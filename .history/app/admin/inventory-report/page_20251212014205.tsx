// STORE-FRONTEND/app/admin/inventory-report/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
// SỬA LỖI: Dùng hook lấy token của bạn, dựa trên cấu trúc hook/useAuth
import { useAuth } from '@/hook/useAuth'; 

// --- Định nghĩa kiểu dữ liệu trả về từ Backend ---
// Kiểu dữ liệu này phải khớp với những gì Backend trả về từ getLowStockItems
interface LowStockItem {
  id: number;
  stock: number;
  // Product được include trong Backend để lấy tên
  product: { 
    name: string;
    slug: string;
  };
}

// Lấy biến môi trường đã set trong .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InventoryReportPage = () => {
  // Lấy dữ liệu user hoặc token từ hook của bạn
  // Giả định hook useAuth trả về một đối tượng có trường 'token' hoặc 'adminToken'
  const { accessToken } = useAuth(); // Sửa lại tên biến nếu hook của bạn dùng tên khác (ví dụ: 'adminToken')
  
  const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockData = async () => {
    // 1. Kiểm tra Token
    if (!token) {
      setError('Lỗi: Bạn chưa đăng nhập hoặc không có token.');
      setLoading(false);
      return;
    }

    try {
      // 2. Gọi API Backend (Sử dụng API_URL đã lấy từ .env.local)
      const response = await fetch(`${API_URL}/reports/low-stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // TRUYỀN TOKEN CHO AUTHGUARD
          'Content-Type': 'application/json',
        },
      });

      // 3. Xử lý lỗi từ Backend
      if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập báo cáo. Cần Role Admin.');
      }
      if (!response.ok) {
          // Xử lý các lỗi khác như 401 (nếu token hết hạn) hoặc 500
          throw new Error(`Lỗi tải dữ liệu (${response.status}): Vui lòng kiểm tra Server Backend.`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tải báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockData();
  // CHÚ Ý: Nếu useAuth của bạn trả về { adminToken } thay vì { token }, bạn phải sửa dependency này
  }, [token]); 

  // --- Giao diện (Không có AdminLayout) ---
  if (loading) return <div className="p-8">Đang tải báo cáo...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-8"> 
      <h2 className="text-2xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
      
      {reportData && reportData.length > 0 ? (
        <>
          <p className="mb-4">Danh sách {reportData.length} mặt hàng có tồn kho thấp:</p>
          {/* Vị trí đặt biểu đồ, tạm thời là danh sách */}
          <ul className="space-y-3">
            {reportData.map((item) => (
              <li key={item.id} className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm flex justify-between items-center">
                <span className="font-medium">{item.product.name}</span>
                <span className="font-bold text-lg text-red-600">Tồn kho: {item.stock}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-green-600 font-medium">🎉 Mọi mặt hàng đều có tồn kho an toàn.</p>
      )}
    </div>
  );
};

export default InventoryReportPage;