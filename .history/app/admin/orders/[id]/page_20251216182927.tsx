// STORE-FRONTEND/app/admin/orders/[id]/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Import các hàm Service đã được đóng gói
import { 
    createShippingLabel, 
    processOrder, 
    fetchOrderDetails 
} from '@/app/services/order.service';

// Định nghĩa kiểu dữ liệu (Lấy từ order.service.ts)
interface Order {
    id: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    trackingCode: string | null;
    shippingLabelUrl: string | null;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
}

const AdminOrderDetailPage = () => {
    const params = useParams();
    const orderId = parseInt(params.id as string);
    
    // --- STATE QUẢN LÝ DỮ LIỆU & TRẠNG THÁI ---
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- LOGIC FETCH DỮ LIỆU BAN ĐẦU (useEffect) ---
    useEffect(() => {
        const loadOrder = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchOrderDetails(orderId);
                setOrder(data);
            } catch (err) {
                setError('Không thể tải chi tiết đơn hàng: ' + (err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        if (orderId && !isNaN(orderId)) {
            loadOrder();
        } else {
            setIsLoading(false);
            setError('ID đơn hàng không hợp lệ.');
        }
    }, [orderId]);


    // --- HÀM XỬ LÝ: TẠO VẬN ĐƠN (Gửi PATCH) ---
    const handleCreateShippingLabel = async () => {
        if (!order || order.status !== 'PROCESSING') return;
        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const result = await createShippingLabel(order.id);
            setOrder(result.order as Order); 
            setSuccessMessage(`✅ Tạo vận đơn thành công! Mã: ${result.trackingCode}. Đã chuyển sang SHIPPED.`);
            
        } catch (err) {
            setError('Lỗi khi tạo vận đơn: ' + (err as Error).message);
        } finally {
            setIsMutating(false);
        }
    };

    // --- HÀM XỬ LÝ: CHUYỂN TRẠNG THÁI SANG PROCESSING ---
    const handleProcessOrder = async () => {
        if (!order || order.status !== 'PENDING') return;
        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const updatedOrder = await processOrder(order.id);
            setOrder(updatedOrder as Order); 
            setSuccessMessage(`✅ Đơn hàng đã chuyển sang trạng thái PROCESSING.`);
        } catch (err) {
            setError('Lỗi khi xử lý đơn hàng: ' + (err as Error).message);
        } finally {
            setIsMutating(false);
        }
    };
    
    // --- HIỂN THỊ TRẠNG THÁI ---
    if (isLoading) return <div className="p-4">Đang tải chi tiết đơn hàng...</div>;
    if (error && !order) return <div className="p-4" style={{ color: 'red' }}>Lỗi tải dữ liệu: {error}</div>;
    if (!order) return <div className="p-4">Không tìm thấy đơn hàng #{orderId}.</div>;

    // --- LOGIC ĐIỀU KIỆN NÚT BẤM ---
    const canCreateLabel = order.status === 'PROCESSING' && !order.trackingCode;
    const isPending = order.status === 'PENDING';

    return (
        <div className="container p-4">
            <h1>Chi tiết Đơn hàng #{order.id}</h1>
            <p>Trạng thái hiện tại: <strong style={{color: order.status === 'SHIPPED' ? 'blue' : order.status === 'PENDING' ? 'red' : 'green'}}>{order.status}</strong></p>
            <p>Tổng tiền: <strong>{order.totalAmount.toLocaleString()} VNĐ</strong></p>
            
            {/* Hiển thị thông báo */}
            {error && <div className="alert alert-danger" style={{color: 'red'}}>{error}</div>}
            {successMessage && <div className="alert alert-success" style={{color: 'green'}}>{successMessage}</div>}
            
            <hr />

            <h3>Hành động Quản trị</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
                {/* 1. Nút Chuyển sang PROCESSING */}
                {isPending && (
                    <button 
                        onClick={handleProcessOrder}
                        disabled={isMutating}
                        style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}
                    >
                        {isMutating ? 'Đang xử lý...' : 'Xác nhận & XỬ LÝ'}
                    </button>
                )}
                
                {/* 2. Nút TẠO VẬN ĐƠN */}
                {canCreateLabel && (
                    <button 
                        onClick={handleCreateShippingLabel}
                        disabled={isMutating}
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        {isMutating ? 'Đang gọi API...' : 'Tạo Vận Đơn & SHIPPED'}
                    </button>
                )}
            </div>

            <hr />

            {/* HIỂN THỊ KẾT QUẢ VẬN ĐƠN */}
            {order.trackingCode && (
                <div className="mt-4 p-3 border" style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h4>Thông tin Vận Đơn đã tạo</h4>
                    <p>Mã Vận Đơn: <strong>{order.trackingCode}</strong></p>
                    {order.shippingLabelUrl && (
                         <a 
                            href={order.shippingLabelUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}
                        >
                            In Tem Vận Chuyển
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetailPage;