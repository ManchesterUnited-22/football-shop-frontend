// STORE-FRONTEND/app/utils/orderApi.ts

import axios from 'axios';

// Cấu hình Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hàm kiểm tra tùy chỉnh để xác định đối tượng lỗi có phải là lỗi Axios hay không
// Đây là cách an toàn nhất để giải quyết lỗi Type 2339 và 2305
function isAxiosErrorRuntime(error: any): boolean {
    // Lỗi Axios thường có thuộc tính 'response' hoặc 'config' và thường có property 'isAxiosError'
    // nhưng vì 'isAxiosError' không tồn tại trên static type của bạn, ta kiểm tra các thuộc tính khác.
    return (error && typeof error === 'object' && ('response' in error || 'config' in error));
}

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
 * Hàm gọi API Tạo Vận Đơn (ĐÃ SỬA LỖI FINAL)
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
        let errorMessage = 'Lỗi không xác định khi gọi API Backend.';
        
        // Sử dụng hàm kiểm tra runtime tùy chỉnh
        if (isAxiosErrorRuntime(error)) {
            // Ép kiểu (assertion) an toàn hơn sau khi kiểm tra
            const axiosError = error as any; 
            
            // Lấy thông báo lỗi từ response data của Backend (Nếu có lỗi từ server)
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } 
            // Hoặc lỗi network/client của Axios
            else if (axiosError.message) {
                errorMessage = axiosError.message;
            }
        } else if (error instanceof Error) {
            // Lỗi JavaScript tiêu chuẩn
            errorMessage = error.message;
        }

        // Ném lỗi mới
        throw new Error(errorMessage);
    }
};