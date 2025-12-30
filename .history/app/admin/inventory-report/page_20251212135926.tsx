// STORE-FRONTEND/app/admin/inventory-report/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hook/useAuth'; 
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer // Quan trọng để biểu đồ thích ứng kích thước
} from 'recharts';
// --- Định nghĩa kiểu dữ liệu trả về từ Backend ---
interface LowStockItem {
  id: number;
  stock: number;
  // ✅ CHỈ CÓ sizeValue
  sizeValue: string;
  product: { 
    name: string;
    slug: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm hỗ trợ để định dạng giá trị Size (Loại bỏ 'NONE')
const formatSize = (value: string): string => {
    // Nếu giá trị là 'NONE' (viết hoa) hoặc rỗng/null, thì không hiển thị
    if (!value || value.toUpperCase() === 'NONE') {
        return '';
    }
    return value;
};


const InventoryReportPage = () => {
  // Lấy dữ liệu user hoặc token từ hook của bạn (đã sửa lỗi TS trước đó)
  const { isAuthenticated, isLoading } = useAuth(); 
  
  const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockData = async () => {
    const token = localStorage.getItem('access_token'); // Lấy KEY TOKEN CHÍNH XÁC

    if (!token) {
      setError('Lỗi: Bạn chưa đăng nhập hoặc không có token.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reports/low-stock`, {
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
  }, [isLoading]); 

  // --- Giao diện ---
  if (loading || isLoading) return <div className="p-8">Đang tải báo cáo...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
  if (!isAuthenticated) return <div className="p-8 text-red-500">Bạn phải đăng nhập để xem báo cáo.</div>;


  return (
    <div className="p-8"> 
      <h2 className="text-2xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
      
      {reportData && reportData.length > 0 ? (
        <>
          <p className="mb-4">Danh sách {reportData.length} mặt hàng có tồn kho thấp:</p>
          <ul className="space-y-3">
            {reportData.map((item) => {
                const sizeString = formatSize(item.sizeValue); // Lấy giá trị Size đã được làm sạch
                
                return (
                    <li key={item.id} className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm flex justify-between items-center">
                        <span className="font-medium">
                            {item.product.name} 
                            
                            {/* ✅ HIỂN THỊ SIZE (nếu có) */}
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