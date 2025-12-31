'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext'; 
import Link from 'next/link';
import Image from 'next/image';
import { Banknote, Truck, CreditCard, ShoppingBag } from 'lucide-react';

// ⚠️ GIẢ ĐỊNH HOOK XÁC THỰC (GIỮ NGUYÊN)
const useAuth = () => {
    const MOCK_USER_LOGGED_IN = true;
    const MOCK_USER_ID = 1;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return { 
        isAuthenticated: !!token || MOCK_USER_LOGGED_IN, 
        userId: MOCK_USER_ID 
    }; 
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
};

type FormDataState = {
    name: string;
    phone: string;
    address: string;
    note: string; 
    paymentMethod: 'COD' | 'BANK_TRANSFER';
};

const BankTransferInfo = () => (
    <div className="bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 p-5 rounded-2xl mt-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Banknote size={20} /> Thông tin Chuyển khoản
        </h3>
        <div className="space-y-2 text-sm">
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>Số TK:</strong> 0071000888888</p>
            <p><strong>Chủ TK:</strong> 4FOOTBALL</p>
            <p><strong>Nội dung chuyển khoản:</strong> <span className="font-black text-red-400">DONHANG[ID sẽ được gửi sau khi đặt]</span></p>
        </div>
        <p className="text-xs mt-3 text-gray-300">Sau khi chuyển khoản, đơn hàng sẽ được xác nhận trong 24h ⚡</p>
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (method: 'COD' | 'BANK_TRANSFER') => {
        setFormData(prev => ({ ...prev, paymentMethod: method }));
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
            router.push(`/admin/order-confirmation/${result.id}`); 

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert(`❌ Lỗi khi đặt hàng: ${(error as Error).message || 'Vui lòng thử lại.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-extrabold text-white mb-10 flex items-center gap-4">
                    <CreditCard className="text-red-500" size={50} />
                    THANH TOÁN ĐƠN HÀNG
                </h1>

                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* FORM THÔNG TIN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Thông tin giao hàng */}
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Truck size={28} /> 1. Thông tin Giao hàng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Họ và Tên (*)</label>
                                    <input
                                        type="text" name="name" required
                                        value={formData.name} onChange={handleChange}
                                        className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Số Điện Thoại (*)</label>
                                    <input
                                        type="tel" name="phone" required
                                        value={formData.phone} onChange={handleChange}
                                        className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        placeholder="0901234567"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Địa chỉ Giao hàng (*)</label>
                                <textarea
                                    name="address" rows={3} required
                                    value={formData.address} onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Ghi chú (Tùy chọn)</label>
                                <textarea
                                    name="note" rows={2}
                                    value={formData.note} onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                                    placeholder="Giao giờ hành chính, để trước cửa..."
                                />
                            </div>
                        </div>

                        {/* 2. Phương thức thanh toán */}
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Banknote size={28} /> 2. Phương thức Thanh toán
                            </h2>

                            <div className="space-y-4">
                                <label onClick={() => handlePaymentChange('COD')} className="flex items-center p-5 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition">
                                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={() => {}} className="w-5 h-5 text-red-500" />
                                    <span className="ml-4 text-white font-medium">Thanh toán khi nhận hàng (COD) - Miễn phí</span>
                                </label>

                                <label onClick={() => handlePaymentChange('BANK_TRANSFER')} className="flex items-center p-5 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition">
                                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={formData.paymentMethod === 'BANK_TRANSFER'} onChange={() => {}} className="w-5 h-5 text-red-500" />
                                    <span className="ml-4 text-white font-medium">Chuyển khoản Ngân hàng</span>
                                </label>

                                {formData.paymentMethod === 'BANK_TRANSFER' && <BankTransferInfo />}
                            </div>
                        </div>
                    </div>

                    {/* TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 sticky top-28">
                            <h2 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
                                <ShoppingBag size={32} /> Tóm tắt Đơn hàng
                            </h2>

                            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white/5 rounded-xl p-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <Image src={item.imageUrl || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-white font-medium text-sm line-clamp-2">{item.name}</p>
                                            <p className="text-gray-400 text-xs">Size: {item.sizeValue} × {item.quantity}</p>
                                        </div>
                                        <p className="text-green-400 font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/30 pt-6 space-y-4 text-lg">
                                <div className="flex justify-between text-gray-200">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-200">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-400 font-bold">30.000₫</span>
                                </div>
                                <div className="border-t border-white/30 pt-6 flex justify-between">
                                    <span className="text-2xl font-extrabold text-white">TỔNG CỘNG</span>
                                    <span className="text-3xl font-black text-red-500">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || cartCount === 0}
                                className={`mt-8 w-full py-5 rounded-2xl font-extrabold text-xl uppercase tracking-wider shadow-2xl transition-all duration-300
                                    ${isSubmitting || cartCount === 0 
                                        ? 'bg-gray-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-105 hover:shadow-red-500/50'}`}
                            >
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT ĐẶT HÀNG'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}