// app/order-confirmation/[id]/page.tsx - Phiên bản ĐÚNG (Tải dữ liệu và Xác nhận)

'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'; 

// Khai báo kiểu dữ liệu
type OrderDetail = {
    id: number;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    note: string; 
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Component con: Hiển thị hướng dẫn chuyển khoản
const BankTransferInfo = ({ orderId, amount }: { orderId: number, amount: number }) => (
    <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-5 rounded-xl mt-6">
        <h3 className="text-xl font-bold mb-3 flex items-center text-red-700">
            <CreditCardIcon className="w-6 h-6 mr-2" />
            HƯỚNG DẪN CHUYỂN KHOẢN
        </h3>
        <p className="text-sm mb-3">
            Đơn hàng của bạn đang ở trạng thái **Chờ thanh toán**. Vui lòng chuyển khoản chính xác số tiền sau:
        </p>
        
        <div className="space-y-3 p-3 bg-white rounded-lg border">
            <p className="text-base">
                <strong>Số tiền cần chuyển:</strong> <span className="font-extrabold text-2xl text-red-600">{formatCurrency(amount)}</span>
            </p>
            <p><strong>Ngân hàng:</strong> Vietcombank (VCB)</p>
            <p><strong>Số Tài khoản:</strong> 0071000888888</p>
            <p><strong>Chủ Tài khoản:</strong> 4FOOTBALL</p>
            <p className="text-base border-t pt-2">
                <strong>Nội dung chuyển khoản (BẮT BUỘC):</strong> <br />
                <span className="font-bold text-red-700 text-lg select-all bg-gray-200 inline-block p-1 rounded">
                    DONHANG{orderId}
                </span>
            </p>
        </div>
        <p className="text-xs italic pt-3">
            Hệ thống sẽ tự động xác nhận đơn hàng sau khi nhận được chuyển khoản với nội dung chính xác.
        </p>
    </div>
);


export default function OrderConfirmationPage() {
    
    const params = useParams();
    // Lấy ID từ URL
    const orderId = Number(params.id); 
    
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ CHỨC NĂNG DUY NHẤT CỦA FILE NÀY: Fetch dữ liệu đơn hàng
    useEffect(() => {
        if (!orderId || isNaN(orderId)) {
            setError("ID đơn hàng không hợp lệ.");
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error("Vui lòng đăng nhập lại.");

                // GỌI API LẤY CHI TIẾT ĐƠN HÀNG
                const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải chi tiết đơn hàng.");
                }

                const data: OrderDetail = await response.json();
                setOrder(data);

            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);
    
    // Xử lý trạng thái Loading và Error
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết đơn hàng...</div>;
    }
    
    if (error || !order) {
        return <div className="min-h-screen flex items-center justify-center text-red-600">Lỗi: {error || "Không tìm thấy đơn hàng."}</div>;
    }
    
    // Kiểm tra phương thức thanh toán
    const isBankTransfer = order.note?.includes("CHUYỂN KHOẢN NGÂN HÀNG");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-2xl text-center">
                
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    ĐẶT HÀNG THÀNH CÔNG!
                </h1>
                <p className="text-xl font-semibold text-red-600 mb-4">
                    MÃ ĐƠN HÀNG: {order.id}
                </p>
                
                {/* HIỂN THỊ THÔNG TIN CHUYỂN KHOẢN CHI TIẾT */}
                {isBankTransfer && (
                    <BankTransferInfo orderId={order.id} amount={order.totalAmount} />
                )}

                {!isBankTransfer && (
                    <div className='bg-green-50 border border-green-300 p-4 rounded-lg mt-4'>
                        <p className="text-base text-gray-700 font-medium">
                            Thanh toán COD. Vui lòng chuẩn bị {formatCurrency(order.totalAmount)} khi nhận hàng.
                        </p>
                    </div>
                )}
                
                <div className="space-y-3 mt-8">
                    <Link 
                        href="/" 
                        className="block w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                    >
                        TIẾP TỤC MUA SẮM
                    </Link>
                    <Link 
                        href="/user/orders" 
                        className="block w-full py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                        Xem Lịch sử Đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
}