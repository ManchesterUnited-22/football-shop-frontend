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
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40" />
  <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/50" />

  {/* Card */}
  <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200 overflow-hidden">
    {/* Glow */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-yellow-400/20 blur-2xl -z-10" />

    {/* Logo */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-black tracking-wider 
        bg-gradient-to-r from-emerald-500 via-yellow-400 to-cyan-500 
        bg-clip-text text-transparent animate-pulse">
        4FOOTBALL ⚽
      </h2>
      <p className="text-gray-700 text-sm mt-2">Cửa hàng bóng đá chính hãng</p>
    </div>

    {/* Tabs */}
    <div className="flex mb-8 bg-gray-100 rounded-xl p-1 border border-gray-300">
      <button
        onClick={() => setSelectedRole('customer')}
        className={`flex-1 py-3 text-base font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          selectedRole === 'customer'
            ? 'bg-gradient-to-r from-emerald-500 to-yellow-500 text-white shadow-lg shadow-emerald-500/50'
            : 'text-gray-600 hover:text-emerald-600'
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
            : 'text-gray-600 hover:text-red-600'
        }`}
      >
        🛡️ Admin
      </button>
    </div>

    {/* Title */}
    <h1 className="text-3xl font-extrabold text-center 
      bg-gradient-to-r from-emerald-500 via-yellow-400 to-cyan-500 
      bg-clip-text text-transparent mb-6 tracking-wide">
      {selectedRole === 'admin' ? 'Đăng nhập Quản trị' : 'Chào mừng trở lại!'}
    </h1>

    {/* Warning */}
    {selectedRole === 'admin' && (
      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl text-sm flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        Chỉ dành cho tài khoản Quản trị viên
      </div>
    )}

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-emerald-400/50 focus:border-emerald-400 focus:outline-none transition"
          placeholder="nhap@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-emerald-400/50 focus:border-emerald-400 focus:outline-none transition"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-lg animate-bounce">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-500 to-yellow-500 
        hover:from-emerald-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl 
        transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/50 
        disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          'Đăng nhập ngay'
        )}
      </button>
    </form>

    {/* Register link */}
    <p className="text-center text-gray-700 text-sm mt-8">
      Chưa có tài khoản?{' '}
      <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-500 font-bold underline">
        Đăng ký ngay
      </Link>
    </p>
  </div>
</div>

  );
}
