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
  // Chúng ta cần categoryId ở đây để hiển thị thông báo chính xác
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
  isAccessory = false, // Mặc định là false
  defaultVariantId, // ID biến thể mặc định cho Phụ kiện
}: AddToCartProps) {
  const { addToCart } = useCart();
  
  // Đối với Phụ kiện, chúng ta KHÔNG cần state selectedSize
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); 

  // ⭐ Dùng useEffect để tự động chọn size mặc định nếu là phụ kiện ⭐
  useEffect(() => {
    if (isAccessory && variants.length > 0) {
        // Tự động set sizeValue của biến thể mặc định (ví dụ: 'ONESIZE')
        setSelectedSize(variants[0].sizeValue);
    } else {
        // Reset nếu chuyển sang sản phẩm khác
        setSelectedSize(null);
    }
  }, [isAccessory, variants]);
  
  // Danh sách size duy nhất (Chỉ dùng cho Áo/Giày)
  const uniqueSizes = useMemo(() => {
    if (isAccessory) return []; // Bỏ qua nếu là phụ kiện
    const sizes = variants.map(v => v.sizeValue).filter(size => size && size.length > 0);
    return Array.from(new Set(sizes));
  }, [variants, isAccessory]);
  
  // ⭐ LOGIC CẬP NHẬT: Ưu tiên Biến thể mặc định nếu là Phụ kiện ⭐
  const currentVariant: Variant | null = useMemo(() => {
    if (isAccessory && defaultVariantId) {
        // Nếu là Phụ kiện, trả về biến thể có ID mặc định
        return variants.find(v => v.id === defaultVariantId) || null;
    }
    
    // Logic cũ: Tìm theo size đã chọn
    if (!selectedSize) return null;
    return variants.find(v => v.sizeValue === selectedSize) || null;
    
  }, [selectedSize, variants, isAccessory, defaultVariantId]);

  // Giá hiển thị (Giữ nguyên)
  const displayPrice = useMemo(() => {
    // ... (Logic tính giá giữ nguyên)
    if (currentVariant?.calculatedPrice !== undefined) {
      return currentVariant.calculatedPrice;
    }
    if (currentVariant?.priceAdjustment) {
      return product.price + currentVariant.priceAdjustment;
    }
    return product.price;
  }, [currentVariant, product.price]);

  // Xử lý thay đổi số lượng (Giữ nguyên)
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
      // Kiểm tra tồn kho trước khi tăng (ngăn không cho tăng quá tồn kho)
      const maxStock = currentVariant?.stock ?? Infinity;
      newQuantity = Math.min(newQuantity, maxStock);
      
      return Math.max(1, newQuantity);
    });
  };

  // Thêm vào giỏ hàng (Giữ nguyên, nhưng currentVariant giờ đã được xác định cho Phụ kiện)
  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
        // Thông báo chi tiết hơn cho Phụ kiện
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

  // Trạng thái nút mua hàng
  const isSelectedVariantInStock = currentVariant && currentVariant.stock > 0;
  const isBuyButtonDisabled = !currentVariant || (currentVariant?.stock ?? 0) <= 0;
  
  // ⭐ LOGIC HIỂN THỊ CẬP NHẬT ⭐
  if (variants.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
        Sản phẩm chưa có cấu hình (variants) trong cơ sở dữ liệu.
      </div>
    );
  }
    
  const maxStock = currentVariant?.stock ?? 1;


  return (
    <div className="mt-6">
      
        {/* ẨN BỘ CHỌN SIZE NẾU LÀ PHỤ KIỆN */}
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
                              className={`w-12 h-12 flex items-center justify-center border rounded-full font-semibold transition-colors
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
             max={maxStock} // Giới hạn input theo tồn kho
          />
          
          {/* Nút Tăng */}
          <button
            onClick={() => handleQuantityChange('increment')}
            disabled={quantity >= maxStock} // Ngăn không cho tăng quá tồn kho
            className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
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
          !isSelectedVariantInStock ? (isAccessory ? 'ĐÃ HẾT HÀNG' : 'SIZE NÀY ĐÃ HẾT HÀNG') : // Thông báo cụ thể hơn
          'THÊM VÀO GIỎ HÀNG 🛒'
        }
      </button>
    </div>
  );
}