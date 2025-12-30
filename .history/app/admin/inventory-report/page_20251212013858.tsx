// STORE-FRONTEND/app/admin/inventory-report/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
// Đảm bảo bạn có các import này dựa trên cấu trúc dự án của bạn
import AdminLayout from '@/components/AdminLayout'; 
import { useAuth } from '@/hook/useAuth'; 

// Định nghĩa kiểu dữ liệu trả về từ Backend
interface LowStockItem {
  id: number;
  stock: number;
  // Tùy chỉnh theo cách Backend trả về:
  product: {
    name: string; 
    slug: string;
  };
}

// Lấy biến môi trường đã set ở Bước 1
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InventoryReportPage = () => {
  // Giả định useAuth cung cấp adminToken
  const { access_oken } = useAuth(); 
  const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockData = async () => {
    if (!adminToken) {
      setError('Vui lòng đăng nhập với quyền Admin.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reports/low-stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`, // <<< TRUYỀN TOKEN XÁC THỰC
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403 || response.status === 401) {
        throw new Error('Bạn không có quyền truy cập báo cáo. Cần Role Admin.');
      }
      if (!response.ok) {
        // Xử lý các lỗi HTTP khác (ví dụ: 500 Internal Server Error)
        throw new Error(`Lỗi tải dữ liệu: ${response.statusText}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tải báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  // Gọi hàm fetch data khi Component được render và khi adminToken thay đổi
  useEffect(() => {
    fetchLowStockData();
  }, [adminToken]); 

  if (loading) return <AdminLayout><div>Đang tải báo cáo...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 p-4">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">📊 Báo cáo Tồn Kho Thấp</h2>
      <p>Danh sách các biến thể sản phẩm có tồn kho thấp.</p>

      {reportData && reportData.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {/* Vị trí đặt biểu đồ, tạm thời hiển thị danh sách để kiểm tra */}
          {reportData.map((item) => (
            <li key={item.id} className="p-3 border rounded shadow-sm flex justify-between">
              <span>{item.product.name}</span>
              <span className="font-bold text-red-600">Tồn kho: {item.stock}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-green-600">🎉 Mọi mặt hàng đều có tồn kho an toàn (trên ngưỡng 10).</p>
      )}
    </AdminLayout>
  );
};

export default InventoryReportPage;