// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';

// Định nghĩa Interface cho giá trị trả về
interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isLoading: true,
  });

  useEffect(() => {
    // ⚠️ ĐÂY LÀ PHẦN SẼ THAY THẾ BẰNG LOGIC AUTH THẬT SỰ ⚠️
    // Ví dụ về logic kiểm tra JWT Token trong Local Storage:
    const checkAuthStatus = () => {
      // Giả sử JWT token được lưu ở đây
      const token = localStorage.getItem('access_token'); 
      
      if (token) {
        // Trong môi trường thực: Bạn sẽ giải mã (decode) token để lấy userId.
        // TẠM THỜI: Chúng ta giả định user ID là 1 nếu có token (hoặc một ID cố định)
        
        // GIẢ LẬP: Nếu có Token, coi như đã đăng nhập và ID là 1
        setAuthState({
          isAuthenticated: true,
          userId: 1, // ID Cố định để test Backend
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          userId: null,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
    // Thêm listener nếu bạn muốn cập nhật trạng thái khi token thay đổi
    // window.addEventListener('storage', checkAuthStatus); 
    
    // return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  return authState;
};