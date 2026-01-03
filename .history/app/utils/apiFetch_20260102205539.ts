// File: utils/apiFetch.ts (PHIÊN BẢN TỐI ƯU HÓA 2 LUỒNG URL)

interface CustomRequestInit extends RequestInit {
    apiUrl?: string; 
    body?: any;      
}

/**
 * LOGIC 2 LUỒNG URL:
 * 1. Nếu chạy trên Vercel: Lấy link từ NEXT_PUBLIC_API_URL
 * 2. Nếu chạy ở máy cá nhân (Local): Dùng http://localhost:3001
 * .replace(/\/$/, '') => Xóa dấu / ở cuối nếu có để tránh lỗi //
 */
const DEFAULT_API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

// ===================================================
// BIẾN QUẢN LÝ REFRESH TỰ ĐỘNG
// ===================================================
let refreshPromise: Promise<string> | null = null; 

const getAccessToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
const setAccessToken = (token: string) => localStorage.setItem('access_token', token);
const setRefreshToken = (token: string) => localStorage.setItem('refresh_token', token);

const logoutAndRedirect = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'; 
    }
    throw new Error('Refresh Token đã hết hạn. Vui lòng đăng nhập lại.');
}

async function callRefreshTokenAPI(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return logoutAndRedirect();
    
    try {
        // Luôn sử dụng DEFAULT_API_URL đã được xử lý 2 luồng
        const refreshResponse = await fetch(`${DEFAULT_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // Đảm bảo lấy đúng key từ Backend (thường là accessToken)
            const newAT = data.accessToken || data.access_token;
            const newRT = data.refreshToken || data.refresh_token;
            
            if (newAT) setAccessToken(newAT);
            if (newRT) setRefreshToken(newRT); 
            return newAT;
        }

        return logoutAndRedirect();
    } catch (error) {
        return logoutAndRedirect();
    }
}

/**
 * Hàm fetch tùy chỉnh (Generic Function)
 */
export async function apiFetch<T>(
    endpoint: string, 
    options: CustomRequestInit = {}
): Promise<T> {
    
    const originalRequest = { endpoint, options };

    // apiUrl mặc định lấy từ 2 luồng đã cấu hình bên trên
    const { 
        apiUrl = DEFAULT_API_URL, 
        body, 
        headers: customHeaders, 
        ...customOptions 
    } = options;

    const setAuthHeader = (token: string | null) => {
        const currentHeaders = (customHeaders || {}) as Record<string, string>;
        return token ? { ...currentHeaders, Authorization: `Bearer ${token}` } : currentHeaders;
    }

    // XỬ LÝ URL: Đảm bảo link không bao giờ có lỗi //
    const cleanBaseUrl = apiUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBaseUrl}${cleanEndpoint}`; 
    
    let fetchOptions: RequestInit = {
        ...customOptions,
        headers: setAuthHeader(getAccessToken()), 
    };

    if (body !== undefined) {
        if (body instanceof FormData) {
            fetchOptions.body = body;
            if (fetchOptions.headers) {
                delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
                delete (fetchOptions.headers as Record<string, string>)['content-type'];
            }
        } else {
            fetchOptions.body = JSON.stringify(body);
            fetchOptions.headers = {
                'Content-Type': 'application/json',
                ...(fetchOptions.headers as Record<string, string>), 
            };
        }
    }

    try {
        let response = await fetch(url, fetchOptions);

        // XỬ LÝ REFRESH TOKEN (401)
        if (response.status === 401) {
            const retryRequest = async (token: string) => {
                return apiFetch<T>(originalRequest.endpoint, {
                    ...originalRequest.options,
                    headers: setAuthHeader(token),
                });
            };

            if (refreshPromise) return refreshPromise.then(retryRequest);

            refreshPromise = callRefreshTokenAPI();
            
            try {
                const newAccessToken = await refreshPromise;
                refreshPromise = null;
                return await retryRequest(newAccessToken);
            } catch (refreshError) {
                refreshPromise = null;
                throw refreshError;
            }
        }

        // XỬ LÝ LỖI KHÁC
        if (!response.ok) {
            let errorMessage = `Lỗi hệ thống: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);
        }

        if (response.status === 204) return {} as T;
        return await response.json() as T;

    } catch (error) {
        throw error instanceof Error ? error : new Error('Lỗi kết nối server.');
    }
}