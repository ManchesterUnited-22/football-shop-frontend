'use client'; // Bắt buộc phải có vì sử dụng React Hooks

import { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

// Import hàm fetch đã sửa lỗi
import { apiFetch } from '../../../utils/apiFetch'; 

// =================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
// =================================
// Kiểu trả về cho sản phẩm sau khi tạo thành công (để fix lỗi 'unknown')
export interface CreatedProduct {
    id: number;
    name: string;
    slug: string; 
    price: number;
    // ... thêm các trường khác nếu cần
}

export interface ImageResult {
    url: string; // URL ảnh sau khi upload lên Cloudinary
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

// =================================
// 2. CẤU HÌNH VÀ DỮ LIỆU MOCK
// =================================
const API_BASE_URL = 'http://localhost:3001';
const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: "Áo đấu" },
    { id: 2, name: "Giày đá banh" },
    { id: 3, name: "Phụ kiện" },
];


export default function CreateProductPage() {
    // =================================
    // STATE DECLARATIONS
    // =================================
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [images, setImages] = useState<ImageResult[]>([]); 
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    
    // States cho Cấu hình Size/Giá
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


    // =================================
    // 3. EFFECT: AUTH & AUTHORIZATION
    // =================================
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        try {
            // Giải mã token để kiểm tra quyền
            const decodedToken: { role: string } = jwtDecode(token);
            const userRole = decodedToken.role.toLowerCase();

            if (userRole !== 'admin') {
                alert('Bạn không có quyền truy cập trang quản trị.');
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error("Lỗi giải mã token:", error);
            localStorage.removeItem('token');
            router.push('/auth/login');
        }
    }, [router]);


    // =================================
    // 4. HANDLERS
    // =================================

    // Xử lý thêm/xóa Variant (Sử dụng useCallback để tối ưu hiệu suất)
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

    // Đảm bảo luôn có ít nhất 1 variant để dễ nhập liệu
    useEffect(() => {
        if (variants.length === 0) {
            handleAddVariant();
        }
    }, [variants.length, handleAddVariant]);


    // Xử lý Upload Ảnh
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
                
                // Gọi API Upload
                const uploadData = await apiFetch<ImageResult>('/products/upload', {
                    method: 'POST',
                    body: formData, 
                    apiUrl: API_BASE_URL, 
                });

                uploadedUrls.push({ url: uploadData.url }); 
            }

            setImages(prev => [...prev, ...uploadedUrls]); 
            alert(`Tải lên thành công ${uploadedUrls.length} ảnh!`);
        
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tải ảnh lên.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input file để có thể chọn lại cùng file
        }
    };


    // Xử lý Submit Form
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

        // 1. Chuẩn bị dữ liệu để gửi
        const productData = {
            name,
            description,
            price: priceNum, 
            images: images.map(img => img.url), 
            categoryId: categoryId || undefined,
            variants: variants.filter(v => v.sizeValue && Number(v.stock) >= 0).map(v => ({
                sizeValue: v.sizeValue,
                color: v.color,
                stock: Number(v.stock),
                sku: v.sku,
            })),
            
            // Dữ liệu cấu hình size
            sizeType,
            sizeOptions: sizeType !== SizeType.NONE ? sizeOptions : undefined,
            sizeIncreaseThreshold: sizeType !== SizeType.NONE && sizeIncreaseThreshold ? sizeIncreaseThreshold : undefined,
            sizeIncreasePercentage: sizeType !== SizeType.NONE && sizeIncreasePercentage ? parseFloat(sizeIncreasePercentage as string) : undefined,
        };
        
        if (productData.images.length === 0) {
            setError("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
            setIsLoading(false);
            return;
        }

        // 2. Gửi API
        try {
            const createdProduct = await apiFetch<CreatedProduct>('/products', {
                method: 'POST',
                body: productData, 
                apiUrl: API_BASE_URL,
            });
            
            console.log(`Sản phẩm "${createdProduct.name}" đã được tạo thành công!`);
            console.log(`[SUCCESS] Sản phẩm đã được tạo:`, createdProduct);
            //alert(`Sản phẩm "${createdProduct.name}" đã được tạo thành công!`);
            router.push('/admin'); 

        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi không xác định khi tạo sản phẩm.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // =================================
    // 5. UI RENDER
    // =================================
    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center min-h-[500px] text-lg text-gray-600">
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white min-h-[calc(100vh-80px)] shadow-lg rounded-lg my-8">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-blue-700">Tạo Sản phẩm mới</h1>
                <Link href="/admin/products" className="text-sm text-blue-500 hover:text-blue-700 transition">
                    &larr; Quay lại danh sách sản phẩm
                </Link>
            </header>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Lỗi: {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PHẦN 1: THÔNG TIN CƠ BẢN CỦA SẢM PHẨM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                    <h2 className="md:col-span-2 text-xl font-semibold text-gray-700 mb-2 border-b pb-2">Thông tin chung</h2>
                    
                    {/* Tên, Giá, Mô tả, Danh mục - UI không thay đổi */}
                    <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên Sản phẩm <span className="text-red-500">*</span></label>
                         <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                    </div>
                    <div>
                         <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) <span className="text-red-500">*</span></label>
                         <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="1000" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"></textarea>
                    </div>
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select 
                            id="categoryId" 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(parseInt(e.target.value) || '')} 
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 bg-white"
                        >
                            <option value="">-- Chọn Danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* TRƯỜNG INPUT HÌNH ẢNH */}
                    <div className="md:col-span-2">
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Tải lên Hình ảnh (Cloudinary)</label>
                        <input 
                            type="file" 
                            id="image-upload" 
                            accept="image/*"
                            multiple 
                            onChange={handleImageUpload} 
                            disabled={isUploading || isLoading}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        
                        {isUploading && (
                             <p className="text-sm text-blue-500 mt-2">Đang tải lên...</p>
                        )}

                        {/* HIỂN THỊ CÁC URL ĐÃ UPLOAD */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                                    <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg p-1 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Tổng cộng: {images.length} ảnh đã sẵn sàng.</p>
                    </div>
                </div>

                {/* PHẦN 2: CẤU HÌNH SIZE & GIÁ */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        📏 Cấu hình Size & Quy tắc Tăng Giá
                    </h2>

                    {/* CHỌN LOẠI SIZE - UI không thay đổi */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại Size</label>
                        <select
                            name="sizeType"
                            value={sizeType}
                            onChange={(e) => setSizeType(e.target.value as SizeType)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 bg-white"
                        >
                            <option value={SizeType.NONE}>NONE (Không dùng cấu hình tự động)</option>
                            <option value={SizeType.LETTER}>LETTER (Ví dụ: S, M, L, XL)</option>
                            <option value={SizeType.NUMBER}>NUMBER (Ví dụ: 38, 39, 40, 41)</option>
                        </select>
                    </div>

                    {/* HIỂN THỊ CÁC TRƯỜNG TĂNG GIÁ NẾU KHÔNG PHẢI LÀ NONE - UI không thay đổi */}
                    {sizeType !== SizeType.NONE && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Size Options (Phân cách bằng dấu phẩy)
                                </label>
                                <input
                                    type="text"
                                    value={sizeOptions}
                                    onChange={(e) => setSizeOptions(e.target.value)}
                                    placeholder="Ví dụ: S, M, L, XL hoặc 38, 39, 40, 41"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">Chuỗi này xác định tất cả các size của sản phẩm.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngưỡng Tăng Giá (Size bắt đầu tăng giá)
                                    </label>
                                    <input
                                        type="text"
                                        value={sizeIncreaseThreshold}
                                        onChange={(e) => setSizeIncreaseThreshold(e.target.value)}
                                        placeholder="Ví dụ: L hoặc 42"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phần Trăm Tăng Giá (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={sizeIncreasePercentage}
                                        onChange={(e) => setSizeIncreasePercentage(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Ví dụ: 10 (tăng 10%)"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-red-500 mt-2">
                                **Lưu ý quan trọng:** Nếu bạn sử dụng Cấu hình Size, hệ thống Backend sẽ tự động tạo giá cho các size lớn hơn ngưỡng.
                            </p>
                        </>
                    )}
                </div>

                {/* PHẦN 3: QUẢN LÝ VARIANTS - UI không thay đổi */}
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
                            <div key={index} className="flex flex-wrap items-center gap-3 p-3 border border-dashed rounded-md bg-blue-50">
                                
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-700">Size</label>
                                    <input 
                                        type="text" 
                                        value={variant.sizeValue} 
                                        onChange={(e) => handleVariantChange(index, 'sizeValue', e.target.value)} 
                                        required 
                                        placeholder="Ví dụ: S, M, L" 
                                        className="w-full border-gray-300 rounded-md p-1.5 text-sm" 
                                    />
                                </div>

                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-700">Màu sắc</label>
                                    <input 
                                        type="text" 
                                        value={variant.color} 
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)} 
                                        placeholder="Ví dụ: Đỏ, Xanh" 
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
                                    <label className="block text-xs font-medium text-gray-700">SKU (Tùy chọn)</label>
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
                                    disabled={variants.length === 1}
                                    title="Xóa biến thể này"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Chỉ những Variants có Size và Tồn kho ≥ 0 mới được lưu.</p>
                </div>
                
                {/* NÚT SUBMIT */}
                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={isLoading || isUploading || images.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400 transition"
                    >
                        {isLoading ? 'Đang tạo Sản phẩm...' : isUploading ? 'Vui lòng chờ tải ảnh...' : 'Tạo Sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}