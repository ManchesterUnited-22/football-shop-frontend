'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotalAmount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-950 px-6 overflow-hidden">
        {/* Background sân bóng */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517926967790-dab3f1b0da12?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

        <div className="relative text-center z-10 animate-fade-in">
          <div className="text-8xl mb-8">⚽</div>
          <h1 className="text-5xl font-black text-white mb-6">
            Giỏ hàng trống
          </h1>
          <p className="text-gray-300 text-lg mb-12 max-w-md mx-auto">
            Chưa có sản phẩm nào. Hãy chọn ngay những món đồ bóng đá chất lượng để bùng nổ trên sân!
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/40"
          >
            <ShoppingBag size={28} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-950 py-12 px-6 overflow-hidden">
      {/* Background sân bóng đêm */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1624880357913-8e2a44d8c4a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Tiêu đề */}
        <h1 className="text-5xl font-black text-white mb-12 flex items-center gap-5 animate-fade-in">
          <ShoppingBag size={50} className="text-emerald-500" />
          Giỏ hàng của bạn
          <span className="text-3xl text-gray-400 font-normal">({cartItems.length} sản phẩm)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-8">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-800/50 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Ảnh */}
                <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden relative shadow-lg flex-shrink-0">
                  <Image
                    src={item.imageUrl || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Thông tin */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-gray-400">
                        Size: <span className="text-emerald-400 font-semibold text-lg">{item.sizeValue}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-all duration-300"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    {/* Số lượng */}
                    <div className="flex items-center bg-gray-800/60 rounded-full px-5 py-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="mx-8 font-bold text-white text-xl min-w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-400 hover:text-white transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    {/* Giá */}
                    <p className="text-3xl font-black text-emerald-400">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 sticky top-24 shadow-2xl animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-8">Tóm tắt đơn hàng</h2>

              <div className="space-y-5 mb-10 text-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-semibold">{cartTotalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-400 font-bold">Miễn phí toàn quốc</span>
                </div>
                <div className="border-t border-gray-700 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">Tổng cộng</span>
                    <span className="text-4xl font-black text-emerald-400">
                      {cartTotalAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl py-5 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/50 hover:-translate-y-1">
                  Thanh toán ngay
                </button>
              </Link>

              <Link 
                href="/" 
                className="block text-center mt-6 text-gray-400 hover:text-white font-medium transition"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation đơn giản */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}