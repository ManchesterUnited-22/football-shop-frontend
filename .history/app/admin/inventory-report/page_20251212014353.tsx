// STORE-FRONTEND/app/admin/inventory-report/page.tsx

'use client'; 
import React, { useState, useEffect } from 'react';
// Hook này không cần thiết vì ta lấy token trực tiếp từ localStorage
// import { useAuth } from '@/hook/useAuth'; 

// Giữ lại import useAuth nếu bạn cần isAuthenticated hoặc userId
import { useAuth } from '@/hook/useAuth'; 


// --- Định nghĩa kiểu dữ liệu trả về từ Backend ---
interface LowStockItem {
  id: number;
  stock: number;
  product: { 
    name: string;
    slug: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InventoryReportPage = () => {
  // Bạn có thể dùng hook này để kiểm tra xem đã đăng nhập chưa
  const { isAuthenticated, isLoading } = useAuth(); 
  
  const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
  const [loading, setLoading] = useState(true); // Ban đầu dùng isLoading từ useAuth, nhưng ta sẽ dùng biến này
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockData = async () => {
    // 1. Lấy Token trực tiếp từ localStorage
    const token = localStorage.getItem('access_token'); // <<< Dùng KEY CHÍNH XÁC!

    if (!token) {
      setError('Lỗi: Vui lòng đăng nhập để xem báo cáo.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reports/low-stock`, {
        method: 'GET',
        headers: {
          // 2. TRUYỀN TOKEN CHO AUTHGUARD
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      // 3. Xử lý lỗi từ Backend
      if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập báo cáo. Cần Role Admin.');
      }
      if (!response.ok) {
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
    // Chỉ fetch data nếu không phải đang trong quá trình tải (initial loading)
    if (!isLoading) {
        fetchLowStockData();
    }
  }, [isLoading]); // Kích hoạt fetch data sau khi useAuth đã kiểm tra xong trạng thái

  // --- Giao diện ---
  if (loading || isLoading) return <div className="p-8">Đang tải báo cáo...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
  if (!isAuthenticated) return <div className="p-8 text-red-500">Bạn phải đăng nhập để xem báo cáo.</div>;


  return (
    <div className="p-8"> 
      <h2 className="text-2xl font-bold mb-6">📊 Báo cáo Tồn Kho Thấp</h2>
      
      {reportData && reportData.length > 0 ? (
        <>
          <p className="mb-4">Danh sách {reportData.length} mặt hàng có tồn kho thấp:</p>
          {reportData.map((item) => (
            <li key={item.id} className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm flex justify-between items-center">
              <span className="font-medium">{item.product.name}</span>
              <span className="font-bold text-lg text-red-600">Tồn kho: {item.stock}</span>
            </li>
          ))}
        </>
      ) : (
        <p className="mt-4 text-green-600 font-medium">🎉 Mọi mặt hàng đều có tồn kho an toàn.</p>
      )}
    </div>
  );
};

export default InventoryReportPage;