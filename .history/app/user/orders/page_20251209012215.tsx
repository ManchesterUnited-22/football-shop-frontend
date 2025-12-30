'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hook/useAuth'; // Giả định hook này cung cấp isAuthenticated, userId

// ----------------------------------------------------

// ===================================
// CẤU HÌNH API BASE URL
// ===================================
// ⭐️ ĐẢM BẢO BASE URL NÀY CHÍNH XÁC ⭐️
const API_BASE_URL = 'http://localhost:3001'; 


// ===================================
// ĐỊNH NGHĨA TYPES (Khớp với API JOIN Backend)
// ===================================

type OrderItem = {
    id: number; 
    quantity: number;
    priceAtPurchase: number; 
    
    product: {
        name: string;
        images: string[];
    };
    variant: {
        sizeValue: string;
    };
};

type Order = {
    id: number; 
    createdAt: string; 
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; 
    totalAmount: number;
    shippingFee: number; 
    items: OrderItem[];
};

// ===================================
// HELPER FUNCTIONS (Giữ nguyên)
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
// MAIN COMPONENT (Đã cập nhật Fetching API)
// ===================================

export default function UserOrdersPage() {
    // userId không còn được dùng trực tiếp trong fetch, chỉ dùng isAuthenticated
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); 
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ⭐️ HÀM FETCH ĐÃ CẬP NHẬT: KHÔNG CẦN ID, CHỈ CẦN TOKEN ⭐️
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        // 1. Lấy token từ localStorage (BẮT BUỘC)
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Nếu không có token, hàm sẽ dừng và useEffect sẽ chuyển hướng
            setIsLoading(false);
            return; 
        }

        try {
            // 2. GỌI ENDPOINT BẢO MẬT MỚI: /orders/me
            const response = await fetch(`${API_BASE_URL}/orders/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // ⭐️ GỬI TOKEN BẢO MẬT ĐỂ BACKEND LẤY USER ID ⭐️
                    'Authorization': `Bearer ${token}`, 
                },
            });
            
            if (!response.ok) {
                // Xử lý lỗi token hết hạn/lỗi quyền
                if (response.status === 401 || response.status === 403) {
                     throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                }
                throw new Error(`Lỗi API: ${response.statusText} (${response.status})`);
            }

            const data: Order[] = await response.json();
            setOrders(data);
        } catch (err: any) {
            console.error('Lỗi khi lấy đơn hàng:', err);
            setError(err.message || 'Không thể tải lịch sử đơn hàng. Vui lòng kiểm tra Server Backend.');
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencies chỉ cần là fetchOrders (vì nó là useCallback)

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isAuthenticated) {
            // Chuyển hướng nếu chưa đăng nhập
            router.push('/login?redirect=/user/orders'); 
            return;
        }

        // Bắt đầu fetch đơn hàng (Backend sẽ lấy ID từ token)
        fetchOrders();
    }, [isAuthenticated, isAuthLoading, fetchOrders, router]);


    // ===================================
    // RENDER UI (Giữ nguyên)
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
                                                src={item.product.images[0] || 'https://via.placeholder.com/150'} 
                                                alt={item.product.name} 
                                                fill={true}
                                                style={{ objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-lg">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.variant.sizeValue} | SL: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            {formatCurrency(item.priceAtPurchase * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Tổng kết */}
                            <div className="border-t pt-4 flex flex-col items-end space-y-1">
                                {order.shippingFee !== undefined && (
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