'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Bell, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export const AdminNotificationBar = () => {
    const [newOrders, setNewOrders] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // --- NGUYÊN TẮC 1: KIỂM TRA ROLE ---
            const decoded: any = jwtDecode(token);
            // Chỉ Admin mới được phép mở kết nối SSE này
            if (decoded.role?.toUpperCase() !== 'ADMIN') {
                return; 
            }

            // --- NGUYÊN TẮC 2: KẾT NỐI ĐÚNG PORT 3001 ---
            const eventSource = new EventSource(`http://localhost:3001/notifications/sse?token=${token}`);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Lắng nghe sự kiện ĐƠN HÀNG MỚI
                    if (data.type === 'NEW_ORDER') {
                        setNewOrders(prev => [data.order, ...prev]);
                        setIsOpen(true); // Tự động mở sidebar để Admin thấy ngay
                        
                        // Phát âm thanh thông báo
                        const audio = new Audio('/notification-sound.mp3');
                        audio.play().catch(() => console.log("Yêu cầu tương tác để phát âm thanh")); 
                    }
                } catch (err) {
                    console.error("Lỗi phân tích dữ liệu SSE Admin:", err);
                }
            };

            eventSource.onerror = (error) => {
                console.error("Lỗi kết nối SSE Admin:", error);
                eventSource.close();
            };

            return () => eventSource.close();
        } catch (error) {
            console.error("Lỗi xác thực Admin:", error);
        }
    }, []);

    // Nếu không có đơn hàng mới thì không hiển thị gì cả
    if (newOrders.length === 0) return null;

    return (
        <>
            {/* --- ICON CHUÔNG BÁO (Góc dưới bên phải) --- */}
            <div 
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-orange-600 text-white cursor-pointer shadow-2xl animate-pulse hover:scale-110 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={28} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600 border-2 border-orange-600">
                    {newOrders.length}
                </span>
            </div>

            {/* --- SIDEBAR ĐƠN HÀNG MỚI --- */}
            <div className={`fixed top-0 right-0 w-80 h-full bg-slate-900 shadow-2xl z-50 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-slate-700 flex justify-between items-center text-white bg-slate-800">
                    <h3 className="font-bold flex items-center gap-2"><ShoppingBasket /> Đơn hàng mới</h3>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-slate-700 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {newOrders.map((order) => (
                        <div key={order.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-orange-500 transition-all shadow-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-orange-400 font-mono font-bold">#{order.id}</span>
                                <span className="text-[10px] text-slate-400">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Vừa xong'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">
                                Khách: <span className="text-white font-medium">{order.customerName || 'Khách vãng lai'}</span>
                            </p>
                            <button 
                                onClick={() => {
                                    router.push(`/admin/orders/${order.id}`);
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 flex items-center justify-center gap-1 transition-colors"
                            >
                                Xử lý ngay <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};