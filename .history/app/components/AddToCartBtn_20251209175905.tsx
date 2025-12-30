// components/AddToCartBtn.tsx (ĐÃ SỬA VÀ THÊM BỘ CHỌN SỐ LƯỢNG)

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 
import { Minus, Plus } from 'lucide-react'; // Cần cài đặt lucide-react (hoặc dùng icon khác)

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
categoryId?: number;
} 

interface AddToCartProps {
    product: Product;
    variants: Variant[];
    // ⭐ PROPS MỚI ⭐
    isAccessory?: boolean; 
    defaultVariantId?: number; 
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
  // ⭐️ SỬA: Thay thế hằng số bằng State có thể thay đổi ⭐️
  const [quantity, setQuantity] = useState(1); 

  // Danh sách size duy nhất
  const uniqueSizes = useMemo(() => {
    const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
    return Array.from(new Set(sizes));
  }, [variants]);
  
  // Variant hiện tại theo size đã chọn
  const currentVariant: Variant | null = useMemo(() => {
    if (!selectedSize) return null;
    // Tìm Variant đầu tiên khớp với Size đã chọn (Giả định không có Color)
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

  // ⭐️ HÀM MỚI: Xử lý thay đổi số lượng ⭐️
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

      // Giới hạn số lượng (ít nhất là 1)
      return Math.max(1, newQuantity);
    });
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      alert("Vui lòng chọn Size còn hàng.");
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
      // ⭐️ TRUYỀN QUANTITY ĐÃ CHỌN ⭐️
      quantity: quantity,
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
      
      {/* ⭐️ KHỐI MỚI: BỘ CHỌN SỐ LƯỢNG ⭐️ */}
      <div className="flex items-center space-x-4 mb-6">
        <h4 className="text-lg font-semibold">Số lượng:</h4>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          {/* Nút Giảm */}
          <button
            onClick={() => handleQuantityChange('decrement')}
            disabled={quantity <= 1}
            className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={18} />
          </button>
          
          {/* Input hiển thị số lượng */}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange('manual', parseInt(e.target.value) || 1)}
            className="w-16 text-center text-lg font-medium border-x border-gray-300 focus:outline-none"
            aria-label="Số lượng sản phẩm"
          />
          
          {/* Nút Tăng */}
          <button
            onClick={() => handleQuantityChange('increment')}
            className="p-3 bg-gray-100 hover:bg-gray-200"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      {/* ⭐️ KẾT THÚC KHỐI SỐ LƯỢNG ⭐️ */}


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