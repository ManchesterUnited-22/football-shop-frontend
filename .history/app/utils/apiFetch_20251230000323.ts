// File: utils/apiFetch.ts (PHIÊN BẢN TỐI ƯU HÓA)

interface CustomRequestInit extends RequestInit {
    apiUrl?: string; 
    body?: any;      
}

const DEFAULT_API_URL = 'http://localhost:3001'; // <-- ĐÃ SỬA LỖI 404 CỦA BẠN

// ===================================================
// BIẾN QUẢN LÝ REFRESH TỰ ĐỘNG
// ===================================================
let isRefreshing = false; 
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; }[] = [];
let refreshPromise: Promise<string> | null = null; // Promise duy nhất cho việc refresh

const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
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
    if (!refreshToken) {
        return logoutAndRedirect();
    }
    
    try {
        const refreshResponse = await fetch(`${DEFAULT_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshtoken: refreshToken }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token); 
            return data.access_token;
        }

        logoutAndRedirect();
    } catch (error) {
        logoutAndRedirect();
    }
    // Chỉ để thỏa mãn kiểu trả về của Promise, sẽ không bao giờ đến đây
    return ''; 
}

/**
 * Hàm fetch tùy chỉnh (Generic Function) đã tích hợp Interceptor Refresh Token.
 */
export async function apiFetch<T>(
    endpoint: string, 
    options: CustomRequestInit = {}
): Promise<T> {
    
    const originalRequest = { endpoint, options };

    const { 
        apiUrl = DEFAULT_API_URL, 
        body, 
        headers: customHeaders, 
        ...customOptions 
    } = options;

    // Helper để thêm/sửa header Authorization
    const setAuthHeader = (token: string | null) => {
        const currentHeaders = (customHeaders || {}) as Record<string, string>;
        if (token) {
            return { ...currentHeaders, Authorization: `Bearer ${token}` };
        }
        return currentHeaders;
    }

    let fetchHeaders: Record<string, string> = setAuthHeader(getAccessToken());
    const url = `${apiUrl}${endpoint}`; 
    
    // 1. Xử lý Body và Content-Type
    let fetchOptions: RequestInit = {
        ...customOptions,
        headers: fetchHeaders, 
    };
    if (body !== undefined) {
        if (body instanceof FormData) {
            fetchOptions.body = body;
            // Xóa Content-Type để trình duyệt tự thêm boundary cho FormData
            if (fetchOptions.headers) delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
            if (fetchOptions.headers) delete (fetchOptions.headers as Record<string, string>)['content-type'];
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

        // ===================================================
        // LOGIC INTERCEPTOR REFRESH TOKEN
        // ===================================================
        if (response.status === 401) {
            
            const retryRequest = (token: string) => {
                // Thử lại request ban đầu với AT mới
                const newOptions = {
                    ...originalRequest.options,
                    headers: setAuthHeader(token),
                };
                return apiFetch<T>(originalRequest.endpoint, newOptions);
            };

            // Nếu refresh đang chạy, XẾP HÀNG ĐỢI (đúng logic chặn Race Condition)
            if (refreshPromise) {
                // Chờ Promise Refresh kết thúc, sau đó retry
                return refreshPromise.then(retryRequest);
            }

            // Nếu chưa có refresh, BẮT ĐẦU REFRESH và tạo Promise
            refreshPromise = callRefreshTokenAPI();
            
            // Sau khi promise hoàn thành (thành công hay thất bại), ta reset lại
            try {
                const newAccessToken = await refreshPromise;
                refreshPromise = null; // Xóa Promise sau khi thành công
                // Retry request ban đầu
                return retryRequest(newAccessToken);
            } catch (refreshError) {
                refreshPromise = null; // Xóa Promise sau khi thất bại
                // callRefreshTokenAPI đã tự gọi logoutAndRedirect() và throw Error
                throw refreshError;
            }
        }
        // ===================================================
        // KẾT THÚC LOGIC INTERCEPTOR
        // ===================================================

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                }
            } catch (e) {}
            throw new Error(errorMessage);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {} as T; 
        }

        return await response.json() as T;

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Lỗi mạng hoặc không xác định.');
        }
    }
}