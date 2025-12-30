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

// =========================================================
// I. INTERFACES
// =========================================================

interface LowStockItem {
    id: number; // ID của Product Variant
    stock: number;
    sizeValue: string;
    product: { 
        name: string;
        slug: string;
    };
}

interface SalesPerformanceItem {
    variantId: number;
    productName: string;
    sizeValue: string;
    totalSold: number;
}

interface Category {
    id: number;
    name: string;
}

// =========================================================
// II. HẰNG SỐ & HÀM HỖ TRỢ
// =========================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm hỗ trợ để định dạng giá trị Size (Loại bỏ 'NONE')
const formatSize = (value: string): string => {
    if (!value || value.toUpperCase() === 'NONE') {
        return '';
    }
    return value;
};


// HÀM CHUYỂN ĐỔI DỮ LIỆU TỒN KHO SANG FORMAT BIỂU ĐỒ
const getLowStockChartData = (items: LowStockItem[]) => {
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
    
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    
    // --- STATE CHO BÁO CÁO TỒN KHO THẤP ---
    const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
    const [threshold, setThreshold] = useState<number>(10);
    const [inputThreshold, setInputThreshold] = useState<string>('10'); 
    const [limit, setLimit] = useState<number>(20); 
    const [inputLimit, setInputLimit] = useState<string>('20');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
    const [newStockValue, setNewStockValue] = useState<number>(0);

    // --- STATE CHO BÁO CÁO HIỆU SUẤT BÁN HÀNG ---
    const [salesReportData, setSalesReportData] = useState<SalesPerformanceItem[] | null>(null);
    const [salesType, setSalesType] = useState<'best' | 'worst'>('best');
    const [salesPeriod, setSalesPeriod] = useState<'7days' | '30days' | '6months' | 'year'>('30days');
    const [salesLimit, setSalesLimit] = useState<number>(10);
    const [inputSalesLimit, setInputSalesLimit] = useState<string>('10');


    // =========================================================
    // III. LOGIC & HANDLERS
    // =========================================================

    // --- Xử lý Modal Nhập hàng ---
    const handleOpenModal = (item: LowStockItem) => {
        setSelectedItem(item);
        setNewStockValue(item.stock); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setNewStockValue(0);
    };

    const handleRestockSubmit = async () => {
        if (!selectedItem) return;

        if (newStockValue <= selectedItem.stock) {
            alert("Số lượng nhập kho phải lớn hơn tồn kho hiện tại để xác nhận nhập hàng.");
            return;
        }

        setLoading(true);

        try {
            // Thay thế bằng API gọi thực tế để cập nhật tồn kho
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // Cập nhật state dữ liệu trên client-side
            setReportData(prevData => {
                if (!prevData) return null;
                return prevData.map(item => 
                    item.id === selectedItem.id 
                        ? { ...item, stock: newStockValue } 
                        : item
                ).filter(item => item.stock <= threshold); 
            });

            handleCloseModal();
            alert(`Đã cập nhật tồn kho cho ${selectedItem.product.name} lên ${newStockValue}.`);

        } catch (error) {
            setError('Lỗi khi cập nhật tồn kho. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch Categories ---
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

    // --- Fetch Low Stock Data ---
    const fetchLowStockData = async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setError('Lỗi: Bạn chưa đăng nhập hoặc không có token.');
            setLoading(false);
            return;
        }
        
        let url = `${API_URL}/reports/low-stock?threshold=${threshold}&limit=${limit}`;
        
        if (selectedCategory) {
            url += `&categoryId=${selectedCategory}`;
        }

        try {
            const response = await fetch(url, {
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
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tải báo cáo tồn kho.');
        } finally {
            // Giữ loading = false ở đây
        }
    };

    // --- Fetch Sales Performance Data ---
    const fetchSalesData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        setLoading(true); 
        setError(null);

        let url = `${API_URL}/reports/sales-performance?type=${salesType}&period=${salesPeriod}&limit=${salesLimit}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải dữ liệu doanh thu (${response.status}).`);
            }

            const data: SalesPerformanceItem[] = await response.json();
            setSalesReportData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tải báo cáo doanh thu.');
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // IV. USE EFFECTS
    // =========================================================

    // Tải Báo cáo Tồn kho Thấp khi tham số thay đổi
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchLowStockData();
        }
    }, [isLoading, isAuthenticated, threshold, selectedCategory, limit]); 

    // Tải Categories
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchCategories();
        }
    }, [isLoading, isAuthenticated]); 
    
    // Tải Báo cáo Hiệu suất Bán hàng khi tham số thay đổi
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchSalesData();
        }
    }, [isLoading, isAuthenticated, salesType, salesPeriod, salesLimit]);


    // =========================================================
    // V. RENDER
    // =========================================================
    
    if (loading && reportData === null && salesReportData === null) return <div className="p-8">Đang tải báo cáo...</div>;
    if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
    if (!isAuthenticated) return <div className="p-8 text-red-500">Bạn phải đăng nhập để xem báo cáo.</div>;


    return (
        <div className="p-8"> 
            
            {/* =================================================== */}
            {/* BÁO CÁO TỒN KHO THẤP */}
            {/* =================================================== */}
            <h2 className="text-3xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
            
            {/* KHUNG LỌC TỒN KHO */}
            <div className="flex flex-wrap items-end gap-6 mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                
                {/* LỌC THEO GIỚI HẠN KẾT QUẢ */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="limit" className="font-semibold text-gray-800 text-sm tracking-wide">
                        Giới hạn kết quả
                    </label>
                    <div className="flex items-center space-x-3">
                        <input
                            id="limit"
                            type="number"
                            min="1"
                            value={inputLimit}
                            onChange={(e) => setInputLimit(e.target.value)}
                            className="w-24 p-2 border border-gray-300 rounded-lg text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                        <button
                            onClick={() => setLimit(parseInt(inputLimit) || 0)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                            disabled={loading}
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>

                {/* KHUNG NHẬP NGƯỠNG TỒN KHO */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="threshold" className="font-semibold text-gray-800 text-sm tracking-wide">Ngưỡng Tồn Kho Thấp (&lt;=)</label>
                    <div className="flex items-center space-x-3">
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
                </div>

                {/* LỌC THEO DANH MỤC */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="category" className="font-semibold text-gray-800 text-sm tracking-wide">Lọc theo Danh mục</label>
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
            </div>
            
            {reportData && reportData.length > 0 ? (
                <>
                    <p className="mb-4 text-gray-700">Danh sách {reportData.length} mặt hàng có tồn kho thấp (dưới {threshold + 1}):</p>
                    
                    {/* KHUNG HIỂN THỊ BIỂU ĐỒ TỒN KHO */}
                    <div className="h-[400px] w-full bg-white p-6 border rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-semibold mb-4">Biểu đồ Tồn Kho Thấp nhất (Ngưỡng: {threshold})</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart 
                                data={getLowStockChartData(reportData)} 
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
            {/* BÁO CÁO HIỆU SUẤT BÁN HÀNG (SALES PERFORMANCE) */}
            {/* =================================================== */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-3xl font-bold mb-6">📈 Báo cáo Hiệu suất Bán hàng</h2>

                {/* KHUNG LỌC DOANH THU */}
                <div className="flex flex-wrap items-end gap-6 mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    
                    {/* LỌC THEO KIỂU BÁO CÁO (Bán chạy/Bán kém) */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="salesType" className="font-medium text-gray-700 whitespace-nowrap text-sm">Kiểu Báo Cáo</label>
                        <select
                            id="salesType"
                            value={salesType}
                            onChange={(e) => setSalesType(e.target.value as 'best' | 'worst')}
                            className="p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="best">Bán Chạy Nhất (TOP)</option>
                            <option value="worst">Bán Kém Nhất (BOTTOM)</option>
                        </select>
                    </div>

                    {/* LỌC THEO KHOẢNG THỜI GIAN */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="salesPeriod" className="font-medium text-gray-700 whitespace-nowrap text-sm">Thời Gian</label>
                        <select
                            id="salesPeriod"
                            value={salesPeriod}
                            onChange={(e) => setSalesPeriod(e.target.value as '7days' | '30days' | '6months' | 'year')}
                            className="p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="7days">7 Ngày Qua</option>
                            <option value="30days">30 Ngày Qua</option>
                            <option value="6months">6 Tháng Qua</option>
                            <option value="year">1 Năm Qua</option>
                        </select>
                    </div>

                    {/* LỌC THEO GIỚI HẠN KẾT QUẢ */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="salesLimit" className="font-medium text-gray-700 whitespace-nowrap text-sm">Giới hạn ({salesType === 'best' ? 'Top' : 'Bottom'})</label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="salesLimit"
                                type="number"
                                min="1"
                                value={inputSalesLimit}
                                onChange={(e) => setInputSalesLimit(e.target.value)}
                                className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                                onClick={() => setSalesLimit(parseInt(inputSalesLimit) || 0)} 
                                className="px-3 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition duration-150"
                                disabled={loading}
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
                
                {salesReportData && salesReportData.length > 0 ? (
                    <>
                        <p className="mb-4 text-gray-700">
                            Hiển thị {salesReportData.length} sản phẩm **{salesType === 'best' ? 'BÁN CHẠY NHẤT' : 'BÁN KÉM NHẤT'}** trong vòng **{salesPeriod}**.
                        </p>

                        {/* KHUNG BIỂU ĐỒ DOANH THU */}
                        <div className="h-[400px] w-full bg-white p-6 border rounded-lg shadow-md mb-8">
                            <h3 className="text-xl font-semibold mb-4">Biểu đồ Hiệu suất Bán hàng (Số lượng sản phẩm đã bán)</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart 
                                    data={salesReportData.map(item => ({
                                        name: `${item.productName}${formatSize(item.sizeValue) ? ` (${formatSize(item.sizeValue)})` : ''}`,
                                        'Số lượng bán': item.totalSold
                                    }))}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} /> 
                                    <YAxis allowDecimals={false} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                    <Bar 
                                        dataKey="Số lượng bán" 
                                        fill={salesType === 'best' ? "#059669" : "#f59e0b"} // Xanh lá cho bán chạy, Cam cho bán kém
                                    /> 
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        

                        {/* DANH SÁCH SẢN PHẨM */}
                        <ul className="space-y-3">
                            {salesReportData.map((item, index) => (
                                <li 
                                    key={item.variantId} 
                                    className={`p-4 border rounded-lg shadow-sm flex justify-between items-center ${salesType === 'best' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
                                >
                                    <span className="font-medium">
                                        <span className="font-bold mr-2 text-xl">{index + 1}.</span> 
                                        {item.productName} 
                                        {formatSize(item.sizeValue) && (
                                            <span className="text-gray-600 text-sm ml-2">(Size: {formatSize(item.sizeValue)})</span>
                                        )}
                                    </span>
                                    <div className="flex items-center space-x-4">
                                        <span className={`font-bold text-lg ${salesType === 'best' ? 'text-green-700' : 'text-yellow-700'}`}>
                                            Đã bán: {item.totalSold.toLocaleString()}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="mt-4 text-purple-600 font-medium">Không có dữ liệu bán hàng khớp với bộ lọc.</p>
                )}
            </div>
            {/* =================================================== */}
            {/* KẾT THÚC BÁO CÁO HIỆU SUẤT BÁN HÀNG */}
            {/* =================================================== */}

            {/* =================================================== */}
            {/* MODAL NHẬP HÀNG NHANH */}
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