// app/checkout/page.tsx (PHIÊN BẢN ĐÃ SỬA VÀ ĐỒNG BỘ BACKEND)

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext'; 
import Link from 'next/link';

// ⚠️ GIẢ ĐỊNH HOOK XÁC THỰC: 
// THAY THẾ useAuth() BẰNG HOOK THỰC TẾ TRONG DỰ ÁN CỦA BẠN (ví dụ: useSession, useUser)
const useAuth = () => ({ 
    isAuthenticated: true, 
    userId: 1, // ⭐️ Đây là ID người dùng thực tế từ DB (kiểu Int) ⭐️
}); 
// ⚠️ Đảm bảo bạn đã có hook này hoặc thay thế nó bằng logic lấy user ID của bạn.

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export default function CheckoutPage() {
    const { cartItems, cartCount, clearCart } = useCart();
    const router = useRouter();
    // Lấy trạng thái User
    const { isAuthenticated, userId } = useAuth(); // 👈 Lấy thông tin user
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'COD' as 'COD' | 'TRANSFER'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tính toán Tổng tiền
    const subtotal = useMemo(() => {
        return cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    const shippingFee = 30000;
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

        // 1. KIỂM TRA XÁC THỰC (Đã bỏ dữ liệu giả định)
        if (!isAuthenticated || !userId) {
            alert("Vui lòng đăng nhập để hoàn tất đơn hàng.");
            router.push('/login'); 
            return;
        }

        // Kiểm tra validation cơ bản
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ.");
            return;
        }

        // 2. CHUẨN BỊ PAYLOAD (KHỚP VỚI CreateOrderDto)
        const orderPayload = {
            // ⭐️ TRƯỜNG BẮT BUỘC THEO DTO VÀ SCHEMA ⭐️
            userId: userId, // Dùng ID thực tế
            customerName: formData.name, 
            customerPhone: formData.phone,
            shippingAddress: formData.address, // Dùng 'address' của form
            totalAmount: totalAmount, // Tổng cộng cuối cùng
            
            // TRƯỜNG TÙY CHỌN
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            
            // ⭐️ ITEMS (Khớp với CreateOrderItemDto) ⭐️
            items: cartItems.map((item: CartItem) => ({
                productId: item.productId,
                variantId: item.variantId, 
                quantity: item.quantity,
                priceAtPurchase: item.price, // Backend yêu cầu 'priceAtPurchase'
            })),
        };

        setIsSubmitting(true);
        try {
            // 3. GỌI API BACKEND NESTJS
            // ⚠️ THAY THẾ PORT/URL THỰC TẾ CỦA BACKEND
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi từ Server:', errorData);
                throw new Error(errorData.message || 'Đặt hàng thất bại.');
            }
            
            const result = await response.json();
            
            alert('✅ Đặt hàng thành công!');
            
            clearCart(); 
            // Chuyển hướng đến trang xác nhận, truyền ID đơn hàng mới
            router.push(`/order-confirmation/${result.id}`); 

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert(`❌ Lỗi khi đặt hàng: ${(error as Error).message || 'Vui lòng kiểm tra console.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ... (Phần render UI giữ nguyên)

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
             {/* ... (Phần hiển thị UI giữ nguyên) */}
             <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ... (UI form inputs) */}
                
                {/* 2. CỘT TÓM TẮT ĐƠN HÀNG */}
                <div className="lg:col-span-1">
                    {/* ... (UI tổng tiền và nút) */}
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