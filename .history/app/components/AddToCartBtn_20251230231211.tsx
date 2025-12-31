'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

// ==================== INTERFACE ====================
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

// Props chính xác để không bị lỗi TypeScript
interface AddToCartProps {
  product: Product;
  variants: Variant[];
  isAccessory?: boolean;
}

// ==================== COMPONENT ====================
export default function AddToCartBtn({
  product,
  variants,
  isAccessory = false,
}: AddToCartProps) {
  const { addToCart } = useCart();

  // Tự động chọn variant đầu tiên nếu là phụ kiện
  const initialSize = isAccessory && variants.length > 0 ? variants[0].sizeValue : null;
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize);
  const [quantity, setQuantity] = useState(1);

  // Lấy danh sách size duy nhất
  const uniqueSizes = useMemo(() => {
    if (isAccessory) return [];
    const sizes = variants.map(v => v.sizeValue).filter(Boolean);
    return Array.from(new Set(sizes));
  }, [variants, isAccessory]);

  // Variant đang được chọn
  const currentVariant = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants]);

  // Giá hiển thị (ưu tiên giá đã tính sale của size)
  const displayPrice = currentVariant ? currentVariant.calculatedPrice : product.price;
  const originalPrice = currentVariant ? currentVariant.originalVariantPrice : product.price;
  const isOnSale = currentVariant?.isSale;
  const stock = currentVariant?.stock ?? 0;

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    setQuantity(prev => {
      let newQty = prev;
      if (type === 'increment') newQty += 1;
      if (type === 'decrement') newQty -= 1;
      return Math.max(1, Math.min(newQty, stock));
    });
  };

  // Thêm vào giỏ hàng
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

    // Optional: bạn có thể thêm toast ở đây sau
    alert('Đã thêm vào giỏ hàng!');
  };

  const isBuyDisabled = !currentVariant || stock <= 0;

  return (
    <div className="mt-8 space-y-7">
      {/* Chọn Size */}
      {!isAccessory && uniqueSizes.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4">
            Chọn kích thước
          </h4>
          <div className="flex flex-wrap gap-3">
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
                  className={`w-14 h-14 rounded-lg font-bold text-lg border-2 transition-all
                    ${selectedSize === sizeValue
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-blue-600'
                    }
                    ${disabled ? 'opacity-40 cursor-not-allowed border-gray-200' : ''}
                  `}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Số lượng + Tồn kho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-800">Số lượng</span>
          <div className="flex items-center border-2 border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange('decrement')}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Minus size={20} />
            </button>
            <span className="w-16 text-center text-xl font-bold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange('increment')}
              disabled={quantity >= stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {currentVariant && (
          <span className={`text-base font-semibold ${stock > 5 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
            Còn {stock} sản phẩm
          </span>
        )}
      </div>

      {/* Giá tạm tính */}
      <div className="p-5 bg-gray-50 rounded-xl border">
        <p className="text-sm font-medium text-gray-600 mb-2">
          Giá tạm tính ({quantity} sản phẩm)
        </p>
        <div className="flex items-end gap-4">
          <span className={`text-3xl font-black ${isOnSale ? 'text-red-600' : 'text-gray-900'}`}>
            {(displayPrice * quantity).toLocaleString('vi-VN')}đ
          </span>
          {isOnSale && originalPrice > displayPrice && (
            <span className="text-xl text-gray-500 line-through">
              {(originalPrice * quantity).toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <button
        onClick={handleAddToCart}
        disabled={isBuyDisabled}
        className={`w-full py-5 rounded-xl font-bold text-xl uppercase tracking-wider transition-all flex items-center justify-center gap-3
          ${isBuyDisabled
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-98'
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