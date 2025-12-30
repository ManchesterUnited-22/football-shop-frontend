// STORE-FRONTEND/app/admin/inventory-report/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hook/useAuth'; 

// ✅ IMPORT CÁC COMPONENT BIỂU ĐỒ TỪ RECHARTS
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer
} from 'recharts';

// --- Định nghĩa kiểu dữ liệu trả về từ Backend ---
interface LowStockItem {
    id: number;
    stock: number;
    sizeValue: string;
    product: { 
        name: string;
        slug: string;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm hỗ trợ để định dạng giá trị Size (Loại bỏ 'NONE')
const formatSize = (value: string): string => {
    if (!value || value.toUpperCase() === 'NONE') {
        return '';
    }
    return value;
};


// ✅ HÀM CHUYỂN ĐỔI DỮ LIỆU THÔ SANG FORMAT PHÙ HỢP VỚI BIỂU ĐỒ
const getChartData = (items: LowStockItem[]) => {
    return items.map(item => {
        const sizeString = formatSize(item.sizeValue);
        // Tạo nhãn kết hợp Tên sản phẩm và Size
        const label = `${item.product.name}${sizeString ? ` (${sizeString})` : ''}`;
        
        return {
            name: label,
            'Tồn Kho': item.stock, // Key này sẽ được dùng cho Bar component
        };
    });
};


const InventoryReportPage = () => {
    const { isAuthenticated, isLoading } = useAuth(); 
    
    const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const [threshold, setThreshold] = useState<number>(10);
  // State để theo dõi giá trị nhập tạm thời (dùng cho input)
  const [inputThreshold, setInputThreshold] = useState<string>('10');
    const fetchLowStockData = async () => {
        const token = localStorage.getItem('access_token'); // Lấy KEY TOKEN CHÍNH XÁC

        if (!token) {
            setError('Lỗi: Bạn chưa đăng nhập hoặc không có token.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reports/low-stock?threshold=${threshold}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 403) {
                throw new Error('Bạn không có quyền truy cập báo cáo. Cần Role Admin.');
            }
            if (!response.ok) {
                throw new Error(`Lỗi tải dữ liệu (${response.status}): Vui lòng kiểm tra Server Backend.`);
            }

            const data = await response.json();
            setReportData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tải báo cáo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            fetchLowStockData();
        }
    }, [isLoading, threshold]); 

    // --- Giao diện ---
    if (loading || isLoading) return <div className="p-8">Đang tải báo cáo...</div>;
    if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
    if (!isAuthenticated) return <div className="p-8 text-red-500">Bạn phải đăng nhập để xem báo cáo.</div>;


    return (
        <div className="p-8"> 
            <h2 className="text-2xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
            <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 border rounded-lg">
          <label htmlFor="threshold" className="font-medium text-gray-700">Ngưỡng Tồn Kho Thấp (&lt;=)</label>
          <input
              id="threshold"
              type="number"
              min="1"
              value={inputThreshold}
              onChange={(e) => setInputThreshold(e.target.value)}
              className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-red-500 focus:border-red-500"
          />
          <button
              onClick={() => setThreshold(parseInt(inputThreshold) || 0)} // Áp dụng giá trị nhập vào state threshold
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-150"
              disabled={loading}
          >
              Áp dụng
          </button>
      </div>
            
            {reportData && reportData.length > 0 ? (
                <>
                    <p className="mb-4">Danh sách {reportData.length} mặt hàng có tồn kho thấp:</p>
                    
                    {/* =================================================== */}
                    {/* ✅ KHUNG HIỂN THỊ BIỂU ĐỒ (SỬ DỤNG RECHARTS) */}
                    {/* =================================================== */}
                    <div className="h-[400px] w-full bg-white p-6 border rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-semibold mb-4">Biểu đồ Tồn Kho Thấp nhất</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart 
                                data={getChartData(reportData)} // Sử dụng dữ liệu đã chuyển đổi
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* Trục X: Hiển thị tên sản phẩm + Size */}
                        <XAxis 
                            dataKey="name" 
                            tick={false} // TẮT VIỆC HIỂN THỊ CÁC DÒNG CHỮ Ở DƯỚI CỘT
                            axisLine={false} // Ẩn đường trục chính
                            tickLine={false} // Ẩn các gạch ngang nhỏ
                        />
                                {/* Trục Y: Hiển thị số lượng tồn kho */}
                                <YAxis allowDecimals={false} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                {/* Bar: dataKey="Tồn Kho" phải khớp với key trong getChartData */}
                                <Bar dataKey="Tồn Kho" fill="#ef4444" /> 
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* =================================================== */}
                    {/* DANH SÁCH TỒN KHO (Giữ lại để hiển thị chi tiết) */}
                    {/* =================================================== */}
                    <ul className="space-y-3">
                        {reportData.map((item) => {
                            const sizeString = formatSize(item.sizeValue); 
                            
                            return (
                                <li key={item.id} className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm flex justify-between items-center">
                                    <span className="font-medium">
                                        {item.product.name} 
                                        {sizeString && (
                                            <span className="text-gray-500 text-sm ml-2">(Size: {sizeString})</span>
                                        )}
                                    </span>
                                    <span className="font-bold text-lg text-red-600">Tồn kho: {item.stock}</span>
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : (
                <p className="mt-4 text-green-600 font-medium">🎉 Mọi mặt hàng đều có tồn kho an toàn.</p>
            )}
        </div>
    );
};

export default InventoryReportPage;