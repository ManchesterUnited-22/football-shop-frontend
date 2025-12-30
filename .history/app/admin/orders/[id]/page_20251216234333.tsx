// STORE-FRONTEND/app/admin/orders/[id]/page.tsx (PHIÊN BẢN ĐƠN GIẢN HÓA VÀ HOÀN CHỈNH)

'use client'; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { 
    processOrder, 
    fetchOrderDetails,
    shipOrder,      // ✅ Hàm chuyển trạng thái sang SHIPPED đơn giản
} from '@/app/services/order.service';

// Định nghĩa kiểu dữ liệu (Sử dụng interface đã export từ order.service nếu có thể)
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

    // --- LOGIC FETCH DỮ LIỆU BAN ĐẦU ---
    useEffect(() => {
        const loadOrder = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchOrderDetails(orderId);
                setOrder(data as Order);
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


    // --- HÀM XỬ LÝ: CHUYỂN TRẠNG THÁI SANG PROCESSING (BƯỚC 1) ---
    const handleProcessOrder = async () => {
        if (!order || order.status !== 'PENDING') return;
        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const updatedOrder = await processOrder(order.id);
            setOrder(updatedOrder as Order); 
            
            setSuccessMessage(
                `✅ Đơn hàng đã chuyển sang trạng thái PROCESSING. 
                VUI LÒNG KIỂM TRA CONSOLE BACKEND để lấy thông tin tạo vận đơn thủ công.`
            );
            
        } catch (err) {
            setError('Lỗi khi xử lý đơn hàng: ' + (err as Error).message);
        } finally {
            setIsMutating(false);
        }
    };
    
    // ✅ ĐÃ THÊM: HÀM XỬ LÝ CHUYỂN TRẠNG THÁI SANG SHIPPED ĐƠN GIẢN (BƯỚC 2)
    const handleShipOrder = async () => {
        if (!order || order.status !== 'PROCESSING') return;
        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const updatedOrder = await shipOrder(order.id); // Gọi API đơn giản
            setOrder(updatedOrder as Order);

            setSuccessMessage(
                `✅ Xác nhận Đã Giao Vận Chuyển thành công! Đơn hàng #${order.id} đã chuyển sang SHIPPED.`
            );

        } catch (err) {
            console.error("Lỗi chi tiết khi chuyển trạng thái:", err);
            setError(`Lỗi: Không thể chuyển sang SHIPPED. (Chi tiết: ${(err as Error).message || 'Lỗi kết nối/Server'})`);
        } finally {
            setIsMutating(false);
        }
    };


    // --- HIỂN THỊ TRẠNG THÁI ---
    if (isLoading) return <div className="p-4">Đang tải chi tiết đơn hàng...</div>;
    if (error && !order) return <div className="p-4" style={{ color: 'red' }}>Lỗi tải dữ liệu: {error}</div>;
    if (!order) return <div className="p-4">Không tìm thấy đơn hàng #{orderId}.</div>;

    const canProcess = order.status === 'PENDING';
    const canShip = order.status === 'PROCESSING'; 
    const isShipped = order.status === 'SHIPPED'; 
    const isDelivered = order.status === 'DELIVERED'; 

    return (
        <div className="container p-4">
            <h1>Chi tiết Đơn hàng #{order.id}</h1>
            <p>Trạng thái hiện tại: <strong style={{color: isShipped ? 'blue' : isDelivered ? 'green' : canProcess ? 'red' : 'orange'}}>{order.status}</strong></p>
            <p>Tổng tiền: <strong>{order.totalAmount?.toLocaleString()} VNĐ</strong></p>
            
            {/* Hiển thị thông báo */}
            {error && <div className="alert alert-danger" style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</div>}
            {successMessage && <div className="alert alert-success" style={{color: 'green', border: '1px solid green', padding: '10px'}}>{successMessage}</div>}
            
            <hr />

            <h3>Hành động Quản trị</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                
                {/* 1. Nút Chuyển sang PROCESSING */}
                {canProcess && (
                    <button 
                        onClick={handleProcessOrder}
                        disabled={isMutating}
                        style={{ padding: '12px 20px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isMutating ? 'Đang xử lý...' : 'BƯỚC 1: Xác nhận & XỬ LÝ (Processing)'}
                    </button>
                )}
                
                {/* 2. ✅ NÚT XÁC NHẬN ĐÃ GIAO VẬN CHUYỂN (THAY THẾ FORM MÃ VẬN ĐƠN) */}
                {canShip && (
                    <div style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '8px', backgroundColor: '#e6f7ff' }}>
                        <strong style={{ display: 'block', marginBottom: '10px' }}>BƯỚC 2: Xác nhận Giao Hàng</strong>
                        <button 
                            onClick={handleShipOrder} // ✅ Gọi hàm xử lý đơn giản mới
                            disabled={isMutating}
                            style={{ padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                        >
                            {isMutating ? 'Đang xác nhận...' : '✅ Xác nhận Đã Giao Vận Chuyển & SHIPPED'}
                        </button>
                        <p style={{marginTop: '10px', fontSize: '0.9em', color: '#0056b3'}}>
                            *Lưu ý: Hành động này chuyển trạng thái để kích hoạt thông báo xác nhận bên phía User.
                        </p>
                    </div>
                )}
                
                {/* 3. HIỂN THỊ ĐÃ SHIPPED (VẪN ĐANG CHỜ USER XÁC NHẬN) */}
                {isShipped && (
                    <div style={{ padding: '15px', border: '1px dashed #ffa000', backgroundColor: '#fffbe6' }}>
                        <p style={{ fontWeight: 'bold', color: '#ffa000' }}>
                            Đơn hàng đang ở trạng thái SHIPPED. Hệ thống đang chờ User xác nhận đã nhận hàng trên giao diện của họ.
                        </p>
                        {order.trackingCode && <p>Mã Vận Đơn (Tham chiếu): <strong>{order.trackingCode}</strong></p>}
                    </div>
                )}
                
                {/* 4. HIỂN THỊ ĐÃ DELIVERED */}
                {isDelivered && (
                    <div style={{ padding: '15px', border: '1px solid #008000', backgroundColor: '#e8f5e9' }}>
                        <p style={{ fontWeight: 'bold', color: '#008000' }}>
                            ĐƠN HÀNG ĐÃ HOÀN THÀNH (DELIVERED).
                        </p>
                        {order.trackingCode && <p>Mã Vận Đơn (Tham chiếu): <strong>{order.trackingCode}</strong></p>}
                    </div>
                )}

            </div>
            {/* ... (Các chi tiết đơn hàng khác) */}
        </div>
    );
};

export default AdminOrderDetailPage;