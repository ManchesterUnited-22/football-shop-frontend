'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Bell, X, CheckCircle, Package } from 'lucide-react';
import { fetchUserShippedOrders, confirmDelivery } from '@/app/services/order.service';
import type { Order } from '@/app/services/order.service';
import { jwtDecode } from 'jwt-decode';

const CONFIRMATION_TIMEOUT = 60 * 1000; // 60 giây

export const DeliveryNotificationBar = () => {
  const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadShippedOrders = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role?.toUpperCase() === 'ADMIN') {
        return; // Không hiển thị cho admin
      }

      const orders = await fetchUserShippedOrders();
      setShippedOrders(orders);
      setNotificationVisible(orders.length > 0);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng SHIPPED:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role?.toUpperCase() === 'ADMIN') return;

      loadShippedOrders();

      // Lấy base URL từ biến môi trường đã thiết lập
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const eventSource = new EventSource(`${API_BASE_URL}/notifications/sse?token=${token}`);

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

      eventSource.onerror = () => {
        eventSource.close();
      };

      return () => eventSource.close();
    } catch (e) {
      console.error("Token không hợp lệ");
    }
  }, [loadShippedOrders]);

  const handleConfirmDelivery = async (orderId: number) => {
    setProcessingId(orderId);
    try {
      await confirmDelivery(orderId);
      alert(`✅ Đơn hàng #${orderId} đã được xác nhận thành công!`);
      await loadShippedOrders();
    } catch (error) {
      alert('Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!notificationVisible || shippedOrders.length === 0) return null;

  return (
    <>
      {/* Floating Notification Bell */}
      <div
        className="fixed bottom-8 left-8 z-50 p-5 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white cursor-pointer shadow-2xl hover:shadow-red-600/50 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Bell size={32} strokeWidth={2.5} />
        <span className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-red-900 text-lg font-black shadow-lg border-4 border-white">
          {shippedOrders.length}
        </span>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-full max-w-md h-full bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 transition-transform duration-500 ease-out border-r border-gray-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-900/80 to-gray-900">
          <div className="flex items-center gap-4">
            <Truck size={32} className="text-emerald-400" />
            <div>
              <h2 className="text-2xl font-black text-white">Đơn hàng đang giao</h2>
              <p className="text-gray-400 text-sm">Bạn có {shippedOrders.length} đơn đang trên đường</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Order List */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
          {shippedOrders.map((order) => {
            const orderTime = new Date(order.createdAt).getTime();
            const canConfirm = Date.now() - orderTime > CONFIRMATION_TIMEOUT;

            return (
              <div
                key={order.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-emerald-600/50 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package size={28} className="text-emerald-500" />
                    <div>
                      <h3 className="text-xl font-black text-white">Đơn hàng #{order.id}</h3>
                      <p className="text-sm text-gray-400">
                        Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-blue-900/70 text-blue-300 text-sm font-bold rounded-full border border-blue-700">
                    Đang giao
                  </span>
                </div>

                <div className="text-gray-300 text-sm mb-6">
                  <p>Đơn hàng đang được vận chuyển đến bạn. Vui lòng kiểm tra kỹ khi nhận hàng nhé!</p>
                </div>

                {canConfirm ? (
                  <button
                    onClick={() => handleConfirmDelivery(order.id)}
                    disabled={processingId === order.id}
                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-lg rounded-xl shadow-xl hover:shadow-emerald-600/60 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                  >
                    {processingId === order.id ? (
                      <>Đang xử lý...</>
                    ) : (
                      <>
                        <CheckCircle size={28} />
                        Tôi đã nhận đủ hàng
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl text-center">
                    <p className="text-yellow-300 text-sm font-medium flex items-center justify-center gap-2">
                      <Bell size={18} />
                      Bạn có thể xác nhận sau khoảng 1 phút nữa
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