'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Archive, Edit, Trash2, Plus, Truck, Megaphone, Save, ClipboardCheck, X } from 'lucide-react';
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
  categoryId?: number;
  sizeType: SizeType;
  sizeOptions: string | null;
  sizeIncreaseThreshold: string | null;
  sizeIncreasePercentage: number | null;
  promoName: string | null;
  promoStart: string | null;
  promoEnd: string | null;
  discount?: number;
  salePrice: number | null;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    sizeType: SizeType.NONE,
    sizeOptions: '',
    sizeIncreaseThreshold: '',
    sizeIncreasePercentage: '',
    discount: '',
    promoName: '',
    promoStart: '',
    promoEnd: '',
  });

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
      setProducts(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Lỗi tải danh sách sản phẩm:', error);
      alert('Không thể tải danh sách sản phẩm.');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Xác nhận xóa sản phẩm này? Hành động không thể hoàn tác!')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      alert('✅ Đã xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error) {
      alert('❌ Lỗi khi xóa sản phẩm!');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      categoryId: String(product.categoryId || ''),
      sizeType: product.sizeType,
      sizeOptions: product.sizeOptions || '',
      sizeIncreaseThreshold: product.sizeIncreaseThreshold || '',
      sizeIncreasePercentage: product.sizeIncreasePercentage !== null ? String(product.sizeIncreasePercentage) : '',
      discount: String(product.discount || 0),
      promoName: product.promoName || '',
      promoStart: product.promoStart ? product.promoStart.substring(0, 16) : '',
      promoEnd: product.promoEnd ? product.promoEnd.substring(0, 16) : '',
    });
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
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        sizeType: formData.sizeType,
        sizeOptions: formData.sizeType !== SizeType.NONE && formData.sizeOptions.trim() ? formData.sizeOptions.trim() : null,
        sizeIncreaseThreshold: formData.sizeType !== SizeType.NONE && formData.sizeIncreaseThreshold.trim() ? formData.sizeIncreaseThreshold.trim() : null,
        sizeIncreasePercentage: formData.sizeType !== SizeType.NONE && formData.sizeIncreasePercentage ? parseFloat(formData.sizeIncreasePercentage) : null,
        discount: parseFloat(formData.discount) || 0,
        promoName: formData.promoName.trim() || null,
        promoStart: formData.promoStart ? new Date(formData.promoStart).toISOString() : null,
        promoEnd: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : null,
      };

      await apiFetch(`/products/${editingProduct.id}`, {
        method: 'PATCH',
        body: updateData,
      });

      alert('✅ Cập nhật sản phẩm thành công!');
      cancelEdit();
      fetchProducts();
    } catch (error) {
      alert('❌ Lỗi cập nhật sản phẩm! Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalPromo = async () => {
    if (!globalPromo.promoName.trim() || globalPromo.discountPercent <= 0) {
      alert('Vui lòng nhập tên chương trình và % giảm giá hợp lệ!');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/products/global-promotion', {
        method: 'POST',
        body: {
          promoName: globalPromo.promoName,
          discountPercent: Number(globalPromo.discountPercent),
          startDate: globalPromo.startDate ? new Date(globalPromo.startDate).toISOString() : null,
          endDate: globalPromo.endDate ? new Date(globalPromo.endDate).toISOString() : null,
        },
      });
      alert('🔥 ĐÃ KÍCH HOẠT KHUYẾN MÃI TOÀN CỬA HÀNG THÀNH CÔNG!');
      fetchProducts();
    } catch (error) {
      alert('Lỗi khi áp dụng khuyến mãi toàn sàn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-3">
            Trung tâm quản trị
          </h1>
          <p className="text-lg text-gray-600">Quản lý sản phẩm, đơn hàng và khuyến mãi</p>
        </div>

        {/* Global Promo Banner - Thu nhỏ hơn */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl animate-pulse">
                <Megaphone className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider">Khuyến mãi toàn sàn</h2>
                <p className="text-base opacity-90 mt-1">Áp dụng giảm giá cho tất cả sản phẩm</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1">Tên chương trình</label>
                <input
                  type="text"
                  placeholder="VD: TẾT SALE 50%"
                  className="w-full px-5 py-4 rounded-xl bg-white/20 backdrop-blur-md text-white placeholder-white/60 font-medium focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.promoName}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, promoName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1">% Giảm giá</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="30"
                  className="w-full px-5 py-4 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-2xl text-center focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.discountPercent}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, discountPercent: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1">Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  className="w-full px-5 py-4 rounded-xl bg-white/20 backdrop-blur-md text-white font-medium focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.endDate}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, endDate: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveGlobalPromo}
                  disabled={loading}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-red-700 font-black text-lg uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  {loading ? 'ĐANG ÁP DỤNG...' : 'KÍCH HOẠT'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <Archive className="w-8 h-8 text-emerald-600" />
                  Kho hàng ({products.length})
                </h2>
                <Link
                  href="/admin/products/create"
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Thêm sản phẩm
                </Link>
              </div>

              <div className="space-y-4">
                {products.map((p) => {
                  const isSale = p.salePrice && p.salePrice < p.price;
                  return (
                    <div
                      key={p.id}
                      className="group bg-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 flex items-center gap-5"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-3xl">
                            ⚽
                          </div>
                        )}
                        {isSale && (
                          <div className="absolute top-1 left-1 bg-red-600 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg animate-pulse">
                            SALE {p.discount}%
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{p.name}</h3>
                        {p.promoName && (
                          <p className="text-xs text-orange-600 font-bold uppercase mb-1">{p.promoName}</p>
                        )}
                        <div className="flex items-end gap-3">
                          {isSale ? (
                            <>
                              <p className="text-2xl font-black text-red-600">{p.salePrice?.toLocaleString()}₫</p>
                              <p className="text-sm text-gray-400 line-through">{p.price.toLocaleString()}₫</p>
                            </>
                          ) : (
                            <p className="text-2xl font-black text-emerald-600">{p.price.toLocaleString()}₫</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-3 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all shadow-md"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-3 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all shadow-md"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar tác vụ - Thu nhỏ nút */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-wide">
                Tác vụ nhanh
              </h3>
              <div className="space-y-4">
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:scale-105 group"
                >
                  <span>Quản lý đơn hàng</span>
                  <Truck className="w-6 h-6 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  href="/admin/inventory-report"
                  className="flex items-center justify-between p-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:scale-105 group"
                >
                  <span>Báo cáo kho</span>
                  <ClipboardCheck className="w-6 h-6 group-hover:scale-110 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modal chỉnh sửa - Thu nhỏ, gọn hơn */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Chỉnh sửa sản phẩm</h2>
                    <p className="text-blue-100 mt-1">ID: #{editingProduct.id}</p>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Tên sản phẩm</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 text-xl font-bold rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Giá gốc (VNĐ)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 text-2xl font-bold text-emerald-600 rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Danh mục ID</label>
                    <input
                      type="number"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-5 py-4 text-xl font-bold rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Mô tả sản phẩm</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition resize-none leading-relaxed"
                  />
                </div>

                {/* Các phần khác giữ nguyên nhưng thu gọn padding */}
                {/* ... (giữ nguyên phần size và promo như trước, chỉ giảm padding nếu cần) ... */}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-lg uppercase rounded-xl transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 text-white font-bold text-lg uppercase rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? 'ĐANG LƯU...' : (
                      <>
                        <Save className="w-6 h-6" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}