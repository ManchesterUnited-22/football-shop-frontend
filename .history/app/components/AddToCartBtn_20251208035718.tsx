// components/AddToCartBtn.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

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

  const currentVariant = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants]);

  const finalPrice = useMemo(() => {
    if (currentVariant?.priceAdjustment) {
      return product.price + currentVariant.priceAdjustment;
    }
    return product.price;
  }, [currentVariant, product.price]);

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      alert("Size đã hết hàng hoặc không hợp lệ.");
      return;
    }

    const itemDetails = {
      productId: product.id,
      name: product.name,
      price: finalPrice,
      sizeValue: currentVariant.sizeValue,
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity,
      variantId: currentVariant.id,
    };

    addToCart(itemDetails);
  };

  if (variants.length === 0) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Sản phẩm chưa có cấu hình size/tồn kho.</div>;
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-2">Chọn Kích thước:</h4>

      <div className="flex space-x-2 mb-4">
        {variants.map(v => {
          const isDisabled = v.stock <= 0;
          return (
            <button
              key={v.sizeValue}
              onClick={() => setSelectedSize(v.sizeValue)}
              disabled={isDisabled}
              className={`px-4 py-2 border rounded-md transition-colors
                ${selectedSize === v.sizeValue ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {v.sizeValue} {v.stock > 0 && <span className="text-xs ml-1">({v.stock})</span>}
            </button>
          );
        })}
      </div>

      <p className="text-xl font-semibold mb-4 text-red-600">
        Giá: {finalPrice.toLocaleString("vi-VN")} VNĐ
      </p>

      <button
        onClick={handleAddToCart}
        disabled={!currentVariant || currentVariant?.stock <= 0}
        className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition active:scale-95 shadow-lg"
      >
        {
          currentVariant?.stock > 0
            ? 'THÊM VÀO GIỎ NGAY 🛒'
            : 'Đã hết hàng'
        }
      </button>
    </div>
  );
}
