'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
}

export default function Header() {
  const { items } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const router = useRouter();

  const getRoleFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.role) {
          const role = decoded.role.toLowerCase();
          return role === 'admin' ? 'admin' : 'user';
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem('access_token');
      }
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const role = getRoleFromToken();
      setUserRole(role);
    }
    
    // Thêm listener để Navbar cập nhật ngay khi Token thay đổi (Đăng nhập/Đăng xuất)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('access_token');
      const newLoggedIn = !!newToken;
      setIsLoggedIn(newLoggedIn);
      if (newLoggedIn) {
        setUserRole(getRoleFromToken());
      } else {
        setUserRole(null);
      }
    };

    // Sử dụng sự kiện 'storage' hoặc cách khác để cập nhật trạng thái nếu cần
    // window.addEventListener('storage', handleStorageChange);
    // return () => window.removeEventListener('storage', handleStorageChange);
    
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  const isAdmin = isLoggedIn && userRole === 'admin';

  return (
    <header className="bg-blue-900 text-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between whitespace-nowrap">
        <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition shrink-0">
          ⚽ FOOTBALL STORE
        </Link>

        <nav className="flex items-center gap-6 flex-wrap">
          <Link href="/" className="hover:text-blue-300 font-medium">Trang chủ</Link>
          
          {/* ⭐️ LIÊN KẾT LỊCH SỬ ĐƠN HÀNG ⭐️ */}
          {isLoggedIn && userRole === 'user' && ( // Chỉ hiển thị cho user thường
            <Link href="/user/orders" className="hover:text-blue-300 font-medium">Đơn hàng</Link>
          )}
          {/* Hoặc dùng: {isLoggedIn && ( <Link href="/user/orders" className="hover:text-blue-300 font-medium">Đơn hàng</Link> )} */}
          
          {isAdmin && (
            <Link href="/admin" className="hover:text-blue-300 font-medium whitespace-nowrap">Nhập hàng</Link>
          )}

          {isLoggedIn ? (
            <>
              <Link href="/profile" className="hover:text-blue-300 font-medium">Hồ sơ</Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-300 font-medium bg-transparent border-none cursor-pointer p-0"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-blue-300 font-medium">Đăng nhập</Link>
              <Link href="/auth/register" className="hover:text-blue-300 font-medium">Đăng ký</Link>
            </>
          )}

          <Link href="/cart" className="relative p-2">
            <span className="text-2xl">🛒</span>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {items.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}