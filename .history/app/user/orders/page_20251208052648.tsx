// app/user/orders/page.tsx

'use client';
import Image from 'next/image';
import Link from 'next/link';

// ===================================
// ĐỊNH NGHĨA TYPES (Giả định tạm thời)
// ===================================
type OrderItem = {
    name: string;
    sizeValue: string;
    quantity: number;
    price: number;
    imageUrl: string;
};

type Order = {
    id: string;
    date: string;
    status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
    totalAmount: number;
    shippingFee: number;
    items: OrderItem[];
};

// ===================================
// DỮ LIỆU MÔ PHỎNG (Sẽ được thay bằng API)
// ===================================
const mockOrders: Order[] = [
    {
        id: 'ORDER-00101',
        date: '2025-12-05',
        status: 'Delivered',
        shippingFee: 30000,
        totalAmount: 580000,
        items: [
            { name: "Manchester United 2008", sizeValue: "L", quantity: 2, price: 250000, imageUrl: "https://res.cloudinary.com/dvxll7l8e/image/upload/v1765143377/nextjs_store_products/gqlkmqlwcnq2tbnfwrxyc6.jpg" },
            
        ],
    },
   
        id: 'ORDER-00103',
        date: '2025-12-07',
        status: 'Cancelled',
        shippingFee: 30000,
        totalAmount: 480000,
        items: [
            { name: "Áo Hoodie Trắng", sizeValue: "XL", quantity: 2, price: 225000, imageUrl: "https://res.cloudinary.com/dvxll7l8e/image/upload/v1765143377/nextjs_store_products/gqlkmqlwcnq2tbnfwrxyc6.jpg" },
        ],
    },
];

// Helper để format tiền tệ
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Helper để xác định màu trạng thái
const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'text-green-600 bg-green-100';
        case 'Confirmed': return 'text-blue-600 bg-blue-100';
        case 'Cancelled': return 'text-red-600 bg-red-100';
        case 'Pending':
        default: return 'text-yellow-600 bg-yellow-100';
    }
};

export default function UserOrdersPage() {
    const orders = mockOrders; // Trong thực tế, đây là hàm fetch data

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 min-h-screen bg-gray-50">
            <h1 className="text-4xl font-extrabold mb-8 text-blue-800 border-b pb-2">Lịch Sử Đơn Hàng</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white shadow rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-500">Bạn chưa có đơn hàng nào.</h2>
                    <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                        Bắt đầu mua sắm ngay!
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 shadow-lg rounded-xl border border-gray-200">
                            
                            {/* Header Đơn hàng */}
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Ngày Đặt hàng: <span className="font-semibold text-gray-800">{order.date}</span></p>
                                    <h2 className="text-xl font-bold text-gray-800">Mã Đơn hàng: {order.id}</h2>
                                </div>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status === 'Delivered' ? 'Đã Giao' : 
                                     order.status === 'Confirmed' ? 'Đã Xác nhận' :
                                     order.status === 'Cancelled' ? 'Đã Hủy' : 'Đang Chờ'}
                                </span>
                            </div>

                            {/* Chi tiết Items */}
                            <div className="space-y-4 mb-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                                            <Image 
                                                src={item.imageUrl || 'https://via.placeholder.com/150'} 
                                                alt={item.name} 
                                                layout="fill" 
                                                objectFit="cover"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-lg">{item.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.sizeValue} | SL: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Tổng kết */}
                            <div className="border-t pt-4 flex flex-col items-end space-y-1">
                                <p className="text-sm text-gray-600">Phí Vận chuyển: <span className="font-semibold">{formatCurrency(order.shippingFee)}</span></p>
                                <p className="text-xl font-extrabold text-red-600">
                                    Tổng Cộng: {formatCurrency(order.totalAmount)}
                                </p>
                                {/* Nút xem chi tiết (chưa xây dựng) */}
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                                    Xem chi tiết Đơn hàng &rarr;
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}