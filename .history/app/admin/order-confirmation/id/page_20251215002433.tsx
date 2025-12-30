'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ⬅️ THÊM IMPORT IMAGE
import { CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'; 

// Khai báo kiểu dữ liệu giả định cho đơn hàng trả về từ Backend
type OrderDetail = {
    id: number;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    note: string;
};

// Hàm giả định để format tiền tệ
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// =========================================================
// HÀM TẠO URL QR CODE (ĐÃ THÊM)
// =========================================================
const generateVietQRUrl = (
    orderId: number, 
    amount: number, 
    bankId: string = '970436', // VCB
    accNo: string = '0071000888888' // TK mẫu
): string => {
    // Nội dung chuyển khoản phải chính xác (DONHANG[ID])
    const message = `DONHANG${orderId}`; 
    const encodedMessage = encodeURIComponent(message);
    
    const baseUrl = 'https://api.vietqr.io/image';
    const template = 'qr.png'; 

    return `${baseUrl}/${bankId}-${accNo}-${template}?amount=${amount}&addInfo=${encodedMessage}`;
};


// Component con: Hiển thị hướng dẫn chuyển khoản (ĐÃ BỔ SUNG QR)
const BankTransferInfo = ({ orderId, amount }: { orderId: number, amount: number }) => {
    
    const qrCodeUrl = generateVietQRUrl(orderId, amount); // ⬅️ Tạo URL QR

    return (
        <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-5 rounded-xl mt-6">
            <h3 className="text-xl font-bold mb-3 flex items-center text-red-700">
                <CreditCardIcon className="w-6 h-6 mr-2" />
                QUÉT MÃ QR ĐỂ THANH TOÁN
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* Khu vực Mã QR (MỚI) */}
                <div className="w-full md:w-1/2 p-3 bg-white border rounded-lg shadow-inner">
                    <p className="text-center font-bold text-lg mb-2 text-gray-800">TỔNG: {formatCurrency(amount)}</p>
                    {/* Hiển thị Mã QR Động */}
                    <div className="relative w-full h-auto aspect-square mx-auto">
                        <Image
                            src={qrCodeUrl}
                            alt={`Mã QR Thanh toán Đơn hàng ${orderId}`}
                            fill 
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'contain' }}
                            priority
                            unoptimized // Sử dụng unoptimized để tránh lỗi với nguồn ảnh ngoài
                        />
                    </div>
                </div>

                {/* Khu vực Chi tiết Chuyển khoản (CŨ) */}
                <div className="w-full md:w-1/2 space-y-3 text-sm text-left">
                    <p className="text-sm font-semibold text-gray-700">
                        Vui lòng quét mã QR trên bằng ứng dụng ngân hàng. Hệ thống sẽ tự động điền **số tiền** và **nội dung chuyển khoản**.
                    </p>
                    <p><strong>Ngân hàng:</strong> Vietcombank (VCB)</p>
                    <p><strong>Số Tài khoản:</strong> 0071000888888</p>
                    <p><strong>Chủ Tài khoản:</strong> Cửa hàng X (Nguyen Van A)</p>
                    <p className="border-t pt-2">
                        <strong>Nội dung:</strong> <span className="font-bold text-red-700">DONHANG{orderId}</span>
                    </p>
                </div>
            </div>
            
            <p className="text-sm font-bold text-green-700 mt-4 border-t pt-3">
                Hệ thống sẽ tự động xác nhận sau khi chuyển khoản thành công và chuyển đơn hàng sang trạng thái **Đang giao (SHIPPED)**.
            </p>
        </div>
    );
};


export default function OrderConfirmationPage() {
    // ... (Giữ nguyên logic của component chính)
    const params = useParams();
    const orderId = Number(params.id); 
    
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Gọi API để lấy chi tiết đơn hàng (GIỮ NGUYÊN)
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
    
    // 3. Kiểm tra xem đây có phải đơn hàng Chuyển khoản không (dựa vào nội dung 'note')
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
                
                {/* 4. HIỂN THỊ THÔNG TIN CHUYỂN KHOẢN */}
                {isBankTransfer && (
                    // Truyền ID và Amount
                    <BankTransferInfo orderId={order.id} amount={order.totalAmount} />
                )}

                {!isBankTransfer && (
                    <div className='bg-green-50 border border-green-300 p-4 rounded-lg mt-4'>
                        <p className="text-base text-gray-700 font-medium">
                            Đơn hàng sẽ được chuyển đi ngay. Vui lòng chuẩn bị {formatCurrency(order.totalAmount)} để thanh toán khi nhận hàng (COD).
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