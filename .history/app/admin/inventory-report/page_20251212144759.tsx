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
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

// --- Định nghĩa kiểu dữ liệu trả về từ Backend ---
interface LowStockItem {
    id: number; // ID của Product Variant
    stock: number;
    sizeValue: string;
    product: { 
        name: string;
        slug: string;
    };
}
interface Category {
    id: number;
    name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm hỗ trợ để định dạng giá trị Size (Loại bỏ 'NONE')
const formatSize = (value: string): string => {
    if (!value || value.toUpperCase() === 'NONE') {
        return '';
    }
    return value;
};


// HÀM CHUYỂN ĐỔI DỮ LIỆU THÔ SANG FORMAT PHÙ HỢP VỚI BIỂU ĐỒ
const getChartData = (items: LowStockItem[]) => {
    return items.map(item => {
        const sizeString = formatSize(item.sizeValue);
        const label = `${item.product.name}${sizeString ? ` (${sizeString})` : ''}`;
        
        return {
            name: label,
            'Tồn Kho': item.stock, 
        };
    });
};


const InventoryReportPage = () => {
    const { isAuthenticated, isLoading } = useAuth(); 
    
    const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    
    // State cho Ngưỡng Tồn Kho Thấp
    const [threshold, setThreshold] = useState<number>(10);
    const [inputThreshold, setInputThreshold] = useState<string>('10'); 
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    // ✅ State cho chức năng Nhập Hàng Nhanh
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
    const [newStockValue, setNewStockValue] = useState<number>(0);


    // Xử lý mở modal
    const handleOpenModal = (item: LowStockItem) => {
        setSelectedItem(item);
        setNewStockValue(item.stock); // Giá trị nhập ban đầu là tồn kho hiện tại
        setIsModalOpen(true);
    };

    // Xử lý đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setNewStockValue(0);
    };

    // Xử lý xác nhận nhập hàng
    const handleRestockSubmit = async () => {
        if (!selectedItem) return;

        // ⚠️ Kiểm tra số lượng nhập phải lớn hơn tồn kho hiện tại
        if (newStockValue <= selectedItem.stock) {
            alert("Số lượng nhập kho phải lớn hơn tồn kho hiện tại để xác nhận nhập hàng.");
            return;
        }

        setLoading(true);

        try {
            // =======================================================
            // ⚠️ CHÚ Ý: ĐÂY LÀ CHỖ CẦN GỌI API THỰC TẾ ĐỂ CẬP NHẬT TỒN KHO
            // Ví dụ: 
            // const token = localStorage.getItem('access_token');
            // await fetch(`${API_URL}/products/variant/${selectedItem.id}/stock`, {
            //     method: 'PATCH',
            //     headers: { ... },
            //     body: JSON.stringify({ newStock: newStockValue })
            // });
            
            // Hiện tại, chúng ta sẽ mô phỏng việc cập nhật thành công:
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // =======================================================


            // Cập nhật state dữ liệu trên client-side sau khi gọi API thành công
            setReportData(prevData => {
                if (!prevData) return null;
                // Cập nhật tồn kho và lọc lại (để mặt hàng có thể bị loại khỏi danh sách nếu tồn kho > ngưỡng)
                return prevData.map(item => 
                    item.id === selectedItem.id 
                        ? { ...item, stock: newStockValue } 
                        : item
                ).filter(item => item.stock <= threshold); // Chỉ giữ lại các mặt hàng vẫn dưới ngưỡng
            });

            handleCloseModal();
            alert(`Đã cập nhật tồn kho cho ${selectedItem.product.name} lên ${newStockValue}.`);

        } catch (error) {
            setError('Lỗi khi cập nhật tồn kho. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải categories:", error);
        }
    };


    const fetchLowStockData = async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setError('Lỗi: Bạn chưa đăng nhập hoặc không có token.');
            setLoading(false);
            return;
        }
        let url = `${API_URL}/reports/low-stock?threshold=${threshold}`;
        
        // ✅ THÊM THAM SỐ CATEGORY ID
        if (selectedCategory) {
            url += `&categoryId=${selectedCategory}`;
        }

        try {
            // GỌI API VỚI THAM SỐ threshold
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
    }, [isLoading, threshold, selectedCategory]); 

    // --- Giao diện ---
    if (loading && reportData === null) return <div className="p-8">Đang tải báo cáo...</div>;
    if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
    if (!isAuthenticated) return <div className="p-8 text-red-500">Bạn phải đăng nhập để xem báo cáo.</div>;


    return (
        <div className="p-8"> 
            <h2 className="text-2xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 border rounded-lg"></div>
            
            {/* KHUNG NHẬP NGƯỠNG TỒN KHO */}
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
                    onClick={() => setThreshold(parseInt(inputThreshold) || 0)} 
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-150"
                    disabled={loading}
                >
                    Áp dụng
                </button>
            </div>
            <div className="flex items-center space-x-3">
                    <label htmlFor="category" className="font-medium text-gray-700">Lọc theo Danh mục</label>
                    <select
                        id="category"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

            {reportData && reportData.length > 0 ? (
                <>
                    <p className="mb-4">Danh sách {reportData.length} mặt hàng có tồn kho thấp (dưới {threshold + 1}):</p>
                    
                    {/* KHUNG HIỂN THỊ BIỂU ĐỒ */}
                    <div className="h-[400px] w-full bg-white p-6 border rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-semibold mb-4">Biểu đồ Tồn Kho Thấp nhất (Ngưỡng: {threshold})</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart 
                                data={getChartData(reportData)} 
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} /> 
                                <YAxis allowDecimals={false} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }} />
                                
                                <ReferenceLine 
                                    y={threshold} 
                                    stroke="#FF0000" 
                                    strokeDasharray="5 5" 
                                    label={{ 
                                        value: `Ngưỡng: ${threshold}`, 
                                        position: 'top', 
                                        fill: '#FF0000' 
                                    }}
                                />

                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                <Bar dataKey="Tồn Kho" fill="#ef4444" /> 
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* DANH SÁCH TỒN KHO VÀ NÚT NHẬP HÀNG */}
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
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-lg text-red-600">Tồn kho: {item.stock}</span>
                                        {/* ✅ NÚT NHẬP HÀNG */}
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition duration-150"
                                        >
                                            Nhập hàng
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : (
                <p className="mt-4 text-green-600 font-medium">🎉 Mọi mặt hàng đều có tồn kho an toàn.</p>
            )}

            {/* =================================================== */}
            {/* ✅ MODAL NHẬP HÀNG NHANH */}
            {/* =================================================== */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Nhập Hàng Nhanh</h3>
                        <p className="mb-4">
                            Sản phẩm: <strong>{selectedItem.product.name} {formatSize(selectedItem.sizeValue) ? `(${formatSize(selectedItem.sizeValue)})` : ''}</strong>
                            <br />
                            Tồn kho hiện tại: <span className="text-red-600 font-bold">{selectedItem.stock}</span>
                        </p>

                        <label htmlFor="newStock" className="block text-sm font-medium text-gray-700 mb-2">
                            Số lượng nhập mới:
                        </label>
                        <input
                            id="newStock"
                            type="number"
                            // Số lượng tối thiểu phải lớn hơn tồn kho hiện tại (để tránh lỗi logic)
                            min={selectedItem.stock + 1} 
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-green-500 focus:border-green-500"
                        />
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRestockSubmit}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                                // Disable nếu số lượng nhập mới không lớn hơn tồn kho hiện tại
                                disabled={newStockValue <= selectedItem.stock} 
                            >
                                Xác nhận Nhập hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryReportPage;