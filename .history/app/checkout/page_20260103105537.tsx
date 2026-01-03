'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Banknote, Truck, CreditCard, ShoppingBag } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
// Giả lập auth (giữ nguyên)
const useAuth = () => {
  const MOCK_USER_LOGGED_IN = true;
  const MOCK_USER_ID = 1;
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return { 
    isAuthenticated: !!token || MOCK_USER_LOGGED_IN, 
    userId: MOCK_USER_ID 
  }; 
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN') + '₫';
};

type FormDataState = {
  name: string;
  phone: string;
  address: string;
  note: string; 
  paymentMethod: 'COD' | 'BANK_TRANSFER';
};

const BankTransferInfo = () => (
  <div className="mt-6 p-6 bg-gradient-to-br from-amber-900/40 to-orange-900/30 border border-amber-600/50 rounded-2xl backdrop-blur-md shadow-xl shadow-amber-900/30 transition-all duration-500">
    <h3 className="text-lg font-black text-amber-300 mb-4 flex items-center gap-3 uppercase tracking-wider">
      <Banknote size={24} className="animate-pulse" />
      Thông tin chuyển khoản
    </h3>
    <div className="space-y-3 text-sm text-gray-200">
      <p><strong>Ngân hàng:</strong> Vietcombank</p>
      <p><strong>Số TK:</strong> 0071000888888</p>
      <p><strong>Chủ TK:</strong> 4FOOTBALL</p>
      <p>
        <strong>Nội dung:</strong>{' '}
        <span className="font-black text-red-400 animate-pulse">
          DONHANG[ID sẽ gửi sau khi đặt]
        </span>
      </p>
    </div>
    <p className="text-xs mt-4 text-gray-400 italic">
      ⚡ Đơn hàng sẽ được xác nhận trong vòng 24h sau khi chuyển khoản thành công
    </p>
  </div>
);

export default function CheckoutPage() {
  const { cartItems, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();

  const [formData, setFormData] = useState<FormDataState>({
    name: '', phone: '', address: '', note: '',
    paymentMethod: 'COD'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = 30000;
  const subtotal = useMemo(() => 
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    [cartItems]
  );
  const totalAmount = subtotal + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method: 'COD' | 'BANK_TRANSFER') => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartCount === 0 || !isAuthenticated || !formData.name || !formData.phone || !formData.address) {
      alert("Vui lòng kiểm tra giỏ hàng và điền đầy đủ thông tin.");
      return;
    }

    const orderItemsPayload = cartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));

    const orderPayload = {
      userId,
      customerName: formData.name,
      customerPhone: formData.phone,
      shippingAddress: formData.address,
      totalAmount,
      paymentMethod: formData.paymentMethod,
      note: formData.note,
      items: orderItemsPayload,
    };

    const token = localStorage.getItem('access_token');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) throw new Error('Đặt hàng thất bại');
      const result = await response.json();

      clearCart();
      router.push(`/admin/order-confirmation/${result.id}`);
    } catch (error) {
      alert(`❌ Lỗi: ${(error as Error).message || 'Vui lòng thử lại sau'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-emerald-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề */}
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-12 text-center uppercase tracking-wider">
          <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Thanh Toán Đơn Hàng
          </span>
          <CreditCard className="inline-block ml-4 text-red-500 animate-pulse" size={60} />
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cột trái: Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* 1. Thông tin giao hàng */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-900/30 transition-shadow duration-500">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-wider">
                <Truck size={32} className="text-emerald-400" />
                Thông tin giao hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Họ và tên *</label>
                  <input
                    type="text" name="name" required
                    value={formData.name} onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Số điện thoại *</label>
                  <input
                    type="tel" name="phone" required
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-300 mb-2">Địa chỉ giao hàng *</label>
                <textarea
                  name="address" rows={4} required
                  value={formData.address} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 resize-none"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-300 mb-2">Ghi chú (tùy chọn)</label>
                <textarea
                  name="note" rows={3}
                  value={formData.note} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 resize-none"
                  placeholder="Giao giờ hành chính, gọi trước khi đến..."
                />
              </div>
            </div>

            {/* 2. Phương thức thanh toán */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-red-900/30 transition-shadow duration-500">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-wider">
                <Banknote size={32} className="text-red-400" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-5">
                <label
                  onClick={() => handlePaymentChange('COD')}
                  className={`flex items-center p-6 rounded-2xl cursor-pointer transition-all duration-500 border-2
                    ${formData.paymentMethod === 'COD'
                      ? 'bg-emerald-900/40 border-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80'
                    }`}
                >
                  <input type="radio" name="payment" checked={formData.paymentMethod === 'COD'} readOnly className="w-6 h-6 text-emerald-500" />
                  <span className="ml-5 text-lg font-bold text-white">
                    Thanh toán khi nhận hàng (COD) - <span className="text-emerald-400">Miễn phí</span>
                  </span>
                </label>

                <label
                  onClick={() => handlePaymentChange('BANK_TRANSFER')}
                  className={`flex items-center p-6 rounded-2xl cursor-pointer transition-all duration-500 border-2
                    ${formData.paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-red-900/40 border-red-500 shadow-lg shadow-red-500/30'
                      : 'bg-slate-800/50 border-slate-700 hover:border-red-500 hover:bg-slate-800/80'
                    }`}
                >
                  <input type="radio" name="payment" checked={formData.paymentMethod === 'BANK_TRANSFER'} readOnly className="w-6 h-6 text-red-500" />
                  <span className="ml-5 text-lg font-bold text-white">Chuyển khoản ngân hàng</span>
                </label>

                {formData.paymentMethod === 'BANK_TRANSFER' && <BankTransferInfo />}
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900/90 via-emerald-950/50 to-slate-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-emerald-800/30 sticky top-24 transition-all duration-700 hover:shadow-emerald-700/40">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-wider">
                <ShoppingBag size={36} className="text-emerald-400" />
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-5 mb-8 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-5 items-center bg-slate-800/60 rounded-xl p-5 hover:bg-slate-700/80 transition-all duration-300 border border-slate-700/50">
                    <div className="w-20 h-20 rounded-xl overflow-hidden relative shadow-lg">
                      <Image
                        src={item.imageUrl || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm line-clamp-2">{item.name}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Size: <span className="font-bold text-emerald-400">{item.sizeValue}</span> × {item.quantity}
                      </p>
                    </div>
                    <p className="text-emerald-400 font-black text-lg">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-800/50 pt-6 space-y-5 text-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-400 font-bold">30.000₫</span>
                </div>
                <div className="border-t border-emerald-700 pt-6 flex justify-between items-end">
                  <span className="text-2xl font-black text-white uppercase">Tổng cộng</span>
                  <span className="text-4xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartCount === 0}
                className={`mt-10 w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-wider shadow-2xl transition-all duration-500 flex items-center justify-center gap-4
                  ${isSubmitting || cartCount === 0
                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:scale-105 hover:shadow-red-600/70 active:scale-95'
                  }`}
              >
                {isSubmitting ? (
                  <>ĐANG XỬ LÝ...</>
                ) : (
                  <>
                    <CreditCard size={36} />
                    Hoàn tất đặt hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}