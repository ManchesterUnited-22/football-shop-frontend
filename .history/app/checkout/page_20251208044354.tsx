// app/checkout/page.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// Import hook giỏ hàng
import { useCart } from '../context/CartContext'; 
import Link from 'next/link';

// Helper để format tiền tệ (Có thể copy từ file OrdersManagementPage của bạn)
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export default function CheckoutPage() {
    const { cartItems, cartCount } = useCart();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'COD' as 'COD' | 'TRANSFER' // Mặc định là COD
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tính toán Tổng tiền
    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    // Thêm phí vận chuyển (Ví dụ)
    const shippingFee = 30000;
    const totalAmount = subtotal + shippingFee;

    // Xử lý thay đổi input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Gửi đơn hàng (HÀM QUAN TRỌNG NHẤT)
    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartCount === 0) {
            alert("Giỏ hàng rỗng. Vui lòng thêm sản phẩm.");
            return;
        }

        // ⭐️ THIẾT KẾ DATA CHO BACKEND ⭐️
        const orderData = {
            customerInfo: formData,
            items: cartItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId, 
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: totalAmount,
            shippingFee: shippingFee,
            // ... các trường khác cần thiết
        };

        setIsSubmitting(true);
        // THAY THẾ bằng API call thật:
        try {
            // const response = await fetch('http://localhost:3000/api/orders', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(orderData),
            // });
            // if (!response.ok) throw new Error('Đặt hàng thất bại.');
            // const result = await response.json();
            
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            alert('✅ Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
            
            // Xóa giỏ hàng sau khi đặt hàng thành công (Bạn cần thêm hàm clearCart trong CartContext)
            // clearCart(); 
            router.push('/order-confirmation'); // Chuyển đến trang xác nhận đơn hàng

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert('❌ Lỗi khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (cartCount === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center mt-10">
                <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống!</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    Quay lại trang chủ để mua sắm.
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-red-600 border-b pb-2">Thanh Toán Đơn Hàng</h1>
            
            {/* Bố cục 2 Cột: Thông tin & Tóm tắt */}
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 1. CỘT THÔNG TIN GIAO HÀNG (2/3 chiều rộng) */}
                <div className="lg:col-span-2 bg-white p-6 shadow-xl rounded-lg border">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Thông tin Giao hàng</h2>
                    
                    {/* Input Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và Tên (*)</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    
                    {/* Input Phone */}
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số Điện Thoại (*)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    
                    {/* Input Address */}
                    <div className="mb-4">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ Giao hàng (*)</label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    
                    {/* Input Notes */}
                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Ghi chú (Tùy chọn)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={2}
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-gray-800">2. Phương thức Thanh toán</h2>
                    
                    {/* Payment Method Selector */}
                    <div className="space-y-4">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={formData.paymentMethod === 'COD'}
                                onChange={handleChange}
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="TRANSFER"
                                checked={formData.paymentMethod === 'TRANSFER'}
                                onChange={handleChange}
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">Chuyển khoản Ngân hàng</span>
                        </label>
                        {/* Thêm các cổng thanh toán khác ở đây */}
                    </div>
                </div>

                {/* 2. CỘT TÓM TẮT ĐƠN HÀNG (1/3 chiều rộng) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 shadow-xl rounded-lg border">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Tóm tắt Đơn hàng</h2>

                        {/* Danh sách sản phẩm rút gọn */}
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm text-gray-600">
                                    <span className="truncate pr-2">
                                        {item.name} ({item.sizeValue}) x {item.quantity}
                                    </span>
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between text-base">
                                <span>Tạm tính:</span>
                                <span className="font-semibold">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span>Phí vận chuyển:</span>
                                <span className="font-semibold">{formatCurrency(shippingFee)}</span>
                            </div>
                            
                            <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-4 mt-4">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Nút ĐẶT HÀNG CUỐI CÙNG */}
                    <button
                        type="submit"
                        disabled={isSubmitting || cartCount === 0}
                        className={`mt-6 w-full py-4 rounded-lg font-bold text-lg transition active:scale-95 shadow-xl
                            ${isSubmitting || cartCount === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
                    </button>
                </div>
            </form>
        </div>
    );
}