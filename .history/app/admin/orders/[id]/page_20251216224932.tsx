// STORE-FRONTEND/app/admin/orders/[id]/page.tsx (ĐÃ SỬA THEO PHƯƠNG ÁN BÁN TỰ ĐỘNG)

'use client'; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// ✅ CẦN SỬA: Chúng ta cần thêm hàm updateTrackingCode từ service.
// import { createShippingLabel, processOrder, fetchOrderDetails } from '@/app/services/order.service'; 
import { 
    processOrder, 
    fetchOrderDetails,
    updateTrackingCode, // ✅ ĐÃ THÊM: Service mới cho việc cập nhật mã
    // Xóa createShippingLabel ở đây nếu nó không còn được sử dụng trong service
} from '@/app/services/order.service';

// Định nghĩa kiểu dữ liệu (Giữ nguyên)
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
    
    // ✅ STATE MỚI: Quản lý input cho mã vận đơn
    const [trackingCodeInput, setTrackingCodeInput] = useState('');


    // --- LOGIC FETCH DỮ LIỆU BAN ĐẦU (Giữ nguyên) ---
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


    // ❌ ĐÃ XÓA: Hàm handleCreateShippingLabel không còn tồn tại
    /* const handleCreateShippingLabel = async () => { ... logic cũ ... }; */

    // --- HÀM XỬ LÝ: CHUYỂN TRẠNG THÁI SANG PROCESSING (BƯỚC 1) ---
    const handleProcessOrder = async () => {
        if (!order || order.status !== 'PENDING') return;
        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const updatedOrder = await processOrder(order.id);
            setOrder(updatedOrder as Order); 
            
            // ✅ ĐÃ SỬA: Thay đổi thông báo để hướng dẫn Admin kiểm tra log Backend
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
    
    // ✅ ĐÃ THÊM: HÀM XỬ LÝ CẬP NHẬT MÃ VẬN ĐƠN (BƯỚC 2)
    const handleUpdateTrackingCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order || order.status !== 'PROCESSING') return;
        if (!trackingCodeInput.trim()) {
            setError('Vui lòng nhập Mã Vận Đơn.');
            return;
        }

        setIsMutating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Gọi Service mới để cập nhật mã vận đơn
            const updatedOrder = await updateTrackingCode(order.id, trackingCodeInput.trim()); 
            setOrder(updatedOrder as Order);

            setSuccessMessage(
                `✅ Cập nhật Mã Vận Đơn thành công! Đơn hàng #${order.id} đã chuyển sang SHIPPED.`
            );

        } catch (err) {
            setError('Lỗi khi cập nhật mã vận đơn: ' + (err as Error).message);
        } finally {
            setIsMutating(false);
            setTrackingCodeInput(''); // Xóa input sau khi thành công
        }
    };

    // --- HIỂN THỊ TRẠNG THÁI (Giữ nguyên) ---
    if (isLoading) return <div className="p-4">Đang tải chi tiết đơn hàng...</div>;
    if (error && !order) return <div className="p-4" style={{ color: 'red' }}>Lỗi tải dữ liệu: {error}</div>;
    if (!order) return <div className="p-4">Không tìm thấy đơn hàng #{orderId}.</div>;

    // --- LOGIC ĐIỀU KIỆN NÚT BẤM MỚI ---
    const canProcess = order.status === 'PENDING';
    // ✅ ĐIỀU KIỆN MỚI: Có thể cập nhật mã vận đơn nếu đang PROCESSING và chưa có mã
    const canUpdateTracking = order.status === 'PROCESSING' && !order.trackingCode; 

    return (
        <div className="container p-4">
            <h1>Chi tiết Đơn hàng #{order.id}</h1>
            <p>Trạng thái hiện tại: <strong style={{color: order.status === 'SHIPPED' ? 'blue' : order.status === 'PENDING' ? 'red' : 'green'}}>{order.status}</strong></p>
            <p>Tổng tiền: <strong>{order.totalAmount?.toLocaleString()} VNĐ</strong></p>
            
            {/* Hiển thị thông báo */}
            {error && <div className="alert alert-danger" style={{color: 'red'}}>{error}</div>}
            {successMessage && <div className="alert alert-success" style={{color: 'green'}}>{successMessage}</div>}
            
            <hr />

            <h3>Hành động Quản trị</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                {/* 1. Nút Chuyển sang PROCESSING */}
                {canProcess && (
                    <button 
                        onClick={handleProcessOrder}
                        disabled={isMutating}
                        style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}
                    >
                        {isMutating ? 'Đang xử lý...' : 'BƯỚC 1: Xác nhận & XỬ LÝ (Processing)'}
                    </button>
                )}
                
                {/* 2. ✅ THAY THẾ NÚT TẠO VẬN ĐƠN CŨ BẰNG FORM CẬP NHẬT MÃ */}
                {canUpdateTracking && (
                    <form onSubmit={handleUpdateTrackingCode} style={{ display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #007bff', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ whiteSpace: 'nowrap' }}>BƯỚC 2: Nhập Mã Vận Đơn Thủ Công:</strong>
                        <input
                            type="text"
                            value={trackingCodeInput}
                            onChange={(e) => setTrackingCodeInput(e.target.value)}
                            placeholder="Nhập mã vận đơn từ GHN/GHTK"
                            required
                            disabled={isMutating}
                            style={{ flexGrow: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <button 
                            type="submit"
                            disabled={isMutating}
                            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                            {isMutating ? 'Đang cập nhật...' : 'Cập nhật Mã & SHIPPED'}
                        </button>
                    </form>
                )}
            </div>

            <hr />

            {/* HIỂN THỊ KẾT QUẢ VẬN ĐƠN */}
            {order.trackingCode && (
                <div className="mt-4 p-3 border" style={{ border: '1px solid #ccc', padding: '15px', backgroundColor: '#e9f7ef' }}>
                    <h4>Thông tin Vận Đơn</h4>
                    <p>Mã Vận Đơn: <strong>{order.trackingCode}</strong></p>
                    {/* ❌ ĐÃ XÓA: Loại bỏ URL nhãn in vì không còn tạo tự động */}
                    {/* {order.shippingLabelUrl && (
                         <a href={order.shippingLabelUrl} ... > In Tem Vận Chuyển </a>
                    )} */}
                    <p style={{ color: 'gray', marginTop: '10px' }}>
                        Lưu ý: Mã này được nhập thủ công.
                    </p>
                </div>
            )}
            
            {/* Các chi tiết đơn hàng khác (cần thêm nếu chưa có) */}

        </div>
    );
};

export default AdminOrderDetailPage;