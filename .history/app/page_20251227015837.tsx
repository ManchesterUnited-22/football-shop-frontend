"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// 1. Cập nhật Interface ĐÚNG với Backend trả về
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;        // Giá gốc
  currentPrice: number; // Giá thực tế (sau khi giảm nếu có)
  isSale: boolean;      // Trạng thái đang giảm giá hay không
  discount: number;     // % giảm giá
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
        // Kiểm tra dữ liệu thực tế tại đây nếu cần: console.log(data);
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
    <main className="min-h-screen bg-gray-50 text-slate-900">
      
      <section className="h-[450px] w-full relative flex items-center justify-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase drop-shadow-2xl">
            4FOOTBALL <span className="text-red-500 text-2xl not-italic">STORE</span>
          </h1>
          <p className="mt-2 text-gray-300 font-medium tracking-widest uppercase text-sm">Cháy cùng đam mê sân cỏ</p>
        </div>
      </section>

      {/* --- THANH CÔNG CỤ --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 flex flex-col md:flex-row gap-4">
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 bg-white border border-gray-200 py-3 px-4 rounded-xl shadow-lg font-bold outline-none"
          >
            <option value="">🛒 TẤT CẢ DANH MỤC</option>
            <option value="1">👕 ÁO THI ĐẤU</option>
            <option value="2">👟 GIÀY BÓNG ĐÁ</option>
            <option value="3">🎒 PHỤ KIỆN</option>
          </select>

          <select
            onChange={(e) => {
              const range = PRICE_RANGES[Number(e.target.value)];
              setPriceRange({ min: range.min, max: range.max });
            }}
            className="flex-1 bg-white border border-gray-200 py-3 px-4 rounded-xl shadow-lg font-bold outline-none"
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={index} value={index}>{range.label}</option>
            ))}
          </select>

          <div className="flex-[1.5] relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 py-3 px-11 rounded-xl shadow-lg font-medium outline-none"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
      </div>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 relative border border-gray-100 flex flex-col h-full">
              
              {/* BADGE SALE ĐỎ HÌNH TRÒN (Sử dụng isSale từ Backend) */}
              {product.isSale && (
                <div className="absolute top-2 left-2 z-30 bg-red-600 text-white w-12 h-12 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-white transform -rotate-12 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] leading-none opacity-80 uppercase">Sale</span>
                  <span className="text-sm leading-none">-{product.discount}%</span>
                </div>
              )}

              {/* Ảnh sản phẩm */}
              <div className="h-64 rounded-xl mb-4 overflow-hidden bg-[#f3f4f6] relative">
                <img
                  src={product.images[0] || "/no-image.png"}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Thông tin */}
              <div className="flex flex-col flex-grow">
                <h2 className="text-base font-bold text-gray-800 mb-2 uppercase line-clamp-1 group-hover:text-red-600 transition-colors">
                  {product.name}
                </h2>

                <div className="mt-auto">
                  {product.isSale ? (
                    <div className="flex flex-col">
                      <p className="text-red-600 font-black text-2xl leading-none">
                        {Number(product.currentPrice).toLocaleString("vi-VN")} ₫
                      </p>
                      <p className="text-gray-400 line-through text-xs font-bold mt-1">
                        {Number(product.price).toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-900 font-black text-2xl leading-none">
                      {Number(product.price).toLocaleString("vi-VN")} ₫
                    </p>
                  )}
                </div>

                <button className="mt-4 w-full bg-slate-900 text-white py-2.5 rounded-lg font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}