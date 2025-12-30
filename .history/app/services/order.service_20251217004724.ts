// STORE-FRONTEND/app/services/order.service.ts (ĐÃ SỬA LỖI 404 VÀ ĐỒNG BỘ)

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
 * [PATCH] Chuyển trạng thái sang PROCESSING
 */
export const processOrder = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/process`, {
        method: 'PATCH',
    });
};

/**
 * [PATCH] Hàm chuyển trạng thái sang SHIPPED 
 */
export const shipOrder = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/ship`, {
        method: 'PATCH',
    });
};

/**
 * [PATCH] User xác nhận đã nhận hàng
 */
export const confirmDelivery = (orderId: number): Promise<Order> => {
    return apiFetch<Order>(`/orders/${orderId}/confirm-delivery`, {
        method: 'PATCH',
    });
};

/**
 * [GET] Lấy danh sách đơn hàng đang SHIPPED của User 
 * ✅ ĐÃ SỬA: URL: /orders/user/shipped
 */
export const fetchUserShippedOrders = (): Promise<Order[]> => {
    // URL này khớp với @Controller('orders') + @Get('user/shipped') trong Backend
    return apiFetch<Order[]>(`/orders/user/shipped`, {
        method: 'GET',
    });
};