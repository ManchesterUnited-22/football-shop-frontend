// components/DeliveryNotificationBar.tsx (Đã tối ưu hóa useEffect)

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Bell, X, CheckCircle } from 'lucide-react';
import { fetchUserShippedOrders, confirmDelivery } from '@/app/services/order.service';
import type { Order } from '@/app/services/order.service';

// --- CẤU HÌNH ---
// Thời gian chờ trước khi hiển thị nút "Xác nhận đã nhận hàng" (Tính bằng mili giây)
// Đặt 60 * 1000 = 1 phút cho mục đích testing. 
const CONFIRMATION_TIMEOUT = 60 * 1000; 
// const CONFIRMATION_TIMEOUT = 24 * 60 * 60 * 1000; // Thời gian thực tế (1 ngày)

export const DeliveryNotificationBar = () => {
    const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // 1. Tải đơn hàng đang SHIPPED của User
    const loadShippedOrders = useCallback(async () => {
        try {
            const orders = await fetchUserShippedOrders();
            setShippedOrders(orders);
            
            // Chỉ hiển thị icon nếu có đơn hàng
            setNotificationVisible(orders.length > 0); 
            
            // Nếu có đơn hàng và Sidebar đang đóng, Mở Sidebar lần đầu nếu là đơn hàng mới
            // if (orders.length > 0 && !isSidebarOpen) {
            //     setIsSidebarOpen(true); // Tùy chọn: Tự động mở sidebar
            // }

        } catch (error) {
            console.error('Lỗi khi tải đơn hàng SHIPPED:', error);
            // Có thể hiển thị thông báo lỗi nhỏ cho user
        }
    }, []);

    // 2. Chỉ chạy 1 lần khi Component Mount để tải dữ liệu
    useEffect(() => {
        // Chỉ chạy khi đã xác định là User đã đăng nhập (kiểm tra token hoặc context)
        if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
            loadShippedOrders();
        }
        // [loadShippedOrders] chỉ bao gồm dependency cần thiết
    }, [loadShippedOrders]); 


    // 3. Xử lý User xác nhận đã nhận hàng
    const handleConfirmDelivery = async (orderId: number) => {
        setProcessingId(orderId);
        try {
            await confirmDelivery(orderId);
            alert(`✅ Đơn hàng #${orderId} đã được xác nhận đã giao hàng thành công!`);
            
            // Tải lại danh sách đơn hàng để loại bỏ đơn hàng vừa xác nhận
            await loadShippedOrders();

        } catch (error) {
            alert(`Lỗi khi xác nhận đơn hàng #${orderId}. Vui lòng thử lại.`);
            console.error('Lỗi confirm delivery:', error);
        } finally {
            setProcessingId(null);
        }
    };

    // Nếu không có đơn hàng nào đang SHIPPED, không hiển thị gì cả
    if (!notificationVisible) return null;

    // --- HIỂN THỊ GIAO DIỆN ---
    return (
        <>
            {/* 1. Icon Thông Báo (Cố định ở vị trí khoanh đỏ của bạn) */}
            <div 
                className="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-red-600 text-white cursor-pointer shadow-xl transition-transform hover:scale-110"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <Bell size={24} />
                {shippedOrders.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full border border-white">
                        {shippedOrders.length}
                    </span>
                )}
            </div>

            {/* 2. Thanh Sidebar Thông Báo */}
            <div 
                className={`fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-40 transition-transform duration-300 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b flex justify-between items-center bg-blue-700 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Truck size={20} className="mr-2" /> Đơn Hàng Đang Giao ({shippedOrders.length})
                    </h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-white hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
                    {shippedOrders.map((order) => {
                        // Tính toán timeout trực tiếp khi render
                        const orderTime = new Date(order.createdAt).getTime();
                        const canConfirm = Date.now() - orderTime > CONFIRMATION_TIMEOUT;

                        return (
                            <div key={order.id} className="p-3 border rounded-lg shadow-sm bg-gray-50">
                                <p className="font-bold text-lg text-indigo-600">Đơn hàng #{order.id}</p>
                                <p className="text-sm text-gray-600">Trạng thái: Đang Giao (Shipped)</p>
                                
                                {canConfirm ? (
                                    <>
                                        <p className="text-red-500 mt-2 text-sm font-semibold">
                                            Đã gửi tới? Vui lòng xác nhận:
                                        </p>
                                        <button
                                            onClick={() => handleConfirmDelivery(order.id)}
                                            disabled={processingId === order.id}
                                            className="mt-2 w-full flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
                                        >
                                            {processingId === order.id ? 'Đang xác nhận...' : <><CheckCircle size={18} className='mr-1' /> Xác nhận Đã Nhận Hàng</>}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        Đơn hàng vừa được gửi đi. Vui lòng kiểm tra sau ít phút.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};