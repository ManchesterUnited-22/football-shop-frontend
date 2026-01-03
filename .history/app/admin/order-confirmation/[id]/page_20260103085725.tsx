// app/order-confirmation/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { apiFetch } from './utils/apiFetch';

type OrderDetail = {
  id: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  note: string | null;
  paymentMethod: 'COD' | 'BANK_TRANSFER';
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const BankTransferInfo = ({ orderId, amount }: { orderId: number; amount: number }) => (
  <div className="mt-10 p-8 bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md border border-amber-600/50 rounded-3xl shadow-2xl shadow-amber-900/40 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 bg-amber-500/20 rounded-2xl">
        <CreditCard className="w-10 h-10 text-amber-400" />
      </div>
      <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wider">
        Hướng dẫn chuyển khoản
      </h3>
    </div>

    <div className="space-y-5 text-left">
      <p className="text-amber-200 text-lg">
        Đơn hàng của bạn đang chờ thanh toán. Vui lòng chuyển đúng số tiền sau:
      </p>

      <div className="p-6 bg-white/10 rounded-2xl border border-amber-500/50">
        <p className="text-amber-100 mb-2">Số tiền cần chuyển</p>
        <p className="text-4xl font-black text-amber-400 animate-pulse">
          {formatCurrency(amount)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-amber-200">
        <div>
          <p className="text-sm opacity-80">Ngân hàng</p>
          <p className="font-bold text-xl">Vietcombank (VCB)</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Số tài khoản</p>
          <p className="font-bold text-xl">0071000888888</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Chủ tài khoản</p>
          <p className="font-bold text-xl">4FOOTBALL</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Nội dung chuyển khoản</p>
          <p className="font-black text-2xl text-red-400 bg-white/20 px-4 py-2 rounded-xl inline-block select-all animate-pulse">
            DONHANG{orderId}
          </p>
        </div>
      </div>

      <p className="text-sm text-amber-300 italic mt-6 flex items-center gap-2">
        <span className="animate-ping inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
        Hệ thống sẽ tự động xác nhận trong vòng 24h sau khi nhận tiền đúng nội dung.
      </p>
    </div>
  </div>
);

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError("ID đơn hàng không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error("Không thể tải chi tiết đơn hàng.");
        const data: OrderDetail = await response.json();
        setOrder(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-emerald-950 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-1000">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-white">Đang xác nhận đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-950 flex items-center justify-center p-6">
        <div className="text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="text-9xl mb-6">😞</div>
          <p className="text-3xl font-black text-red-500 mb-4">Lỗi!</p>
          <p className="text-xl text-gray-300">{error || "Không tìm thấy đơn hàng."}</p>
          <Link href="/" className="mt-8 inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-emerald-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-2xl w-full animate-in fade-in zoom-in-95 duration-1000">
        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-800/50 overflow-hidden">
          <div className="p-10 md:p-16 text-center">
            {/* Success Icon Animation */}
            <div className="mb-8 animate-in fade-in slide-in-from-top duration-700 delay-200">
              <div className="relative inline-block">
                <CheckCircle className="w-32 h-32 text-emerald-400 mx-auto drop-shadow-2xl animate-ping-once" />
                <CheckCircle className="w-32 h-32 text-emerald-500 absolute top-0 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in duration-700" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 animate-in fade-in slide-in-from-top duration-700 delay-300">
              ĐẶT HÀNG THÀNH CÔNG!
            </h1>

            <p className="text-2xl text-gray-300 mb-8 animate-in fade-in slide-in-from-top duration-700 delay-500">
              Cảm ơn bạn đã tin tưởng <span className="text-emerald-400 font-bold">4FOOTBALL</span> ⚽
            </p>

            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-2xl p-8 mb-10 border border-emerald-500/50 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
              <p className="text-xl text-gray-400 mb-2">Mã đơn hàng của bạn</p>
              <p className="text-5xl font-black text-emerald-400 tracking-wider animate-pulse">
                #{order.id}
              </p>
              <p className="text-3xl font-bold text-white mt-6">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>

            {/* Hướng dẫn chuyển khoản hoặc COD */}
            {isBankTransfer ? (
              <BankTransferInfo orderId={order.id} amount={order.totalAmount} />
            ) : (
              <div className="mt-10 p-8 bg-emerald-900/40 backdrop-blur-md border border-emerald-600/50 rounded-3xl animate-in fade-in slide-in-from-bottom duration-700 delay-900">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <ShoppingBag className="w-12 h-12 text-emerald-400" />
                  <h3 className="text-2xl font-black text-emerald-300">Thanh toán khi nhận hàng (COD)</h3>
                </div>
                <p className="text-xl text-gray-200">
                  Vui lòng chuẩn bị <span className="font-black text-emerald-400 text-3xl">{formatCurrency(order.totalAmount)}</span> khi nhận hàng.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
              <Link
                href="/"
                className="flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-xl uppercase tracking-wider rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-600/70 active:scale-95"
              >
                <ShoppingBag className="w-8 h-8" />
                Tiếp tục mua sắm
              </Link>

              <Link
                href="/user/orders"
                className="flex items-center justify-center gap-3 px-8 py-6 bg-white/10 hover:bg-white/20 text-white font-black text-xl uppercase tracking-wider rounded-2xl border-2 border-emerald-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <ArrowLeft className="w-8 h-8" />
                Xem đơn hàng của tôi
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-10 animate-in fade-in duration-1000 delay-1200">
          Chúng tôi sẽ gửi thông báo qua email/SMS khi đơn hàng được xử lý 🔥
        </p>
      </div>

      {/* Custom Animation Keyframes (Tailwind không có sẵn ping-once) */}
      <style jsx>{`
        @keyframes ping-once {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        .animate-ping-once {
          animation: ping-once 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}