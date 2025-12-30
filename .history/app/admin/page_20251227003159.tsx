'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Archive, Edit, Trash2, Plus, Truck } from 'lucide-react';
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
    // === MỚI: SALE ===
    promoName: string | null;
    promoStart: string | null;
    promoEnd: string | null;
    salePrice: number | null;
}

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({ 
        name: '', price: '', description: '', 
        sizeType: SizeType.NONE, sizeOptions: '', 
        sizeIncreaseThreshold: '', sizeIncreasePercentage: '',
        // === MỚI: SALE ===
        promoName: '', salePrice: '', promoStart: '', promoEnd: ''
    });

    const fetchProducts = useCallback(async () => {
        try {
            const data = await apiFetch<Product[]>('/products', { method: 'GET' }); 
            setProducts(data);
        } catch (error) { console.error('Lỗi fetch:', error); }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
            // === MỚI: SALE (Định dạng lại ngày để hiện lên input datetime-local) ===
            promoName: product.promoName || '',
            salePrice: product.salePrice ? String(product.salePrice) : '',
            promoStart: product.promoStart ? product.promoStart.substring(0, 16) : '',
            promoEnd: product.promoEnd ? product.promoEnd.substring(0, 16) : '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({ 
            name: '', price: '', description: '', 
            sizeType: SizeType.NONE, sizeOptions: '', 
            sizeIncreaseThreshold: '', sizeIncreasePercentage: '',
            promoName: '', salePrice: '', promoStart: '', promoEnd: ''
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setLoading(true);
        try {
            const updateData = {
                ...formData,
                price: parseFloat(formData.price),
                sizeIncreasePercentage: formData.sizeIncreasePercentage ? parseFloat(formData.sizeIncreasePercentage) : null,
                // === MỚI: SALE ===
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                promoStart: formData.promoStart ? new Date(formData.promoStart).toISOString() : null,
                promoEnd: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : null,
            };

            await apiFetch(`/products/${editingProduct.id}`, { method: "PATCH", body: updateData });
            alert('Cập nhật thành công!');
            cancelEdit();
            fetchProducts();
        } catch (error) { alert('Lỗi cập nhật!'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
                
                {/* DANH SÁCH BÊN TRÁI */}
                <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-1/2">
                    <h2 className="text-xl font-bold mb-4">📦 Kho hàng ({products.length})</h2>
                    <div className="space-y-4 overflow-y-auto max-h-[700px]">
                        {products.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 border rounded-xl">
                                <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-red-600 text-sm">{Number(p.price).toLocaleString()}đ</p>
                                </div>
                                <button onClick={() => startEdit(p)} className="p-2 hover:bg-blue-50 text-blue-600 rounded"><Edit size={18}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORM BÊN PHẢI */}
                <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-1/2 sticky top-4 h-fit">
                    <h2 className="text-xl font-bold mb-4">{editingProduct ? '📝 Sửa sản phẩm' : '💡 Tác vụ'}</h2>
                    {editingProduct ? (
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <input type="text" className="w-full p-2 border rounded" placeholder="Tên..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            <input type="number" className="w-full p-2 border rounded" placeholder="Giá gốc..." value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                            
                            {/* === MỚI: PHẦN SALE === */}
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                                <p className="text-xs font-bold text-red-600 uppercase">Khuyến mãi (Sale)</p>
                                <input type="text" className="w-full p-2 text-sm border rounded" placeholder="Tên KM (VD: Black Friday)" value={formData.promoName} onChange={(e) => setFormData({...formData, promoName: e.target.value})} />
                                <input type="number" className="w-full p-2 text-sm border rounded font-bold text-red-600" placeholder="Giá Sale..." value={formData.salePrice} onChange={(e) => setFormData({...formData, salePrice: e.target.value})} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="datetime-local" className="w-full p-2 text-xs border rounded" value={formData.promoStart} onChange={(e) => setFormData({...formData, promoStart: e.target.value})} />
                                    <input type="datetime-local" className="w-full p-2 text-xs border rounded" value={formData.promoEnd} onChange={(e) => setFormData({...formData, promoEnd: e.target.value})} />
                                </div>
                            </div>

                            <textarea className="w-full p-2 border rounded" placeholder="Mô tả..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            
                            {/* CẤU HÌNH SIZE */}
                            <select className="w-full p-2 border rounded" value={formData.sizeType} onChange={(e) => setFormData({...formData, sizeType: e.target.value as SizeType})}>
                                <option value={SizeType.NONE}>Không Size</option>
                                <option value={SizeType.LETTER}>S/M/L</option>
                                <option value={SizeType.NUMBER}>38/39/40</option>
                            </select>

                            <div className="flex gap-2">
                                <button type="button" onClick={cancelEdit} className="w-1/2 p-2 bg-gray-200 rounded">Hủy</button>
                                <button type="submit" disabled={loading} className="w-1/2 p-2 bg-green-600 text-white rounded font-bold">{loading ? 'Đang lưu...' : 'LƯU'}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link href="/admin/products/create" className="p-3 bg-blue-600 text-white text-center rounded-lg font-bold">+ Tạo mới</Link>
                            <Link href="/admin/orders" className="p-3 bg-red-600 text-white text-center rounded-lg font-bold"><Truck size={20} className="inline mr-2"/>Đơn hàng</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}