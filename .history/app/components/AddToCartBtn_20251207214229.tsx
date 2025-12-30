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
    stock: number; 
    priceAdjustment?: number; 
}

interface Product {
    id: number;
    name: string;
    price: number; 
    // Giả định product.images là mảng các chuỗi URL (nếu Backend trả về mảng chuỗi)
    // Nếu Backend trả về mảng { url: string }, hãy sửa lại interface ProductDetail.tsx để map chúng thành mảng string.
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
        const sizes = variants.map(v => v.sizeValue);
        return Array.from(new Set(sizes));
    }, [variants]);
    
    // 2. STATE: Theo dõi Size đã chọn và Variant đã chọn
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity] = useState(1); 

    // 3. TÍNH TOÁN: Tìm Variant khớp với Size đã chọn (nếu có Color, logic sẽ phức tạp hơn)
    const currentVariant = useMemo(() => {
        if (!selectedSize) return null;
        // Hiện tại chỉ tìm theo SizeValue (Variant đầu tiên khớp)
        return variants.find(v => v.sizeValue === selectedSize);
    }, [selectedSize, variants]);


    // 4. KIỂM TRA TỒN KHO CHUNG (KHẮC PHỤC LỖI 2)
    const hasAnyStock = useMemo(() => {
        // Trả về true nếu CÓ BẤT KỲ variant nào có stock > 0
        return variants.some(v => v.stock > 0);
    }, [variants]); 

    // 5. TÍNH TOÁN GIÁ
    const finalPrice = useMemo(() => {
        if (currentVariant && currentVariant.priceAdjustment) {
            return product.price + currentVariant.priceAdjustment;
        }
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
            price: finalPrice, 
            sizeValue: currentVariant.sizeValue, 
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg', 
            quantity: quantity,
            // Thêm variantId để dễ dàng quản lý giỏ hàng/backend nếu cần
            variantId: currentVariant.id 
        };
        
        addToCart(itemDetails); 
    };

    const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
    
    // Xử lý khi sản phẩm KHÔNG CÓ BẤT KỲ VARIANT NÀO (ví dụ: lỗi nhập liệu admin)
    if (variants.length === 0) {
        return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Sản phẩm chưa có cấu hình size/tồn kho.</div>;
    }


    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Chọn Kích thước:</h4>
            
            <div className="flex space-x-2 mb-4">
                {/* LẶP QUA DANH SÁCH SIZE DUY NHẤT (KHẮC PHỤC LỖI 1) */}
                {uniqueSizes.map((size) => {
                    // Tìm Variant đầu tiên có size này để kiểm tra stock
                    const v = variants.find(v => v.sizeValue === size);
                    const isDisabled = v ? v.stock <= 0 : true; 
                    
                    return (
                        <button
                            key={size}
                            // Khi bấm nút, chỉ cần lưu sizeValue đã chọn
                            onClick={() => setSelectedSize(size)} 
                            disabled={isDisabled} 
                            className={`px-4 py-2 border rounded-md transition-colors 
                                ${selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {size} 
                            {v && v.stock > 0 && <span className="text-xs ml-1">({v.stock})</span>}
                        </button>
                    )
                })}
            </div>

            {/* Hiển thị giá cuối cùng */}
            <p className="text-xl font-semibold mb-4 text-red-600">
                Giá: {finalPrice.toLocaleString("vi-VN")} VNĐ
            </p>

            <button
                onClick={handleAddToCart}
                // Vô hiệu hóa nếu không có hàng TỔNG THỂ, hoặc chưa chọn size/size đã chọn hết hàng
                disabled={!hasAnyStock || !currentVariant || !isSelectedVariantInStock} 
                className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition active:scale-95 shadow-lg"
            >
                {
                    // Nếu toàn bộ sản phẩm hết hàng
                    !hasAnyStock ? 'Đã hết hàng' : 
                    // Nếu chưa chọn size
                    !selectedSize ? 'Vui lòng chọn Size' :
                    // Nếu đã chọn size nhưng hết hàng
                    !isSelectedVariantInStock ? 'Size này đã hết hàng' :
                    // Mặc định
                    'THÊM VÀO GIỎ NGAY 🛒'
                }
            </button>
        </div>
    );
}