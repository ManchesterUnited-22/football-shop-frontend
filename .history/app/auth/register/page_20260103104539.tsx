'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../utils/apiFetch';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      t fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      }

      alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-950 px-4 overflow-hidden">
      {/* Background sân bóng đá đêm - tinh tế, mờ nhẹ */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1683575565181-3be8d92ff177?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
      />
      {/* Overlay tối nhẹ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Card chính - glassmorphism tinh tế */}
      <div className="relative w-full max-w-md bg-gray-900/70 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-800">
        {/* Logo */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black tracking-tight text-white">
            4FOOTBALL <span className="text-4xl">⚽</span>
          </h2>
          <p className="text-gray-400 text-lg mt-2">Cửa hàng bóng đá chính hãng</p>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Đăng ký tài khoản
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Tên của bạn"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="nhap@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/30 py-3 px-4 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-70"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}