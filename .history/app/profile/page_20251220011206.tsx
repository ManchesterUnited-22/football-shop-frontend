'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/services/users.service';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái đóng/mở chế độ sửa
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  // Giả sử lấy dữ liệu user từ đâu đó khi load trang
  useEffect(() => {
    // Lấy thông tin từ localStorage hoặc API
    const user = JSON.parse(localStorage.getItem('user_info') || '{"name": "Chưa có tên", "email": "test@gmail.com"}');
    setUserInfo(user);
    setEditName(user.name);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Gọi API Backend (Hàm này chúng ta đã viết ở bước trước)
      const data = await updateProfile(editName);
      
      // 2. Lưu token mới vào máy
      localStorage.setItem('access_token', data.access_token);
      
      // 3. Cập nhật giao diện tại chỗ
      setUserInfo({ ...userInfo!, name: editName });
      setIsEditing(false); // Đóng chế độ sửa

      // 4. "Bắn" tin hiệu cho Header cập nhật
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Hồ sơ cá nhân</h1>
      
      <div className="space-y-4">
        {/* PHẦN HIỂN THỊ TÊN */}
        <div>
          <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
          
          {isEditing ? (
            /* Khi đang sửa: Hiện ô Input */
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              autoFocus
            />
          ) : (
            /* Khi không sửa: Hiện chữ bình thường */
            <p className="text-lg font-semibold text-gray-800 py-2">{userInfo.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-600">{userInfo.email}</p>
        </div>

        {/* NÚT ĐIỀU KHIỂN */}
        <div className="pt-4">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(userInfo.name); // Hủy thì reset lại tên cũ
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)} // QUAN TRỌNG: Phải có dòng này để mở chế độ sửa
              className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-blue-200 transition"
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}