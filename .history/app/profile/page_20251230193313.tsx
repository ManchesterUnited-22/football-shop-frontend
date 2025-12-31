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
        role: decoded.role || 'USER',
        createdAt: decoded.iat ? new Date(decoded.iat * 1000).toLocaleDateString('vi-VN') : 'Mới tham gia'
      };
      setUserInfo(info);
      setEditData({ name: info.name, email: info.email });
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await updateProfile(editData);
      localStorage.setItem('access_token', result.access_token);
      setUserInfo({ ...userInfo!, name: editData.name, email: editData.email });
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
    setEditData({ name: userInfo!.name, email: userInfo!.email });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Đang tải hồ sơ...</div>
      </div>
    );
  }

  const isAdmin = userInfo?.role.toUpperCase() === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Main Profile Card - Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Hero Header với Avatar */}
          <div className="relative bg-gradient-to-r from-green-700 to-green-900 p-10 md:p-16 text-center">
            <div className="relative inline-block">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-400 to-red-600 rounded-full flex items-center justify-center text-white text-7xl font-black shadow-2xl border-8 border-white/20">
                {userInfo?.name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-4 right-4 p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-all hover:scale-110">
                <Camera size={28} className="text-white" />
              </button>
            </div>

            <h1 className="text-5xl font-extrabold text-white mt-8">{userInfo?.name}</h1>
            <div className="flex justify-center gap-4 mt-6">
              <span className={`px-6 py-3 rounded-full text-lg font-black uppercase tracking-wider shadow-lg ${
                isAdmin 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              }`}>
                {isAdmin ? 'ADMIN' : 'KHÁCH HÀNG VIP'}
              </span>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="p-10 md:p-16">
            {error && (
              <div className="mb-8 bg-red-900/50 border border-red-600/50 text-red-300 p-5 rounded-2xl text-center font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {/* Họ và tên */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-3 text-gray-300 text-lg font-medium mb-3">
                  <User size={24} className="text-green-400" /> Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white/10 rounded-xl text-white text-xl font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 transition"
                    placeholder="Nhập tên của bạn"
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-2xl font-extrabold">{userInfo?.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-3 text-gray-300 text-lg font-medium mb-3">
                  <Mail size={24} className="text-green-400" /> Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-white/10 rounded-xl text-white text-xl font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 transition"
                    placeholder="email@example.com"
                  />
                ) : (
                  <p className="text-white text-2xl font-extrabold">{userInfo?.email}</p>
                )}
              </div>

              {/* Quyền hạn */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-3 text-gray-300 text-lg font-medium mb-3">
                  <Shield size={24} className="text-green-400" /> Quyền hạn
                </label>
                <p className={`text-2xl font-black uppercase ${isAdmin ? 'text-yellow-400' : 'text-green-400'}`}>
                  {userInfo?.role}
                </p>
              </div>

              {/* Ngày tham gia */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-3 text-gray-300 text-lg font-medium mb-3">
                  <Calendar size={24} className="text-green-400" /> Ngày tham gia
                </label>
                <p className="text-white text-2xl font-extrabold">{userInfo?.createdAt}</p>
              </div>
            </div>

            {/* Nút điều khiển - Nổi bật */}
            <div className="mt-12 flex justify-center gap-6">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-green-800 text-white font-extrabold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all disabled:opacity-70"
                  >
                    <Check size={28} />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-3 px-10 py-5 bg-white/10 text-white font-extrabold text-xl rounded-2xl shadow-2xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    <X size={28} />
                    Hủy bỏ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-extrabold text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all"
                >
                  <Edit2 size={32} />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}