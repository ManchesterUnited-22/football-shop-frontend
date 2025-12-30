'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/services/users.service';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user_info') || '{"name": "Chưa có tên", "email": "test@gmail.com"}');
    setUserInfo(user);
    setEditName(user.name);
  }, []);

  const handleSave = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!userInfo) return <div>Đang tải...</div>;

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl border border-gray-200">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="https://i.pravatar.cc/120"
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-md"
        />
        <h1 className="text-2xl font-bold mt-4 text-blue-900">Hồ sơ cá nhân</h1>
      </div>

      <div className="space-y-6">
        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              autoFocus
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800 mt-2">{userInfo.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-700 mt-2">{userInfo.email}</p>
        </div>

        {/* Nút điều khiển */}
        <div className="pt-4 flex justify-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(userInfo.name);
                }}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-200 transition"
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
