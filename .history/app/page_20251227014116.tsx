"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// 1. Cập nhật Interface để nhận thêm salePrice từ Backend
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null; // Thêm trường này
  images: string[];
}

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
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (priceRange.min !== null) params.append("minPrice", priceRange.min.toString());
      if (priceRange.max !== null) params.append("maxPrice", priceRange.max.toString());
      if (searchQuery) params.append("q", searchQuery);

      const url = `http://localhost:3001/products?${params.toString()}`;
      
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [categoryId, priceRange, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-100 relative overflow-hidden text-gray-900">
      {/* 1. Hero Section */}
      <section className="h-[500px] w-full relative flex items-center justify-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-red-600/40"></div>
        <h1 className="relative z-10 text-5xl font-extrabold tracking-wide">4FOOTBALL</h1>
      </section>

      {/* 2. Thanh Công cụ */}
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-4 mt-10 mb-8 px-4">
        {/* Lọc Category */}
        <div className={`relative w-full md:w-64 transition-opacity ${isSearchOpen ? 'md:opacity-50' : ''}`}>
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

        {/* Lọc Giá */}
        <div className={`relative w-full md:w-64 transition-opacity ${isSearchOpen ? 'md:opacity-50' : ''}`}>
          <select
            onChange={(e) => {
              const range = PRICE_RANGES[Number(e.target.value)];
              setPriceRange({ min: range.min, max: range.max });
            }}
            className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={index} value={index}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Thanh Tìm kiếm */}
        <div className="relative flex items-center">
          <div className={`flex items-center bg-white border border-gray-300 rounded-lg shadow transition-all duration-500 overflow-hidden ${isSearchOpen ? 'w-full md:w-80 px-3' : 'w-12 h-12 justify-center'}`}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-500 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Tìm tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent border-none focus:ring-0 text-gray-700 w-full ml-2 transition-all ${isSearchOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
            />
            {isSearchOpen && (
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Danh sách sản phẩm */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 pb-20">
        {products.length > 0 ? (
          products.map((product) => {
            // Kiểm tra xem sản phẩm có đang giảm giá không
            const isSale = product.salePrice && product.salePrice < product.price;

            return (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-red-500 group relative overflow-hidden">
                  
                  {/* BADGE RED SALE TRÊN GÓC ẢNH */}
                  {isSale && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black px-3 py-1 rounded-bl-xl z-20 shadow-md animate-pulse">
                      SALE
                    </div>
                  )}

                  <div className="h-64 rounded-lg mb-4 overflow-hidden bg-gray-50 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
                    )}
                  </div>

                  <h2 className="text-lg font-bold mb-1 uppercase line-clamp-1 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h2>

                  {/* HIỂN THỊ GIÁ CÓ LOGIC SALE */}
                  <div className="flex flex-col h-14 justify-center">
                    {isSale ? (
                      <div className="flex flex-col">
                        <p className="text-red-600 font-black text-xl leading-none">
                          {Number(product.salePrice).toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-gray-400 line-through text-sm font-medium mt-1">
                          {Number(product.price).toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    ) : (
                      <p className="text-blue-900 font-black text-xl">
                        {Number(product.price).toLocaleString("vi-VN")} VNĐ
                      </p>
                    )}
                  </div>

                  <button className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg font-black hover:bg-red-600 transition-all transform active:scale-95 shadow-md">
                    XEM CHI TIẾT
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-400 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
      </div>
    </main>
  );
}