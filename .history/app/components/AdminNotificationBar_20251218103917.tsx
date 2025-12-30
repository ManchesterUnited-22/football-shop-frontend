'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Bell, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const AdminNotificationBar = () => {
    const [newOrders, setNewOrders] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Kết nối đến port của Backend (Ví dụ: 3001)
        const eventSource = new EventSource(`http://localhost:3001/notifications/sse?token=${token}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER') {
                // Thêm đơn hàng mới vào đầu danh sách
                setNewOrders(prev => [data.order, ...prev]);
                setIsOpen(true); // Tự động bật thông báo khi có đơn mới
                
                // Phát âm thanh thông báo (Tùy chọn)
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(() => {}); 
            }
        };

        return () => eventSource.close();
    }, []);

    if (newOrders.length === 0) return null;

    return (
        <>
            {/* Icon chuông báo cho Admin */}
            <div 
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-orange-600 text-white cursor-pointer shadow-2xl animate-pulse"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={28} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600 border-2 border-orange-600">
                    {newOrders.length}
                </span>
            </div>

            {/* Sidebar thông báo đơn hàng mới */}
            <div className={`fixed top-0 right-0 w-80 h-full bg-slate-900 shadow-2xl z-50 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-slate-700 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><ShoppingBasket /> Đơn hàng mới</h3>
                    <button onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {newOrders.map((order) => (
                        <div key={order.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-orange-500 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-orange-400 font-mono font-bold">#{order.id}</span>
                                <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">Khách hàng: <strong>{order.customerName}</strong></p>
                            <button 
                                onClick={() => {
                                    router.push(`/admin/orders/${order.id}`);
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 flex items-center justify-center gap-1"
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