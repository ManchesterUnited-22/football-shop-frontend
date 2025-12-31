'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import Image from 'next/image'; 
import { X, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotalAmount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 via-black to-green-900 px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-white mb-2">Giỏ hàng đang trống</h1>
        <p className="text-gray-300 mb-8 text-center">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link href="/" className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
          QUAY LẠI MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-black to-green-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-3">
          🛒 GIỎ HÀNG <span className="text-red-400">({cartItems.length})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20 flex gap-4 items-center relative group hover:scale-[1.02] transition-transform">
                
                {/* NÚT XÓA */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-100/20 transition-all rounded-full"
                  title="Xóa khỏi giỏ"
                >
                  <X size={18} />
                </button>

                {/* Ảnh sản phẩm */}
                <div className="w-28 h-28 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image 
                    src={item.imageUrl || '/placeholder.jpg'} 
                    alt={item.name} 
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-grow pr-6">
                  <h3 className="font-bold text-white text-lg line-clamp-1">{item.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Kích cỡ: <span className="text-green-300 font-semibold">{item.sizeValue}</span>
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Bộ chọn số lượng */}
                    <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden bg-black/30">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-700 text-gray-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-700 text-gray-200 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    {/* Giá tiền */}
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Thành tiền</p>
                      <p className="font-bold text-green-300">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 text-gray-200">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{cartTotalAmount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-400 font-medium">Miễn phí</span>
                </div>
                <div className="border-t border-gray-500 pt-4 flex justify-between">
                  <span className="text-lg font-bold">Tổng tiền</span>
                  <span className="text-2xl font-black text-red-400">
                    {cartTotalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl uppercase">
                  Tiếp tục thanh toán
                </button>
              </Link>

              <Link href="/" className="block text-center mt-4 text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
