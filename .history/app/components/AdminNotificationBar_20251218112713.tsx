'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBasket, Bell, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/app/services/order.service'; // Đảm bảo bạn có hàm này

export const AdminNotificationBar = () => {
    const [newOrders, setNewOrders] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const lastOrderCount = useRef<number | null>(null); // Lưu số lượng đơn để so sánh
    const router = useRouter();

    // Hàm kiểm tra đơn hàng
    const checkNewOrders = async () => {
        try {
            const orders = await fetchOrders(); // Gọi API lấy tất cả đơn hàng
            
            // Lọc ra các đơn hàng có trạng thái PENDING (đơn mới)
            const pendingOrders = orders.filter((o: any) => o.status === 'PENDING');

            // Nếu đây không phải lần chạy đầu tiên và số lượng đơn tăng lên
            if (lastOrderCount.current !== null && pendingOrders.length > lastOrderCount.current) {
                const diff = pendingOrders.length - lastOrderCount.current;
                console.log(`🔔 Có ${diff} đơn hàng mới!`);
                
                // Cập nhật danh sách hiển thị (lấy những đơn mới nhất)
                setNewOrders(pendingOrders.slice(0, 5)); // Hiển thị 5 đơn gần nhất
                setIsOpen(true);
                
                // Phát âm thanh
                new Audio('/notification-sound.mp3').play().catch(() => {});
            }

            // Cập nhật lại số lượng để so sánh lần sau
            lastOrderCount.current = pendingOrders.length;
        } catch (error) {
            console.error("Lỗi Polling đơn hàng:", error);
        }
    };

    useEffect(() => {
        // 1. Chạy kiểm tra ngay lập tức khi vào trang
        checkNewOrders();

        // 2. Thiết lập Polling: Cứ 30 giây (30000ms) kiểm tra 1 lần
        const interval = setInterval(() => {
            checkNewOrders();
        }, 30000); 

        // Dọn dẹp khi thoát trang
        return () => clearInterval(interval);
    }, []);

    if (newOrders.length === 0) return null;

    return (
        <>
            {/* Icon chuông */}
            <div 
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-orange-600 text-white cursor-pointer shadow-2xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={28} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600 border-2 border-orange-600">
                    {newOrders.length}
                </span>
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 w-80 h-full bg-slate-900 shadow-2xl z-50 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-slate-700 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><ShoppingBasket /> Đơn mới (Polling)</h3>
                    <button onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {newOrders.map((order) => (
                        <div key={order.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-orange-400 font-bold">#{order.id}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">Khách: {order.customerName}</p>
                            <button 
                                onClick={() => {
                                    router.push(`/admin/orders/${order.id}`);
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 bg-orange-600 text-white text-xs rounded flex items-center justify-center gap-1"
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