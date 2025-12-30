// components/AddToCartBtn.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 

interface Variant {
  id: number;
  sizeValue: string; 
  stock: number; 
  priceAdjustment?: number; 
  calculatedPrice?: number; // Nếu backend trả về giá đã tính
}

interface Product {
  id: number;
  name: string;
  price: number; 
  images: string[];
} 

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

  // Danh sách size duy nhất
  const uniqueSizes = useMemo(() => {
    const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
    return Array.from(new Set(sizes));
  }, [variants]);
  
  // Variant hiện tại theo size đã chọn
  const currentVariant: Variant | null = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants]);

  // Giá hiển thị
  const displayPrice = useMemo(() => {
    if (currentVariant?.calculatedPrice !== undefined) {
      return currentVariant.calculatedPrice;
    }
    if (currentVariant?.priceAdjustment) {
      return product.price + currentVariant.priceAdjustment;
    }
    return product.price;
  }, [currentVariant, product.price]);

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      alert("Size đã hết hàng hoặc không hợp lệ.");
      return;
    }

    const itemDetails = {
      productId: product.id,
      name: product.name,
      price: displayPrice,
      sizeValue: currentVariant.sizeValue,
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity,
      variantId: currentVariant.id,
    };

    addToCart(itemDetails);
  };

  // Trạng thái nút mua hàng
  const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
  const isBuyButtonDisabled = !currentVariant || (currentVariant?.stock ?? 0) <= 0;
  
  if (variants.length === 0 || uniqueSizes.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
        Sản phẩm chưa có cấu hình size/tồn kho.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4">Chọn Kích thước:</h4>
      <div className="flex flex-wrap gap-3 mb-6">
        {uniqueSizes.map(sizeValue => {
          const v = variants.find(v => v.sizeValue === sizeValue);
          const isDisabled = !v || v.stock <= 0; 
          
          return (
            <button
              key={sizeValue}
              onClick={() => setSelectedSize(sizeValue)}
              disabled={isDisabled} 
              className={`w-12 h-12 flex items-center justify-center border rounded-full font-semibold transition-colors
                ${selectedSize === sizeValue ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {sizeValue}
            </button>
          );
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
          !currentVariant ? 'VUI LÒNG CHỌN SIZE' : 
          !isSelectedVariantInStock ? 'SIZE NÀY ĐÃ HẾT HÀNG' : 
          'THÊM VÀO GIỎ HÀNG 🛒'
        }
      </button>
    </div>
  );
}
