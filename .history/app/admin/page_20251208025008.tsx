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
                // Không cần headers nếu apiFetch đã tự lo JSON.stringify và Content-Type
                // body: JSON.stringify(updateData),
                body: updateData, // apiFetch sẽ tự động xử lý
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
   