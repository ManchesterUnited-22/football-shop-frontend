"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number; // Chuyển thành number vì DB là Float
  images: string[];
}

// Định nghĩa các khoảng giá để lọc
const PRICE_RANGES = [
  { label: "💰 Tất cả mức giá", min: null, max: null },
  { label: "Dưới 200.000 VNĐ", min: 0, max: 200000 },
  { label: "200.000 - 500.000 VNĐ", min: 200000, max: 500000 },
  { label: "500.000 - 1.000.000 VNĐ", min: 500000, max: 1000000 },
  { label: "Trên 1.000.000 VNĐ", min: 1000000, max: 10000000 },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  
  // ✅ Thêm State cho giá
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });

  useEffect(() => {
    async function fetchProducts() {
      // ✅ Sử dụng URLSearchParams để build query string chuyên nghiệp
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (priceRange.min !== null) params.append("minPrice", priceRange.min.toString());
      if (priceRange.max !== null) params.append("maxPrice", priceRange.max.toString());

      const url = `http://localhost:3001/products?${params.toString()}`;
      
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }
    fetchProducts();
  }, [categoryId, priceRange]); // Chạy lại khi đổi category hoặc giá

  return (
    <main className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Hero video background */}
      <section className="h-[500px] w-full relative flex items-center justify-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-red-600/40"></div>
        <h1 className="relative z-10 text-5xl font-extrabold tracking-wide text-white">4FOOTBALL</h1>
      </section>

      {/* KHU VỰC BỘ LỌC */}
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-4 mt-10 mb-8 px-4">
        
        {/* Lọc theo Loại sản phẩm */}
        <div className="relative w-full md:w-64">
          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Phân loại</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">🛒 Tất cả sản phẩm</option>
            <option value="1">👕 Áo đấu</option>
            <option value="2">👟 Giày bóng đá</option>
            <option value="3">🎒 Phụ kiện</option>
          </select>
        </div>

        {/* ✅ BỘ LỌC THEO GIÁ TIỀN */}
        <div className="relative w-full md:w-64">
          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Khoảng giá</label>
          <select
            onChange={(e) => {
              const range = PRICE_RANGES[Number(e.target.value)];
              setPriceRange({ min: range.min, max: range.max });
            }}
            className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={index} value={index}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 pb-20">
        {products.length > 0 ? (
          products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-red-500">
                <div className="h-64 rounded-lg mb-4 relative overflow-hidden bg-gray-50">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                      No Image
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold mb-1 text-gray-800 uppercase line-clamp-1">{product.name}</h2>
                <p className="text-red-600 font-black text-xl">
                  {Number(product.price).toLocaleString("vi-VN")}đ
                </p>
                <div className="mt-4 w-full bg-black text-white py-2.5 rounded-lg font-bold text-center group-hover:bg-red-600 transition-colors uppercase text-sm">
                  Xem chi tiết
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-inner">
            <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
            <button 
                onClick={() => { setCategoryId(null); setPriceRange({min: null, max: null}); }}
                className="mt-4 text-red-500 font-bold underline"
            >
                Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    </main>
  );
}