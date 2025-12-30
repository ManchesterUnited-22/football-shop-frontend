// app/user/orders/page.tsx

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// ⭐️ IMPORT HOOK AUTH TẠM THỜI ⭐️
// (Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn)
 
// ----------------------------------------------------

// ===================================
// ĐỊNH NGHĨA TYPES (Khớp với API JOIN Backend)
// ===================================

type OrderItem = {
    id: number; // ID của OrderItem
    quantity: number;
    priceAtPurchase: number; // Giá đã lưu lúc mua (Thay thế cho 'price' cũ)
    
    // Dữ liệu được JOIN từ các bảng khác
    product: {
        name: string;
        images: string[];
    };
    variant: {
        sizeValue: string;
    };
};

type Order = {
    id: number; // ID Order là số
    createdAt: string; // Ngày đặt hàng (Thay thế cho 'date' cũ)
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; // Enum từ Prisma
    totalAmount: number;
    // ⚠️ Bạn cần đảm bảo trường này tồn tại trong Order Model của Prisma
    shippingFee: number; 
    items: OrderItem[];
};

// ===================================
// HELPER FUNCTIONS (Cập nhật để khớp với Enum của Prisma)
// ===================================

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'DELIVERED': return 'text-green-600 bg-green-100';
        case 'PROCESSING': 
        case 'SHIPPED': return 'text-blue-600 bg-blue-100';
        case 'CANCELLED': return 'text-red-600 bg-red-100';
        case 'PENDING':
        default: return 'text-yellow-600 bg-yellow-100';
    }
};

const getStatusText = (status: Order['status']) => {
    switch (status) {
        case 'DELIVERED': return 'Đã Giao';
        case 'PROCESSING': return 'Đang Xử lý';
        case 'SHIPPED': return 'Đang Giao';
        case 'CANCELLED': return 'Đã Hủy';
        case 'PENDING':
        default: return 'Đang Chờ Xác nhận';
    }
};


// ===================================
// MAIN COMPONENT (Tích hợp Fetching API)
// ===================================

export default function UserOrdersPage() {
    // ⭐️ LẤY ID USER ĐỘNG TỪ HOOK AUTH ⭐️
    const { isAuthenticated, userId, isLoading: isAuthLoading } = useAuth(); 
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            // Gọi API Backend NestJS với ID người dùng
            const response = await fetch(`http://localhost:3001/orders/user/${id}`);
            
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.statusText} (${response.status})`);
            }

            const data: Order[] = await response.json();
            setOrders(data);
        } catch (err: any) {
            console.error('Lỗi khi lấy đơn hàng:', err);
            setError('Không thể tải lịch sử đơn hàng. Vui lòng kiểm tra Server Backend.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isAuthenticated || userId === null) {
            // Chuyển hướng nếu chưa đăng nhập (hoặc nếu userId không được tìm thấy)
            router.push('/login?redirect=/user/orders'); 
            return;
        }

        // Fetch data với userId LẤY TỪ HOOK AUTH
        fetchOrders(userId);
    }, [isAuthenticated, userId, isAuthLoading, fetchOrders, router]);


    // ===================================
    // RENDER UI
    // ===================================

    if (isLoading || isAuthLoading) {
        return <div className="max-w-6xl mx-auto p-4 sm:p-8 min-h-screen bg-gray-50 text-center py-20">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="max-w-6xl mx-auto p-4 sm:p-8 min-h-screen bg-gray-50 text-center py-20 text-red-600 font-semibold">Lỗi: {error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 min-h-screen bg-gray-50">
            <h1 className="text-4xl font-extrabold mb-8 text-blue-800 border-b pb-2">📦 Lịch Sử Đơn Hàng</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white shadow rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-500">Bạn chưa có đơn hàng nào.</h2>
                    <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                        Bắt đầu mua sắm ngay!
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 shadow-lg rounded-xl border border-gray-200">
                            
                            {/* Header Đơn hàng */}
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <div>
                                    {/* Sử dụng createdAt và format từ date-fns */}
                                    <p className="text-sm text-gray-500">Ngày Đặt hàng: <span className="font-semibold text-gray-800">{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span></p>
                                    <h2 className="text-xl font-bold text-gray-800">Mã Đơn hàng: #{order.id}</h2>
                                </div>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>

                            {/* Chi tiết Items */}
                            <div className="space-y-4 mb-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                                            <Image 
                                                // ⭐️ Dùng dữ liệu JOIN: item.product.images[0] ⭐️
                                                src={item.product.images[0] || 'https://via.placeholder.com/150'} 
                                                alt={item.product.name} 
                                                fill={true}
                                                style={{ objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            {/* ⭐️ Dùng dữ liệu JOIN: item.product.name và item.variant.sizeValue ⭐️ */}
                                            <p className="font-semibold text-lg">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.variant.sizeValue} | SL: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            {/* Dùng priceAtPurchase */}
                                            {formatCurrency(item.priceAtPurchase * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Tổng kết */}
                            <div className="border-t pt-4 flex flex-col items-end space-y-1">
                                {/* Hiển thị phí vận chuyển (Nếu bạn đã thêm vào Order model) */}
                                {order.shippingFee && (
                                    <p className="text-sm text-gray-600">Phí Vận chuyển: <span className="font-semibold">{formatCurrency(order.shippingFee)}</span></p>
                                )}
                                <p className="text-xl font-extrabold text-red-600">
                                    Tổng Cộng: {formatCurrency(order.totalAmount)}
                                </p>
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                                    Xem chi tiết Đơn hàng &rarr;
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}