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
      setProducts(data.sort((a, b) => b.id - a.id)); // Mới nhất lên đầu
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight mb-4">
            Trung tâm quản trị
          </h1>
          <p className="text-xl text-gray-600">Quản lý sản phẩm, đơn hàng và khuyến mãi</p>
        </div>

        {/* Global Promo Banner */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 rounded-3xl shadow-2xl p-10 mb-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-5 bg-white/20 backdrop-blur-sm rounded-3xl animate-pulse">
                <Megaphone className="w-16 h-16" />
              </div>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-wider">Khuyến mãi toàn sàn</h2>
                <p className="text-xl opacity-90 mt-2">Áp dụng giảm giá cho tất cả sản phẩm</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold uppercase opacity-80 mb-2">Tên chương trình</label>
                <input
                  type="text"
                  placeholder="VD: TẾT SALE 50%"
                  className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-md text-white placeholder-white/60 font-bold text-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.promoName}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, promoName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase opacity-80 mb-2">% Giảm giá</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="30"
                  className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-4xl text-center focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.discountPercent}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, discountPercent: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase opacity-80 mb-2">Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold focus:outline-none focus:ring-4 focus:ring-white/30"
                  value={globalPromo.endDate}
                  onChange={(e) => setGlobalPromo({ ...globalPromo, endDate: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveGlobalPromo}
                  disabled={loading}
                  className="w-full py-6 bg-yellow-400 hover:bg-yellow-300 text-red-700 font-black text-2xl uppercase tracking-wider rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  {loading ? 'ĐANG ÁP DỤNG...' : 'KÍCH HOẠT NGAY'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                  <Archive className="w-10 h-10 text-emerald-600" />
                  Kho hàng ({products.length})
                </h2>
                <Link
                  href="/admin/products/create"
                  className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Thêm sản phẩm
                </Link>
              </div>

              <div className="space-y-5">
                {products.map((p) => {
                  const isSale = p.salePrice && p.salePrice < p.price;
                  return (
                    <div
                      key={p.id}
                      className="group bg-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-4xl">
                              ⚽
                            </div>
                          )}
                          {isSale && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg animate-pulse">
                              SALE {p.discount}%
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-black text-gray-900 truncate mb-2">{p.name}</h3>
                          {p.promoName && (
                            <p className="text-sm text-orange-600 font-bold uppercase mb-2">{p.promoName}</p>
                          )}
                          <div className="flex items-end gap-4">
                            {isSale ? (
                              <>
                                <p className="text-4xl font-black text-red-600">{p.salePrice?.toLocaleString()}₫</p>
                                <p className="text-xl text-gray-400 line-through mb-1">{p.price.toLocaleString()}₫</p>
                              </>
                            ) : (
                              <p className="text-4xl font-black text-emerald-600">{p.price.toLocaleString()}₫</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(p)}
                            className="p-4 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl transition-all shadow-md hover:shadow-xl"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-4 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl transition-all shadow-md hover:shadow-xl"
                            title="Xóa"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar tác vụ */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sticky top-10">
              <h3 className="text-2xl font-black text-gray-900 mb-8 text-center uppercase tracking-wider">
                Tác vụ nhanh
              </h3>
              <div className="space-y-5">
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-3xl shadow-xl transition-all hover:scale-105 group"
                >
                  <span>Quản lý đơn hàng</span>
                  <Truck className="w-8 h-8 group-hover:translate-x-2 transition" />
                </Link>

                <Link
                  href="/admin/inventory-report"
                  className="flex items-center justify-between p-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl rounded-3xl shadow-xl transition-all hover:scale-105 group"
                >
                  <span>Báo cáo tồn kho</span>
                  <ClipboardCheck className="w-8 h-8 group-hover:scale-110 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modal chỉnh sửa nhanh */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Chỉnh sửa sản phẩm</h2>
                    <p className="text-blue-100 mt-2">ID: #{editingProduct.id}</p>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Tên sản phẩm</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-5 text-2xl font-bold rounded-2xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Giá gốc (VNĐ)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-6 py-5 text-3xl font-black text-emerald-600 rounded-2xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Danh mục ID</label>
                    <input
                      type="number"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-6 py-5 text-2xl font-bold rounded-2xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Mô tả sản phẩm</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-5 rounded-2xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 transition resize-none leading-relaxed"
                  />
                </div>

                {/* Cấu hình Size */}
                <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-200">
                  <h3 className="text-xl font-black text-indigo-800 mb-6 uppercase tracking-wider">Cấu hình size tự động</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-3">Loại size</label>
                      <select
                        value={formData.sizeType}
                        onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as SizeType })}
                        className="w-full px-6 py-5 rounded-2xl border border-indigo-300 bg-white text-lg font-medium focus:ring-4 focus:ring-indigo-500/30"
                      >
                        <option value={SizeType.NONE}>Không sử dụng</option>
                        <option value={SizeType.LETTER}>Ký tự (S, M, L, XL...)</option>
                        <option value={SizeType.NUMBER}>Số (38, 39, 40...)</option>
                      </select>
                    </div>

                    {formData.sizeType !== SizeType.NONE && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-3">Danh sách size</label>
                          <input
                            type="text"
                            placeholder="S, M, L, XL, XXL"
                            value={formData.sizeOptions}
                            onChange={(e) => setFormData({ ...formData, sizeOptions: e.target.value })}
                            className="w-full px-6 py-5 rounded-2xl border border-indigo-300 focus:ring-4 focus:ring-indigo-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-3">Ngưỡng tăng giá</label>
                          <input
                            type="text"
                            placeholder="XL hoặc 42"
                            value={formData.sizeIncreaseThreshold}
                            onChange={(e) => setFormData({ ...formData, sizeIncreaseThreshold: e.target.value })}
                            className="w-full px-6 py-5 rounded-2xl border border-indigo-300 focus:ring-4 focus:ring-indigo-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-3">% tăng giá</label>
                          <input
                            type="number"
                            placeholder="10"
                            value={formData.sizeIncreasePercentage}
                            onChange={(e) => setFormData({ ...formData, sizeIncreasePercentage: e.target.value })}
                            className="w-full px-6 py-5 rounded-2xl border border-indigo-300 focus:ring-4 focus:ring-indigo-500/30 text-2xl font-bold text-center"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Khuyến mãi riêng */}
                <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-200">
                  <h3 className="text-xl font-black text-orange-800 mb-6 uppercase tracking-wider">Khuyến mãi riêng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-3">% giảm giá</label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl border border-orange-300 focus:ring-4 focus:ring-orange-500/30 text-3xl font-black text-center text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-3">Tên chương trình</label>
                      <input
                        type="text"
                        placeholder="Flash Sale, Black Friday..."
                        value={formData.promoName}
                        onChange={(e) => setFormData({ ...formData, promoName: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl border border-orange-300 focus:ring-4 focus:ring-orange-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-3">Ngày bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={formData.promoStart}
                        onChange={(e) => setFormData({ ...formData, promoStart: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl border border-orange-300 focus:ring-4 focus:ring-orange-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-3">Ngày kết thúc</label>
                      <input
                        type="datetime-local"
                        value={formData.promoEnd}
                        onChange={(e) => setFormData({ ...formData, promoEnd: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl border border-orange-300 focus:ring-4 focus:ring-orange-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-xl uppercase rounded-2xl transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 text-white font-black text-xl uppercase rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {loading ? 'ĐANG LƯU...' : (
                      <>
                        <Save className="w-8 h-8" />
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