// components/AddToCartBtn.tsx

'use client'; 
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 
// Đảm bảo bạn đã sửa CartContext.tsx để nó chỉ nhận 1 đối tượng duy nhất!

// ===============================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU KHỚP VỚI BACKEND
// ===============================================
interface Variant {
    id: number;
    // Tên trường chính xác từ Schema của chúng ta
    sizeValue: string; 
    // XÓA DẤU '?' VÀ BẮT BUỘC (Khắc phục lỗi TS18048)
    stock: number; 
    // Giữ lại nếu bạn có tính toán giá động ở Backend
    priceAdjustment?: number; 
}

interface Product {
    id: number;
    name: string;
    price: number; // Giá cơ bản
    images: { url: string }[]; // Giả định mảng đối tượng URL
    // Nếu bạn chỉ lưu mảng chuỗi, hãy đổi thành: images: string[]; 
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
    
    // Theo dõi toàn bộ đối tượng Variant đã chọn
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        // Khởi tạo với Variant đầu tiên còn hàng
        variants.length > 0 ? variants.find(v => v.stock > 0) || variants[0] : null
    );
    const [quantity] = useState(1); // Số lượng mặc định là 1

    // Tính toán Giá cuối cùng (Sử dụng useMemo để tối ưu)
    const finalPrice = useMemo(() => {
        if (selectedVariant && selectedVariant.priceAdjustment) {
            // Giá động: Giá cơ bản + Giá điều chỉnh
            return product.price + selectedVariant.priceAdjustment;
        }
        return product.price; // Giá cơ bản
    }, [selectedVariant, product.price]);


    // Xử lý logic Thêm vào Giỏ
    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) {
            alert("Vui lòng chọn kích thước hợp lệ hoặc sản phẩm đã hết hàng.");
            return;
        }

        // TẠO ĐỐI TƯỢNG DUY NHẤT (CartItemDetails) ĐỂ GỌI CONTEXT
        const itemDetails = {
            productId: product.id,
            name: product.name,
            price: finalPrice, // Giá đã tính toán
            sizeValue: selectedVariant.sizeValue, // SizeValue chính xác cho Backend
            imageUrl: product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.jpg', // URL ảnh đầu tiên
            quantity: quantity,
        };
        
        // GỌI HÀM ADDOCART VỚI 1 THAM SỐ (ĐỐI TƯỢNG)
        addToCart(itemDetails); 
    };

    const hasStock = selectedVariant && selectedVariant.stock > 0;

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Chọn Kích thước:</h4>
            
            <div className="flex space-x-2 mb-4">
                {variants.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stock <= 0} // Vô hiệu hóa nút hết hàng
                        className={`px-4 py-2 border rounded-md transition-colors 
                                   ${selectedVariant?.id === v.id ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                                   ${v.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {v.sizeValue} 
                        {v.stock > 0 && <span className="text-xs ml-1">({v.stock})</span>}
                    </button>
                ))}
            </div>

            {/* Hiển thị giá cuối cùng */}
            <p className="text-xl font-semibold mb-4 text-red-600">
                Giá: {finalPrice.toLocaleString("vi-VN")} VNĐ
            </p>

            <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !hasStock} 
                className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition active:scale-95 shadow-lg"
            >
                {selectedVariant && !hasStock ? 'Đã hết hàng' : 'THÊM VÀO GIỎ NGAY 🛒'}
            </button>
        </div>
    );
}