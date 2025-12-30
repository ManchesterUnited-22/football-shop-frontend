// app/order-confirmation/[id]/page.tsx

'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

// ======================
// Kiểu dữ liệu đơn hàng
// ======================
type OrderDetail = {
  id: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  note: string;
};

// Hàm format tiền tệ
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// =========================================================
// Component con: Hiển thị hướng dẫn chuyển khoản
// =========================================================
const BankTransferInfo = ({ orderId, amount }: { orderId: number; amount: number }) => (
  <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-5 rounded-xl flex-1">
    <h3 className="text-xl font-bold mb-3 flex items-center text-red-700">
      <CreditCardIcon className="w-6 h-6 mr-2" />
      HƯỚNG DẪN CHUYỂN KHOẢN
    </h3>
    <p className="text-sm mb-3">
      Đơn hàng của bạn đang ở trạng thái <strong>Chờ thanh toán</strong>. Vui lòng chuyển khoản chính xác số tiền sau:
    </p>

    <div className="space-y-3 p-3 bg-white rounded-lg border">
      <p className="text-base">
        <strong>Số tiền cần chuyển:</strong>{' '}
        <span className="font-extrabold text-2xl text-red-600">{formatCurrency(amount)}</span>
      </p>
      <p><strong>Ngân hàng:</strong> Vietcombank (VCB)</p>
      <p><strong>Số Tài khoản:</strong> 0071000888888</p>
      <p><strong>Chủ Tài khoản:</strong> 4FOOTBALL SHOP</p>
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

// =========================================================
// Component con: Tóm tắt đơn hàng
// =========================================================
const OrderSummary = ({ order }: { order: OrderDetail }) => (
  <div className="bg-blue-50 border border-blue-300 p-5 rounded-lg flex-1">
    <h3 className="text-lg font-bold text-blue-700 mb-3">TÓM TẮT ĐƠN HÀNG</h3>
    <ul className="text-sm space-y-2 text-gray-700 text-left">
      <li><strong>Mã đơn:</strong> {order.id}</li>
      <li><strong>Trạng thái:</strong> {order.status}</li>
      <li><strong>Tổng tiền:</strong> {formatCurrency(order.totalAmount)}</li>
      <li><strong>Ghi chú:</strong> {order.note}</li>
    </ul>
  </div>
);

// =========================================================
// Trang chính: Order Confirmation
// =========================================================
export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy chi tiết đơn hàng
  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError('ID đơn hàng không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Vui lòng đăng nhập lại.');

        const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Không thể tải chi tiết đơn hàng.');

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

  // Loading & Error
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lỗi: {error || 'Không tìm thấy đơn hàng.'}
      </div>
    );
  }

  // Kiểm tra loại thanh toán
  const isBankTransfer = order.note?.includes('CHUYỂN KHOẢN NGÂN HÀNG');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-4xl w-full bg-white p-10 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">ĐẶT HÀNG THÀNH CÔNG!</h1>
          <p className="text-lg font-semibold text-red-600 mt-2">MÃ ĐƠN HÀNG: {order.id}</p>
        </div>

        {/* Payment Info + Order Summary ngang hàng */}
        <div className="flex flex-col md:flex-row gap-6">
          {isBankTransfer ? (
            <BankTransferInfo orderId={order.id} amount={order.totalAmount} />
          ) : (
            <div className="bg-green-50 border border-green-300 p-5 rounded-lg flex-1">
              <p className="text-base text-gray-700 font-medium">
                Đơn hàng sẽ được chuyển đi ngay. Vui lòng chuẩn bị{' '}
                <span className="font-bold text-green-700">{formatCurrency(order.totalAmount)}</span> để thanh toán khi nhận
                hàng (COD).
              </p>
            </div>
          )}

          <OrderSummary order={order} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-10">
          <Link
            href="/"
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-center"
          >
            TIẾP TỤC MUA SẮM
          </Link>
          <Link
            href="/user/orders"
            className="flex-1 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition text-center"
          >
            Lịch sử Đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
