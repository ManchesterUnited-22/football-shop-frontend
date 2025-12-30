'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Camera } from 'lucide-react';
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
 const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setEditName(info.name); // khởi tạo editName
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateProfile(editName);
      localStorage.setItem('access_token', data.access_token);
      setUserInfo({ ...userInfo!, name: editName });
      setIsEditing(false);
      window.dispatchEvent(new Event('authUpdate'));
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Lỗi khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header trang hồ sơ */}
        <div className="bg-white rounded-t-3xl shadow-sm border-b p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
              {userInfo?.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md border hover:bg-gray-50 transition-colors">
              <Camera size={18} className="text-gray-600" />
            </button>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{userInfo?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                userInfo?.role.toUpperCase() === 'ADMIN' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
              }`}>
                {userInfo?.role}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Thành viên vàng
              </span>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="bg-white rounded-b-3xl shadow-sm p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <User size={16} /> Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="p-3 bg-gray-50 rounded-xl font-medium text-gray-700 border border-gray-300 w-full"
                  autoFocus
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl font-medium text-gray-700 border border-gray-100">
                  {userInfo?.name}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Mail size={16} /> Địa chỉ Email
              </label>
              <div className="p-3 bg-gray-50 rounded-xl font-medium text-gray-700 border border-gray-100">
                {userInfo?.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Shield size={16} /> Quyền hạn tài khoản
              </label>
              <div className="p-3 bg-gray-50 rounded-xl font-medium text-gray-700 border border-gray-100 uppercase">
                {userInfo?.role}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar size={16} /> Ngày tham gia
              </label>
              <div className="p-3 bg-gray-50 rounded-xl font-medium text-gray-700 border border-gray-100">
                {userInfo?.createdAt}
              </div>
            </div>
          </div>

          {/* Nút điều khiển */}
          <div className="pt-6 border-t flex justify-end gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(userInfo!.name);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all shadow-md"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                <Edit2 size={18} /> Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
