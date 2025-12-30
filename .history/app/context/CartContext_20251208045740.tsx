// src/context/CartContext.tsx (ĐÃ CẬP NHẬT)

'use client';
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// ===============================================
// ĐỊNH NGHĨA INTERFACE VÀ TYPES
// ===============================================
type CartItemDetails = {
    productId: number;
    variantId?: number; 
    name: string;
    price: number; 
    sizeValue: string; 
    imageUrl: string; 
    quantity: number; 
};

// ⭐️ Đã thêm export để các file khác có thể import và sử dụng type này (fix lỗi 7006) ⭐️
export type CartItem = {
    id: number; // ID duy nhất cho mỗi DÒNG item trong giỏ
    productId: number;
    variantId?: number;
    name: string;
    price: number;
    sizeValue: string; 
    imageUrl: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (itemDetails: CartItemDetails) => void; 
    removeFromCart: (itemId: number) => void; 
    updateQuantity: (itemId: number, newQuantity: number) => void; 
    clearCart: () => void; 
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]); 

    const addToCart = (itemDetails: CartItemDetails) => { 
        const existingItemIndex = items.findIndex(
            (item) => item.productId === itemDetails.productId && item.sizeValue === itemDetails.sizeValue
        );

        let newItems: CartItem[] = [...items]; 

        if (existingItemIndex > -1) {
            const existingItem = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
                ...existingItem,
                quantity: existingItem.quantity + itemDetails.quantity, 
            };
        } else {
            const newItem: CartItem = { 
                id: Date.now(), 
                productId: itemDetails.productId,
                variantId: itemDetails.variantId,
                name: itemDetails.name,
                price: itemDetails.price,
                sizeValue: itemDetails.sizeValue,
                imageUrl: itemDetails.imageUrl,
                quantity: itemDetails.quantity,
            };
            newItems.push(newItem);
        }

        setItems(newItems); 
    };

    const updateQuantity = (itemId: number, newQuantity: number) => {
        setItems(prevItems => prevItems.map(item => 
            item.id === itemId
                ? { ...item, quantity: newQuantity >= 1 ? newQuantity : 1 }
                : item
        ));
    };

    const removeFromCart = (itemId: number) => {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
    };

    // ⭐️ HÀM MỚI: Xóa sạch giỏ hàng ⭐️
    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart phải dùng trong CartProvider');
    
    // Tính tổng số lượng
    // TypeScript tự suy luận total là number vì giá trị khởi tạo là 0, nhưng bạn có thể thêm type:
    const cartCount = context.items.reduce((total: number, item) => total + item.quantity, 0);

    // ⭐️ FIX LỖI TÍNH TỔNG TIỀN: Thêm logic tính tổng giá trị * số lượng ⭐️
    const cartTotalAmount = context.items.reduce((total: number, item) => {
        return total + (item.price * item.quantity); 
    }, 0); 

    // Trả về đối tượng mở rộng (chứa cartCount, cartTotalAmount và đổi tên items)
    return { 
        ...context, 
        cartCount, 
        cartTotalAmount, // ⭐️ Đã thêm Tổng tiền ⭐️
        cartItems: context.items 
    };
}