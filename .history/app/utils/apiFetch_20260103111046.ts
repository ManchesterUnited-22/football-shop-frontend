// utils/apiFetch.ts

interface CustomRequestInit extends RequestInit {
    apiUrl?: string;
    body?: any;
}

const DEFAULT_API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

let refreshPromise: Promise<string> | null = null;

// Hàm hỗ trợ an toàn cho SSR
const isClient = typeof window !== 'undefined';

const getAccessToken = () => isClient ? localStorage.getItem('access_token') : null;
const getRefreshToken = () => isClient ? localStorage.getItem('refresh_token') : null;
const setAccessToken = (token: string) => isClient && localStorage.setItem('access_token', token);
const setRefreshToken = (token: string) => isClient && localStorage.setItem('refresh_token', token);

const logoutAndRedirect = () => {
    if (isClient) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
    }
    throw new Error('Phiên đăng nhập hết hạn.');
}

async function callRefreshTokenAPI(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return logoutAndRedirect();

    try {
        const refreshResponse = await fetch(`${DEFAULT_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAT = data.accessToken || data.access_token;
            const newRT = data.refreshToken || data.refresh_token;

            if (newAT) setAccessToken(newAT);
            if (newRT) setRefreshToken(newRT);
            return newAT;
        }
        return logoutAndRedirect();
    } catch {
        return logoutAndRedirect();
    }
}

export async function apiFetch<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
    const { apiUrl = DEFAULT_API_URL, body, headers: customHeaders, ...customOptions } = options;

    const url = `${apiUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    // Header mặc định
    const headers = new Headers(customHeaders as any);
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let fetchOptions: RequestInit = { 
        ...customOptions, 
        headers,
        // Mặc định không store cache cho các dữ liệu cá nhân/đơn hàng
        cache: options.cache || 'no-store' 
    };

    if (body !== undefined) {
        if (body instanceof FormData) {
            fetchOptions.body = body;
            // Trình duyệt tự set Content-Type cho FormData
        } else {
            headers.set('Content-Type', 'application/json');
            fetchOptions.body = JSON.stringify(body);
        }
    }

    try {
        let response = await fetch(url, fetchOptions);

        if (response.status === 401 && isClient) {
            if (refreshPromise) {
                const newToken = await refreshPromise;
                headers.set('Authorization', `Bearer ${newToken}`);
                return apiFetch<T>(endpoint, options);
            }

            refreshPromise = callRefreshTokenAPI();
            try {
                const newToken = await refreshPromise;
                refreshPromise = null;
                headers.set('Authorization', `Bearer ${newToken}`);
                return apiFetch<T>(endpoint, options);
            } catch (err) {
                refreshPromise = null;
                throw err;
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi ${response.status}`);
        }

        return response.status === 204 ? {} as T : await response.json();
    } catch (error) {
        throw error;
    }
}