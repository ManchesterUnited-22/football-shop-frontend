// app/checkout/page.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext'; 
import Link from 'next/link';

// ⚠️ GIẢ ĐỊNH HOOK XÁC THỰC ⚠️
// BẠN PHẢI THAY THẾ BẰNG HOOK THỰC TẾ TRONG DỰ ÁN CỦA BẠN
const useAuth = () => {
    // Trong môi trường thực tế, hook này sẽ lấy dữ liệu từ session/token
    const MOCK_USER_LOGGED_IN = true;
    const MOCK_USER_ID = 1; // ID người dùng (Int)
    
    return { 
        isAuthenticated: MOCK_USER_LOGGED_IN, 
        userId: MOCK_USER_ID 
    }; 
};
// ⚠️ ----------------------------- ⚠️

// Helper để format tiền tệ
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Định nghĩa kiểu dữ liệu cho Form State
type FormDataState = {
    name: string;
    phone: string;
    address: string;
    notes: string;
    paymentMethod: 'COD' | 'TRANSFER';
};

export default function CheckoutPage() {
    const { cartItems, cartCount, clearCart } = useCart();
    const router = useRouter();
    
    // Lấy trạng thái User từ hook giả định (hoặc hook thực tế)
    const { isAuthenticated, userId } = useAuth(); 
    
    const [formData, setFormData] = useState<FormDataState>({
        name: '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'COD'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tính toán Tổng tiền
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
        
        if (cartCount === 0) {
            alert("Giỏ hàng rỗng. Vui lòng thêm sản phẩm.");
            return;
        }

        // 1. KIỂM TRA XÁC THỰC
        if (!isAuthenticated || !userId) {
            alert("Vui lòng đăng nhập để hoàn tất đơn hàng.");
            router.push('/login'); 
            return;
        }

        // 2. KIỂM TRA VALIDATION
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ.");
            return;
        }

        // 3. CHUẨN BỊ PAYLOAD (KHỚP VỚI CreateOrderDto trong Backend)
        const orderItemsPayload = cartItems.map((item: CartItem) => ({
            productId: item.productId,
            variantId: item.variantId, 
            quantity: item.quantity,
            priceAtPurchase: item.price, // Backend cần tên trường này
        }));

        const orderPayload = {
            // Thông tin Order chính
            userId: userId, // ID người dùng thực tế
            customerName: formData.name, 
            customerPhone: formData.phone,
            shippingAddress: formData.address, 
            totalAmount: totalAmount, 
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            
            // Danh sách Items
            items: orderItemsPayload,
        };
        const token = localStorage.getItem('access_token');

        if (!token) {
            alert("Không tìm thấy Token. Vui lòng đăng nhập lại.");
            router.push('/login'); 
            return;
        }

        setIsSubmitting(true);
        try {
            // 4. GỌI API BACKEND NESTJS
            // ⚠️ ĐẢM BẢO PORT BACKEND LÀ 3001
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',  },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) {
                // Xử lý lỗi từ ValidationPipe của NestJS
                const errorData = await response.json();
                console.error('Lỗi từ Server:', errorData);
                throw new Error(errorData.message || 'Đặt hàng thất bại.');
            }
            
            const result = await response.json();
            
            // 5. Xử lý thành công
            alert('✅ Đặt hàng thành công!');
            
            clearCart(); 
            // Chuyển hướng đến trang xác nhận, truyền ID đơn hàng
            router.push(`admin/order-confirmation/${result.id}`); 

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert(`❌ Lỗi khi đặt hàng: ${(error as Error).message || 'Vui lòng kiểm tra console.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // UI: Hiển thị khi giỏ hàng trống
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

    // UI: Form Checkout chính
    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-red-600 border-b pb-2">Thanh Toán Đơn Hàng</h1>
            
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 1. CỘT THÔNG TIN GIAO HÀNG */}
                <div className="lg:col-span-2 bg-white p-6 shadow-xl rounded-lg border">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Thông tin Giao hàng</h2>
                    
                    {/* Các Input (Name, Phone, Address) */}
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
                    
                    {/* Payment Method Selector (COD/TRANSFER) */}
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
                                value="TRANSFER"
                                checked={formData.paymentMethod === 'TRANSFER'}
                                onChange={handleChange}
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">Chuyển khoản Ngân hàng</span>
                        </label>
                    </div>
                </div>

                {/* 2. CỘT TÓM TẮT ĐƠN HÀNG */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 shadow-xl rounded-lg border sticky top-10">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Tóm tắt Đơn hàng</h2>

                        {/* Danh sách sản phẩm rút gọn */}
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {cartItems.map((item: CartItem, index: number) => (
                                <div key={index} className="flex justify-between text-sm text-gray-600">
                                    <span className="truncate pr-2">
                                        {item.name} x {item.quantity}
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