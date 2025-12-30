'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext'; 
import Link from 'next/link';

// ⚠️ GIẢ ĐỊNH HOOK XÁC THỰC ⚠️
const useAuth = () => {
    const MOCK_USER_LOGGED_IN = true;
    const MOCK_USER_ID = 1; 
    return { 
        isAuthenticated: MOCK_USER_LOGGED_IN, 
        userId: MOCK_USER_ID 
    }; 
};

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Component thông tin chuyển khoản
const BankTransferInfo = ({ orderId }: { orderId: number | string }) => (
    <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 p-5 rounded-xl mt-6">
        <h3 className="text-lg font-bold mb-3">Thông tin chuyển khoản</h3>
        <p className="text-sm mb-4">Vui lòng chuyển khoản chính xác để đơn hàng được xác nhận nhanh chóng.</p>
        <div className="space-y-2 text-sm">
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>Số TK:</strong> 0071000888888</p>
            <p><strong>Chủ TK:</strong> Cửa hàng X (Nguyễn Văn A)</p>
            <p><strong>Nội dung CK (BẮT BUỘC):</strong> <span className="font-bold text-red-600">DONHANG{orderId}</span></p>
        </div>
        <p className="text-xs italic mt-3">Sau khi chuyển khoản, đơn hàng sẽ tự động cập nhật trạng thái.</p>
    </div>
);

export default function CheckoutPage() {
    const { cartItems, cartCount, clearCart } = useCart();
    const router = useRouter();
    const { isAuthenticated, userId } = useAuth(); 

    const [formData, setFormData] = useState<FormDataState>({
        name: '',
        phone: '',
        address: '',
        note: '',
        paymentMethod: 'BANK_TRANSFER', // Mặc định để test
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null); // Để lưu ID sau khi tạo

    const shippingFee = 30000;
    const subtotal = useMemo(() => {
        return cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    }, [cartItems]);
    const totalAmount = subtotal + shippingFee;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name === 'notes' ? 'note' : name;
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartCount === 0) return alert("Giỏ hàng rỗng!");
        if (!isAuthenticated || !userId) {
            alert("Vui lòng đăng nhập!");
            router.push('/login');
            return;
        }
        if (!formData.name || !formData.phone || !formData.address) {
            return alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        }

        const orderItemsPayload = cartItems.map((item: CartItem) => ({
            productId: item.productId,
            variantId: item.variantId, 
            quantity: item.quantity,
            priceAtPurchase: item.price, 
        }));

        const orderPayload = {
            userId, 
            customerName: formData.name, 
            customerPhone: formData.phone,
            shippingAddress: formData.address, 
            totalAmount, 
            paymentMethod: formData.paymentMethod, 
            note: formData.note, 
            items: orderItemsPayload,
        };

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("Không tìm thấy token!");
            router.push('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) throw new Error('Đặt hàng thất bại');

            const result = await response.json();
            setCreatedOrderId(result.id); // Lưu ID để hiển thị info CK nếu cần

            alert('✅ Đặt hàng thành công!');
            clearCart();
            router.push(`/order-confirmation/${result.id}`);
        } catch (error) {
            alert(`❌ Lỗi: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartCount === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center mt-20">
                <h1 className="text-3xl font-bold mb-6">Giỏ hàng trống!</h1>
                <Link href="/" className="text-blue-600 hover:underline text-lg">Quay lại mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-red-600">Thanh Toán Đơn Hàng</h1>

            {/* Progress indicator đơn giản */}
            <div className="max-w-3xl mx-auto mb-10">
                <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-medium text-red-600">1. Thông tin</span>
                    <span className="font-medium text-red-600">2. Thanh toán</span>
                    <span className="font-medium text-gray-400">3. Hoàn tất</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-red-600 rounded-full transition-all"></div>
                </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột trái: Form thông tin + phương thức thanh toán */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Thông tin giao hàng */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border">
                        <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên (*)</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại (*)</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng (*)</label>
                            <textarea name="address" rows={3} value={formData.address} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                            <textarea name="note" rows={2} value={formData.note} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500" />
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border">
                        <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                        <div className="space-y-4">
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="h-5 w-5 text-red-600" />
                                <span className="ml-4 font-medium">Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={formData.paymentMethod === 'BANK_TRANSFER'} onChange={handleChange} className="h-5 w-5 text-red-600" />
                                <span className="ml-4 font-medium">Chuyển khoản ngân hàng</span>
                            </label>

                            {formData.paymentMethod === 'BANK_TRANSFER' && (
                                <BankTransferInfo orderId={createdOrderId || "[Sẽ hiển thị sau khi đặt hàng]"} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng (sticky trên desktop) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 sm:p-8 rounded-xl shadow-lg border sticky top-6">
                        <h2 className="text-2xl font-bold mb-6">Tóm tắt đơn hàng ({cartCount} sản phẩm)</h2>

                        {/* Danh sách sản phẩm */}
                        <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                            {cartItems.map((item) => (
                                <div key={item.productId + item.variantId} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-lg w-16 h-16 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-sm text-gray-600">{item.variantName && `${item.variantName} • `}Số lượng: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>{formatCurrency(shippingFee)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-4">
                                <span>TỔNG CỘNG</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`mt-8 w-full py-4 rounded-xl text-white font-bold text-lg transition ${
                                isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 shadow-lg active:scale-95'
                            }`}
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}