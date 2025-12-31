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
    
  );
}
