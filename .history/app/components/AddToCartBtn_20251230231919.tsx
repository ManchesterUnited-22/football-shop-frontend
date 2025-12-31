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
          <h4 className="text-xl font-black text-white mb-6 uppercase tracking-wider">
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
                  className={`w-20 h-20 rounded-3xl font-black text-2xl transition-all duration-300 shadow-2xl border-4
                    ${selectedSize === sizeValue
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/60 scale-110'
                      : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:border-emerald-500 hover:bg-gray-700/80 hover:shadow-emerald-500/30'
                    }
                    ${disabled ? 'opacity-30 cursor-not-allowed border-gray-600' : 'cursor-pointer'}
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
          <span className="text-xl font-black text-white uppercase tracking-wider">Số lượng</span>
          <div className="flex items-center bg-gray-800/70 rounded-3xl p-3 shadow-2xl border border-gray-700">
            <button
              onClick={() => handleQuantityChange('decrement')}
              disabled={quantity <= 1}
              className="p-4 rounded-2xl hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Minus size={28} className="text-gray-300" />
            </button>
            <span className="w-24 text-center text-4xl font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange('increment')}
              disabled={quantity >= stock}
              className="p-4 rounded-2xl hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Plus size={28} className="text-gray-300" />
            </button>
          </div>
        </div>

        {currentVariant && (
          <span className={`text-2xl font-black ${stock > 10 ? 'text-emerald-400' : stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            Còn {stock} sản phẩm
          </span>
        )}
      </div>

      {/* Giá tạm tính - Nổi bật nhất */}
      <div className="p-8 bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700 shadow-2xl">
        <p className="text-gray-400 text-lg uppercase font-bold tracking-wider mb-4">
          Giá tạm tính ({quantity} sản phẩm)
        </p>
        <div className="flex items-end gap-8">
          <span className={`text-5xl lg:text-6xl font-black ${isOnSale ? 'text-red-500' : 'text-emerald-400'}`}>
            {(displayPrice * quantity).toLocaleString('vi-VN')}₫
          </span>
          {isOnSale && originalPrice > displayPrice && (
            <span className="text-3xl text-gray-500 line-through mb-2">
              {(originalPrice * quantity).toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng - Siêu mạnh mẽ */}
      <button
        onClick={handleAddToCart}
        disabled={isBuyDisabled}
        className={`w-full py-7 rounded-3xl font-black text-3xl uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-6 shadow-2xl
          ${isBuyDisabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-emerald-600/80 hover:-translate-y-2 active:scale-98'
          }
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