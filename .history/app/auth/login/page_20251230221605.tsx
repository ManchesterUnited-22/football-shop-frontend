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
    <div className="relative flex justify-center items-center min-h-screen bg-gray-950 px-4 overflow-hidden">
      {/* Background sân bóng đá đêm - tinh tế, mờ nhẹ */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
      />
      {/* Overlay tối nhẹ để nổi bật card */}
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

        {/* Tabs sạch sẽ */}
        <div className="flex mb-8 bg-gray-800/50 rounded-xl p-1">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`flex-1 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-300 ${
              selectedRole === 'customer'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-300 ${
              selectedRole === 'admin'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          {selectedRole === 'admin' ? 'Đăng nhập Quản trị' : 'Chào mừng trở lại!'}
        </h1>

        {/* Admin warning */}
        {selectedRole === 'admin' && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 text-red-300 rounded-lg text-sm text-center">
            Chỉ dành cho tài khoản Quản trị viên
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Register link */}
        {selectedRole === 'customer' && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
              Đăng ký ngay
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}