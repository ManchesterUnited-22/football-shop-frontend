// app/admin/orders/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Truck, Package, XCircle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Giả định apiFetch đã được đặt đúng đường dẫn
import { apiFetch } from '../../utils/apiFetch'; 

// === ENUM CHO TRẠNG THÁI ĐƠN HÀNG ===
// Dùng các trạng thái chuẩn cho E-commerce
export enum OrderStatus {
    PENDING = 'PENDING', // Chờ thanh toán/Xác nhận (COD)
    PROCESSING = 'PROCESSING', // Đã xác nhận/Đang đóng gói
    SHIPPED = 'SHIPPED', // Đã gửi cho đơn vị vận chuyển
    DELIVERED = 'DELIVERED', // Đã giao hàng thành công
    CANCELLED = 'CANCELLED', // Đã hủy
}

// Định nghĩa kiểu dữ liệu cho Đơn hàng
interface Order {
    id: number;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    createdAt: string;
    // Thêm trường để lưu mã vận đơn sau này
    trackingCode: string | null; 
}

const formatCurrency = (amount: number) => 
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Hàm trợ giúp hiển thị trạng thái
const StatusBadge = ({ status }: { status: OrderStatus }) => {
    let style = '';
    let Icon = Clock;
    
    switch (status) {
        case OrderStatus.PENDING:
            style = 'bg-yellow-100 text-yellow-800 border-yellow-300';
            Icon = Clock;
            break;
        case OrderStatus.PROCESSING:
            style = 'bg-blue-100 text-blue-800 border-blue-300';
            Icon = Package;
            break;
        case OrderStatus.SHIPPED:
            style = 'bg-indigo-100 text-indigo-800 border-indigo-300';
            Icon = Truck;
            break;
        case OrderStatus.DELIVERED:
            style = 'bg-green-100 text-green-800 border-green-300';
            Icon = CheckCircle;
            break;
        case OrderStatus.CANCELLED:
            style = 'bg-red-100 text-red-800 border-red-300';
            Icon = XCircle;
            break;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${style}`}>
            <Icon size={14} className="mr-1" />
            {status}
        </span>
    );
};


export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    // ✅ BỘ LỌC TRẠNG THÁI MỚI
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>(OrderStatus.PENDING);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // ✅ GỌI API ĐƠN HÀNG (Sửa lại endpoint nếu cần)
            const data = await apiFetch<Order[]>('/orders', { method: 'GET' }); 
            setOrders(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    // ✅ LỌC DANH SÁCH THEO TRẠNG THÁI HIỆN TẠI
    const filteredOrders = useMemo(() => {
        if (filterStatus === 'ALL') {
            return orders;
        }
        return orders.filter(order => order.status === filterStatus);
    }, [orders, filterStatus]);
    
    // [LOGIC XỬ LÝ ĐƠN HÀNG - SẼ THÊM SAU]
    const handleProcessOrder = (orderId: number) => {
        alert(`Bắt đầu xử lý (đóng gói) đơn hàng ID: ${orderId}. Sẽ gọi API Backend để chuyển trạng thái.`);
        // Logic gọi API Patch để chuyển trạng thái sang PROCESSING 
    };

    const handleCreateShippingLabel = (orderId: number) => {
        alert(`Tạo vận đơn cho đơn hàng ID: ${orderId}. Sẽ gọi API Vận chuyển.`);
        // Logic gọi API POST/Vận chuyển để tạo tracking code
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-8 text-center text-red-600 border-b pb-2">
                    QUẢN LÝ ĐƠN HÀNG 🛒
                </h1>

                {/* KHU VỰC LỌC VÀ TÁC VỤ */}
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {/* NÚT LỌC TRẠNG THÁI */}
                        {['ALL', ...Object.values(OrderStatus)].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as OrderStatus | 'ALL')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition 
                                    ${filterStatus === status 
                                        ? 'bg-red-600 text-white shadow-md' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {status === 'ALL' ? 'Tất cả' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    {/* NÚT REFRESH (Sẽ dùng để làm nút TÁC VỤ sau này) */}
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="flex items-center justify-center h-10 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
                    >
                        {loading ? 'Đang tải...' : 'Tải lại Danh sách'}
                    </button>
                </div>

                {/* DANH SÁCH ĐƠN HÀNG */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        Danh sách Đơn hàng ({filteredOrders.length})
                    </h2>
                    
                    {loading ? (
                        <p className='text-center text-gray-500 pt-10'>Đang tải dữ liệu...</p>
                    ) : filteredOrders.length === 0 ? (
                        <p className='text-center text-gray-500 pt-10'>Không tìm thấy đơn hàng nào với trạng thái **{filterStatus}**.</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-gray-50"
                                >
                                    {/* THÔNG TIN CHÍNH */}
                                    <div className="flex-grow min-w-0 mb-3 md:mb-0 md:mr-4">
                                        <p className="text-sm font-bold text-red-600">ID: #{order.id}</p>
                                        <p className="font-semibold text-lg truncate">{order.customerName} - {order.customerPhone}</p>
                                        <p className="text-gray-600 text-sm">
                                            {formatCurrency(order.totalAmount)} | {order.paymentMethod}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1 truncate">
                                            Địa chỉ: {order.shippingAddress}
                                        </p>
                                    </div>

                                    {/* TRẠNG THÁI & ACTION */}
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                        <StatusBadge status={order.status} />
                                        
                                        {/* NÚT HÀNH ĐỘNG */}
                                        <div className="flex gap-2">
                                            {/* Nút Xử lý (Chỉ hiện khi PENDING) */}
                                            {order.status === OrderStatus.PENDING && (
                                                <button
                                                    onClick={() => handleProcessOrder(order.id)}
                                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                                    title='Chuyển trạng thái sang Đang đóng gói'
                                                >
                                                    Đóng gói
                                                </button>
                                            )}

                                            {/* Nút Tạo Vận đơn (Chỉ hiện khi PROCESSING) */}
                                            {order.status === OrderStatus.PROCESSING && !order.trackingCode && (
                                                <button
                                                    onClick={() => handleCreateShippingLabel(order.id)}
                                                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                                    title='Tạo mã vận đơn và gửi cho đơn vị vận chuyển'
                                                >
                                                    Tạo Vận đơn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}