// STORE-FRONTEND/app/services/order.service.ts (ĐÃ SỬA THEO PHƯƠNG ÁN BÁN TỰ ĐỘNG)

import { apiFetch } from '../utils/apiFetch';  // Import hàm fetch chung

// Định nghĩa kiểu dữ liệu (Giữ nguyên)


export interface Order { // <-- PHẢI CÓ 'export' ở đây
    id: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number; 
    trackingCode: string | null;
    shippingLabelUrl: string | null;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    // Đảm bảo thuộc tính này có mặt cho Component thông báo
    createdAt: string; 
}
 
export const fetchOrderDetails = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}`, {
        method: 'GET',
    });
};

// ❌ ĐÃ XÓA: Hàm này không còn tồn tại trong Backend
/* export const createShippingLabel = (orderId: number): Promise<ShippingResult> => {
    // ... logic cũ 
};
*/

/**
 * [PATCH] Chuyển trạng thái sang PROCESSING (Giữ nguyên)
 */
export const processOrder = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/process`, {
        method: 'PATCH',
    });
};

/**
 * ✅ ĐÃ THÊM: [PATCH] Cập nhật Mã Vận Đơn thủ công và chuyển sang SHIPPED
 */
export const updateTrackingCode = (orderId: number, trackingCode: string): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/update-tracking-code`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingCode }), // Gửi mã vận đơn lên Backend
    });
};
export const confirmDelivery = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/confirm-delivery`, {
        method: 'PATCH',
    });
};
export const fetchUserShippedOrders = (): Promise<Order[]> => {
    // Giả sử có endpoint /user/orders/shipped
    return apiFetch<Order[]>(`/user/orders/shipped`, {
        method: 'GET',
    });
};