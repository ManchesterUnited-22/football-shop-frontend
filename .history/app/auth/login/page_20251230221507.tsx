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
      const userRole = decodedToken.role.toLowerCase() as Role;

      if (selectedRole === 'customer' && userRole === 'admin') {
        throw new Error('Bạn đang cố đăng nhập bằng tài khoản Quản trị viên. Vui lòng chọn tab "Đăng nhập Admin".');
      }
      if (selectedRole === 'admin' && userRole !== 'admin') {
        throw new Error('Tài khoản này không có quyền Quản trị viên.');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      router.refresh();
      router.push(userRole === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (role: Role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-black px-4 overflow-hidden">
      {/* Background sân bóng đá hiện đại - thay URL nếu muốn hình khác */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518098268026-4e266ba5f9d8?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
      />
      {/* Overlay grass texture + gradient neon */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black/70 to-emerald-900/60" />
      {/* Subtle football particles animation (CSS keyframe đơn giản) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-ping absolute top-20 left-10 text-6xl opacity-20">⚽</div>
        <div className="animate-bounce absolute bottom-32 right-20 text-5xl opacity-10 delay-1000">⚽</div>
      </div>

      {/* Card chính - glassmorphism mạnh mẽ */}
      <div className="relative w-full max-w-md bg-black/70 backdrop-blur-3xl shadow-2xl rounded-3xl p-10 border border-green-500/30 overflow-hidden">
        {/* Neon glow border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-yellow-500/20 to-cyan-500/30 blur-xl -z-10 animate-pulse" />

        {/* Logo */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl animate-glow">
            4FOOTBALL <span className="inline-block animate-spin-slow">⚽</span>
          </h2>
          <p className="text-green-300 text-lg mt-3 font-semibold">Cửa hàng bóng đá chính hãng #1</p>
        </div>

        {/* Tabs hiện đại hơn */}
        <div className="flex mb-10 bg-black/50 rounded-full p-2 border border-green-500/50 shadow-2xl">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`flex-1 py-4 px-6 text-lg font-bold rounded-full transition-all duration-500 flex items-center justify-center gap-3 ${
              selectedRole === 'customer'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/70 scale-110'
                : 'text-gray-400 hover:text-emerald-300'
            }`}
          >
            <span className="text-2xl">⚽</span> Khách hàng
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-4 px-6 text-lg font-bold rounded-full transition-all duration-500 flex items-center justify-center gap-3 ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-600/70 scale-110'
                : 'text-gray-400 hover:text-red-300'
            }`}
          >
            <span className="text-2xl">🛡️</span> Admin
          </button>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-center bg-gradient-to-r from-emerald-300 to-yellow-300 bg-clip-text text-transparent mb-8 tracking-wide drop-shadow-xl">
          {selectedRole === 'admin' ? 'QUẢN TRỊ HỆ THỐNG' : 'CHÀO MỪNG FAN BÓNG ĐÁ!'}
        </h1>

        {/* Admin warning */}
        {selectedRole === 'admin' && (
          <div className="mb-8 p-5 bg-red-900/50 border border-red-500/70 text-red-200 rounded-2xl text-center font-bold flex items-center justify-center gap-3 shadow-lg">
            <span className="text-3xl">⚠️</span>
            Chỉ dành cho Quản trị viên
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-lg font-bold text-emerald-300 mb-3">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-black/60 border border-green-500/50 rounded-2xl px-6 py-5 text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition-all shadow-lg"
              placeholder="fan@bongda.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg font-bold text-emerald-300 mb-3">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-black/60 border border-green-500/50 rounded-2xl px-6 py-5 text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition-all shadow-lg"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-center bg-red-900/60 py-4 px-6 rounded-2xl font-bold animate-pulse shadow-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-green-600 hover:from-emerald-600 hover:via-yellow-600 hover:to-green-700 text-white font-black text-xl py-6 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/80 disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-4">
                <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                ĐANG XỬ LÝ...
              </span>
            ) : (
              'ĐĂNG NHẬP NGAY ⚡'
            )}
          </button>
        </form>

        {/* Register link */}
        {selectedRole === 'customer' && (
          <p className="text-center text-gray-300 text-lg mt-10 font-semibold">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-emerald-400 hover:text-yellow-400 font-black underline transition-all">
              ĐĂNG KÝ LIỀN TAY
            </Link>
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px #10b981; }
          50% { text-shadow: 0 0 40px #10b981, 0 0 60px #10b981; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-glow { animation: glow 2s infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
}