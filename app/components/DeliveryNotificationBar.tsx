'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Bell, X, CheckCircle } from 'lucide-react';
import { fetchUserShippedOrders, confirmDelivery } from '@/app/services/order.service';
import type { Order } from '@/app/services/order.service';
import { jwtDecode } from 'jwt-decode';

const CONFIRMATION_TIMEOUT = 60 * 1000; 

export const DeliveryNotificationBar = () => {
    const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // =========================================================
    // 1. HÀM TẢI DỮ LIỆU - ÁP DỤNG NGUYÊN TẮC 1 (CHẶN ADMIN)
    // =========================================================
    const loadShippedOrders = useCallback(async () => {
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // 🛑 GIẢI MÃ VÀ KIỂM TRA ROLE TRƯỚC KHI GỌI API
            const decoded: any = jwtDecode(token);
            if (decoded.role?.toUpperCase() === 'ADMIN') {
                console.log("🛡️ Role Admin detected: Skipping customer API call.");
                return; // Thoát ngay, không gọi fetchUserShippedOrders
            }

            const orders = await fetchUserShippedOrders();
            setShippedOrders(orders);
            setNotificationVisible(orders.length > 0); 
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng SHIPPED:', error);
        }
    }, []);

    // =========================================================
    // 2. LOGIC REAL-TIME - ÁP DỤNG NGUYÊN TẮC 2 (PORT 3001)
    // =========================================================
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            // 🛑 CHỈ CHO PHÉP CUSTOMER KẾT NỐI SSE VÀ TẢI DỮ LIỆU
            if (decoded.role?.toUpperCase() === 'ADMIN') return;

            // Khách hàng thì mới chạy 2 lệnh này
            loadShippedOrders();

            // SỬA PORT THÀNH 3001 (BACKEND) THEO ĐÚNG NGUYÊN TẮC
            const eventSource = new EventSource(`http://localhost:3001/notifications/sse?token=${token}`);

            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    if (parsedData.type === 'ORDER_SHIPPED') {
                        loadShippedOrders();
                        setIsSidebarOpen(true);
                    }
                } catch (err) {
                    console.error('Lỗi phân tích dữ liệu SSE:', err);
                }
            };

            eventSource.onerror = (error) => {
                eventSource.close();
            };

            return () => eventSource.close();
        } catch (e) {
            console.error("Token không hợp lệ");
        }
    }, [loadShippedOrders]);

    // =========================================================
    // 3. XỬ LÝ XÁC NHẬN ĐÃ NHẬN HÀNG
    // =========================================================
    const handleConfirmDelivery = async (orderId: number) => {
        setProcessingId(orderId);
        try {
            await confirmDelivery(orderId);
            alert(`✅ Tuyệt vời! Đơn hàng #${orderId} đã hoàn tất.`);
            await loadShippedOrders();
        } catch (error) {
            alert(`Có lỗi xảy ra khi xác nhận.`);
        } finally {
            setProcessingId(null);
        }
    };

    // NẾU KHÔNG CÓ ĐƠN HÀNG HOẶC LÀ ADMIN (shippedOrders trống) THÌ ẨN COMPONENT
    if (!notificationVisible || shippedOrders.length === 0) return null;

    return (
        <>
            {/* --- ICON CHUÔNG THÔNG BÁO --- */}
            <div 
                className="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-red-600 text-white cursor-pointer shadow-2xl transition-all hover:scale-110 active:scale-95 animate-bounce"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <Bell size={28} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-red-900 border-2 border-white">
                    {shippedOrders.length}
                </span>
            </div>

            {/* --- SIDEBAR --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div 
                className={`fixed top-0 left-0 w-85 max-w-[90vw] h-full bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-5 border-b flex justify-between items-center bg-indigo-700 text-white">
                    <div className="flex items-center gap-2">
                        <Truck size={24} />
                        <span className="font-bold text-lg">Hành trình đơn hàng</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-indigo-600 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {shippedOrders.map((order) => {
                        const orderTime = new Date(order.createdAt).getTime();
                        const canConfirm = Date.now() - orderTime > CONFIRMATION_TIMEOUT;

                        return (
                            <div key={order.id} className="p-4 border-2 border-gray-100 rounded-xl shadow-sm bg-white hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-indigo-700 text-lg">#{order.id}</span>
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">Đang giao hàng</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Đơn hàng đang trên đường đến với bạn.</p>
                                
                                {canConfirm ? (
                                    <button
                                        onClick={() => handleConfirmDelivery(order.id)}
                                        disabled={processingId === order.id}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:bg-green-700 transition-all disabled:bg-gray-300 shadow-md"
                                    >
                                        {processingId === order.id ? 'Đang xử lý...' : <><CheckCircle size={20} /> Tôi đã nhận đủ hàng</>}
                                    </button>
                                ) : (
                                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <p className="text-xs text-yellow-700 flex items-center gap-1 italic">
                                            <Bell size={14} /> Bạn có thể xác nhận sau ít phút nữa...
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};