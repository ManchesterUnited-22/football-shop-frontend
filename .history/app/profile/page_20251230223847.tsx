'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Camera, Check, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/services/users.service';

interface UserInfo {
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const info: UserInfo = {
        name: decoded.name || 'Chưa cập nhật',
        email: decoded.email || 'Chưa cập nhật',
        role: decoded.role?.toUpperCase() || 'CUSTOMER',
        createdAt: decoded.iat ? new Date(decoded.iat * 1000).toLocaleDateString('vi-VN') : 'Mới tham gia'
      };
      setUserInfo(info);
      setEditData({ name: info.name === 'Chưa cập nhật' ? '' : info.name, email: info.email === 'Chưa cập nhật' ? '' : info.email });
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      setError('Vui lòng nhập đầy đủ tên và email');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await updateProfile(editData);
      localStorage.setItem('access_token', result.access_token);
      setUserInfo(prev => prev ? { ...prev, name: editData.name, email: editData.email } : null);
      setIsEditing(false);
      window.dispatchEvent(new Event('authUpdate'));
      alert("Cập nhật hồ sơ thành công! 🎉");
    } catch (err: any) {
      setError(err.message || "Email đã tồn tại hoặc lỗi hệ thống");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ 
      name: userInfo?.name === 'Chưa cập nhật' ? '' : userInfo?.name || '', 
      email: userInfo?.email === 'Chưa cập nhật' ? '' : userInfo?.email || '' 
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-xl">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userInfo?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-6 relative overflow-hidden">
      {/* Background nhẹ */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-red-900/20" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Main Profile Card */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in">
          {/* Header với Avatar */}
          <div className="relative bg-gradient-to-br from-emerald-900/80 via-gray-900 to-red-900/60 p-12 text-center">
            <div className="relative inline-block group">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-8xl font-black shadow-2xl ring-8 ring-white/20">
                {userInfo?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera size={40} className="text-white" />
              </div>
              <button className="absolute bottom-4 right-4 p-3 bg-emerald-600/80 backdrop-blur-md rounded-full shadow-lg hover:bg-emerald-500 hover:scale-110 transition-all">
                <Camera size={24} className="text-white" />
              </button>
            </div>

            <h1 className="text-5xl font-black mt-8 tracking-tight">{userInfo?.name}</h1>
            <div className="mt-6">
              <span className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-black uppercase tracking-wider shadow-xl ${
                isAdmin 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
              }`}>
                <Shield size={24} />
                {isAdmin ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG VIP'}
              </span>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="p-10 lg:p-16">
            {error && (
              <div className="mb-10 bg-red-900/50 border border-red-700/50 text-red-300 p-6 rounded-2xl text-center font-bold text-lg shadow-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Họ và tên */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-700/50 transition-all">
                <div className="flex items-center gap-4 text-gray-400 mb-4">
                  <User size={28} className="text-emerald-500" />
                  <span className="text-lg font-bold uppercase tracking-wide">Họ và tên</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-2xl font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Nhập tên của bạn"
                    autoFocus
                  />
                ) : (
                  <p className="text-3xl font-black text-white">{userInfo?.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-700/50 transition-all">
                <div className="flex items-center gap-4 text-gray-400 mb-4">
                  <Mail size={28} className="text-emerald-500" />
                  <span className="text-lg font-bold uppercase tracking-wide">Email</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-2xl font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="email@example.com"
                  />
                ) : (
                  <p className="text-3xl font-black text-white">{userInfo?.email}</p>
                )}
              </div>

              {/* Quyền hạn */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-700/50 transition-all">
                <div className="flex items-center gap-4 text-gray-400 mb-4">
                  <Shield size={28} className="text-emerald-500" />
                  <span className="text-lg font-bold uppercase tracking-wide">Quyền hạn</span>
                </div>
                <p className={`text-3xl font-black uppercase ${isAdmin ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {isAdmin ? 'ADMIN' : 'CUSTOMER'}
                </p>
              </div>

              {/* Ngày tham gia */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-700/50 transition-all">
                <div className="flex items-center gap-4 text-gray-400 mb-4">
                  <Calendar size={28} className="text-emerald-500" />
                  <span className="text-lg font-bold uppercase tracking-wide">Ngày tham gia</span>
                </div>
                <p className="text-3xl font-black text-white">{userInfo?.createdAt}</p>
              </div>
            </div>

            {/* Nút điều khiển */}
            <div className="mt-16 flex justify-center gap-8">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-emerald-600/60 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Check size={32} />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-4 px-12 py-6 bg-gray-800/70 hover:bg-gray-700 text-white font-black text-xl rounded-2xl shadow-2xl border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <X size={32} />
                    Hủy bỏ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-4 px-16 py-7 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-red-600/60 hover:scale-105 hover:-translate-y-2 transition-all"
                >
                  <Edit2 size={36} />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}