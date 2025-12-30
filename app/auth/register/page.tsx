// STORE-FRONTEND/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // ✅ Đảm bảo URL này khớp với NestJS Backend của bạn
            const response = await fetch('http://localhost:3001/auth/register', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ✅ Đảm bảo trường fullName khớp với DTO của Backend
                body: JSON.stringify({ email, password, fullName }), 
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
            }

            alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
            router.push('/auth/login'); // Chuyển hướng đến trang Đăng nhập

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-150px)] bg-gray-50">
            <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Đăng ký tài khoản</h1>
                <form onSubmit={handleSubmit}>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">Họ và tên</label>
                        <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regEmail">Email</label>
                        <input type="email" id="regEmail" value={email} onChange={(e) => setEmail(e.target.value)} required className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regPassword">Mật khẩu</label>
                        <input type="password" id="regPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    
                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400">
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-gray-500 text-sm mt-4">
                    Đã có tài khoản? <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-bold">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
}