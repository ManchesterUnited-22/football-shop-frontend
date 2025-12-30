// components/AddToCartBtn.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 

// ===============================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU KHỚP VỚI BACKEND
// ===============================================
interface Variant {
    id: number;
    sizeValue: string; 
    // Thêm trường 'calculatedPrice' từ Backend để hiển thị giá chính xác
    calculatedPrice?: number; 
    stock: number; 
    priceAdjustment?: number; 
}

interface Product {
    id: number;
    name: string;
    price: number; 
    images: string[]; 
}

// ===============================================
// COMPONENT ADD TO CART
// ===============================================
export default function AddToCartBtn({
    product,
    variants,
}: {
    product: Product;
    variants: Variant[];
}) {
    const { addToCart } = useCart();
    
    // 1. LỌC: Tạo danh sách các size duy nhất để hiển thị nút
    const uniqueSizes = useMemo(() => {
        // Dùng Set để chỉ lấy ra các sizeValue không trùng lặp
        const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
        return Array.from(new Set(sizes));
    }, [variants]);
    
    // 2. STATE: Theo dõi Size đã chọn
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity] = useState(1); 

    // 3. TÍNH TOÁN: Tìm Variant khớp với Size đã chọn 
    const currentVariant = useMemo(() => {
        if (!selectedSize) return null;
        // Tìm Variant chính xác khớp với size đã chọn
        // ⚠️ Lưu ý: Nếu có Color, bạn cần thêm state selectedColor và tìm theo cả hai trường.
        return variants.find(v => v.sizeValue === selectedSize);
    }, [selectedSize, variants]);


    // 4. KIỂM TRA TỒN KHO CHUNG
    const hasAnyStock = useMemo(() => {
        // Trả về true nếu CÓ BẤT KỲ variant nào có stock > 0
        return variants.some(v => v.stock > 0);
    }, [variants]); 

    // 5. TÍNH TOÁN GIÁ HIỂN THỊ
    const displayPrice = useMemo(() => {
        // Ưu tiên sử dụng calculatedPrice từ Backend (nếu có)
        if (currentVariant && currentVariant.calculatedPrice !== undefined) {
            return currentVariant.calculatedPrice;
        }
        // Hoặc sử dụng giá cơ bản
        return product.price;
    }, [currentVariant, product.price]);


    // Xử lý logic Thêm vào Giỏ
    const handleAddToCart = () => {
        if (!currentVariant || currentVariant.stock <= 0) {
            alert("Vui lòng chọn kích thước hợp lệ hoặc sản phẩm đã hết hàng.");
            return;
        }

        const itemDetails = {
            productId: product.id,
            name: product.name,
            price: displayPrice, // SỬ DỤNG GIÁ ĐÃ TÍNH
            sizeValue: currentVariant.sizeValue, 
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg', 
            quantity: quantity,
            variantId: currentVariant.id 
        };
        
        addToCart(itemDetails); 
    };

    // 6. LOGIC TRẠNG THÁI NÚT MUA HÀNG
    const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
    const isBuyButtonDisabled = !hasAnyStock || !currentVariant || !isSelectedVariantInStock;
    
    // Xử lý khi sản phẩm KHÔNG CÓ VARIANT (thay vì lỗi, thông báo cho Admin)
    if (variants.length === 0 || uniqueSizes.length === 0) {
        return (
            <div className="mt-6">
                <p className="text-3xl text-red-600 font-bold mb-6">
                    {product.price.toLocaleString("vi-VN")} VNĐ
                </p>
                <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
                    Sản phẩm chưa có cấu hình size/tồn kho.
                </div>
            </div>
        );
    }


    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Chọn Kích thước:</h4>
            
            <div className="flex space-x-2 mb-4">
                {/* ⭐️ KHẮC PHỤC LỖI 1: ICON CẤM/DISABLED ⭐️ */}
                {uniqueSizes.map((size) => {
                    // Tìm Variant có stock > 0
                    const v = variants.find(v => v.sizeValue === size);
                    const isDisabled = v ? v.stock <= 0 : true; 
                    
                    return (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)} 
                            // Chỉ vô hiệu hóa khi stock <= 0
                            disabled={isDisabled} 
                            className={`px-4 py-2 border rounded-md transition-colors 
                                ${selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {size} 
                            {/* Hiển thị stock, giúp người dùng biết */}
                            {v && v.stock > 0 && <span className="text-xs ml-1 font-normal text-gray-600">({v.stock})</span>}
                        </button>
                    )
                })}
            </div>

            {/* Hiển thị giá cuối cùng (đã được sửa) */}
            <p className="text-xl font-semibold mb-4 text-red-600">
                Giá: {displayPrice.toLocaleString("vi-VN")} VNĐ
            </p>

            <button
                onClick={handleAddToCart}
                // ⭐️ KHẮC PHỤC LỖI 2: LOGIC NÚT ĐÃ HẾT HÀNG ⭐️
                disabled={isBuyButtonDisabled} 
                className={`w-full py-4 rounded-lg font-bold text-lg transition active:scale-95 shadow-lg
                    ${isBuyButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
                {
                    // Nếu toàn bộ sản phẩm hết hàng
                    !hasAnyStock ? 'Đã hết hàng' : 
                    // Nếu chưa chọn size
                    !selectedSize ? 'Vui lòng chọn Size' :
                    // Nếu đã chọn size nhưng hết hàng
                    !isSelectedVariantInStock ? 'Size này đã hết hàng' :
                    // Mặc định
                    'THÊM VÀO GIỎ HÀNG 🛒'
                }
            </button>
        </div>
    );
}