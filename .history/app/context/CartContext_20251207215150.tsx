// src/context/CartContext.tsx

'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// ===============================================
// ĐỊNH NGHĨA INTERFACE CHI TIẾT SẢN PHẨM CẦN THÊM VÀO GIỎ
// ===============================================
type CartItemDetails = {
    productId: number;
    name: string;
    price: number; // Giá đã tính toán (nếu có logic giá động)
    sizeValue: string; // <-- SỬA TỪ 'size' thành 'sizeValue'
    imageUrl: string; // Tên trường ảnh chính xác
    quantity: number; // Thêm số lượng
};

// ===============================================
// ĐỊNH NGHĨA CART ITEM LƯU TRONG STATE
// ===============================================
// Sửa CartItem để khớp với CartItemDetails
type CartItem = {
    id: number; // Giữ nguyên ID, nếu cần ID duy nhất cho mỗi item trong giỏ hàng
    productId: number;
    name: string;
    price: number;
    sizeValue: string; // <-- SỬA TỪ 'size' thành 'sizeValue'
    imageUrl: string;
    quantity: number;
};

type CartContextType = {
  items: CartItem[];
  // SỬA ĐỊNH NGHĨA: Chỉ nhận 1 tham số là đối tượng CartItemDetails
  addToCart: (itemDetails: CartItemDetails) => void; 
  removeFromCart: (productId: number) => void; // Thường dùng productId thay vì index
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // SỬA LOGIC THỰC THI: Chỉ nhận 1 tham số
  const addToCart = (itemDetails: CartItemDetails) => { 
    const existingItemIndex = items.findIndex(
        (item) => item.productId === itemDetails.productId && item.sizeValue === itemDetails.sizeValue
    );
    // Thêm logic kiểm tra nếu sản phẩm cùng size đã có trong giỏ, thì tăng quantity lên
let newItems: CartItem[] = [...items];
    const newItem: CartItem = { 
        id: itemDetails.productId, // Tạm thời dùng productId làm ID item trong giỏ
        productId: itemDetails.productId,
        name: itemDetails.name,
        price: itemDetails.price,
        sizeValue: itemDetails.sizeValue,
        imageUrl: itemDetails.imageUrl,
        quantity: itemDetails.quantity,
    };
    
    setItems([...items, newItem]);
    
    alert(`✅ Đã thêm thành công: ${newItem.name} (Size ${newItem.sizeValue})`);
  };

  const removeFromCart = (productId: number) => {
    // Sửa logic để xóa theo productId hoặc VariantId
    const newItems = items.filter(item => item.productId !== productId);
    setItems(newItems);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải dùng trong CartProvider');
  return context;
}