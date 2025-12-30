// app/cart/page.tsx

'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import Image from 'next/image'; 

export default function CartPage() {
    // Lấy cartItems, updateQuantity và removeFromCart
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    
    // Tính tổng tiền dựa trên cartItems (giá * số lượng)
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Nếu giỏ hàng trống
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-3xl font-bold text-gray-400 mb-4">Giỏ hàng đang trống 🛒</h1>
                <p className="text-gray-500 mb-8">Bạn chưa chọn món hàng nào cả.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    QUAY LẠI MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-900">GIỎ HÀNG CỦA BẠN ({cartItems.length} loại sản phẩm)</h1>
                </div>

                {/* Danh sách hàng */}
                <div className="p-6 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-6 last:border-0">
                            <div className="flex items-start gap-4 flex-grow">
                                {/* Hình ảnh */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded relative overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                        <Image 
                                            src={item.imageUrl} 
                                            alt={item.name} 
                                            layout="fill" 
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">IMG</span> 
                                    )}
                                </div>
                                
                                {/* Thông tin & Số lượng */}
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mb-2">Size: <span className="font-bold text-black">{item.sizeValue}</span></p>

                                    {/* Bộ chọn số lượng */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Giá tiền & Xóa */}
                            <div className="flex flex-col items-end gap-2">
                                <p className="font-bold text-xl text-blue-600">
                                    {(item.price * item.quantity).toLocaleString()} đ
                                </p>
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="text-red-500 hover:text-red-700 font-bold text-sm underline"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tổng tiền & Nút Thanh toán */}
                <div className="bg-gray-50 p-6 border-t flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-gray-600 text-lg">Tổng cộng:</span>
                        <span className="text-3xl font-bold text-red-600 ml-3">{total.toLocaleString()} VNĐ</span>
                    </div>

                    {/* ⭐️ FIX LỖI CHUYỂN HƯỚNG ⭐️ */}
                    <Link href="/checkout" passHref className="w-full md:w-auto">
                        <button 
                            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg w-full"
                        >
                            THANH TOÁN NGAY
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}