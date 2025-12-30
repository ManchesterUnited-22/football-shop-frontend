'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext'; 
import { Minus, Plus } from 'lucide-react'; 

interface Variant {
  id: number;
  sizeValue: string; 
  stock: number; 
  priceAdjustment?: number; 
  calculatedPrice?: number; 
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
  defaultVariantId?: number; 
}

export default function AddToCartBtn({
  product,
  variants,
  isAccessory = false,
  defaultVariantId,
}: AddToCartProps) {
  const { addToCart } = useCart();
  const initialSize = isAccessory && variants.length > 0 ? variants[0].sizeValue : null;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); 

  useEffect(() => {
    if (isAccessory && variants.length > 0) {
      setSelectedSize(variants[0].sizeValue);
    } else {
      setSelectedSize(null);
    }
  }, [isAccessory, variants]);
  
  const uniqueSizes = useMemo(() => {
    if (isAccessory) return [];
    const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
    return Array.from(new Set(sizes));
  }, [variants, isAccessory]);
  
  const currentVariant: Variant | null = useMemo(() => {
    if (isAccessory && defaultVariantId) {
      return variants.find(v => v.id === defaultVariantId) || null;
    }
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
  }, [selectedSize, variants, isAccessory, defaultVariantId]);

  const displayPrice = useMemo(() => {
    if (currentVariant?.calculatedPrice !== undefined) {
      return currentVariant.calculatedPrice;
    }
    if (currentVariant?.priceAdjustment) {
      return product.price + currentVariant.priceAdjustment;
    }
    return product.price;
  }, [currentVariant, product.price]);

  const handleQuantityChange = (type: 'increment' | 'decrement' | 'manual', value?: number) => {
    setQuantity(prev => {
      let newQuantity = prev;
      if (type === 'increment') {
        newQuantity = prev + 1;
      } else if (type === 'decrement') {
        newQuantity = prev - 1;
      } else if (type === 'manual' && value !== undefined) {
        newQuantity = value;
      }
      const maxStock = currentVariant?.stock ?? Infinity;
      newQuantity = Math.min(newQuantity, maxStock);
      return Math.max(1, newQuantity);
    });
  };

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      const msg = isAccessory && currentVariant ? "Sản phẩm đã hết hàng." : "Vui lòng chọn Size còn hàng.";
      alert(msg);
      return;
    }
    if (quantity < 1) {
      alert("Số lượng phải lớn hơn 0.");
      return;
    }

    const itemDetails = {
      productId: product.id,
      name: product.name,
      price: displayPrice,
      sizeValue: currentVariant.sizeValue,
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity: quantity,
      variantId: currentVariant.id,
    };

    addToCart(itemDetails);
  };

  const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
  const isBuyButtonDisabled = !currentVariant || (currentVariant?.stock ?? 0) <= 0;
  const maxStock = currentVariant?.stock ?? 1;

  if (variants.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
        Sản phẩm chưa có cấu hình (variants) trong cơ sở dữ liệu.
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!isAccessory && (
        <>
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
                  className={`w-12 h-12 flex items-center justify-center text-center leading-none border rounded-full font-semibold transition-colors
                    ${selectedSize === sizeValue ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </>
      )}
      
      {/* KHỐI SỐ LƯỢNG */}
      <div className="flex items-center space-x-4 mb-6">
        <h4 className="text-lg font-semibold">Số lượng:</h4>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => handleQuantityChange('decrement')}
            disabled={quantity <= 1}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
          </button>
          
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange('manual', parseInt(e.target.value) || 1)}
            className="w-12 text-center text-base font-medium border-x border-gray-300 focus:outline-none"
            aria-label="Số lượng sản phẩm"
            max={maxStock}
          />
          
          <button
            onClick={() => handleQuantityChange('increment')}
            disabled={quantity >= maxStock}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>
        {currentVariant && <p className="text-sm text-gray-500">Còn lại: {currentVariant.stock}</p>}
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
          !isSelectedVariantInStock ? (isAccessory ? 'ĐÃ HẾT HÀNG' : 'SIZE NÀY ĐÃ HẾT HÀNG') : 
          'THÊM VÀO GIỎ HÀNG 🛒'
        }
      </button>
    </div>
  );
}
