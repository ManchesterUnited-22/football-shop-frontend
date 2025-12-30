'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type CartItemDetails = {
    productId: number;
    variantId?: number; 
    name: string;
    price: number; 
    sizeValue: string; 
    imageUrl: string; 
    quantity: number; 
};

export type CartItem = {
    id: number;
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
    const [isInitialized, setIsInitialized] = useState(false); // Chống lỗi Hydration

    // 1. Tải giỏ hàng từ LocalStorage khi khởi động
    useEffect(() => {
        const savedCart = localStorage.getItem('next-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Lỗi đọc giỏ hàng:", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // 2. Lưu giỏ hàng mỗi khi có thay đổi
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('next-cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (itemDetails: CartItemDetails) => { 
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                (item) => item.variantId === itemDetails.variantId // Dùng variantId để check là chuẩn nhất
            );

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += itemDetails.quantity;
                return newItems;
            }
            
            return [...prevItems, { ...itemDetails, id: Date.now() }];
        });
    };

    const updateQuantity = (itemId: number, newQuantity: number) => {
        setItems(prevItems => prevItems.map(item => 
            item.id === itemId
                ? { ...item, quantity: Math.max(1, newQuantity) }
                : item
        ));
    };

    const removeFromCart = (itemId: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const clearCart = () => setItems([]);

    // Nếu chưa khởi tạo xong từ localStorage thì trả về provider trống để tránh nháy giao diện
    if (!isInitialized) return <CartContext.Provider value={{ items: [], addToCart, removeFromCart, updateQuantity, clearCart }}>{children}</CartContext.Provider>;

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart phải dùng trong CartProvider');
    
    const cartCount = context.items.reduce((total, item) => total + item.quantity, 0);
    const cartTotalAmount = context.items.reduce((total, item) => total + (item.price * item.quantity), 0); 

    return { 
        ...context, 
        cartCount, 
        cartTotalAmount,
        cartItems: context.items 
    };
}