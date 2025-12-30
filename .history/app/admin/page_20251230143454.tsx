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

  // MỞ MODAL CHỈNH SỬA NHANH
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

  // CẬP NHẬT SẢN PHẨM QUA MODAL
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

      alert('Cập nhật sản phẩm thành công!');
      cancelEdit();
      fetchProducts();
    } catch (error) {
      alert('Lỗi cập nhật sản phẩm! Vui lòng kiểm tra lại.');
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
      await apiFetch('/products/global-promotion', {
        method: 'POST',
        body: {
          ...globalPromo,
          discountPercent: Number(globalPromo.discountPercent),
          startDate: globalPromo.startDate ? new Date(globalPromo.startDate).toISOString() : null,
          endDate: globalPromo.endDate ? new Date(globalPromo.endDate).toISOString() : null,
        },
      });
      alert('🔥 ĐÃ KÍCH HOẠT KHUYẾN MÃI TOÀN CỬA HÀNG!');
      fetchProducts();
    } catch (error) {
      alert('Lỗi khi áp dụng sale toàn sàn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-8 uppercase tracking-tighter">
          Hệ thống Quản trị Cửa hàng
        </h1>

        {/* SALE TOÀN SÀN */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <Megaphone size={150} />
          </div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="bg-white/20 p-3 rounded-full animate-pulse">
              <Megaphone size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Cấu hình Sale toàn hệ thống</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-black/10 p-6 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-red-100">Tên chương trình</label>
              <input
                type="text"
                placeholder="VD: XẢ KHO CUỐI NĂM"
                className="w-full p-3 rounded-xl bg-white text-gray-900 font-bold outline-none transition-all"
                value={globalPromo.promoName}
                onChange={(e) => setGlobalPromo({ ...globalPromo, promoName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-red-100">% Giảm</label>
              <input
                type="number"
                placeholder="VD: 20"
                className="w-full p-3 rounded-xl bg-white text-red-600 font-black text-xl outline-none transition-all"
                value={globalPromo.discountPercent}
                onChange={(e) => setGlobalPromo({ ...globalPromo, discountPercent: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-red-100">Ngày kết thúc</label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded-xl bg-white text-gray-900 font-medium outline-none transition-all"
                value={globalPromo.endDate}
                onChange={(e) => setGlobalPromo({ ...globalPromo, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveGlobalPromo}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                  ${loading ? 'bg-gray-400' : 'bg-yellow-400 hover:bg-white text-red-700 hover:text-red-600'}`}
              >
                <Save size={24} />
                {loading ? 'ĐANG LƯU...' : 'ÁP DỤNG NGAY'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="bg-white p-6 rounded-3xl shadow-xl flex-1 border border-gray-100 order-1">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-black text-gray-700 flex items-center gap-3">
                Kho hàng ({products.length})
              </h2>
            </div>

            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-3">
              {products.map((p) => {
                const isSale = p.salePrice && p.salePrice < p.price;
                return (
                  <div
                    key={p.id}
                    className="group flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-center gap-5 flex-grow min-w-0">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-xl border border-gray-100"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-300 uppercase font-bold">
                            No Image
                          </div>
                        )}
                        {isSale && (
                          <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-br-xl shadow-lg z-10 animate-pulse">
                            SALE
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-grow">
                        <p className="font-black text-gray-800 text-base truncate mb-1">{p.name}</p>
                        <div>
                          {isSale ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 font-black text-xl">{p.salePrice?.toLocaleString()}đ</span>
                                <span className="text-gray-400 line-through text-xs font-bold">{p.price.toLocaleString()}đ</span>
                              </div>
                              {p.promoName && (
                                <span className="inline-flex items-center text-[10px] text-orange-600 font-black uppercase mt-0.5">
                                  {p.promoName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-blue-900 font-black text-xl">{p.price.toLocaleString()}đ</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 ml-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2.5 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition-all"
                        title="Chỉnh sửa nhanh"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 hover:bg-red-600 hover:text-white text-red-500 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR TÁC VỤ */}
          <div className="w-full md:w-80 space-y-6 order-2">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-10">
              <h2 className="text-lg font-black text-gray-800 mb-6 text-center uppercase tracking-widest border-b pb-4">
                Tác vụ nhanh
              </h2>
              <div className="space-y-3">
                <Link
                  href="/admin/products/create"
                  className="flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all group"
                >
                  <span>Tạo sản phẩm</span>
                  <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all"
                >
                  <span>Đơn hàng</span>
                  <Truck size={22} />
                </Link>

                <Link
                  href="/admin/inventory-report"
                  className="flex items-center justify-between p-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all"
                >
                  <span>Báo cáo kho</span>
                  <ClipboardCheck size={22} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA NHANH */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Chỉnh sửa nhanh sản phẩm</h2>
                <p className="text-blue-200 text-xs">ID: {editingProduct.id} - {editingProduct.name}</p>
              </div>
              <button onClick={cancelEdit} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase text-gray-500">Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-500">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-blue-700 text-lg outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-500">Danh mục ID</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-500">Mô tả</label>
                <textarea
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* PHẦN SIZE */}
              <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-4">
                <h3 className="text-indigo-800 font-black text-sm uppercase">Cấu hình Size</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-700">Loại size</label>
                    <select
                      className="w-full p-3 rounded-lg border border-indigo-300 bg-white"
                      value={formData.sizeType}
                      onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as SizeType })}
                    >
                      <option value={SizeType.NONE}>Không có size</option>
                      <option value={SizeType.LETTER}>Chữ (S, M, L, XL...)</option>
                      <option value={SizeType.NUMBER}>Số (38, 39, 40...)</option>
                    </select>
                  </div>

                  {formData.sizeType !== SizeType.NONE && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-indigo-700">Danh sách size (cách nhau bởi dấu phẩy)</label>
                        <input
                          type="text"
                          placeholder="VD: S,M,L,XL,XXL"
                          className="w-full p-3 rounded-lg border border-indigo-300"
                          value={formData.sizeOptions}
                          onChange={(e) => setFormData({ ...formData, sizeOptions: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-indigo-700">Ngưỡng size tăng giá (VD: XL)</label>
                        <input
                          type="text"
                          placeholder="Size bắt đầu tăng giá"
                          className="w-full p-3 rounded-lg border border-indigo-300"
                          value={formData.sizeIncreaseThreshold}
                          onChange={(e) => setFormData({ ...formData, sizeIncreaseThreshold: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-indigo-700">% Tăng giá từ ngưỡng</label>
                        <input
                          type="number"
                          placeholder="VD: 10"
                          className="w-full p-3 rounded-lg border border-indigo-300"
                          value={formData.sizeIncreasePercentage}
                          onChange={(e) => setFormData({ ...formData, sizeIncreasePercentage: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* KHUYẾN MÃI RIÊNG */}
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl space-y-4">
                <h3 className="text-orange-700 font-black text-sm uppercase">Khuyến mãi riêng cho sản phẩm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-orange-600 uppercase">% Giảm giá</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded-lg border border-orange-200 outline-none font-bold"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-orange-600 uppercase">Tên chương trình</label>
                    <input
                      type="text"
                      placeholder="VD: Flash Sale"
                      className="w-full p-2 rounded-lg border border-orange-200 outline-none"
                      value={formData.promoName}
                      onChange={(e) => setFormData({ ...formData, promoName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-orange-600 uppercase">Ngày bắt đầu</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 rounded-lg border border-orange-200 outline-none text-xs"
                      value={formData.promoStart}
                      onChange={(e) => setFormData({ ...formData, promoStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-orange-600 uppercase">Ngày kết thúc</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 rounded-lg border border-orange-200 outline-none text-xs"
                      value={formData.promoEnd}
                      onChange={(e) => setFormData({ ...formData, promoEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang lưu...' : (
                    <>
                      <Save size={20} />
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
  );
} 