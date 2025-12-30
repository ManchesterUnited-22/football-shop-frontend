'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Archive, Edit, Trash2, Plus, Truck } from 'lucide-react';
// Đã sửa đường dẫn tương đối (tùy dự án của bạn có thể cần điều chỉnh lại)
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

}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sizeType: SizeType.NONE,
    sizeOptions: '',
    sizeIncreaseThreshold: '',
    sizeIncreasePercentage: '',
    // === SALE ===
    promoName: '',
    promoStart: '',
    promoEnd: '',
    salePrice: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiFetch<Product[]>('/products', { method: 'GET' });
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa không? Hành động này không thể hoàn tác. 🗑️')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      alert('Đã xóa thành công!');
      fetchProducts();
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm! Vui lòng kiểm tra console.');
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
     
    
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
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
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        // Size fields
        sizeType: formData.sizeType,
        sizeOptions: formData.sizeType !== SizeType.NONE && formData.sizeOptions.trim() ? formData.sizeOptions.trim() : null,
        sizeIncreaseThreshold:
          formData.sizeType !== SizeType.NONE && formData.sizeIncreaseThreshold.trim()
            ? formData.sizeIncreaseThreshold.trim()
            : null,
        sizeIncreasePercentage:
          formData.sizeType !== SizeType.NONE && formData.sizeIncreasePercentage
            ? parseFloat(formData.sizeIncreasePercentage)
            : null,
        // === SALE ===
        promoName: formData.promoName.trim() || null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        promoStart: formData.promoStart ? new Date(formData.promoStart).toISOString() : null,
        promoEnd: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : null,
      };

      await apiFetch(`/products/${editingProduct.id}`, {
        method: 'PATCH',
        body: updateData,
      });

      alert(`Cập nhật sản phẩm "${formData.name}" thành công!`);
      cancelEdit();
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Lỗi cập nhật:', error);
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-800 border-b pb-2">
          QUẢN LÝ KHO SẢN PHẨM 🛠️
        </h1>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col w-full md:w-1/2 order-1">
            <h2 className="text-xl font-bold mb-4">📦 Danh sách Sản phẩm ({products.length})</h2>
            <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
              {products.length === 0 ? (
                <p className="text-center text-gray-500 pt-10">Không tìm thấy sản phẩm nào trong kho.</p>
              ) : (
                products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-grow min-w-0">
                      {p.images?.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-base text-gray-800 break-words">{p.name}</p>
                        <p className="text-red-600 text-sm font-semibold">
                          {Number(p.price).toLocaleString()} đ
                        </p>
                        {p.salePrice && (
                          <p className="text-sm text-green-600">
                            Sale: {Number(p.salePrice).toLocaleString()} đ
                          </p>
                        )}
                        {p.sizeType !== SizeType.NONE && (
                          <p className="text-xs text-gray-500 mt-1">
                            Size: {p.sizeType} | Ngưỡng: {p.sizeIncreaseThreshold || 'N/A'} (
                            {p.sizeIncreasePercentage || 0}%)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 ml-4">
                      <button
                        title="Sửa nhanh"
                        onClick={() => startEdit(p)}
                        className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-transform hover:scale-110"
                      >
                        <Edit size={20} />
                      </button>
                      <Link
                        href={`/admin/products/edit/${p.id}`}
                        title="Chỉnh sửa chi tiết"
                        className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 transition-transform hover:scale-110"
                      >
                        <Archive size={20} />
                      </Link>
                      <button
                        title="Xóa"
                        onClick={() => handleDelete(p.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-transform hover:scale-110"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FORM CHỈNH SỬA + TÁC VỤ */}
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4 h-fit w-full md:w-1/2 order-2">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? `📝 Chỉnh sửa Nhanh: ${editingProduct.name}` : '💡 Tác vụ Sản phẩm'}
            </h2>

            {editingProduct ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <p className="text-sm text-blue-500 font-medium border-b pb-2">
                  Sửa nhanh thông tin cơ bản, size & khuyến mãi
                </p>

                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      className="w-full p-3 border rounded"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <hr className="my-5" />

                {/* CẤU HÌNH SIZE */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại Size</label>
                    <select
                      value={formData.sizeType}
                      onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as SizeType })}
                      className="w-full p-3 border rounded bg-white"
                    >
                      <option value={SizeType.NONE}>Không dùng size</option>
                      <option value={SizeType.LETTER}>LETTER (S/M/L...)</option>
                      <option value={SizeType.NUMBER}>NUMBER (38/39/40...)</option>
                    </select>
                  </div>

                  {formData.sizeType !== SizeType.NONE && (
                    <div className="space-y-4 pt-2 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tùy chọn Size (phân cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: S, M, L, XL"
                          className="w-full p-3 border rounded"
                          value={formData.sizeOptions}
                          onChange={(e) => setFormData({ ...formData, sizeOptions: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngưỡng tăng giá</label>
                          <input
                            type="text"
                            placeholder="VD: L hoặc 42"
                            className="w-full p-3 border rounded"
                            value={formData.sizeIncreaseThreshold}
                            onChange={(e) =>
                              setFormData({ ...formData, sizeIncreaseThreshold: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">% Tăng giá</label>
                          <input
                            type="number"
                            placeholder="VD: 10"
                            className="w-full p-3 border rounded"
                            value={formData.sizeIncreasePercentage}
                            onChange={(e) =>
                              setFormData({ ...formData, sizeIncreasePercentage: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-5" />

                {/* PHẦN KHUYẾN MÃI / SALE */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                  <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Khuyến mãi (Sale)</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình</label>
                    <input
                      type="text"
                      placeholder="VD: Black Friday, Summer Sale..."
                      className="w-full p-3 border rounded text-sm"
                      value={formData.promoName}
                      onChange={(e) => setFormData({ ...formData, promoName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá sale</label>
                    <input
                      type="number"
                      placeholder="Giá sau khi giảm"
                      className="w-full p-3 border rounded font-semibold text-red-700"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 border rounded text-sm"
                        value={formData.promoStart}
                        onChange={(e) => setFormData({ ...formData, promoStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 border rounded text-sm"
                        value={formData.promoEnd}
                        onChange={(e) => setFormData({ ...formData, promoEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* NÚT HÀNH ĐỘNG */}
                <div className="flex gap-3 pt-5 border-t mt-5">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 h-11 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 h-11 rounded-lg font-semibold text-white transition
                      ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {loading ? 'Đang lưu...' : 'LƯU CẬP NHẬT'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col space-y-4">
                <p className="text-gray-600">Chọn sản phẩm bên trái để chỉnh sửa nhanh</p>

                <Link
                  href="/admin/products/create"
                  className="flex items-center justify-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md"
                >
                  <Plus size={20} className="mr-2" /> Tạo sản phẩm mới
                </Link>

                <Link href="/admin/orders">
                  <button className="flex items-center justify-center h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md w-full">
                    <Truck size={20} className="mr-2" /> Xử lý đơn hàng
                  </button>
                </Link>

                <Link href="/admin/inventory-report" className="w-full">
                  <button className="h-12 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-lg transition shadow-sm w-full">
                    Xem báo cáo kho
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-gray-600 hover:text-black font-medium">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}