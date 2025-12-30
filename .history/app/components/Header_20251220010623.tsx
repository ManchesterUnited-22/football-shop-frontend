'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { DeliveryNotificationBar } from './DeliveryNotificationBar';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  UserCircle, 
  ShoppingBag,
  Home
} from 'lucide-react';

interface JwtPayload {
  role: string;
  email?: string;
  name?: string;
}

export default function Header() {
  const { items } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * Hàm giải mã token và cập nhật trạng thái người dùng
   * Được tách ra để có thể tái sử dụng khi thông tin thay đổi
   */
  const getInfoFromToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded) {
            const role = decoded.role?.toLowerCase();
            setUserRole(role === 'admin' ? 'admin' : 'user');
            // 'name' này phải khớp với trường 'name' trong payload mà Backend trả về
            setUserName(decoded.name || decoded.email || 'Người dùng');
            setIsLoggedIn(true);
            return;
          }
        } catch (error) {
          console.error("Lỗi giải mã token:", error);
        }
      }
      // Nếu không có token hoặc lỗi, reset về trạng thái ban đầu
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
    }
  };

  useEffect(() => {
    // 1. Chạy ngay khi component được nạp
    getInfoFromToken();

    // 2. Lắng nghe sự kiện 'authUpdate' để cập nhật tên ngay lập tức khi user sửa Profile
    const handleAuthChange = () => {
      console.log("Header: Nhận được tín hiệu cập nhật thông tin người dùng!");
      getInfoFromToken();
    };
    window.addEventListener('authUpdate', handleAuthChange);

    // 3. Xử lý đóng Dropdown khi click ra ngoài vùng menu
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('authUpdate', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');
    setIsDropdownOpen(false);
    router.push('/');
    // Có thể reload nhẹ để clear hoàn toàn state các component khác
    router.refresh();
  };

  const isAdmin = isLoggedIn && userRole === 'admin';
  const isRegularUser = isLoggedIn && userRole === 'user';

  return (
    <>
      <header className="bg-blue-900 text-white px-4 py-3 shadow-md sticky top-0 z-50 font-sans">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="text-2xl font-black hover:text-blue-200 transition shrink-0 flex items-center gap-2">
            <span className="bg-white text-blue-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              ⚽
            </span>
            <span className="hidden sm:inline tracking-tighter italic">FOOTBALL STORE</span>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 mr-4">
              <Link href="/" className="hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors">
                <Home size={18} /> Trang chủ
              </Link>
              {isLoggedIn && (
                <Link href="/user/orders" className="hover:text-blue-300 font-semibold transition-colors">
                  Đơn hàng
                </Link>
              )}
            </div>
            
            {/* Admin Access Button */}
            {isAdmin && (
              <Link href="/admin" className="hover:bg-yellow-400 font-bold bg-yellow-500 text-blue-900 px-4 py-1.5 rounded-full text-xs transition-all shadow-md animate-pulse hover:animate-none">
                ADMIN PANEL
              </Link>
            )}

            {/* Auth Actions & User Menu */}
            <div className="flex items-center gap-3 border-l border-blue-800 pl-4 ml-2">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full transition-all border border-blue-400/20 active:scale-95"
                  >
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-md">
                      {isAdmin ? <ShieldCheck size={18} /> : userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold hidden sm:block max-w-[100px] truncate">
                      Hi, {userName.split(' ').pop()}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu với Animation */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] text-gray-800 ring-1 ring-black/5">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Tài khoản</p>
                        <p className="text-sm font-bold text-blue-900 truncate">{userName}</p>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm font-semibold"
                      >
                        <UserCircle size={20} className="text-blue-600" /> Hồ sơ của tôi
                      </Link>

                      <Link 
                        href="/user/orders" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm font-semibold"
                      >
                        <ShoppingBag size={20} className="text-green-600" /> Lịch sử mua hàng
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-sm font-bold"
                        >
                          <LogOut size={20} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href="/auth/login" className="hover:text-blue-200 text-xs sm:text-sm font-bold px-2 py-1">Đăng nhập</Link>
                  <Link href="/auth/register" className="bg-white text-blue-900 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-black hover:bg-blue-50 transition shadow-lg active:scale-95">
                    ĐĂNG KÝ
                  </Link>
                </div>
              )}

              {/* Cart Button */}
              <Link href="/cart" className="relative p-2 hover:bg-blue-800 rounded-full transition-all group">
                <span className="text-2xl group-hover:rotate-12 inline-block transition-transform">🛒</span>
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-900 animate-bounce shadow-md">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Thông báo cho người dùng thường */}
      {isRegularUser && <DeliveryNotificationBar />}
    </>
  );
}