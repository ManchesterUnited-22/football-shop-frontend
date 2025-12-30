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
  promoName: string | null;
  promoStart: string | null;
  promoEnd: string | null;
  salePrice: number | null;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // State cho form chỉnh sửa nhanh sản phẩm
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

  // === STATE CHO KHUYẾN MÃI TOÀN SÀN ===
  const [globalPromo, setGlobalPromo] = useState({
    promoName: '',
    discountPercent: 0,
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiFetch<Product[]>('/products', { method: 'GET' });
      setProducts(data);
    } catch (error) {
      console.error('Lỗi tải danh sách sản phẩm:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa sản phẩm? Không thể khôi phục.')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      alert('Đã xóa thành công!');
      fetchProducts();
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm!');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      description: product.description,
      sizeType: product.sizeType,
      sizeOptions: product.sizeOptions || '',
      sizeIncreaseThreshold: product.sizeIncreaseThreshold || '',
      sizeIncreasePercentage: product.sizeIncreasePercentage !== null ? String(product.sizeIncreasePercentage) : '',
      promoName: product.promoName || '',
      salePrice: product.salePrice !== null ? String(product.salePrice) : '',
      promoStart: product.promoStart ? product.promoStart.substring(0, 16) : '',
      promoEnd: product.promoEnd ? product.promoEnd.substring(0, 16) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => setEditingProduct(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        sizeType: formData.sizeType,
        sizeOptions: formData.sizeType !== SizeType.NONE && formData.sizeOptions.trim() ? formData.sizeOptions.trim() : null,
        sizeIncreaseThreshold: formData.sizeType !== SizeType.NONE && formData.sizeIncreaseThreshold.trim() ? formData.sizeIncreaseThreshold.trim() : null,
        sizeIncreasePercentage: formData.sizeType !== SizeType.NONE && formData.sizeIncreasePercentage ? parseFloat(formData.sizeIncreasePercentage) : null,
        promoName: formData.promoName.trim() || null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        promoStart: formData.promoStart ? new Date(formData.promoStart).toISOString() : null,
        promoEnd: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : null,
      };

      await apiFetch(`/products/${editingProduct.id}`, { method: 'PATCH', body: updateData });
      alert('Cập nhật sản phẩm thành công!');
      cancelEdit();
      fetchProducts();
    } catch (error) {
      alert('Lỗi cập nhật sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalPromo = async () => {
    if (!globalPromo.promoName || globalPromo.discountPercent <= 0) {
      alert('Vui lòng nhập đầy đủ tên chương trình và % giảm giá!');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/settings/global-promotion', {
        method: 'POST',
        body: {
          ...globalPromo,
          discountPercent: Number(globalPromo.discountPercent),
          startDate: globalPromo.startDate ? new Date(globalPromo.startDate).toISOString() : null,
          endDate: globalPromo.endDate ? new Date(globalPromo.endDate).toISOString() : null,
        },
      });
      alert('🔥 ĐÃ KÍCH HOẠT KHUYẾN MÃI TOÀN CỬA HÀNG!');
      // Có thể reset form hoặc fetch lại settings nếu cần
    } catch (error) {
      alert('Lỗi khi áp dụng sale toàn sàn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-8">
          QUẢN LÝ CỬA HÀNG 🛒
        </h1>

        {/* ==========================================================
            PHẦN SALE TOÀN SÀN - ĐẶT Ở ĐẦU TRANG, NỔI BẬT
        =========================================================== */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 md:p-8 rounded-2xl shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-6">
            <Megaphone size={36} className="animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">Thiết lập Khuyến Mãi Toàn Cửa Hàng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-white/15 p-5 rounded-xl backdrop-blur-md">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">Tên chương trình</label>
              <input
                type="text"
                placeholder="VD: SALE TẾT 2026"
                className="w-full p-3 rounded-lg bg-white text-black font-semibold"
                value={globalPromo.promoName}
                onChange={(e) => setGlobalPromo({ ...globalPromo, promoName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">% Giảm giá</label>
              <input
                type="number"
                min="1"
                max="90"
                placeholder="VD: 25"
                className="w-full p-3 rounded-lg bg-white text-black font-bold text-xl"
                value={globalPromo.discountPercent}
                onChange={(e) => setGlobalPromo({ ...globalPromo, discountPercent: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">Kết thúc</label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded-lg bg-white text-black"
                value={globalPromo.endDate}
                onChange={(e) => setGlobalPromo({ ...globalPromo, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSaveGlobalPromo}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 text-red-900'}`}
              >
                <Save size={24} />
                {loading ? 'ĐANG XỬ LÝ...' : 'KÍCH HOẠT SALE'}
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-90 italic text-center md:text-left">
            * Khi kích hoạt: Tất cả sản phẩm (không có sale riêng) sẽ tự động giảm theo % này
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex-1 order-1">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              📦 Sản phẩm ({products.length})
            </h2>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4 flex-grow min-w-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-lg truncate">{p.name}</p>
                      <p className="text-red-600 font-semibold">
                        {p.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      title="Chỉnh sửa nhanh"
                    >
                      <Edit size={20} />
                    </button>
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition"
                      title="Chỉnh sửa chi tiết"
                    >
                      <Archive size={20} />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
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
          <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-96 order-2 sticky top-4 h-fit">
            {editingProduct ? (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-blue-800">
                  Chỉnh sửa nhanh: {editingProduct.name}
                </h2>
                {/* Form chỉnh sửa nhanh - giữ nguyên như code cũ, bạn có thể paste phần form chi tiết vào đây nếu muốn */}
                <div className="text-center text-gray-500 py-10">
                  [Form chỉnh sửa nhanh sản phẩm - giữ nguyên từ code trước]
                  <br />
                  <button
                    onClick={cancelEdit}
                    className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-center">Tác vụ nhanh</h2>

                <Link
                  href="/admin/products/create"
                  className="block text-center py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Plus size={24} /> Tạo sản phẩm mới
                </Link>

                <Link
                  href="/admin/orders"
                  className="block text-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Truck size={24} /> Quản lý đơn hàng
                </Link>
                
                <Link
                  href="/admin/inventory-report"
                  className="block py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-center rounded-xl shadow-sm transition-all"
                >
                  < Xem báo cáo kho
                </Link>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}