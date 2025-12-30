'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// === Import hàm gọi API đã đồng bộ hóa ===
// Đảm bảo đường dẫn này khớp với vị trí file apiFetch.ts của bạn
import { apiFetch } from '../../../../utils/apiFetch'; 

// === ENUM CHO SIZE TYPE ===
export enum SizeType {
    NONE = 'NONE',
    LETTER = 'LETTER',
    NUMBER = 'NUMBER',
}

// Kiểu dữ liệu cho Variant
interface ProductVariant {
    id?: number; // Cần thiết cho việc PATCH/UPDATE
    sizeValue: string; 
    color: string;
    stock: number | string; // Giữ lại string/number để dễ xử lý input
    sku?: string;
}

// Kiểu dữ liệu cho Product
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

// Kiểu dữ liệu cho Category (Mock)
interface Category {
    id: number;
    name: string;
}

const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: 'Áo đấu' },
    { id: 2, name: 'Giày đá banh' },
    { id: 3, name: 'Phụ kiện' },
    { id: 4, name: 'Trang phục tập luyện' },
];


export default function EditProductPage() {
    const params = useParams();
    const productId = Array.isArray(params.id)
        ? parseInt(params.id[0])
        : parseInt(params.id as string);

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

    // =================================
    // 1. Logic Fetching Dữ liệu cũ (SỬ DỤNG apiFetch)
    // =================================
    const fetchProductData = useCallback(async () => {
        if (isNaN(productId)) {
            setError('ID sản phẩm không hợp lệ.');
            setIsFetching(false);
            return;
        }
        
        const urlToFetch = `/products/${productId}`; // URL chỉ cần là đường dẫn API của Backend
        console.log('🔗 CUỘC GỌI GET (apiFetch): Đang gọi URL: ', urlToFetch); 

        try {
            // GỌI API FETCH VỚI OPTIONS ĐÃ ĐƯỢC BỔ SUNG
            const data: Product = await apiFetch<Product>(urlToFetch, { 
                method: 'GET',
                // apiFetch tự động thêm headers Authorization và x-api-key
            }); 
            
            // Cập nhật state
            setOriginalProduct(data);
            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
            setImages(data.images);
            setCategoryId(data.categoryId || '');
            
            // Đảm bảo stock là string cho input
            setVariants(data.variants.map(v => ({
                ...v,
                stock: String(v.stock), 
            } as ProductVariant))); 
            
            setSizeType(data.sizeType || SizeType.NONE);
            setSizeOptions(data.sizeOptions || '');
            setSizeIncreaseThreshold(data.sizeIncreaseThreshold || '');
            setSizeIncreasePercentage(data.sizeIncreasePercentage !== null ? data.sizeIncreasePercentage : '');

        } catch (err: any) {
            // apiFetch đã format lỗi, chỉ cần hiển thị
            setError(`Lỗi tải dữ liệu sản phẩm: ${err.message}`);
        } finally {
            setIsFetching(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);


    // =================================
    // 2. Logic Quản lý Variants (Giữ nguyên)
    // =================================
    const handleAddVariant = useCallback(() => {
        setVariants(prev => [
            ...prev,
            { sizeValue: '', color: '', stock: 0, sku: '' }
        ]);
    }, []);

    const handleRemoveVariant = useCallback((index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleVariantChange = useCallback((index: number, field: keyof ProductVariant, value: string | number) => {
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
    
    // =================================
    // 3. Logic Upload Ảnh (Giữ nguyên)
    // =================================
    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Lấy chữ ký từ API Route nội bộ (không cần apiFetch vì không cần token)
        const sigRes = await fetch(`/api/products/cloudinary-signature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp }),
        });
        
        if (!sigRes.ok) {
             const errorText = await sigRes.text(); 
             throw new Error(`Không thể lấy chữ ký Cloudinary từ Backend. Status: ${sigRes.status}. Phản hồi: ${errorText.substring(0, 100)}...`);
        }

        const { signature, apiKey: cloudApiKey, cloudName } = await sigRes.json();
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', cloudApiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
    
        // GỌI API CLOUDINARY BÊN NGOÀI
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });
    
        if (!res.ok) {
             const errorData = await res.json();
             throw new Error(errorData.error.message || '❌ Upload ảnh thất bại');
        }
        const data = await res.json();
        return data.secure_url;
    };
    
    // =================================
    // 4. Logic Submit Form (Cập nhật - PATCH) (SỬ DỤNG apiFetch)
    // =================================
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

        try {
            let uploadedUrls = [...images];

            // 1. UPLOAD ẢNH MỚI (nếu có)
            if (file) {
                const url = await uploadImageToCloudinary(file);
                uploadedUrls.push(url);
            }

            // 2. CHUẨN BỊ DỮ LIỆU CẬP NHẬT
            const productData = {
                name,
                description,
                price: priceNum,
                images: uploadedUrls,
                categoryId: categoryId || undefined,
                
                // Variants
                variants: variants.filter(v => v.sizeValue && Number(v.stock) >= 0).map(v => ({
                    sizeValue: v.sizeValue,
                    color: v.color,
                    stock: Number(v.stock),
                    sku: v.sku,
                    ...(v.id && { id: v.id }), // Giữ lại ID nếu là variant cũ để backend update
                })),
                
                // CẤU HÌNH SIZE
                sizeType,
                sizeOptions: sizeType !== SizeType.NONE ? sizeOptions : null,
                sizeIncreaseThreshold: sizeType !== SizeType.NONE && sizeIncreaseThreshold ? sizeIncreaseThreshold : null,
                sizeIncreasePercentage: sizeType !== SizeType.NONE && sizeIncreasePercentage ? parseFloat(sizeIncreasePercentage as string) : null,
            };

            // 3. GỌI API PATCH (SỬ DỤNG apiFetch)
            const data = await apiFetch<Product>(`/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify(productData),
                // apiFetch tự động thêm Content-Type, Authorization, x-api-key
            });

            console.log(`✅ Sản phẩm "${data.name}" đã được cập nhật thành công!`);
            router.push('/admin');

        } catch (err: any) {
            // apiFetch đã format lỗi, chỉ cần hiển thị
            setError(err.message || 'Đã xảy ra lỗi khi cập nhật API.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Hàm xóa ảnh khỏi danh sách
    const handleRemoveImage = (urlToRemove: string) => {
        setImages(prev => prev.filter(url => url !== urlToRemove));
    };

    // =================================
    // 5. UI render (Giữ nguyên)
    // =================================
    if (isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[500px] text-lg text-blue-600">
                Đang tải dữ liệu sản phẩm ID: {productId}...
            </div>
        );
    }
    
    if (error && !originalProduct) {
        return (
            <div className="max-w-4xl mx-auto p-6 my-8 bg-red-100 border border-red-400 rounded-lg text-red-700">
                <h1 className="text-2xl font-bold mb-4">Lỗi tải dữ liệu</h1>
                <p>{error}</p>
                <Link href="/admin" className="mt-4 inline-block text-blue-500 hover:text-blue-700">
                    &larr; Quay lại trang quản trị
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white min-h-[calc(100vh-80px)] shadow-lg rounded-lg my-8">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-blue-700">
                    📝 Chỉnh sửa Sản phẩm: {originalProduct?.name} (ID: {productId})
                </h1>
                <Link href="/admin" className="text-sm text-blue-500 hover:text-blue-700 transition">
                    &larr; Quay lại trang quản trị
                </Link>
            </header>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Lỗi: {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* PHẦN 1: THÔNG TIN CƠ BẢN VÀ ẢNH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                    <h2 className="md:col-span-2 text-xl font-semibold text-gray-700 mb-2 border-b pb-2">Thông tin chung & Ảnh</h2>
                    
                    {/* Input Tên, Giá, Mô tả, Danh mục */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Sản phẩm</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="1000" className="w-full border-gray-300 rounded-md p-2" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select value={categoryId} onChange={e => setCategoryId(parseInt(e.target.value) || '')} className="w-full border-gray-300 rounded-md p-2 bg-white">
                            <option value="">-- Chọn Danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quản lý ảnh hiện tại và upload ảnh mới */}
                    <div className="md:col-span-2 space-y-4">
                         <h3 className='text-md font-semibold text-gray-600'>Ảnh hiện tại: ({images.length})</h3>
                         <div className="mt-2 flex flex-wrap gap-2">
                            {images.map((url, index) => (
                                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveImage(url)}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg p-1 opacity-0 group-hover:opacity-100 transition text-xs"
                                        title="Xóa ảnh này"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <hr/>
                        
                        <label className="block text-sm font-medium text-gray-700">Tải lên Ảnh MỚI (sẽ được thêm vào danh sách trên)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                            className="w-full border-gray-300 rounded-md p-2 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                         {file && <p className='text-sm text-green-600'>File đã chọn: **{file.name}**. Sẽ được upload khi Cập nhật.</p>}
                    </div>
                </div>

                {/* PHẦN 2: CẤU HÌNH SIZE & GIÁ */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        📏 Cấu hình Size & Quy tắc Tăng Giá
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại Size</label>
                        <select
                            name="sizeType"
                            value={sizeType}
                            onChange={(e) => setSizeType(e.target.value as SizeType)}
                            className="w-full border-gray-300 rounded-md p-2 bg-white"
                        >
                            <option value={SizeType.NONE}>NONE</option>
                            <option value={SizeType.LETTER}>LETTER (S, M, L)</option>
                            <option value={SizeType.NUMBER}>NUMBER (38, 39, 40)</option>
                        </select>
                    </div>

                    {sizeType !== SizeType.NONE && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Size Options (Phân cách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    value={sizeOptions}
                                    onChange={(e) => setSizeOptions(e.target.value)}
                                    placeholder="Ví dụ: S, M, L, XL"
                                    className="w-full border-gray-300 rounded-md p-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngưỡng Tăng Giá</label>
                                    <input
                                        type="text"
                                        value={sizeIncreaseThreshold}
                                        onChange={(e) => setSizeIncreaseThreshold(e.target.value)}
                                        placeholder="Ví dụ: L hoặc 42"
                                        className="w-full border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phần Trăm Tăng Giá (%)</label>
                                    <input
                                        type="number"
                                        value={sizeIncreasePercentage}
                                        onChange={(e) => setSizeIncreasePercentage(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Ví dụ: 10"
                                        className="w-full border-gray-300 rounded-md p-2"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* PHẦN 3: QUẢN LÝ VARIANTS */}
                <div className="p-4 border rounded-lg bg-white shadow-inner">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex justify-between items-center">
                        Biến thể Sản phẩm (Variants)
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition"
                        >
                            + Thêm Variant
                        </button>
                    </h2>
                    
                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={variant.id || index} className="flex flex-wrap items-center gap-3 p-3 border border-dashed rounded-md bg-blue-50">
                                
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-700">Size</label>
                                    <input 
                                        type="text" 
                                        value={variant.sizeValue} 
                                        onChange={(e) => handleVariantChange(index, 'sizeValue', e.target.value)} 
                                        required 
                                        placeholder="Ví dụ: S" 
                                        className="w-full border-gray-300 rounded-md p-1.5 text-sm" 
                                    />
                                </div>

                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-700">Màu sắc</label>
                                    <input 
                                        type="text" 
                                        value={variant.color} 
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)} 
                                        placeholder="Ví dụ: Đỏ" 
                                        className="w-full border-gray-300 rounded-md p-1.5 text-sm" 
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-[100px]">
                                    <label className="block text-xs font-medium text-gray-700">Tồn kho</label>
                                    <input 
                                        type="number" 
                                        value={variant.stock} 
                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} 
                                        required 
                                        min="0" 
                                        className="w-full border-gray-300 rounded-md p-1.5 text-sm" 
                                    />
                                </div>

                                <div className="flex-1 min-w-[100px]">
                                    <label className="block text-xs font-medium text-gray-700">SKU</label>
                                    <input 
                                        type="text" 
                                        value={variant.sku || ''} 
                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} 
                                        placeholder="Mã SKU" 
                                        className="w-full border-gray-300 rounded-md p-1.5 text-sm" 
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(index)}
                                    className="ml-auto p-2 text-red-500 hover:text-red-700 transition self-end disabled:text-gray-400"
                                    title="Xóa biến thể này"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nút submit */}
                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400 transition"
                    >
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật Sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}