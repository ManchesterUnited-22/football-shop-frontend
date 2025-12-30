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
    X
} from 'lucide-react'; // Cài đặt: npm install lucide-react

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
    const [sizeOptions, setSizeOptions] = useState<string>('');
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
            setDescription(data.description);
            setPrice(data.price);
            setImages(data.images);
            setCategoryId(data.categoryId || '');
            setVariants(data.variants.map(v => ({ ...v, stock: String(v.stock) } as ProductVariant))); 
            setSizeType(data.sizeType || SizeType.NONE);
            setSizeOptions(data.sizeOptions || '');
            setSizeIncreaseThreshold(data.sizeIncreaseThreshold || '');
            setSizeIncreasePercentage(data.sizeIncreasePercentage !== null ? data.sizeIncreasePercentage : '');
        } catch (err: any) {
            setError(`Lỗi tải dữ liệu sản phẩm: ${err.message}`);
        } finally {
            setIsFetching(false);
        }
    }, [productId]);

    useEffect(() => { fetchProductData(); }, [fetchProductData]);

    const handleAddVariant = useCallback(() => {
        setVariants(prev => [...prev, { sizeValue: '', color: '', stock: 0, sku: '' }]);
    }, []);

    const handleRemoveVariant = useCallback((index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleVariantChange = useCallback((index: number, field: keyof ProductVariant, value: string | number) => {
        setVariants(prev => prev.map((variant, i) => i === index ? { ...variant, [field]: field === 'stock' ? (parseInt(value as string) || 0) : value } : variant));
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
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            let uploadedUrls = [...images];
            if (file) {
                const url = await uploadImageToCloudinary(file);
                uploadedUrls.push(url);
            }
            const productData = {
                name, description, price: parseFloat(price as string),
                images: uploadedUrls,
                categoryId: categoryId || undefined,
                variants: variants.filter(v => v.sizeValue).map(v => ({ ...v, stock: Number(v.stock), ...(v.id && { id: v.id }) })),
                sizeType,
                sizeOptions: sizeType !== SizeType.NONE ? sizeOptions : null,
                sizeIncreaseThreshold: sizeType !== SizeType.NONE && sizeIncreaseThreshold ? sizeIncreaseThreshold : null,
                sizeIncreasePercentage: sizeType !== SizeType.NONE && sizeIncreasePercentage ? parseFloat(sizeIncreasePercentage as string) : null,
            };
            await apiFetch<Product>(`/products/${productId}`, { method: 'PATCH', body: productData });
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu sản phẩm...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* STICKY HEADER */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                                {originalProduct?.name}
                            </h1>
                            <p className="text-xs text-slate-500 font-mono">ID: #{productId}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md shadow-indigo-200"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* CARD: THÔNG TIN CƠ BẢN */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Package className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h2>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên sản phẩm</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        placeholder="Ví dụ: Áo đấu Real Madrid 2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả chi tiết</label>
                                    <textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        rows={5}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm leading-relaxed"
                                        placeholder="Chất liệu, công nghệ, hướng dẫn chọn size..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* CARD: BIẾN THỂ (VARIANTS) */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Layers className="w-5 h-5" /></div>
                                    <h2 className="text-lg font-bold text-slate-800">Kho hàng & Biến thể</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddVariant}
                                    className="text-sm flex items-center gap-1.5 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-bold transition"
                                >
                                    <Plus className="w-4 h-4" /> Thêm biến thể
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                                            <th className="pb-3 pl-2">Size</th>
                                            <th className="pb-3">Màu sắc</th>
                                            <th className="pb-3">Tồn kho</th>
                                            <th className="pb-3">SKU</th>
                                            <th className="pb-3 text-right pr-2">Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {variants.map((variant, index) => (
                                            <tr key={variant.id || index} className="group hover:bg-slate-50 transition">
                                                <td className="py-3 pl-2">
                                                    <input 
                                                        type="text" value={variant.sizeValue} 
                                                        onChange={(e) => handleVariantChange(index, 'sizeValue', e.target.value)}
                                                        className="w-16 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 p-1 font-medium text-slate-800"
                                                    />
                                                </td>
                                                <td className="py-3">
                                                    <input 
                                                        type="text" value={variant.color} 
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        className="w-24 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 p-1 text-sm"
                                                    />
                                                </td>
                                                <td className="py-3">
                                                    <input 
                                                        type="number" value={variant.stock} 
                                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                        className="w-20 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 p-1 text-sm font-mono"
                                                    />
                                                </td>
                                                <td className="py-3">
                                                    <input 
                                                        type="text" value={variant.sku || ''} 
                                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                        placeholder="Mã SKU"
                                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 p-1 text-xs text-slate-500 font-mono"
                                                    />
                                                </td>
                                                <td className="py-3 text-right pr-2">
                                                    <button 
                                                        type="button" onClick={() => handleRemoveVariant(index)}
                                                        className="text-slate-300 hover:text-red-500 transition p-1.5"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {variants.length === 0 && (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-2">
                                        <p className="text-slate-400 text-sm italic">Chưa có biến thể nào được tạo.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* CỘT PHẢI: PHÂN LOẠI, GIÁ, ẢNH */}
                    <div className="space-y-8">
                        {/* CARD: GIÁ & DANH MỤC */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Tag className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-slate-800">Giá & Phân loại</h2>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá bán lẻ (VND)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" value={price} 
                                            onChange={e => setPrice(e.target.value)} 
                                            className="w-full pl-12 bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₫</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Danh mục</label>
                                    <select 
                                        value={categoryId} 
                                        onChange={e => setCategoryId(parseInt(e.target.value) || '')}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 appearance-none transition"
                                    >
                                        <option value="">Chưa phân loại</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* CARD: HÌNH ẢNH */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><ImageIcon className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-slate-800">Hình ảnh</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {images.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group">
                                        <img src={url} alt="product" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setImages(prev => prev.filter(u => u !== url))}
                                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition group">
                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition mb-2" />
                                <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition">Thêm ảnh mới</span>
                                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" />
                            </label>
                            {file && <p className="mt-2 text-[11px] text-green-600 font-medium italic animate-pulse text-center">Đang chờ: {file.name}</p>}
                        </section>

                        {/* CARD: CẤU HÌNH SIZE */}
                        <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 border border-slate-800 shadow-indigo-100">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Ruler className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold">Quy tắc Size & Giá</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Loại kích thước</label>
                                    <select 
                                        value={sizeType} onChange={e => setSizeType(e.target.value as SizeType)}
                                        className="w-full bg-slate-800 border-slate-700 rounded-xl p-2.5 text-sm text-white focus:ring-indigo-500"
                                    >
                                        <option value={SizeType.NONE}>Không áp dụng</option>
                                        <option value={SizeType.LETTER}>Dạng chữ (S, M, L...)</option>
                                        <option value={SizeType.NUMBER}>Dạng số (38, 39, 40...)</option>
                                    </select>
                                </div>
                                {sizeType !== SizeType.NONE && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Ngưỡng tăng giá từ</label>
                                            <input 
                                                type="text" value={sizeIncreaseThreshold} onChange={e => setSizeIncreaseThreshold(e.target.value)}
                                                className="w-full bg-slate-800 border-slate-700 rounded-xl p-2.5 text-sm" placeholder="Ví dụ: XXL hoặc 44"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tăng thêm (%)</label>
                                            <input 
                                                type="number" value={sizeIncreasePercentage} onChange={e => setSizeIncreasePercentage(e.target.value)}
                                                className="w-full bg-slate-800 border-slate-700 rounded-xl p-2.5 text-sm font-bold text-indigo-400" placeholder="%"
                                            />
                                        </div>
                                        <div className="flex items-start gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                                            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                Khi khách hàng chọn size từ ngưỡng này trở đi, giá sản phẩm sẽ tự động tăng theo % cấu hình.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}