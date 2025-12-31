'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Package, 
  Ruler, 
  Tag, 
  Info, 
  AlertCircle, 
  UploadCloud,
  X,
  Layers,
} from 'lucide-react';

import { apiFetch } from '../../../../utils/apiFetch';

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

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: number | null;
  variants: ProductVariant[];
  sizeType: SizeType;
  sizeOptions: string | null;
  sizeIncreaseThreshold: string | null;
  sizeIncreasePercentage: number | null;
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

export default function EditProductPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id as string);

  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [images, setImages] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);

  const [sizeType, setSizeType] = useState<SizeType>(SizeType.NONE);
  const [sizeIncreaseThreshold, setSizeIncreaseThreshold] = useState<string>('');
  const [sizeIncreasePercentage, setSizeIncreasePercentage] = useState<number | string>('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const fetchProductData = useCallback(async () => {
    if (isNaN(productId)) {
      setError('ID sản phẩm không hợp lệ.');
      setIsFetching(false);
      return;
    }
    try {
      const data: Product = await apiFetch<Product>(`/products/id/${productId}`, { method: 'GET' });
      setOriginalProduct(data);
      setName(data.name);
      setDescription(data.description || '');
      setPrice(data.price);
      setImages(data.images || []);
      setCategoryId(data.categoryId || '');
      setVariants(data.variants.map(v => ({ ...v, stock: String(v.stock) })));
      setSizeType(data.sizeType || SizeType.NONE);
      setSizeIncreaseThreshold(data.sizeIncreaseThreshold || '');
      setSizeIncreasePercentage(data.sizeIncreasePercentage ?? '');
    } catch (err: any) {
      setError(`Không thể tải sản phẩm: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

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
          [field]: field === 'stock' ? (parseInt(value as string) || 0) : value,
        };
      }
      return variant;
    }));
  }, []);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sigRes = await fetch(`/api/products/cloudinary-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp }),
    });
    const { signature, apiKey, cloudName } = await sigRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let updatedImages = [...images];
      if (file) {
        const newUrl = await uploadImageToCloudinary(file);
        updatedImages.push(newUrl);
      }

      const productData = {
        name,
        description,
        price: parseFloat(price as string),
        images: updatedImages,
        categoryId: categoryId || null,
        variants: variants
          .filter(v => v.sizeValue.trim())
          .map(v => ({
            ...(v.id && { id: v.id }),
            sizeValue: v.sizeValue,
            color: v.color,
            stock: Number(v.stock),
            sku: v.sku || undefined,
          })),
        sizeType,
        sizeIncreaseThreshold: sizeType !== SizeType.NONE && sizeIncreaseThreshold ? sizeIncreaseThreshold : null,
        sizeIncreasePercentage: sizeType !== SizeType.NONE && sizeIncreasePercentage ? parseFloat(sizeIncreasePercentage as string) : null,
      };

      await apiFetch(`/products/${productId}`, {
        method: 'PATCH',
        body: productData,
      });

      alert('✅ Sản phẩm đã được cập nhật thành công!');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href="/admin"
              className="p-3 rounded-xl hover:bg-gray-100 transition group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Chỉnh sửa: {originalProduct?.name || 'Sản phẩm'}
              </h1>
              <p className="text-sm text-gray-500 font-mono">ID: #{productId}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            <span className="text-lg">{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-md">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cột chính: Thông tin & Biến thể */}
          <div className="lg:col-span-2 space-y-10">
            {/* Thông tin cơ bản */}
            <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-100 rounded-2xl">
                  <Package className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Thông tin sản phẩm</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-lg font-medium"
                    placeholder="Áo đấu Manchester United 2025/26"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Giá bán (VND)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-2xl font-black text-emerald-600"
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₫</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Mô tả sản phẩm</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none leading-relaxed"
                    placeholder="Mô tả chất liệu, công nghệ, thiết kế đặc biệt..."
                  />
                </div>
              </div>
            </section>

            {/* Biến thể */}
            <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-100 rounded-2xl">
                    <Layers className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Biến thể & Kho hàng</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-md"
                >
                  <Plus className="w-6 h-6" />
                  Thêm biến thể
                </button>
              </div>

              <div className="space-y-5">
                {variants.map((variant, index) => (
                  <div key={variant.id || index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Size</label>
                      <input
                        type="text"
                        value={variant.sizeValue}
                        onChange={(e) => handleVariantChange(index, 'sizeValue', e.target.value)}
                        placeholder="M, L, XL..."
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Màu sắc</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        placeholder="Trắng, Đen..."
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        min="0"
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">SKU (tùy chọn)</label>
                        <input
                          type="text"
                          value={variant.sku || ''}
                          onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                          placeholder="MU2025-H"
                          className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-sm font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        disabled={variants.length === 1}
                        className="p-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: Ảnh, Phân loại, Cấu hình Size */}
          <div className="space-y-10">
            {/* Danh mục */}
            <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Tag className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Phân loại</h2>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value) || '')}
                className="w-full px-6 py-5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-lg font-medium bg-gray-50"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </section>

            {/* Hình ảnh */}
            <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <ImageIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Hình ảnh sản phẩm</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group">
                    <img src={url} alt="product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 bg-white/90 text-red-600 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center p-10 border-4 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition group">
                  <UploadCloud className="w-16 h-16 text-gray-400 group-hover:text-emerald-600 transition mb-4" />
                  <p className="text-lg font-bold text-gray-600 group-hover:text-emerald-600 transition">
                    Thêm ảnh mới
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Click để chọn file</p>
                </div>
              </label>

              {file && (
                <p className="mt-6 text-center text-emerald-600 font-bold animate-pulse">
                  ✅ Đang chờ upload: {file.name}
                </p>
              )}
            </section>

            {/* Cấu hình Size - Card nổi bật */}
            <section className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl shadow-2xl p-8 border border-emerald-800">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-500/30 rounded-2xl">
                  <Ruler className="w-8 h-8 text-emerald-300" />
                </div>
                <h2 className="text-2xl font-black text-white">Quy tắc Size & Tăng giá tự động</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wider">
                    Loại size áp dụng
                  </label>
                  <select
                    value={sizeType}
                    onChange={(e) => setSizeType(e.target.value as SizeType)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition text-lg"
                  >
                    <option value={SizeType.NONE}>Không áp dụng</option>
                    <option value={SizeType.LETTER}>Ký tự (S, M, L, XL...)</option>
                    <option value={SizeType.NUMBER}>Số (38, 39, 40, 41...)</option>
                  </select>
                </div>

                {sizeType !== SizeType.NONE && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wider">
                        Ngưỡng bắt đầu tăng giá
                      </label>
                      <input
                        type="text"
                        value={sizeIncreaseThreshold}
                        onChange={(e) => setSizeIncreaseThreshold(e.target.value)}
                        placeholder="Ví dụ: XL hoặc 43"
                        className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wider">
                        Tăng thêm bao nhiêu (%)
                      </label>
                      <input
                        type="number"
                        value={sizeIncreasePercentage}
                        onChange={(e) => setSizeIncreasePercentage(e.target.value)}
                        placeholder="10"
                        className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition font-bold text-2xl text-emerald-300"
                      />
                    </div>

                    <div className="flex items-start gap-4 bg-white/10 p-5 rounded-2xl border border-emerald-500/30">
                      <Info className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-emerald-200 leading-relaxed">
                        Khi khách chọn size từ ngưỡng này trở lên, giá sẽ <strong>tự động tăng theo %</strong> bạn cài đặt. Rất hữu ích cho giày/áo size lớn.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}