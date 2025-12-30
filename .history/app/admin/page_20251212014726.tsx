'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Archive, Edit, Trash2, Plus } from 'lucide-react';
// 🚨 ĐÃ SỬA LỖI ĐƯỜNG DẪN TƯƠNG ĐỐI: Lùi 2 cấp (ra khỏi admin, ra khỏi app)
import { apiFetch } from '../utils/apiFetch'; 

// === ENUM CHO SIZE TYPE ===
export enum SizeType {
    NONE = 'NONE',
    LETTER = 'LETTER', // Ví dụ: S, M, L
    NUMBER = 'NUMBER', // Ví dụ: 38, 39, 40
}

// Định nghĩa kiểu dữ liệu cho sản phẩm (Đã thêm các trường Size)
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    images: string[];
    // Cấu hình Size
    sizeType: SizeType;
    sizeOptions: string | null;
    sizeIncreaseThreshold: string | null;
    sizeIncreasePercentage: number | null;
}

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        description: '', 
        // Các trường Size
        sizeType: SizeType.NONE,
        sizeOptions: '',
        sizeIncreaseThreshold: '',
        sizeIncreasePercentage: '', // Sẽ là chuỗi số
    });
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // [Logic Fetching và Delete giữ nguyên...]
    const fetchProducts = useCallback(async () => {
        try {
            // Gọi API Fetch
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
            // Gọi API Delete
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            alert('Đã xóa thành công!');
            fetchProducts();
        } catch (error) {
            alert('Lỗi khi xóa sản phẩm! Vui lòng kiểm tra console.');
        }
    };
    
    // =================================
    // Logic Chỉnh sửa Nhanh (Update)
    // =================================
    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({ 
            name: '', price: '', description: '', 
            sizeType: SizeType.NONE, sizeOptions: '', 
            sizeIncreaseThreshold: '', sizeIncreasePercentage: '' 
        });
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: String(product.price),
            description: product.description,
            // Đổ dữ liệu Size vào form
            sizeType: product.sizeType,
            sizeOptions: product.sizeOptions || '',
            sizeIncreaseThreshold: product.sizeIncreaseThreshold || '',
            sizeIncreasePercentage: product.sizeIncreasePercentage !== null ? String(product.sizeIncreasePercentage) : '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setLoading(true);

        try {
            const updateData = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                
                // === CẬP NHẬT TRƯỜNG SIZE ===
                sizeType: formData.sizeType,
                // Đặt về null nếu sizeType là NONE hoặc trường là rỗng
                sizeOptions: formData.sizeType !== SizeType.NONE && formData.sizeOptions ? formData.sizeOptions : null,
                sizeIncreaseThreshold: formData.sizeType !== SizeType.NONE && formData.sizeIncreaseThreshold ? formData.sizeIncreaseThreshold : null,
                sizeIncreasePercentage: formData.sizeType !== SizeType.NONE && formData.sizeIncreasePercentage ? parseFloat(formData.sizeIncreasePercentage) : null,
                // ==============================
            };

            // Gọi API Patch
            await apiFetch(`/products/${editingProduct.id}`, { 
                method: "PATCH",
                // apiFetch sẽ tự động xử lý JSON.stringify và Content-Type
                body: updateData, 
            });

            alert(`Cập nhật sản phẩm "${formData.name}" thành công!`);
            cancelEdit();
            fetchProducts();
        } catch (error: any) {
            console.error("❌ Lỗi cập nhật:", error);
            alert("Cập nhật thất bại: " + (error.message || "Lỗi không xác định."));
        } finally {
            setLoading(false);
        }
    };

    // =================================
    // UI Render
    // =================================
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-800 border-b pb-2">
                    QUẢN LÝ KHO SẢN PHẨM 🛠️
                </h1>

                {/* CONTAINER ĐÃ SỬA: DÙNG FLEX VÀ ORDER ĐỂ HOÁN ĐỔI VỊ TRÍ */}
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* DANH SÁCH SẢN PHẨM (MỚI: order-1 -> Bên trái trên Desktop) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col w-full md:w-1/2 order-1">
                        <h2 className="text-xl font-bold mb-4">📦 Danh sách Sản phẩm ({products.length})</h2>
                        <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
                            {products.length === 0 ? (
                                <p className='text-center text-gray-500 pt-10'>Không tìm thấy sản phẩm nào trong kho.</p>
                            ) : (
                                products.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-start justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Bên trái: ảnh + thông tin sản phẩm */}
                                        <div className="flex items-center space-x-4 flex-grow min-w-0">
                                            {p.images && p.images.length > 0 ? (
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
                                                <p className="font-bold text-base text-gray-800 whitespace-normal break-words">{p.name}</p>
                                                <p className="text-red-600 text-sm font-semibold">
                                                    {Number(p.price).toLocaleString()} đ
                                                </p>
                                                {/* Hiển thị tóm tắt cấu hình Size */}
                                                {p.sizeType !== SizeType.NONE && (
                                                    <p className='text-xs text-gray-500 mt-1'>
                                                        Size: **{p.sizeType}** | Ngưỡng: **{p.sizeIncreaseThreshold || 'N/A'}** ({p.sizeIncreasePercentage || 0}%)
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bên phải: icon dọc */}
                                        <div className="flex flex-col items-center gap-2 ml-4">
                                            
                                            <button
                                                title="Sửa nhanh (Tên, Giá, Mô tả & Size)"
                                                onClick={() => startEdit(p)}
                                                className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-transform hover:scale-110"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            
                                            <Link 
                                                href={`/admin/products/edit/${p.id}`} 
                                                title="Chỉnh sửa Chi tiết (Ảnh/Size/Variant)"
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

                    {/* FORM CHỈNH SỬA NHANH VÀ TÁC VỤ (MỚI: order-2 -> Bên phải trên Desktop, dính trên cùng) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4 h-fit w-full md:w-1/2 order-2">
                        <h2 className="text-xl font-bold mb-4">
                            {editingProduct ? `📝 Chỉnh sửa Nhanh: ${editingProduct.name}` : '💡 Tác vụ Sản phẩm'}
                        </h2>
                        
                        {editingProduct ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <p className="text-sm text-blue-500 font-medium border-b pb-2">Sửa nhanh các thông tin cơ bản và cấu hình Size.</p>

                                {/* TRƯỜNG CƠ BẢN */}
                                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                <input
                                    type="text"
                                    placeholder="Tên sản phẩm..."
                                    className="w-full p-3 border rounded"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Giá tiền</label>
                                <input
                                    type="number"
                                    placeholder="Giá tiền..."
                                    className="w-full p-3 border rounded"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea
                                    placeholder="Mô tả..."
                                    className="w-full p-3 border rounded"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                
                                <hr className='my-4' />

                                {/* === CÁC TRƯỜNG CẤU HÌNH SIZE === */}
                                <label className="block text-sm font-medium text-gray-700">Loại Size</label>
                                <select
                                    value={formData.sizeType}
                                    onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as SizeType })}
                                    className="w-full p-3 border rounded bg-white"
                                >
                                    <option value={SizeType.NONE}>NONE (Không dùng cấu hình)</option>
                                    <option value={SizeType.LETTER}>LETTER (S, M, L)</option>
                                    <option value={SizeType.NUMBER}>NUMBER (38, 39, 40)</option>
                                </select>
                                
                                {formData.sizeType !== SizeType.NONE && (
                                    <div className='space-y-4 pt-2 border-t'>
                                        <label className="block text-sm font-medium text-gray-700">Tùy chọn Size (Phân cách bằng dấu phẩy)</label>
                                        <input
                                            type="text"
                                            placeholder="Size Options (VD: S, M, L, XL)"
                                            className="w-full p-3 border rounded"
                                            value={formData.sizeOptions}
                                            onChange={(e) => setFormData({ ...formData, sizeOptions: e.target.value })}
                                        />
                                        <div className='grid grid-cols-2 gap-3'>
                                            <label className="block text-sm font-medium text-gray-700 col-span-1">Ngưỡng tăng giá</label>
                                            <label className="block text-sm font-medium text-gray-700 col-span-1">% Tăng giá</label>
                                            <input
                                                type="text"
                                                placeholder="VD: L hoặc 42"
                                                className="w-full p-3 border rounded"
                                                value={formData.sizeIncreaseThreshold}
                                                onChange={(e) => setFormData({ ...formData, sizeIncreaseThreshold: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="VD: 10"
                                                className="w-full p-3 border rounded"
                                                value={formData.sizeIncreasePercentage}
                                                onChange={(e) => setFormData({ ...formData, sizeIncreasePercentage: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* ========================================== */}

                                <div className='flex gap-3 pt-4 border-t mt-4'>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex items-center justify-center w-1/2 h-10 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition shadow-sm font-semibold"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex items-center justify-center w-1/2 h-10 rounded-lg font-semibold transition shadow 
                                            bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400`} 
                                    >
                                        {loading ? <span className="text-sm">Đang lưu...</span> : 'LƯU CẬP NHẬT'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className='flex flex-col space-y-4'>
                                <p className='text-gray-600'>Chọn một sản phẩm từ danh sách bên cạnh để chỉnh sửa nhanh, hoặc:</p>
                                <Link
                                    href="/admin/products/create"
                                    className="flex items-center justify-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
                                >
                                    <Plus size={20} className="mr-2"/> Tạo Sản phẩm Mới
                                </Link>
                                <Link >
                                </Link>
                                
                            </div>
                        )}
                    </div>
                </div>

                {/* Nút quay về trang chủ */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-gray-500 hover:text-black font-medium">
                        ← Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}