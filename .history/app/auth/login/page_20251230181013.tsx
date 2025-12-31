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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-700 via-black to-green-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-white/20">
        
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setSelectedRole('customer')}
            className={`flex-1 py-2 text-sm font-semibold rounded-l-lg transition ${
              selectedRole === 'customer'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            className={`flex-1 py-2 text-sm font-semibold rounded-r-lg transition ${
              selectedRole === 'admin'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-white mb-6 tracking-wide">
          {selectedRole === 'admin' ? 'Đăng nhập Quản trị viên' : 'Đăng nhập Khách hàng'}
        </h1>

        {/* Warning for admin */}
        {selectedRole === 'admin' && (
          <div className="mb-4 p-3 bg-yellow-200/80 border border-yellow-400 text-yellow-900 rounded text-sm">
            ⚠️ Lưu ý: Chỉ dành cho tài khoản Quản trị viên.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-2 rounded-lg transition transform hover:scale-105 disabled:bg-gray-400"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-gray-200 text-sm mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="text-green-300 hover:text-green-500 font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
