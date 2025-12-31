'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  XCircle, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw,
  Filter
} from 'lucide-react';
import Link from 'next/link';

import { apiFetch } from '../../utils/apiFetch';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  createdAt: string;
  trackingCode: string | null;
}

const formatCurrency = (amount: number) => 
  amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const configs: Record<OrderStatus, { color: string; icon: React.ReactNode }> = {
    [OrderStatus.PENDING]: { color: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Clock size={16} /> },
    [OrderStatus.PROCESSING]: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Package size={16} /> },
    [OrderStatus.SHIPPED]: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: <Truck size={16} /> },
    [OrderStatus.DELIVERED]: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <CheckCircle size={16} /> },
    [OrderStatus.CANCELLED]: { color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle size={16} /> },
  };

  const { color, icon } = configs[status];

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border ${color} shadow-sm`}>
      {icon}
      {status === 'PENDING' ? 'Chờ xác nhận' :
       status === 'PROCESSING' ? 'Đang xử lý' :
       status === 'SHIPPED' ? 'Đang giao' :
       status === 'DELIVERED' ? 'Đã giao' :
       'Đã hủy'}
    </span>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Order[]>('/orders', { method: 'GET' });
      // Sắp xếp theo mới nhất
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      alert('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter(order => order.status === filterStatus);
  }, [orders, filterStatus]);

  const statusOptions = ['ALL', ...Object.values(OrderStatus)] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
                Quản lý đơn hàng
              </h1>
              <p className="text-gray-600 mt-2">Tổng cộng: <span className="font-bold text-emerald-600">{orders.length}</span> đơn hàng</p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-60 hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
              Tải lại danh sách
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-10 border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Lọc theo trạng thái</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md
                  ${filterStatus === status
                    ? 'bg-emerald-600 text-white shadow-emerald-600/50 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
                  }`}
              >
                {status === 'ALL' ? 'Tất cả' :
                 status === 'PENDING' ? 'Chờ xác nhận' :
                 status === 'PROCESSING' ? 'Đang xử lý' :
                 status === 'SHIPPED' ? 'Đang giao' :
                 status === 'DELIVERED' ? 'Đã giao' :
                 'Đã hủy'}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Đang hiển thị: <span className="font-bold text-emerald-600">{filteredOrders.length}</span> đơn hàng
          </p>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 font-medium">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-200">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <p className="text-xl text-gray-600 font-medium">
                Không có đơn hàng nào ở trạng thái này.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 group"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Thông tin khách & đơn hàng */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl font-black text-emerald-600">#{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {order.customerName}
                      </h3>
                      <p className="text-gray-700 font-medium mb-3">
                        <span className="text-gray-500">Điện thoại:</span> {order.customerPhone}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        <span className="font-medium">Địa chỉ:</span> {order.shippingAddress}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-lg">
                        <div className="font-black text-emerald-600 text-3xl">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-gray-600">
                          Thanh toán: <span className="font-bold text-emerald-600">
                            {order.paymentMethod === 'COD' ? 'Khi nhận hàng' : 'Chuyển khoản'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trạng thái & Action */}
                    <div className="flex flex-col items-end gap-6">
                      <StatusBadge status={order.status} />

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-lg uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-emerald-600/70"
                      >
                        Xử lý đơn hàng
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}