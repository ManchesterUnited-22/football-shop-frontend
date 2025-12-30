'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 
import { Minus, Plus } from 'lucide-react'; 

interface Variant {
  id: number;
  sizeValue: string; 
  stock: number; 
  // Các trường mới từ Backend
  originalVariantPrice: number; // Giá gốc của size này
  calculatedPrice: number;      // Giá sau khi đã tính Sale
  isSale: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number; // Giá cơ bản
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

  // Logic giá mới: Ưu tiên dùng calculatedPrice từ Backend
  const displayPrice = currentVariant ? currentVariant.calculatedPrice : product.price;
  const originalPrice = currentVariant ? currentVariant.originalVariantPrice : product.price;

  const handleQuantityChange = (type: 'increment' | 'decrement' | 'manual', value?: number) => {
    const maxStock = currentVariant?.stock ?? 1;
    setQuantity(prev => {
      let newQuantity = prev;
      if (type === 'increment') newQuantity = prev + 1;
      else if (type === 'decrement') newQuantity = prev - 1;
      else if (type === 'manual' && value !== undefined) newQuantity = value;
      
      newQuantity = Math.min(newQuantity, maxStock);
      return Math.max(1, newQuantity);
    });
  };

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
        alert(isAccessory ? "Sản phẩm đã hết hàng." : "Vui lòng chọn Size còn hàng.");
        return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice, // Giá đã tính sale + size
      sizeValue: currentVariant.sizeValue,
      imageUrl: product.images?.[0] || '/placeholder.jpg',
      quantity: quantity,
      variantId: currentVariant.id,
    });
  };

  const isBuyButtonDisabled = !currentVariant || currentVariant.stock <= 0;
  const maxStock = currentVariant?.stock ?? 1;

  return (
    <div className="mt-6 border-t pt-6">
      {!isAccessory && (
        <>
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Chọn Kích thước:</h4>
          <div className="flex flex-wrap gap-3 mb-6">
            {uniqueSizes.map(sizeValue => {
              const v = variants.find(v => v.sizeValue === sizeValue);
              const isDisabled = !v || v.stock <= 0; 
              return (
                <button
                  key={sizeValue}
                  onClick={() => {
                    setSelectedSize(sizeValue);
                    setQuantity(1); // Reset số lượng khi đổi size
                  }}
                  disabled={isDisabled} 
                  className={`w-14 h-14 flex items-center justify-center border rounded-xl font-bold transition-all
                    ${selectedSize === sizeValue ? 'bg-black text-white scale-110 shadow-md' : 'bg-white text-black hover:border-black'}
                    ${isDisabled ? 'opacity-30 cursor-not-allowed bg-gray-100' : ''}`}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </>
      )}
      
      {/* KHỐI SỐ LƯỢNG */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="flex items-center border-2 border-gray-200 rounded-xl p-1">
          <button
            onClick={() => handleQuantityChange('decrement')}
            disabled={quantity <= 1}
            className="p-2 hover:bg-gray-100 disabled:opacity-30"
          >
            <Minus size={18} />
          </button>
          <input
            type="number"
            value={quantity}
            readOnly
            className="w-10 text-center font-bold text-lg bg-transparent"
          />
          <button
            onClick={() => handleQuantityChange('increment')}
            disabled={quantity >= maxStock}
            className="p-2 hover:bg-gray-100 disabled:opacity-30"
          >
            <Plus size={18} />
          </button>
        </div>
        {currentVariant && (
          <span className="text-sm text-gray-500 font-medium">
            {currentVariant.stock > 0 ? `Kho: ${currentVariant.stock}` : 'Hết hàng'}
          </span>
        )}
      </div>
      
      {/* HIỂN THỊ GIÁ DỰA TRÊN SIZE ĐANG CHỌN */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500 mb-1 font-medium">Giá tạm tính:</p>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-red-600">
            {displayPrice.toLocaleString("vi-VN")}đ
          </span>
          {currentVariant?.isSale && (
            <span className="text-lg text-gray-400 line-through">
              {originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isBuyButtonDisabled} 
        className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-[0.98] shadow-xl
          ${isBuyButtonDisabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200'}`}
      >
        {!currentVariant ? 'VUI LÒNG CHỌN SIZE' : 
         currentVariant.stock <= 0 ? 'ĐÃ HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
      </button>
    </div>
  );
}