'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface Variant {
  id: number;
  sizeValue: string;
  stock: number;
  originalVariantPrice: number;
  calculatedPrice: number;
  isSale: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  categoryId?: number;
}

interface AddToCartProps {
  product: Product;
  variants: Variant[];
  isAccessory?: boolean;
}

export default function AddToCartBtn({
  product,
  variants,
  isAccessory = false,
}: AddToCartProps) {
  const { addToCart } = useCart();

  // Với phụ kiện: tự động chọn variant đầu tiên (nếu có)
  const initialSize = isAccessory && variants.length > 0 ? variants[0].sizeValue : null;
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize);
  const [quantity, setQuantity] = useState(1);

  // Danh sách size duy nhất (chỉ áp dụng cho giày/áo, không phải phụ kiện)
  const uniqueSizes = useMemo(() => {
    if (isAccessory) return [];
    const sizes = variants.map(v => v.sizeValue).filter(Boolean);
    return Array.from(new Set(sizes));
  }, [variants, isAccessory]);

  // Variant hiện tại dựa trên size đã chọn
  const currentVariant = useMemo(() => {
    if (isAccessory && variants.length > 0) return variants[0];
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants, isAccessory]);

  // Giá và thông tin hiển thị
  const displayPrice = currentVariant ? currentVariant.calculatedPrice : product.price;
  const originalPrice = currentVariant ? currentVariant.originalVariantPrice : product.price;
  const isOnSale = currentVariant?.isSale ?? false;
  const stock = currentVariant?.stock ?? 0;

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    setQuantity(prev => {
      let newQty = prev;
      if (type === 'increment') newQty += 1;
      if (type === 'decrement' && prev > 1) newQty -= 1;
      return Math.max(1, Math.min(newQty, stock || 999));
    });
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!isAccessory && !currentVariant) {
      alert('Vui lòng chọn kích thước phù hợp');
      return;
    }
    if (stock <= 0) {
      alert('Sản phẩm hiện đã hết hàng');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      sizeValue: currentVariant?.sizeValue || 'Únic',
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity,
      variantId: currentVariant?.id || product.id,
    });

    // Feedback nhẹ: reset số lượng sau khi thêm thành công
    setQuantity(1);
  };

  // Điều kiện nút bị disable
  const isBuyDisabled = (!isAccessory && !currentVariant) || stock <= 0;

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* === CHỌN KÍCH THƯỚC (chỉ hiển thị nếu không phải phụ kiện) === */}
      {!isAccessory && uniqueSizes.length > 0 && (
        <div>
          <h4 className="text-lg font-black text-white uppercase tracking-widest mb-5">
            Chọn kích thước
          </h4>
          <div className="flex flex-wrap gap-4">
            {uniqueSizes.map(size => {
              const variant = variants.find(v => v.sizeValue === size);
              const isOutOfStock = !variant || variant.stock <= 0;

              return (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  disabled={isOutOfStock}
                  className={`w-16 h-16 rounded-xl font-bold text-lg transition-all duration-300 border-2 shadow-md
                    ${selectedSize === size
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-400 shadow-emerald-500/40 scale-105'
                      : 'bg-slate-800/70 text-gray-300 border-slate-700 hover:border-emerald-500 hover:bg-slate-700/80'
                    }
                    ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* === SỐ LƯỢNG & TỒN KHO === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="text-lg font-black text-white uppercase tracking-wider">
            Số lượng
          </span>
          <div className="flex items-center bg-slate-800/70 rounded-xl p-2 border border-slate-700 shadow-inner">
            <button
              onClick={() => handleQuantityChange('decrement')}
              disabled={quantity <= 1}
              className="p-3 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
            >
              <Minus size={24} className="text-gray-300" />
            </button>
            <span className="w-20 text-center text-3xl font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange('increment')}
              disabled={quantity >= stock}
              className="p-3 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
            >
              <Plus size={24} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Hiển thị tồn kho */}
        {stock > 0 && stock < Infinity && (
          <span className={`text-lg font-bold ${stock > 10 ? 'text-emerald-400' : stock > 3 ? 'text-amber-400' : 'text-red-400'}`}>
            Còn {stock} sản phẩm
          </span>
        )}
      </div>

      {/* === GIÁ TẠM TÍNH === */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700">
        <p className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-3">
          Giá tạm tính ({quantity} sản phẩm)
        </p>
        <div className="flex items-end gap-5">
          <span className={`text-4xl font-black ${isOnSale ? 'text-red-400' : 'text-emerald-400'}`}>
            {(displayPrice * quantity).toLocaleString('vi-VN')}₫
          </span>
          {isOnSale && originalPrice > displayPrice && (
            <span className="text-xl text-gray-500 line-through pb-1">
              {(originalPrice * quantity).toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>

      {/* === NÚT THÊM VÀO GIỎ HÀNG === */}
      <button
        onClick={handleAddToCart}
        disabled={isBuyDisabled}
        className={`w-full py-5 rounded-xl font-black text-xl uppercase tracking-wider flex items-center justify-center gap-4 transition-all duration-300 shadow-xl
          ${isBuyDisabled
            ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-emerald-600/50 hover:shadow-emerald-600/80 hover:-translate-y-1 active:scale-98'
          }
        `}
      >
        <ShoppingCart size={32} />
        {isBuyDisabled
          ? stock <= 0
            ? 'Hết hàng'
            : 'Chọn kích thước'
          : 'Thêm vào giỏ hàng'}
      </button>
    </div>
  );
}