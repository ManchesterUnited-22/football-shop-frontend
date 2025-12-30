'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import Image from 'next/image'; 
import { X, Minus, Plus } from 'lucide-react'; // Import icon X và các icon bổ trợ

export default function CartPage() {
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
                    {/* DANH SÁCH SẢN PHẨM */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center relative group">
                                
                                {/* NÚT XÓA (DẤU X) - Đặt ở góc trên bên phải của card */}
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                                    title="Xóa khỏi giỏ"
                                >
                                    <X size={18} />
                                </button>

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
                                <div className="flex-grow pr-6"> {/* pr-6 để không bị đè lên nút X */}
                                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mb-3">
                                        Kích cỡ: <span className="text-black font-semibold">{item.sizeValue}</span>
                                    </p>

                                    <div className="flex items-center justify-between">
                                        {/* Bộ chọn số lượng */}
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        
                                        {/* Giá tiền */}
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Thành tiền</p>
                                            <p className="font-bold text-gray-900">
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
                                <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl hover:shadow-gray-200 uppercase">
                                    Tiếp tục thanh toán
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