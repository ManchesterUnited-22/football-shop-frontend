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
      alert(isAccessory ? "Sản phẩm tạm hết hàng." : "Vui lòng chọn size còn hàng.");
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
    <div className="mt-8 space-y-8">
      {/* Chọn Size */}
      {!isAccessory && uniqueSizes.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-300 mb-4 uppercase tracking-wider">
            Chọn kích thước
          </h4>
          <div className="flex flex-wrap gap-4">
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
                  className={`w-14 h-14 rounded-xl font-bold text-lg transition-all duration-300 shadow-md border-2
                    ${selectedSize === sizeValue 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/40' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-emerald-500 hover:bg-gray-700/70'
                    }
                    ${disabled ? 'opacity-40 cursor-not-allowed border-gray-600' : 'cursor-pointer'}
                  `}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Số lượng + Stock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="text-lg font-bold text-gray-300 uppercase tracking-wider">Số lượng</span>
          <div className="flex items-center bg-gray-800/70 rounded-xl p-2 shadow-inner border border-gray-700">
            <button
              onClick={() => handleQuantityChange('decrement')}
              disabled={quantity <= 1}
              className="p-2.5 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Minus size={18} className="text-gray-300" />
            </button>
            <span className="w-14 text-center text-xl font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange('increment')}
              disabled={quantity >= stock}
              className="p-2.5 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Plus size={18} className="text-gray-300" />
            </button>
          </div>
        </div>

        {currentVariant && (
          <span className={`text-base font-bold ${stock > 5 ? 'text-emerald-400' : stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            Còn {stock} sản phẩm
          </span>
        )}
      </div>

      {/* Giá tạm tính - Chữ vừa phải, cân đối */}
      <div className="p-5 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">
          Giá tạm tính ({quantity} sản phẩm)
        </p>
        <div className="flex items-end gap-4">
          <span className={`text-3xl font-black ${isOnSale ? 'text-red-500' : 'text-emerald-400'}`}>
            {(displayPrice * quantity).toLocaleString('vi-VN')}₫
          </span>
          {isOnSale && originalPrice > displayPrice && (
            <span className="text-xl text-gray-500 line-through">
              {(originalPrice * quantity).toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <button
        onClick={handleAddToCart}
        disabled={isBuyDisabled}
        className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-3
          ${isBuyDisabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-emerald-600/60 hover:-translate-y-1 active:scale-98'
          }
        `}
      >
        <ShoppingCart size={28} />
        {isBuyDisabled
          ? (stock <= 0 ? 'Hết hàng' : 'Chọn size')
          : 'Thêm vào giỏ hàng'}
      </button>
    </div>
  );
}