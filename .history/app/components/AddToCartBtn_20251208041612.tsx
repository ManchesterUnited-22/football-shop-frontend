// components/AddToCartBtn.tsx

'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 

// ===============================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU KHỚP VỚI BACKEND
// ⭐️ BỊ THIẾU HOẶC BỊ XÓA - PHẢI THÊM LẠI ⭐️
// ===============================================
interface Variant {
    id: number;
    sizeValue: string; 
    calculatedPrice?: number; // Thêm trường này nếu bạn dùng logic tính giá ở Backend
    stock: number; 
    priceAdjustment?: number; 
}

interface Product {
    id: number;
    name: string;
    price: number; 
    images: string[]; 
    // Thêm các trường khác nếu cần thiết
}

// ===============================================
// COMPONENT ADD TO CART
// ===============================================
// ... (Phần code còn lại của component)