// STORE-FRONTEND/app/services/order.service.ts (ĐÃ SỬA THEO PHƯƠNG ÁN ĐƠN GIẢN HÓA)

import { apiFetch } from '../utils/apiFetch'; 

// Định nghĩa kiểu dữ liệu (Giữ nguyên)
export interface Order { 
    id: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number; 
    trackingCode: string | null;
    shippingLabelUrl: string | null;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    createdAt: string; 
}
 
export const fetchOrderDetails = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}`, {
        method: 'GET',
    });
};

/**
 * [PATCH] Chuyển trạng thái sang PROCESSING (Giữ nguyên)
 */
export const processOrder = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/process`, {
        method: 'PATCH',
    });
};

// ❌ ĐÃ XÓA/THAY THẾ: Hàm cập nhật Mã Vận Đơn thủ công 
/* export const updateTrackingCode = (orderId: number, trackingCode: string): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/update-tracking-code`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode }), 
    });
};
*/

/**
 * ✅ ĐÃ THÊM: [PATCH] Hàm chuyển trạng thái sang SHIPPED (Không cần mã vận đơn)
 * Hàm này gọi endpoint /ship đơn giản đã định nghĩa trong Backend.
 */
export const shipOrder = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/ship`, {
        method: 'PATCH',
    });
};

/**
 * [PATCH] User xác nhận đã nhận hàng (Giữ nguyên)
 */
export const confirmDelivery = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/confirm-delivery`, {
        method: 'PATCH',
    });
};

/**
 * [GET] Lấy danh sách đơn hàng đang SHIPPED của User (Giữ nguyên)
 */
export const fetchUserShippedOrders = (): Promise<Order[]> => {
    // Giả sử có endpoint /user/orders/shipped
    return apiFetch<Order[]>(`/user/orders/shipped`, {
        method: 'GET',
    });
};