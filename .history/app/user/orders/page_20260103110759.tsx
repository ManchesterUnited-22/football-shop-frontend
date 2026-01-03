'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hook/useAuth';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiFetch} from 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'DELIVERED':
      return { label: 'Đã giao hàng', color: 'bg-emerald-900/70 text-emerald-300 border-emerald-700', icon: CheckCircle };
    case 'SHIPPED':
      return { label: 'Đang giao', color: 'bg-blue-900/70 text-blue-300 border-blue-700', icon: Truck };
    case 'PROCESSING':
      return { label: 'Đang xử lý', color: 'bg-yellow-900/70 text-yellow-300 border-yellow-700', icon: Package };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'bg-red-900/70 text-red-300 border-red-700', icon: XCircle };
    case 'PENDING':
    default:
      return { label: 'Chờ xác nhận', color: 'bg-gray-700 text-gray-300 border-gray-600', icon: Clock };
  }
};

export default function UserOrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const fetchOrders = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    // Sử dụng apiFetch giúp bạn không cần lo về localStorage hay baseURL nữa
    const data = await apiFetch('/orders/me');
    setOrders(data);
  } catch (err: any) {
    console.error('Lỗi tải đơn hàng:', err);
    setError(err.message || 'Không thể tải lịch sử đơn hàng.');
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/user/orders');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, isAuthLoading, fetchOrders, router]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-6 relative overflow-hidden">
      {/* Background nhẹ */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-5xl font-black text-center mb-12 tracking-tight">
          Lịch Sử Đơn Hàng ⚽
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800">
            <Package size={80} className="text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-400 mb-4">
              Bạn chưa có đơn hàng nào
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Hãy chọn ngay những món đồ bóng đá yêu thích để cháy hết mình trên sân cỏ!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-full font-bold text-xl transition-all hover:shadow-2xl hover:shadow-emerald-600/50"
            >
              Bắt đầu mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-900/30 hover:border-emerald-800/50 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-black">Đơn hàng #{order.id}</h2>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusConfig.color} flex items-center gap-2`}>
                          <StatusIcon size={18} />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-gray-400">
                        Đặt lúc: <span className="text-white font-semibold">{format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-6 mb-8">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 bg-gray-800/50 rounded-2xl p-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                          <Image
                            src={item.product.images[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg mb-1">{item.product.name}</h3>
                          <p className="text-gray-400 text-sm">
                            Size: <span className="text-emerald-400 font-bold">{item.variant.sizeValue}</span> | 
                            Số lượng: <span className="text-white font-bold">{item.quantity}</span>
                          </p>
                        </div>
                        <p className="text-xl font-black text-emerald-400">
                          {formatCurrency(item.priceAtPurchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer tổng kết */}
                  <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6">
                    <div className="text-right sm:text-left">
                      {order.shippingFee > 0 && (
                        <p className="text-gray-400 mb-1">
                          Phí vận chuyển: <span className="text-white font-semibold">{formatCurrency(order.shippingFee)}</span>
                        </p>
                      )}
                      <p className="text-3xl font-black text-emerald-400">
                        Tổng cộng: {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <button className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 transition">
                      Xem chi tiết đơn hàng →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animation nhẹ */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}