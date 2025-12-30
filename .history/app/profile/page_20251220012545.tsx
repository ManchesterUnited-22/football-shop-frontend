'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '../services/users.service';
import { jwtDecode } from 'jwt-decode';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy dữ liệu từ Token khi load trang
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const initialData = { 
        name: decoded.name || '', 
        email: decoded.email || '' 
      };
      setUserInfo(initialData);
      setEditData(initialData);
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Gọi API cập nhật
      const result = await updateProfile(editData);
      
      // 2. Lưu token mới (chứa email/tên mới) vào máy
      localStorage.setItem('access_token', result.access_token);
      
      // 3. Cập nhật UI tại chỗ
      setUserInfo({ name: editData.name, email: editData.email });
      setIsEditing(false);

      // 4. Báo cho Header cập nhật ngay
      window.dispatchEvent(new Event('authUpdate'));
      alert("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      setError(err.message || "Email đã tồn tại hoặc lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-black">
      <h2 className="text-3xl font-black mb-8 text-blue-900 border-b pb-4">Hồ sơ cá nhân</h2>
      
      {error && <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-bold">{error}</p>}

      <div className="space-y-6">
        {/* TRƯỜNG TÊN */}
        <div className="group">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Họ và tên</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="w-full p-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none transition-all"
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">{userInfo.name}</p>
          )}
        </div>

        {/* TRƯỜNG EMAIL */}
        <div className="group">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Địa chỉ Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              className="w-full p-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none transition-all"
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">{userInfo.email}</p>
          )}
        </div>

        {/* NÚT ĐIỀU KHIỂN */}
        <div className="pt-6 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditData(userInfo); }}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto px-8 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all border-2 border-blue-100"
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}