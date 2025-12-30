// app/order-confirmation/page.tsx

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Hoặc icon tương đương

export default function OrderConfirmationPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center">
                
                {/* Icon thành công */}
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />

                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    ĐẶT HÀNG THÀNH CÔNG!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng chúng tôi.
                </p>
                
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        Chi tiết đơn hàng sẽ được gửi qua email.
                    </p>
                    <Link 
                        href="/" 
                        className="block w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                    >
                        TIẾP TỤC MUA SẮM
                    </Link>
                    <Link 
                        href="/user/orders" // Nếu có trang lịch sử đơn hàng
                        className="block w-full py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                        Xem Lịch sử Đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
}