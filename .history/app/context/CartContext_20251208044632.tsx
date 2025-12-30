// src/context/CartContext.tsx

'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// ===============================================
// ĐỊNH NGHĨA INTERFACE CHI TIẾT SẢN PHẨM CẦN THÊM VÀO GIỎ
// ===============================================
type CartItemDetails = {
    productId: number;
    name: string;
    price: number; 
    sizeValue: string; 
    imageUrl: string; 
    quantity: number; 
};

// ===============================================
// ĐỊNH NGHĨA CART ITEM LƯU TRONG STATE
// ===============================================
type CartItem = {
    // ID duy nhất cho mỗi DÒNG item trong giỏ (Dùng Date.now() khi tạo mới)
    id: number; 
    productId: number;
    name: string;
    price: number;
    sizeValue: string; 
    imageUrl: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (itemDetails: CartItemDetails) => void; 
    removeFromCart: (productId: number) => void; 
    updateQuantity: (itemId: number, newQuantity: number) => void;
    
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    // Khởi tạo state với mảng rỗng
    const [items, setItems] = useState<CartItem[]>([]); 

    const addToCart = (itemDetails: CartItemDetails) => { 
        
        // 1. TÌM KIẾM: Item có cùng ID sản phẩm VÀ cùng Size (để đảm bảo tính duy nhất)
        const existingItemIndex = items.findIndex(
            (item) => item.productId === itemDetails.productId && item.sizeValue === itemDetails.sizeValue
        );

        // Tạo bản sao của mảng hiện tại để thay đổi
        let newItems: CartItem[] = [...items]; 

        if (existingItemIndex > -1) {
            // 2. NẾU TÌM THẤY: Tăng số lượng (quantity)
            const existingItem = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
                ...existingItem,
                // Tăng số lượng của item đã có trong giỏ
                quantity: existingItem.quantity + itemDetails.quantity, 
            };
        } else {
            // 3. NẾU KHÔNG TÌM THẤY: Thêm item mới hoàn toàn
            const newItem: CartItem = { 
                // ID duy nhất cho dòng giỏ hàng mới
                id: Date.now(), 
                productId: itemDetails.productId,
                name: itemDetails.name,
                price: itemDetails.price,
                sizeValue: itemDetails.sizeValue,
                imageUrl: itemDetails.imageUrl,
                quantity: itemDetails.quantity,
            };
            newItems.push(newItem);
        }

        // 4. CẬP NHẬT STATE: Gọi setState để kích hoạt re-render
        setItems(newItems); 
        
        // 5. THÔNG BÁO: Chỉ sử dụng itemDetails (đối tượng đơn lẻ) cho alert
        alert(`✅ Đã thêm/Cập nhật thành công: ${itemDetails.name} (Size ${itemDetails.sizeValue})`);
    };

    const removeFromCart = (productId: number) => {
        // Tùy thuộc vào logic của bạn: 
        // Nếu muốn xóa theo ProductId:
        const newItems = items.filter(item => item.productId !== productId);
        // Nếu muốn xóa theo CartItem.id (chuẩn hơn cho từng dòng):
        // const newItems = items.filter(item => item.id !== itemId);

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