'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Bell, X, CheckCircle } from 'lucide-react';
import { fetchUserShippedOrders, confirmDelivery } from '@/app/services/order.service';
import type { Order } from '@/app/services/order.service';

// --- CẤU HÌNH ---
// Thời gian chờ trước khi hiển thị nút "Xác nhận đã nhận hàng" (1 phút cho testing)
const CONFIRMATION_TIMEOUT = 60 * 1000; 

export const DeliveryNotificationBar = () => {
    const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // =========================================================
    // 1. HÀM TẢI DỮ LIỆU TỪ SERVER (PULL)
    // =========================================================
    const loadShippedOrders = useCallback(async () => {
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const orders = await fetchUserShippedOrders();
            setShippedOrders(orders);
            // Hiển thị thanh thông báo nếu có ít nhất 1 đơn hàng đang SHIPPED
            setNotificationVisible(orders.length > 0); 
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng SHIPPED:', error);
        }
    }, []);

    // Tải dữ liệu lần đầu khi component được gắn (Mount)
    useEffect(() => {
        loadShippedOrders();
    }, [loadShippedOrders]);


    // =========================================================
    // 2. LOGIC REAL-TIME VỚI SSE (PUSH)
    // =========================================================
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        if (!token) return;
        const decoded: any = jwtDecode(token);
    if (decoded.role !== 'customer') return;

        // Khởi tạo kết nối SSE đến Backend
        // Chúng ta truyền token qua query string vì EventSource mặc định không hỗ trợ Headers
        const eventSource = new EventSource(`http://localhost:3001/notifications/sse?token=${token}`);

        // Lắng nghe sự kiện từ Server
        eventSource.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                
                // Nếu nhận được tín hiệu có đơn hàng mới đang giao
                if (parsedData.type === 'ORDER_SHIPPED') {
                    console.log('🔔 Thông báo mới từ hệ thống:', parsedData.message);
                    
                    // Cập nhật lại danh sách đơn hàng ngay lập tức mà không cần load lại trang
                    loadShippedOrders();
                    
                    // Tự động bật Sidebar để báo cho người dùng biết
                    setIsSidebarOpen(true);
                    
                    // Tùy chọn: Hiển thị thông báo trình duyệt hoặc phát âm thanh
                    // if (Notification.permission === 'granted') new Notification(parsedData.message);
                }
            } catch (err) {
                console.error('Lỗi phân tích dữ liệu SSE:', err);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Connection Error:', error);
            eventSource.close();
        };

        // Quan trọng: Ngắt kết nối khi User thoát trang hoặc logout
        return () => {
            eventSource.close();
        };
    }, [loadShippedOrders]);


    // =========================================================
    // 3. XỬ LÝ XÁC NHẬN ĐÃ NHẬN HÀNG
    // =========================================================
    const handleConfirmDelivery = async (orderId: number) => {
        setProcessingId(orderId);
        try {
            await confirmDelivery(orderId);
            alert(`✅ Tuyệt vời! Đơn hàng #${orderId} đã hoàn tất.`);
            
            // Tải lại danh sách để xóa đơn hàng đã xác nhận khỏi danh sách SHIPPED
            await loadShippedOrders();
        } catch (error) {
            alert(`Có lỗi xảy ra khi xác nhận. Vui lòng kiểm tra lại kết nối.`);
            console.error('Confirm delivery error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    // Nếu không có đơn hàng nào, ẩn hoàn toàn Component
    if (!notificationVisible) return null;

    return (
        <>
            {/* --- ICON CHUÔNG THÔNG BÁO (Góc dưới bên trái) --- */}
            <div 
                className="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-red-600 text-white cursor-pointer shadow-2xl transition-all hover:scale-110 active:scale-95 animate-bounce"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <Bell size={28} />
                {shippedOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-red-900 border-2 border-white">
                        {shippedOrders.length}
                    </span>
                )}
            </div>

            {/* --- SIDEBAR CHI TIẾT ĐƠN HÀNG --- */}
            {/* Lớp phủ mờ (Overlay) */}
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
                {/* Header Sidebar */}
                <div className="p-5 border-b flex justify-between items-center bg-indigo-700 text-white">
                    <div className="flex items-center gap-2">
                        <Truck size={24} />
                        <span className="font-bold text-lg">Hành trình đơn hàng</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="p-1 hover:bg-indigo-600 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Danh sách đơn hàng */}
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {shippedOrders.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10 italic">Không có đơn hàng nào đang giao.</p>
                    ) : (
                        shippedOrders.map((order) => {
                            const orderTime = new Date(order.createdAt).getTime();
                            const canConfirm = Date.now() - orderTime > CONFIRMATION_TIMEOUT;

                            return (
                                <div key={order.id} className="p-4 border-2 border-gray-100 rounded-xl shadow-sm bg-white hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-indigo-700 text-lg">#{order.id}</span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">Đang giao hàng</span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 mb-4">
                                        Đơn hàng đã được xuất kho và đang trên đường đến với bạn.
                                    </p>
                                    
                                    {canConfirm ? (
                                        <button
                                            onClick={() => handleConfirmDelivery(order.id)}
                                            disabled={processingId === order.id}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:bg-green-700 transition-all disabled:bg-gray-300 shadow-md"
                                        >
                                            {processingId === order.id ? (
                                                <span className="animate-pulse">Đang xử lý...</span>
                                            ) : (
                                                <><CheckCircle size={20} /> Tôi đã nhận đủ hàng</>
                                            )}
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
                        })
                    )}
                </div>
            </div>
        </>
    );
};