'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import Image from 'next/image'; 

export default function CartPage() {
    // Lấy dữ liệu từ Context - dùng cartTotalAmount đã tính sẵn
    const { cartItems, removeFromCart, updateQuantity, cartTotalAmount } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng đang trống</h1>
                <p className="text-gray-500 mb-8 text-center">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                <Link href="/" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200">
                    QUAY LẠI MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    GIỎ HÀNG <span className="text-red-600">({cartItems.length})</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* DANH SÁCH SẢN PHẨM (Bên trái) */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                {/* Ảnh sản phẩm */}
                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    <Image 
                                        src={item.imageUrl || '/placeholder.jpg'} 
                                        alt={item.name} 
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Thông tin sản phẩm */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mb-3">
                                        Kích cỡ: <span className="text-black font-semibold">{item.sizeValue}</span>
                                    </p>

                                    <div className="flex items-center justify-between">
                                        {/* Bộ chọn số lượng */}
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-3 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-3 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        
                                        {/* Giá của một sản phẩm */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Đơn giá: {item.price.toLocaleString()}đ</p>
                                            <p className="font-bold text-gray-900">
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nút xóa */}
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Xóa khỏi giỏ"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d=" orbit-19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* TÓM TẮT ĐƠN HÀNG (Bên phải) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{cartTotalAmount.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between">
                                    <span className="text-lg font-bold">Tổng tiền</span>
                                    <span className="text-2xl font-black text-red-600">
                                        {cartTotalAmount.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl hover:shadow-gray-200">
                                    TIẾP TỤC THANH TOÁN
                                </button>
                            </Link>

                            <Link href="/" className="block text-center mt-4 text-gray-500 hover:text-black text-sm font-medium transition-colors">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}