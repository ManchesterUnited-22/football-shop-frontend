'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';

// =================================
// 1. TYPINGS VÀ MOCK DATA
// =================================

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    variant: {
        size: string;
        color: string;
    };
}

interface Order {
    id: number;
    userId: number;
    customerName: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: string;
}

const MOCK_ORDERS: Order[] = [
    {
        id: 1001,
        userId: 1,
        customerName: "Nguyễn Văn A",
        totalAmount: 3500000,
        status: 'PENDING',
        createdAt: "2025-11-30T10:00:00Z",
        shippingAddress: "45 Lê Lợi, Quận 1, TP.HCM",
        items: [
            { name: "Áo đấu MU 2024", quantity: 2, price: 1500000, variant: { size: 'M', color: 'Đỏ' } },
            { name: "Giày Adidas Predator", quantity: 1, price: 500000, variant: { size: '42', color: 'Đen' } },
        ]
    },
    {
        id: 1002,
        userId: 2,
        customerName: "Trần Thị B",
        totalAmount: 1200000,
        status: 'SHIPPING',
        createdAt: "2025-11-29T15:30:00Z",
        shippingAddress: "123 Hoàng Hoa Thám, Hà Nội",
        items: [
            { name: "Phụ kiện bó gối", quantity: 3, price: 100000, variant: { size: 'L', color: 'Đen' } },
            { name: "Áo tập luyện", quantity: 1, price: 900000, variant: { size: 'S', color: 'Xanh' } },
        ]
    },
    {
        id: 1003,
        userId: 3,
        customerName: "Lê Văn C",
        totalAmount: 850000,
        status: 'DELIVERED',
        createdAt: "2025-11-25T08:15:00Z",
        shippingAddress: "Khu Phố 5, Đà Nẵng",
        items: [
            { name: "Bóng đá số 5", quantity: 1, price: 850000, variant: { size: '5', color: 'Trắng' } },
        ]
    },
    {
        id: 1004,
        userId: 1,
        customerName: "Nguyễn Văn A",
        totalAmount: 500000,
        status: 'CANCELLED',
        createdAt: "2025-11-20T11:00:00Z",
        shippingAddress: "45 Lê Lợi, Quận 1, TP.HCM",
        items: [
            { name: "Áo đấu MU 2024", quantity: 1, price: 1500000, variant: { size: 'S', color: 'Đỏ' } },
        ]
    },
];

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

// Helper để format tiền tệ
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Helper để format ngày
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};

// =================================
// 2. COMPONENT LOGIC
// =================================

export default function OrdersManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState<number | null>(null); // Dùng để disable nút khi đang cập nhật
    const router = useRouter();

    // Xác thực Admin
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        try {
            const decodedToken: { role: string } = jwtDecode(token);
            const userRole = decodedToken.role.toLowerCase();

            if (userRole !== 'admin') {
                alert('Bạn không có quyền truy cập trang quản trị.');
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error("Lỗi giải mã token:", error);
            localStorage.removeItem('jwtToken');
            router.push('/auth/login');
        }
    }, [router]);

    // Fetch dữ liệu đơn hàng
    useEffect(() => {
        if (isAuthorized) {
            const loadOrders = async () => {
                setIsFetching(true);
                try {
                    // THAY THẾ bằng API call thật:
                    // const token = localStorage.getItem('jwtToken');
                    // const response = await fetch(`http://localhost:3000/orders`, { 
                    //     headers: { 'Authorization': `Bearer ${token}` }
                    // });
                    // if (!response.ok) throw new Error('Không thể tải dữ liệu đơn hàng.');
                    // const data: Order[] = await response.json();
                    
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    setOrders(MOCK_ORDERS);
                    setFilteredOrders(MOCK_ORDERS);

                } catch (err: any) {
                    setError(err.message || 'Không thể tải dữ liệu đơn hàng.');
                } finally {
                    setIsFetching(false);
                }
            };
            loadOrders();
        }
    }, [isAuthorized]);

    // Lọc đơn hàng khi trạng thái thay đổi
    useEffect(() => {
        if (selectedStatus === 'ALL') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === selectedStatus));
        }
    }, [selectedStatus, orders]);

    // Hàm cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
        setIsLoadingStatus(orderId);
        setError(null);
        try {
            // THAY THẾ bằng API call thật:
            // const token = localStorage.getItem('jwtToken');
            // const response = await fetch(`http://localhost:3000/orders/${orderId}/status`, {
            //     method: 'PATCH',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}` 
            //     },
            //     body: JSON.stringify({ status: newStatus }),
            // });
            // if (!response.ok) throw new Error('Cập nhật trạng thái thất bại.');
            
            await new Promise(resolve => setTimeout(resolve, 300)); 

            // Cập nhật state trong Frontend (Mock)
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            console.log(`Đơn hàng #${orderId} đã được cập nhật sang trạng thái: ${newStatus}`);

        } catch (err: any) {
            setError(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng.');
        } finally {
            setIsLoadingStatus(null);
        }
    };
    
    // Helper để hiển thị badge trạng thái
    const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
        let colorClass = '';
        switch (status) {
            case 'PENDING':
                colorClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'PROCESSING':
                colorClass = 'bg-blue-100 text-blue-800';
                break;
            case 'SHIPPING':
                colorClass = 'bg-indigo-100 text-indigo-800';
                break;
            case 'DELIVERED':
                colorClass = 'bg-green-100 text-green-800';
                break;
            case 'CANCELLED':
                colorClass = 'bg-red-100 text-red-800';
                break;
            default:
                colorClass = 'bg-gray-100 text-gray-800';
        }
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                {status}
            </span>
        );
    };

    // =================================
    // 3. RENDER UI
    // =================================

    if (!isAuthorized || isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[500px] text-lg text-gray-600">
                {isFetching ? 'Đang tải danh sách đơn hàng...' : 'Đang kiểm tra quyền truy cập...'}
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-[calc(100vh-80px)] shadow-lg rounded-lg my-8">
            <header className="mb-6 border-b pb-4 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-red-700">Quản lý Đơn hàng</h1>
                <Link href="/admin" className="text-sm text-blue-500 hover:text-blue-700 transition font-medium">
                    &larr; Quay lại trang Admin
                </Link>
            </header>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Lỗi: {error}
                </div>
            )}
            
            {/* Thanh lọc và tìm kiếm */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <label htmlFor="statusFilter" className="text-gray-600 font-medium whitespace-nowrap">Lọc theo Trạng thái:</label>
                    <select
                        id="statusFilter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'ALL')}
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">Tất cả</option>
                        {ORDER_STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <p className="text-sm text-gray-500">Tìm thấy **{filteredOrders.length}** đơn hàng.</p>
            </div>

            {/* Bảng Đơn hàng */}
            <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    Không có đơn hàng nào với trạng thái "{selectedStatus === 'ALL' ? 'Tất cả' : selectedStatus}".
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.customerName}
                                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{order.shippingAddress}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">{formatCurrency(order.totalAmount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                            disabled={isLoadingStatus === order.id}
                                            className={`p-1.5 border rounded-lg text-sm transition focus:ring-blue-500 focus:border-blue-500 ${
                                                isLoadingStatus === order.id ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:border-blue-300'
                                            }`}
                                        >
                                            {ORDER_STATUS_OPTIONS.map(status => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingStatus === order.id && (
                                            <span className="ml-2 text-xs text-blue-500">Đang cập nhật...</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}