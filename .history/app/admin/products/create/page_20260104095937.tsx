'use client';

import { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '../../../utils/apiFetch';

export interface CreatedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
}

export interface ImageResult {
  url: string;
}

export enum SizeType {
  NONE = 'NONE',
  LETTER = 'LETTER',
  NUMBER = 'NUMBER',
}

interface ProductVariant {
  id?: number;
  sizeValue: string;
  color: string;
  stock: number | string;
  sku?: string;
}

interface Category {
  id: number;
  name: string;
}



const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Áo Câu Lạc Bộ" },
  { id: 2, name: "Áo Đội Tuyển Quốc Gia" },
  { id: 3, name: "Áo Training" },
  { id: 4, name: "Giày Đá Banh" },
  { id: 5, name: "Phụ Kiện" },
];

export default function CreateProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [sizeType, setSizeType] = useState<SizeType>(SizeType.NONE);
  const [sizeOptions, setSizeOptions] = useState<string>('');
  const [sizeIncreaseThreshold, setSizeIncreaseThreshold] = useState<string>('');
  const [sizeIncreasePercentage, setSizeIncreasePercentage] = useState<number | string>('');

  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter();

  // Kiểm tra quyền admin
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decodedToken: { role: string } = jwtDecode(token);
      if (decodedToken.role.toLowerCase() !== 'admin') {
        alert('Bạn không có quyền truy cập trang quản trị.');
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      localStorage.removeItem('access_token');
      router.push('/auth/login');
    }
  }, [router]);

  // Quản lý variants
  const handleAddVariant = useCallback(() => {
    setVariants(prev => [...prev, { sizeValue: '', color: '', stock: 0, sku: '' }]);
  }, []);

  const handleRemoveVariant = useCallback((index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleVariantChange = useCallback((
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants(prev => prev.map((variant, i) => {
      if (i === index) {
        return {
          ...variant,
          [field]: field === 'stock' ? (typeof value === 'string' ? parseInt(value) || 0 : value) : value,
        };
      }
      return variant;
    }));
  }, []);

  useEffect(() => {
    if (variants.length === 0) handleAddVariant();
  }, [variants.length, handleAddVariant]);

  // Upload ảnh
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const uploadedUrls: ImageResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const uploadData = await apiFetch<ImageResult>('/products/upload', {
          method: 'POST',
          body: formData,
          
        });

        uploadedUrls.push({ url: uploadData.url });
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      alert(`✅ Tải lên thành công ${uploadedUrls.length} ảnh!`);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const priceNum = parseFloat(price as string);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Giá phải là một số dương.");
      setIsLoading(false);
      return;
    }

    if (images.length === 0) {
      setError("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
      setIsLoading(false);
      return;
    }
    const processedVariants = variants.map(v => ({
    sizeValue: v.sizeValue.trim() || "Default", // Nếu trống thì để Default để tránh lỗi DB
    color: v.color.trim() || "Default",
    stock: Number(v.stock) || 0,
    sku: v.sku?.trim() || "",
  }));

    const productData = {
      name,
      description,
      price: priceNum,
      images: images.map(img => img.url),
      categoryId: categoryId || undefined,
      variants: processedVariants,
      sizeType,
      sizeOptions: sizeType !== SizeType.NONE ? sizeOptions : undefined,
      sizeIncreaseThreshold: sizeType !== SizeType.NONE && sizeIncreaseThreshold ? sizeIncreaseThreshold : undefined,
      sizeIncreasePercentage: sizeType !== SizeType.NONE && sizeIncreasePercentage ? parseFloat(sizeIncreasePercentage as string) : undefined,
    };

    try {
      await apiFetch<CreatedProduct>('/products', {
        method: 'POST',
        body: productData,
        
      });

      alert('🎉 Sản phẩm đã được tạo thành công!');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
              Tạo sản phẩm mới
            </h1>
            <Link
              href="/admin"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium shadow-md">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 1. Thông tin chung */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              Thông tin sản phẩm
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="Ví dụ: Áo đấu Manchester United 2025/26"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá gốc (VND) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="890000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                  placeholder="Mô tả chi tiết về chất liệu, thiết kế, công nghệ..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value) || '')}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload ảnh */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3">Hình ảnh sản phẩm *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-600 file:mr-5 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition disabled:opacity-50"
                />

                {isUploading && (
                  <p className="mt-4 text-emerald-600 font-bold animate-pulse">⏳ Đang tải lên ảnh...</p>
                )}

                <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-md border border-gray-200">
                      <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {images.length > 0 && (
                  <p className="mt-4 text-sm text-gray-500 font-medium">
                    Đã tải lên: <span className="text-emerald-600 font-bold">{images.length}</span> ảnh
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 2. Cấu hình Size tự động */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              Cấu hình Size & Quy tắc tăng giá
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Loại Size</label>
                <select
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value as SizeType)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white"
                >
                  <option value={SizeType.NONE}>Không sử dụng tự động</option>
                  <option value={SizeType.LETTER}>Ký tự (S, M, L, XL...)</option>
                  <option value={SizeType.NUMBER}>Số (38, 39, 40...)</option>
                </select>
              </div>

              {sizeType !== SizeType.NONE && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Danh sách Size (cách nhau bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={sizeOptions}
                      onChange={(e) => setSizeOptions(e.target.value)}
                      placeholder="Ví dụ: S, M, L, XL, XXL"
                      className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngưỡng tăng giá (Size bắt đầu tăng)</label>
                    <input
                      type="text"
                      value={sizeIncreaseThreshold}
                      onChange={(e) => setSizeIncreaseThreshold(e.target.value)}
                      placeholder="Ví dụ: XL hoặc 42"
                      className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phần trăm tăng giá (%)</label>
                    <input
                      type="number"
                      value={sizeIncreasePercentage}
                      onChange={(e) => setSizeIncreasePercentage(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="10"
                      className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 3. Biến thể sản phẩm */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Biến thể sản phẩm (Variants)</h2>
              <button
                type="button"
                onClick={handleAddVariant}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md"
              >
                + Thêm biến thể
              </button>
            </div>

            <div className="space-y-5">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Size</label>
                    <input
                      type="text"
                      value={variant.sizeValue}
                      onChange={(e) => handleVariantChange(index, 'sizeValue', e.target.value)}
                      placeholder="S, M, L..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Màu sắc</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      placeholder="Đỏ, Xanh..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho *</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      required
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">SKU (tùy chọn)</label>
                      <input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="ABC123"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length === 1}
                      className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isUploading || images.length === 0}
              className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-xl uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {isLoading ? 'Đang tạo sản phẩm...' : 'Tạo sản phẩm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}