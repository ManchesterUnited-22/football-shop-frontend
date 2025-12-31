// STORE-FRONTEND/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      const response = await fetch('http://localhost:3001/auth/register', {
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
    <div className="relative flex justify-center items-center min-h-screen bg-black px-4 overflow-hidden">
      {/* Background gradient + subtle stadium texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-black to-emerald-950" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624880357913-8cd7b47d89b9?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-emerald-500/30 overflow-hidden">
        {/* Neon border glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-transparent blur-xl -z-10" />

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-emerald-400 tracking-wider">BALLSHOP ⚽</h2>
          <p className="text-gray-300 text-sm mt-2">Cửa hàng bóng đá chính hãng</p>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wide">
          ⚽ Đăng ký tài khoản
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-200 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 focus:outline-none transition"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label htmlFor="regEmail" className="block text-sm font-semibold text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="regEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 focus:outline-none transition"
              placeholder="nhap@email.com"
            />
          </div>

          <div>
            <label htmlFor="regPassword" className="block text-sm font-semibold text-gray-200 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="regPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 focus:outline-none transition"
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
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-600/50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-300 text-sm mt-8">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}