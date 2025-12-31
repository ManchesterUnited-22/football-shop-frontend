'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import Image from 'next/image'; 
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotalAmount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-800 via-black to-green-900 px-6">
        <div className="text-8xl mb-6 animate-bounce">⚽</div>
        <h1 className="text-4xl font-extrabold 
          bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 
          bg-clip-text text-transparent mb-4 text-center">
          Giỏ hàng trống
        </h1>
        <p className="text-gray-300 text-lg mb-10 text-center max-w-md">
          Hãy chọn ngay những món đồ bóng đá yêu thích để cháy hết mình trên sân cỏ!
        </p>
        <Link href="/" className="bg-gradient-to-r from-red-600 to-red-800 text-white px-10 py-4 rounded-full font-bold text-xl hover:scale-110 transition-all shadow-2xl flex items-center gap-3">
          <ShoppingBag size={24} />
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 flex items-center gap-4 
          bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 
          bg-clip-text text-transparent">
          <ShoppingBag className="text-red-500" size={48} />
          GIỎ HÀNG CỦA BẠN
          <span className="text-3xl text-red-400 font-bold">({cartItems.length} sản phẩm)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-8">
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row gap-6 p-6 hover:scale-[1.03] hover:shadow-emerald-500/30 transition-all duration-500"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-lg">
                  <Image 
                    src={item.imageUrl || '/placeholder.jpg'} 
                    alt={item.name} 
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Thông tin */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-white text-xl mb-2 line-clamp-2">{item.name}</h3>
                      <p className="text-gray-300 text-sm">
                        Size: <span className="text-green-400 font-bold text-base">{item.sizeValue}</span>
                      </p>
                    </div>

                    {/* Nút xóa */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded-full transition-all"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    {/* Quantity selector */}
                    <div className="flex items-center bg-white/10 rounded-full px-4 py-2 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-300 hover:text-white hover:bg-emerald-500/30 rounded-full transition-all disabled:opacity-50"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="mx-6 font-bold text-white text-lg min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-300 hover:text-white hover:bg-emerald-500/30 rounded-full transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Giá */}
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-green-400">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-400/30 sticky top-28">
              <h2 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
                <span className="text-4xl">📋</span> Tóm tắt đơn hàng
              </h2>
              
              <div className="space-y-5 text-lg mb-8">
                <div className="flex justify-between text-gray-200">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-bold">{cartTotalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-200">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-400 font-bold">MIỄN PHÍ TOÀN QUỐC</span>
                </div>
                <div className="border-t border-white/30 pt-6 flex justify-between">
                  <span className="text-2xl font-extrabold text-white">TỔNG CỘNG</span>
                  <span className="text-3xl font-black text-red-500">
                    {cartTotalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-5 rounded-2xl font-extrabold text-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 uppercase tracking-wider shadow-xl animate-pulse">
                  Thanh Toán Ngay
                </button>
              </Link>

              <Link href="/" className="block text-center mt-6 text-gray-300 hover:text-white font-medium transition-colors">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
