// app/checkout/page.tsx - Phiên bản ĐÚNG (Chỉ tạo đơn hàng và chuyển hướng)

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext'; 
import Link from 'next/link';

// ⚠️ GIẢ ĐỊNH HOOK XÁC THỰC ⚠️
const useAuth = () => {
    const MOCK_USER_LOGGED_IN = true;
    const MOCK_USER_ID = 1; // ID người dùng (Int)
    
    // Đảm bảo bạn đang sử dụng logic token/session thực tế của mình
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return { 
        isAuthenticated: !!token, 
        userId: MOCK_USER_ID // Cần thay thế bằng logic lấy User ID từ token
    }; 
};
// ⚠️ ----------------------------- ⚠️

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

type FormDataState = {
    name: string;
    phone: string;
    address: string;
    note: string; 
    paymentMethod: 'COD' | 'BANK_TRANSFER';
};

// Component con để hiển thị thông tin chuyển khoản (Chỉ hiển thị trong form Checkout)
const BankTransferInfo = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg mt-4">
        <h3 className="text-sm font-bold mb-2">Thông tin chuyển khoản</h3>
        <div className="space-y-1 text-xs">
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>Số Tài khoản:</strong> 0071000888888</p>
            <p><strong>Chủ Tài khoản:</strong> </p>
            {/* Dùng placeholder cho Order ID */}
            <p><strong>Nội dung:</strong> <span className="font-bold text-red-600">DONHANG[ID Đơn hàng]</span></p>
        </div>
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
    const subtotal = useMemo(() => {
        return cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    }, [cartItems]);
    const totalAmount = subtotal + shippingFee;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartCount === 0 || !isAuthenticated || !userId || !formData.name || !formData.phone || !formData.address) {
            alert("Vui lòng kiểm tra giỏ hàng và điền đầy đủ thông tin.");
            return;
        }

        const orderItemsPayload = cartItems.map((item: CartItem) => ({
            productId: item.productId,
            variantId: item.variantId, 
            quantity: item.quantity,
            priceAtPurchase: item.price, 
        }));

        const orderPayload = {
            userId: userId, customerName: formData.name, customerPhone: formData.phone,
            shippingAddress: formData.address, totalAmount: totalAmount, 
            paymentMethod: formData.paymentMethod, note: formData.note, 
            items: orderItemsPayload,
        };
        const token = localStorage.getItem('access_token');

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Đặt hàng thất bại.');
            }
            
            const result = await response.json();
            
            clearCart(); 
            // ✅ CHUYỂN HƯỚNG ĐÚNG ĐẾN TRANG XÁC NHẬN
            router.push(`/admin/order-confirmation/${result.id}`); 

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert(`❌ Lỗi khi đặt hàng: ${(error as Error).message || 'Vui lòng kiểm tra console.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // UI: Form Checkout chính
    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-red-600 border-b pb-2">Thanh Toán Đơn Hàng</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 1. CỘT THÔNG TIN VÀ THANH TOÁN (Form) */}
                <form id="checkout-form" onSubmit={handleSubmitOrder} className="lg:col-span-2 bg-white p-6 shadow-xl rounded-lg border">
                    
                    {/* Phần 1. Thông tin Giao hàng */}
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Thông tin Giao hàng</h2>
                    
                    {/* Các Input (Name, Phone, Address, Note) */}
                    {/* ... (Đoạn code inputs ở đây giống phiên bản trước) ... */}
                    {/* Bạn cần sao chép các thẻ <label> và <input>/<textarea> từ code cũ vào đây */}

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
                    
                    <div className="mb-6">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">Ghi chú (Tùy chọn)</label>
                        <textarea
                            id="note"
                            name="note"
                            rows={2}
                            value={formData.note}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    
                    {/* Phần 2. Phương thức Thanh toán */}
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-t pt-6 mt-6">2. Phương thức Thanh toán</h2>
                    
                    {/* Payment Method Selector (COD/BANK_TRANSFER) */}
                    <div className="space-y-4">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                id="payment-cod"
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
                                id="payment-transfer"
                                name="paymentMethod"
                                value="BANK_TRANSFER"
                                checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                onChange={handleChange}
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">Chuyển khoản Ngân hàng</span>
                        </label>

                        {/* HIỂN THỊ HƯỚNG DẪN CHUYỂN KHOẢN RÚT GỌN (CHỈ TRONG CHECKOUT) */}
                        {formData.paymentMethod === 'BANK_TRANSFER' && (
                            <BankTransferInfo /> 
                        )}

                    </div>
                </form>
                
                {/* 2. CỘT TÓM TẮT ĐƠN HÀNG VÀ NÚT ĐẶT HÀNG */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 shadow-xl rounded-lg border sticky top-10">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Tóm tắt Đơn hàng</h2>

                        {/* Danh sách sản phẩm rút gọn... */}
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm text-gray-700">
                                    <span className="truncate pr-2">
                                        {item.name} x{item.quantity}
                                    </span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-base text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-base text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(shippingFee)}</span>
                            </div>

                            <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-4 mt-4">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    
                        {/* Nút ĐẶT HÀNG CUỐI CÙNG (Dùng form="checkout-form") */}
                        <button
                            form="checkout-form"
                            type="submit"
                            disabled={isSubmitting || cartCount === 0}
                            className={`mt-6 w-full py-4 rounded-lg font-bold text-lg transition active:scale-95 shadow-xl
                                ${isSubmitting || cartCount === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}