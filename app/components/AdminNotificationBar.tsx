'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBasket, Bell, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/app/services/order.service';
import { jwtDecode } from 'jwt-decode'; // Cần import thêm cái này

export const AdminNotificationBar = () => {
    const [newOrders, setNewOrders] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const lastOrderCount = useRef<number | null>(null);
    const router = useRouter();

    const checkNewOrders = async () => {
        try {
            const orders = await fetchOrders();
            const pendingOrders = orders.filter((o: any) => o.status === 'PENDING');

            if (lastOrderCount.current !== null && pendingOrders.length > lastOrderCount.current) {
                setNewOrders(pendingOrders.slice(0, 5));
                setIsOpen(true);
                new Audio('/notification-sound.mp3').play().catch(() => {});
            }

            lastOrderCount.current = pendingOrders.length;
        } catch (error) {
            console.error("Lỗi Polling đơn hàng:", error);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            // 🛑 CHỐT CHẶN: Nếu không phải ADMIN thì thoát luôn, không Polling làm gì cho tốn tài nguyên
            if (decoded.role?.toUpperCase() !== 'ADMIN') {
                return;
            }

            // Đúng là Admin thì mới bắt đầu làm việc
            checkNewOrders();
            const interval = setInterval(checkNewOrders, 30000);
            return () => clearInterval(interval);

        } catch (error) {
            console.error("Token không hợp lệ tại AdminBar");
        }
    }, []);

    // Nếu không có đơn hoặc không phải admin (newOrders trống) thì không hiện gì
    if (newOrders.length === 0) return null;

    return (
        <>
            {/* Giữ nguyên phần UI bên dưới của bạn - Nó đã rất đẹp rồi */}
            <div 
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-orange-600 text-white cursor-pointer shadow-2xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={28} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600 border-2 border-orange-600">
                    {newOrders.length}
                </span>
            </div>
            {/* ... Sidebar code giữ nguyên ... */}
        </>
    );
};