'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Archive, Edit, Trash2, Plus, Truck, Megaphone, Save } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

export enum SizeType {
  NONE = 'NONE',
  LETTER = 'LETTER',
  NUMBER = 'NUMBER',
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizeType: SizeType;
  sizeOptions: string | null;
  sizeIncreaseThreshold: string | null;
  sizeIncreasePercentage: number | null;
  // Các trường sale cá nhân (nếu backend hỗ trợ)
  promoName?: string | null;
  promoStart?: string | null;
  promoEnd?: string | null;
  salePrice?: number | null;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form chỉnh sửa nhanh sản phẩm
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sizeType: SizeType.NONE,
    sizeOptions: '',
    sizeIncreaseThreshold: '',
    sizeIncreasePercentage: '',
    promoName: '',
    promoStart: '',
    promoEnd: '',
    salePrice: '',
  });

  // State cho Khuyến mãi TOÀN SHOP
  const [globalPromo, setGlobalPromo] = useState({
    promoName: '',
    discountPercent: '',
    endDate: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiFetch<Product[]>('/products', { method: 'GET' });
      setProducts(data);
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Kích hoạt sale toàn shop
  const handleActivateGlobalSale = async () => {
    if (!globalPromo.discountPercent || Number(globalPromo.discountPercent) <= 0) {
      return alert('Vui lòng nhập % giảm giá hợp lệ!');
    }

    if (!globalPromo.endDate) {
      return alert('Vui lòng chọn ngày kết thúc!');
    }

    setLoading(true);
    try {
      await apiFetch('/products/global-sale', {
        method: 'POST',
        body: {
          promoName: globalPromo.promoName.trim() || 'Khuyến mãi toàn shop',
          discountPercent: parseFloat(globalPromo.discountPercent),
          endDate: new Date(globalPromo.endDate).toISOString(),
        },
      });
      alert('ĐÃ KÍCH HOẠT KHUYẾN MÃI TOÀN BỘ SẢN PHẨM!');
      // Có thể fetch lại products nếu backend cập nhật giá realtime
      fetchProducts();
    } catch (error) {
      alert('Lỗi khi kích hoạt sale toàn shop!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      sizeType: product.sizeType,
      sizeOptions: product.sizeOptions || '',
      sizeIncreaseThreshold: product.sizeIncreaseThreshold || '',
      sizeIncreasePercentage: product.sizeIncreasePercentage != null ? String(product.sizeIncreasePercentage) : '',
      promoName: product.promoName || '',
      salePrice: product.salePrice != null ? String(product.salePrice) : '',
      promoStart: product.promoStart ? product.promoStart.substring(0, 16) : '',
      promoEnd: product.promoEnd ? product.promoEnd.substring(0, 16) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '', price: '', description: '',
      sizeType: SizeType.NONE, sizeOptions: '',
      sizeIncreaseThreshold: '', sizeIncreasePercentage: '',
      promoName: '', promoStart: '', promoEnd: '', salePrice: '',
    });
  };

  // Hàm cập nhật sản phẩm (chỉnh sửa nhanh) - bạn có thể mở rộng thêm
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        sizeType: formData.sizeType,
        sizeOptions: formData.sizeType !== SizeType.NONE && formData.sizeOptions ? formData.sizeOptions : null,
        sizeIncreaseThreshold: formData.sizeType !== SizeType.NONE && formData.sizeIncreaseThreshold ? formData.sizeIncreaseThreshold : null,
        sizeIncreasePercentage: formData.sizeType !== SizeType.NONE && formData.sizeIncreasePercentage ? parseFloat(formData.sizeIncreasePercentage) : null,
        // Sale cá nhân (nếu cần)
        promoName: formData.promoName || null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        promoStart: formData.promoStart ? new Date(formData.promoStart).toISOString() : null,
        promoEnd: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : null,
      };

      await apiFetch(`/products/${editingProduct.id}`, {
        method: 'PATCH',
        body: updateData,
      });

      alert('Cập nhật sản phẩm thành công!');
      cancelEdit();
      fetchProducts();
    } catch (error) {
      alert('Lỗi cập nhật sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* BANNER KHUYẾN MÃI TOÀN SHOP - ĐẶT Ở ĐẦU */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 md:p-8 rounded-2xl shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-5">
            <Megaphone size={32} className="animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
              THIẾT LẬP KHUYẾN MÃI TOÀN SHOP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/15 p-5 rounded-xl backdrop-blur-md">
            <input
              type="text"
              placeholder="Tên chương trình (VD: Sale Tết 2026)"
              className="p-3 rounded-lg text-black font-medium outline-none focus:ring-2 focus:ring-yellow-400"
              value={globalPromo.promoName}
              onChange={(e) => setGlobalPromo({ ...globalPromo, promoName: e.target.value })}
            />
            <input
              type="number"
              min="1"
              max="90"
              placeholder="% Giảm giá"
              className="p-3 rounded-lg text-black font-bold text-xl outline-none focus:ring-2 focus:ring-yellow-400"
              value={globalPromo.discountPercent}
              onChange={(e) => setGlobalPromo({ ...globalPromo, discountPercent: e.target.value })}
            />
            <input
              type="datetime-local"
              className="p-3 rounded-lg text-black outline-none focus:ring-2 focus:ring-yellow-400"
              value={globalPromo.endDate}
              onChange={(e) => setGlobalPromo({ ...globalPromo, endDate: e.target.value })}
            />
            <button
              onClick={handleActivateGlobalSale}
              disabled={loading}
              className={`p-3 rounded-lg font-black uppercase transition-all active:scale-95 shadow-lg
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-400 hover:bg-yellow-300 text-red-900'}`}
            >
              {loading ? 'ĐANG XỬ LÝ...' : 'KÍCH HOẠT SALE'}
            </button>
          </div>

          <p className="text-xs md:text-sm mt-4 opacity-90 italic text-center">
            * Áp dụng ngay lập tức cho tất cả sản phẩm (ưu tiên sale cá nhân nếu có)
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 border-b pb-3">
          QUẢN LÝ KHO SẢN PHẨM 🛠️
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex-1">
            <h2 className="text-xl font-bold mb-5">📦 Danh sách sản phẩm ({products.length})</h2>
            <div className="space-y-4 overflow-y-auto max-h-[700px] pr-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-grow min-w-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-lg border shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-lg truncate">{p.name}</p>
                      <p className="text-red-600 font-semibold text-sm">
                        {p.price.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-md transition"
                      title="Chỉnh sửa nhanh"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => {/* Thêm logic xóa nếu cần */}}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-md transition"
                      title="Xóa"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM CHỈNH SỬA NHANH + TÁC VỤ */}
          <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-96 lg:w-[480px] sticky top-4 h-fit">
            {editingProduct ? (
              <form onSubmit={handleUpdateProduct} className="space-y-5">
                <h2 className="text-xl font-bold text-blue-800">
                  Chỉnh sửa nhanh: {editingProduct.name}
                </h2>

                {/* Tên & Giá */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border rounded-lg"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá (₫)</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border rounded-lg"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full p-2.5 border rounded-lg"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Phần size và sale cá nhân - có thể mở rộng thêm */}
                {/* ... thêm các trường size như code cũ nếu cần ... */}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-center text-gray-800">Tác vụ nhanh</h2>

                <Link
                  href="/admin/products/create"
                  className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  <Plus size={22} /> Tạo sản phẩm mới
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  <Truck size={22} /> Xử lý đơn hàng
                </Link>

                <Link
                  href="/admin/inventory-report"
                  className="block py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-center rounded-xl shadow-sm transition-all"
                >
                  Xem báo cáo kho
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-gray-600 hover:text-black font-medium transition">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}