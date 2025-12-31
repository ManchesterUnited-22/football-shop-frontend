'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '../../utils/apiFetch';

type Role = 'customer' | 'admin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const token = data.access_token;
      const decodedToken: { role: string } = jwtDecode(token);
      const userRole = decodedToken.role.toLowerCase();

      if (selectedRole === 'customer' && userRole === 'admin') {
        throw new Error('Bạn đang cố đăng nhập bằng tài khoản Quản trị viên. Vui lòng chọn tab "Đăng nhập Admin".');
      }
      if (selectedRole === 'admin' && (userRole === 'user' || userRole === 'customer')) {
        throw new Error('Tài khoản này không có quyền Quản trị viên.');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      router.refresh();
      router.push(userRole === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-800 via-gray-900 to-blue-950 px-4 overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-25" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

  {/* Card */}
  <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-700 overflow-hidden">
    {/* Glow */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-yellow-400/20 blur-2xl -z-10" />

    {/* Logo */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-black tracking-wider 
        bg-gradient-to-r from-emerald-400 via-yellow-400 to-cyan-400 
        bg-clip-text text-transparent animate-pulse">
        4FOOTBALL ⚽
      </h2>
      <p className="text-gray-300 text-sm mt-2">Cửa hàng bóng đá chính hãng</p>
    </div>

    {/* Tabs */}
    <div className="flex mb-8 bg-slate-800 rounded-xl p-1 border border-gray-600">
      <button
        onClick={() => setSelectedRole('customer')}
        className={`flex-1 py-3 text-base font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          selectedRole === 'customer'
            ? 'bg-gradient-to-r from-emerald-500 to-yellow-500 text-white shadow-lg shadow-emerald-500/50'
            : 'text-gray-400 hover:text-emerald-400'
        }`}
      >
        ⚽ Khách hàng
      </button>
      <button
        onClick={() => {
          setSelectedRole('admin');
          setEmail('');
          setPassword('');
        }}
        className={`flex-1 py-3 text-base font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          selectedRole === 'admin'
            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50'
            : 'text-gray-400 hover:text-red-400'
        }`}
      >
        🛡️ Admin
      </button>
    </div>

    {/* Title */}
    <h1 className="text-3xl font-extrabold text-center 
      bg-gradient-to-r from-emerald-400 via-yellow-400 to-cyan-400 
      bg-clip-text text-transparent mb-6 tracking-wide">
      {selectedRole === 'admin' ? 'Đăng nhập Quản trị' : 'Chào mừng trở lại!'}
    </h1>

  );
}
