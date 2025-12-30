// STORE-FRONTEND/app/services/order.service.ts

import { apiFetch } from '../utils/apiFetch';  // Import hàm fetch chung

// Định nghĩa kiểu dữ liệu (Thay thế bằng kiểu thực tế của bạn)
interface Order {
    id: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number; // 👈 Thêm vào
    trackingCode: string | null;
    shippingLabelUrl: string | null;
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    // ...
}
interface ShippingResult {
    message: string;
    order: Order;
    trackingCode: string;
}

/**
 * [GET] Lấy chi tiết đơn hàng
 */
export const fetchOrderDetails = (orderId: number): Promise<Order> => {
    // Tự động thêm Authorization Header và xử lý 401
    return apiFetch<Order>(`/orders/${orderId}`, {
        method: 'GET',
    });
};

/**
 * [PATCH] Tạo vận đơn GHN/GHTK
 */
export const createShippingLabel = (orderId: number): Promise<ShippingResult> => {
    // Tự động thêm Authorization Header và xử lý 401
    return apiFetch<ShippingResult>(`/orders/${orderId}/create-shipping-label`, {
        method: 'PATCH',
        // Không cần body vì backend lấy data từ DB
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