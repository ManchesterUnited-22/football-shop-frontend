'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { DeliveryNotificationBar } from './DeliveryNotificationBar';
// Thêm các icon từ lucide
import { User, ChevronDown, LogOut, ShieldCheck, UserCircle } from 'lucide-react';

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

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInfoFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.role) {
          const role = decoded.role.toLowerCase();
          setUserRole(role === 'admin' ? 'admin' : 'user');
          setUserName(decoded.name || decoded.email || 'Người dùng');
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem('access_token');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      getInfoFromToken();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserRole(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const isAdmin = isLoggedIn && userRole === 'admin';
  const isRegularUser = isLoggedIn && userRole === 'user';

  return (
    <>
      <header className="bg-blue-900 text-white px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition shrink-0 flex items-center gap-2">
            ⚽ <span className="hidden sm:inline">FOOTBALL STORE</span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="hover:text-blue-300 font-medium hidden md:block">Trang chủ</Link>
            
            {isAdmin && (
              <Link href="/admin" className="hover:text-blue-300 font-medium bg-blue-800 px-3 py-1 rounded-md text-sm">
                Quản trị
              </Link>
            )}

            {/* Auth Section với Avatar */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-all border border-blue-400/30"
                  >
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold border border-white/20">
                      {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                      {userName}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] text-gray-800 animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tài khoản</p>
                        <p className="text-sm font-semibold truncate">{userName}</p>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <UserCircle size={18} className="text-blue-600" /> Hồ sơ của tôi
                      </Link>

                      <Link 
                        href="/user/orders" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <ShoppingBasketIcon size={18} className="text-green-600" /> Đơn hàng
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors text-sm font-medium"
                        >
                          <LogOut size={18} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className="hover:text-blue-200 text-sm font-medium">Đăng nhập</Link>
                  <Link href="/auth/register" className="bg-white text-blue-900 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-50 transition">
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Giỏ hàng */}
              <Link href="/cart" className="relative p-2 hover:bg-blue-800 rounded-full transition">
                <span className="text-xl">🛒</span>
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-900">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      </header>
      {isRegularUser && <DeliveryNotificationBar />}
    </>
  );
}

// Icon phụ trợ cho menu
const ShoppingBasketIcon = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="M4.5 7 9 4"/></svg>
);