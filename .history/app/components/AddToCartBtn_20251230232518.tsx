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

  const initialSize = isAccessory && variants.length > 0 ? variants[0].sizeValue : null;
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize);
  const [quantity, setQuantity] = useState(1);

  const uniqueSizes = useMemo(() => {
    if (isAccessory) return [];
    const sizes = variants.map(v => v.sizeValue).filter(Boolean);
    return Array.from(new Set(sizes));
  }, [variants, isAccessory]);

  const currentVariant = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants]);

  const displayPrice = currentVariant ? currentVariant.calculatedPrice : product.price;
  const originalPrice = currentVariant ? currentVariant.originalVariantPrice : product.price;
  const isOnSale = currentVariant?.isSale;
  const stock = currentVariant?.stock ?? 0;

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    setQuantity(prev => {
      let newQty = prev;
      if (type === 'increment') newQty += 1;
      if (type === 'decrement') newQty -= 1;
      return Math.max(1, Math.min(newQty, stock));
    });
  };

  const handleAddToCart = () => {
    if (!currentVariant || stock <= 0) {
      alert(isAccessory ? 'Sản phẩm tạm hết hàng.' : 'Vui lòng chọn size còn hàng.');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      sizeValue: currentVariant.sizeValue,
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity,
      variantId: currentVariant.id,
    });
  };

  const isBuyDisabled = !currentVariant || stock <= 0;

  return (
    <div className="mt-10 space-y-10">
      {/* Chọn Kích Thước */}
      {!isAccessory && uniqueSizes.length > 0 && (
        <div>
          <h4 className="text-xl font-extrabold text-white mb-6 uppercase tracking-wider">
            Chọn kích thước
          </h4>
          <div className="flex flex-wrap gap-5">
            {uniqueSizes.map(sizeValue => {
              const variant = variants.find(v => v.sizeValue === sizeValue);
              const disabled = !variant || variant.stock <= 0;

              return (
                <button
                  key={sizeValue}
                  onClick={() => {
                    setSelectedSize(sizeValue);
                    setQuantity(1);
                  }}
                  disabled={disabled}
                  className={`w-20 h-20 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg border
                    ${selectedSize === sizeValue
                      ? 'bg-gradient-to-br from-green-500 to-green-700 text-white border-green-400 shadow-green-500/50 scale-105'
                      : 'bg-neutral-800 text-gray-300 border-neutral-700 hover:border-green-500 hover:bg-neutral-700 hover:shadow-green-500/30'}
                    ${disabled ? 'opacity-40 cursor-not-allowed border-neutral-600' : 'cursor-pointer'}
                  `}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Số lượng & Tồn kho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold text-white uppercase tracking-wider">Số lượng</span>
          <div className="flex items-center bg-neutral-800 rounded-2xl p-3 shadow-lg border border-neutral-700">
            <button
              onClick={() => handleQuantityChange('decrement')}
              disabled={quantity <= 1}
              className="p-4 rounded-xl hover:bg-neutral-700 transition disabled:opacity-50"
            >
              <Minus size={28} className="text-gray-300" />
            </button>
            <span className="w-24 text-center text-4xl font-extrabold text-white">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange('increment')}
              disabled={quantity >= stock}
              className="p-4 rounded-xl hover:bg-neutral-700 transition disabled:opacity-50"
            >
              <Plus size={28} className="text-gray-300" />
            </button>
          </div>
        </div>

        {currentVariant && (
          <span className={`text-2xl font-bold ${stock > 10 ? 'text-lime-400' : stock > 0 ? 'text-amber-400' : 'text-red-500'}`}>
            Còn {stock} sản phẩm
          </span>
        )}
      </div>

      {/* Giá tạm tính */}
      <div className="p-8 bg-neutral-900 backdrop-blur-xl rounded-3xl border border-neutral-700 shadow-xl">
        <p className="text-gray-400 text-lg uppercase font-bold tracking-wider mb-4">
          Giá tạm tính ({quantity} sản phẩm)
        </p>
        <div className="flex items-end gap-8">
          <span className={`text-5xl lg:text-6xl font-extrabold ${isOnSale ? 'text-red-500' : 'text-green-400'}`}>
            {(displayPrice * quantity).toLocaleString('vi-VN')}₫
          </span>
          {isOnSale && originalPrice > displayPrice && (
            <span className="text-3xl text-gray-500 line-through mb-2">
              {(originalPrice * quantity).toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <button
        onClick={handleAddToCart}
        disabled={isBuyDisabled}
        className={`w-full py-6 rounded-2xl font-extrabold text-2xl uppercase tracking-wide transition-all duration-500 flex items-center justify-center gap-4 shadow-lg
          ${isBuyDisabled
            ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-green-600/70 hover:-translate-y-1 active:scale-95'}
        `}
      >
        <ShoppingCart size={40} />
        {isBuyDisabled
          ? (stock <= 0 ? 'Hết hàng' : 'Chọn size')
          : 'Thêm vào giỏ hàng'}
      </button>
    </div>
  );
}
