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
  Home,
  Menu
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getInfoFromToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded) {
            const role = decoded.role?.toLowerCase();
            setUserRole(role === 'admin' ? 'admin' : 'user');
            setUserName(decoded.name || decoded.email || 'Người dùng');
            setIsLoggedIn(true);
            return;
          }
        } catch (error) {
          console.error("Lỗi giải mã token:", error);
        }
      }
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
    }
  };

  useEffect(() => {
    getInfoFromToken();

    const handleAuthChange = () => getInfoFromToken();
    window.addEventListener('authUpdate', handleAuthChange);

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
    router.refresh();
  };

  const isAdmin = isLoggedIn && userRole === 'admin';
  const isRegularUser = isLoggedIn && userRole === 'user';

  return (
    <>
      <header className="bg-gradient-to-b from-green-900 via-black to-green-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo - Left */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white text-green-900 w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl group-hover:rotate-12 transition-all duration-300 text-3xl">
                ⚽
              </div>
              <span className="text-3xl font-black tracking-tight italic hidden md:block">4FOOTBALL</span>
            </Link>

            {/* Main Navigation - Center (Desktop) - Chỉ còn Trang Chủ và Đơn Hàng nếu đăng nhập */}
            <nav className="hidden lg:flex items-center gap-12">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-red-400 transition-all hover:scale-110">
                <Home size={20} /> Trang Chủ
              </Link>
             
                <Link href="/user/orders" className="font-bold text-lg hover:text-red-400 transition-all hover:scale-110">
                  Đơn Hàng Của Tôi
                </Link>
             
            </nav>

            {/* Right Section: User & Cart */}
            <div className="flex items-center gap-6">

              {/* Admin Panel Button */}
              {isAdmin && (
                <Link href="/admin" className="hidden sm:block bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all animate-pulse hover:animate-none">
                  ADMIN PANEL
                </Link>
              )}

              {/* User Menu / Login */}
              <div className="relative" ref={dropdownRef}>
                {isLoggedIn ? (
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2.5 rounded-full transition-all border border-white/20"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-red-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md">
                      {isAdmin ? <ShieldCheck size={22} /> : userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-bold">Hi, {userName.split(' ').pop()}</span>
                    <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="hidden sm:block font-bold hover:text-red-400 transition">
                      Đăng Nhập
                    </Link>
                    <Link href="/auth/register" className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-2.5 rounded-full font-extrabold shadow-lg hover:scale-105 transition">
                      ĐĂNG KÝ
                    </Link>
                  </div>
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 py-4 z-60">
                    <div className="px-6 py-4 border-b border-white/20">
                      <p className="text-sm text-gray-300 uppercase font-bold tracking-wider">Tài Khoản</p>
                      <p className="text-xl font-extrabold text-white truncate">{userName}</p>
                    </div>

                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition">
                      <UserCircle size={22} className="text-green-400" /> <span className="font-bold">Hồ sơ</span>
                    </Link>

                    <Link href="/user/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-6 py-3 hover:bg-white/10 transition">
                      <ShoppingBag size={22} className="text-green-400" /> <span className="font-bold">Đơn hàng</span>
                    </Link>

                    <div className="border-t border-white/20 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 hover:bg-red-500/20 text-red-400 transition font-bold">
                        <LogOut size={22} /> Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all hover:scale-110">
                <ShoppingBag size={28} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 rounded-full hover:bg-white/10 transition"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown - Cũng bỏ mục Sản Phẩm */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-6 pb-4 border-t border-white/20 pt-6">
              <div className="flex flex-col gap-4">
                <Link href="/" className="font-bold text-lg hover:text-red-400 transition">Trang Chủ</Link>
                {isLoggedIn && <Link href="/user/orders" className="font-bold text-lg hover:text-red-400 transition">Đơn Hàng Của Tôi</Link>}
                {!isLoggedIn && (
                  <>
                    <Link href="/auth/login" className="font-bold text-lg hover:text-red-400 transition">Đăng Nhập</Link>
                    <Link href="/auth/register" className="font-bold text-lg hover:text-red-400 transition">Đăng Ký</Link>
                  </>
                )}
                {isAdmin && <Link href="/admin" className="font-bold text-lg text-orange-400">ADMIN PANEL</Link>}
              </div>
            </nav>
          )}
        </div>
      </header>

      {isRegularUser && <DeliveryNotificationBar />}
    </>
  );
}