// STORE-FRONTEND/app/utils/orderApi.ts

import axios, { AxiosError } from 'axios';
// Cấu hình Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hàm helper để lấy Authorization Header (cơ bản nhất)
const getAuthHeaders = () => {
    // Chỉ chạy logic này ở phía Client (browser)
    if (typeof window === 'undefined') return {}; 
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

/**
 * Hàm gọi API Tạo Vận Đơn (Đã xử lý lỗi TypeScript 'unknown' type)
 */
export const createShippingLabel = async (orderId: number) => {
    const headers = getAuthHeaders();
    
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/orders/${orderId}/create-shipping-label`,
            {}, 
            { headers }
        );
        return response.data; 
    } catch (error) {
        // Khởi tạo thông báo lỗi mặc định
        let errorMessage = 'Lỗi không xác định khi gọi API Backend.';

        // ✅ Bắt lỗi và kiểm tra kiểu lỗi Axios (Fix lỗi 'unknown')
        if (axios.isAxiosError(error)) {
            // TypeScript đã xác định 'error' là AxiosError ở đây
            const axiosError = error as AxiosError;
            
            // Lấy thông báo lỗi chi tiết từ Backend (nếu có data.message)
            // hoặc dùng thông báo lỗi mạng/client của Axios
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }
        } else if (error instanceof Error) {
            // Bắt các lỗi JavaScript tiêu chuẩn khác
            errorMessage = error.message;
        }

        // Ném một đối tượng Error chuẩn để Component có thể bắt và hiển thị
        throw new Error(errorMessage);
    }
};

// ... (Các hàm API khác)