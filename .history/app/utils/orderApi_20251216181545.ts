// STORE-FRONTEND/app/utils/orderApi.ts

import axios, { AxiosError } from 'axios';
// Cấu hình Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hàm helper để lấy Authorization Header (cơ bản nhất)
const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}; 
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

/**
 * Hàm gọi API Tạo Vận Đơn (Chỉ có chức năng gọi API, không quản lý state)
 */
export const createShippingLabel = async (orderId: number) => {
    const headers = getAuthHeaders();
    
    // Bắt lỗi Axios để dễ dàng xử lý trong Component
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/orders/${orderId}/create-shipping-label`,
            {}, 
            { headers }
        );
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối API Backend.');
    }
};