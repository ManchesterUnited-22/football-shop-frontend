// components/AddToCartBtn.tsx (CODE SỬA CUỐI CÙNG)

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 

interface Variant {
    id: number;
    sizeValue: string; 
    stock: number; 
    priceAdjustment?: number; 
    calculatedPrice?: number; // Thêm trường này để nhận giá đã tính từ Backend
}

interface Product 



export default function AddToCartBtn({
    product,
    variants,
}: {
    product: Product;
    variants: Variant[];
}) {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity] = useState(1); 

    // ⭐️ BƯỚC 1: TẠO DANH SÁCH SIZE DUY NHẤT (Khắc phục lỗi trùng lặp nút Size)
    const uniqueSizes = useMemo(() => {
        const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
        return Array.from(new Set(sizes));
    }, [variants]);
    
    // BƯỚC 2: TÌM VARIANT HIỆN TẠI (Giữ nguyên)
    const currentVariant = useMemo(() => {
        if (!selectedSize) return null;
        // Lấy Variant đầu tiên khớp với Size đã chọn (nếu có màu sắc, logic sẽ khác)
        return variants.find(v => v.sizeValue === selectedSize) || null;
    }, [selectedSize, variants]);

    // BƯỚC 3: TÍNH TOÁN GIÁ HIỂN THỊ (Ưu tiên giá từ Backend)
    const displayPrice = useMemo(() => {
        if (currentVariant && currentVariant.calculatedPrice !== undefined) {
            return currentVariant.calculatedPrice;
        }
        if (currentVariant && currentVariant.priceAdjustment) {
            return product.price + currentVariant.priceAdjustment;
        }
        return product.price;
    }, [currentVariant, product.price]);

    const handleAddToCart = () => { /* ... giữ nguyên ... */ };

    // BƯỚC 4: LOGIC TRẠNG THÁI NÚT MUA HÀNG
    const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
    // Nút bị disabled khi CHƯA CHỌN SIZE HOẶC SIZE ĐÃ CHỌN HẾT HÀNG
    const isBuyButtonDisabled = !currentVariant || (currentVariant.stock ?? 0) <= 0;
    
    if (variants.length === 0 || uniqueSizes.length === 0) {
        // ... (Hiển thị thông báo Admin)
    }

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Chọn Kích thước:</h4>
            <div className="flex space-x-2 mb-4">
                {/* ⭐️ LẶP QUA UNIQUE SIZES (ĐÃ SỬA LỖI 1) ⭐️ */}
                {uniqueSizes.map(sizeValue => {
                    // Tìm Variant đầu tiên khớp để kiểm tra stock
                    const v = variants.find(v => v.sizeValue === sizeValue);
                    // Chỉ vô hiệu hóa khi stock <= 0 (Logic này đã đúng)
                    const isDisabled = !v || v.stock <= 0; 
                    
                    return (
                        <button
                            key={sizeValue}
                            onClick={() => setSelectedSize(sizeValue)}
                            disabled={isDisabled} 
                            className={`px-4 py-2 border rounded-md transition-colors 
                                ${selectedSize === sizeValue ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {sizeValue} {v && v.stock > 0 && <span className="text-xs ml-1">({v.stock})</span>}
                        </button>
                    )
                })}
            </div>

            <p className="text-xl font-semibold mb-4 text-red-600">
                Giá: {displayPrice.toLocaleString("vi-VN")} VNĐ
            </p>

            <button
                onClick={handleAddToCart}
                disabled={isBuyButtonDisabled} 
                className={`w-full py-4 rounded-lg font-bold text-lg transition active:scale-95 shadow-lg
                    ${isBuyButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
                {
                    // ⭐️ LOGIC 3 TẦNG ĐÃ SỬA LỖI 2 ⭐️
                    !currentVariant ? 'VUI LÒNG CHỌN SIZE' : 
                    !isSelectedVariantInStock ? 'SIZE NÀY ĐÃ HẾT HÀNG' : 
                    'THÊM VÀO GIỎ HÀNG 🛒'
                }
            </button>
        </div>
    );
}