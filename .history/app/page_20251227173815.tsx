"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

// --- INTERFACE ---
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  currentPrice: number;
  isSale: boolean;
  discount: number;
  promoEnd: string | null;
  images: string[];
}

const CATEGORIES = [
  { id: 1, title: "Áo quần bóng đá", sub: "Trendy", img: "/categories/ao-quan-bong-da.jpg" },
  { id: 2, title: "Giày", sub: "Unique", img: "/categories/giay-the-thao.jpg" },
  { id: 3, title: "Phụ kiện", sub: "Special", img: "/categories/phu-kien-the-thao.jpg" },
];

const STEP = 50000;
const MIN = 0;
const MAX = 5000000;

// --- COMPONENT CON ---
const TimerSmall = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          h: Math.floor(diff / (1000 * 60 * 60)),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      } else setTimeLeft(null);
    };
    const timer = setInterval(calculate, 1000);
    calculate();
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;
  return (
    <span className="font-mono font-bold text-yellow-300 ml-2">
      {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:
      <span className="text-white animate-pulse">{String(timeLeft.s).padStart(2, '0')}</span>
    </span>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 mt-20 border-t border-white/5">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 text-xl shadow-lg">4F</div>
          <span className="text-white font-black italic tracking-tighter text-xl uppercase">FOOTBALL <span className="text-red-500">STORE</span></span>
        </div>
        <p className="text-sm opacity-70 leading-relaxed">Chuyên đồ đá bóng & phụ kiện thể thao chính hãng.</p>
      </div>
      <div className="md:col-span-2 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Sản phẩm</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#" className="hover:text-blue-400">Áo thi đấu</Link></li>
            <li><Link href="#" className="hover:text-blue-400">Giày bóng đá</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Liên hệ</h3>
          <p className="text-sm opacity-80">HOTLINE: 0327 040 026</p>
        </div>
      </div>
      <div>
        <h3 className="text-white font-black uppercase text-sm tracking-widest italic mb-6">NHẬN ƯU ĐÃI</h3>
        <input type="email" placeholder="Nhập email" className="w-full bg-[#f3f4f6] text-slate-900 py-3 px-6 rounded-full outline-none mb-3" />
        <button className="w-full bg-yellow-400 text-slate-900 py-3 rounded-full font-black uppercase text-xs">Đăng ký</button>
      </div>
    </div>
  </footer>
);

// --- COMPONENT CHÍNH ---
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [values, setValues] = useState<number[]>([MIN, MAX]);

  useEffect(() => {
    async function fetchProducts() {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (searchQuery) params.append("q", searchQuery);
      params.append("minPrice", values[0].toString());
      params.append("maxPrice", values[1].toString());

      const url = `http://localhost:3001/products?${params.toString()}`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    }

    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [categoryId, searchQuery, values]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* Sale Bar */}
      {products.some(p => p.isSale && p.promoEnd) && (
        <div className="w-full bg-red-600 text-white py-2 sticky top-0 z-[100] flex justify-center items-center gap-3 text-sm font-bold uppercase">
          <span>🔥 SIÊU SALE:</span>
          <TimerSmall targetDate={products.find(p => p.isSale)!.promoEnd!} />
        </div>
      )}

      {/* Hero */}
      <section className="h-[400px] relative flex items-center justify-center text-white bg-slate-900">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-black italic uppercase">4FOOTBALL STORE</h1>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              className={`relative h-60 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${categoryId === cat.id ? 'border-yellow-400 scale-95' : 'border-transparent'}`}
            >
              <img src={cat.img} className="w-full h-full object-cover" alt={cat.title} />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold uppercase">{cat.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Search */}
          <div className="flex-[1.5] relative">
            <input
              type="text"
              placeholder="Bạn muốn tìm gì?..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 py-5 px-14 rounded-3xl outline-none focus:border-yellow-400"
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>

          {/* Price Range - ĐÃ SỬA LỖI TYPESCRIPT */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between mb-4">
              <span className="text-[10px] font-black uppercase opacity-40">Lọc giá</span>
              <span className="text-xs font-bold text-yellow-600">{values[0].toLocaleString()}đ - {values[1].toLocaleString()}đ</span>
            </div>
            <div className="px-2">
              <Range
                values={values}
                step={STEP}
                min={MIN}
                max={MAX}
                onChange={(newVals: number[]) => setValues(newVals)} // Thêm : number[]
                renderTrack={({ props, children }: { props: any; children: React.ReactNode }) => ( // Thêm type object
                  <div
                    {...props}
                    className="h-1.5 w-full rounded-full"
                    style={{
                      ...props.style,
                      background: getTrackBackground({ values, colors: ["#f1f5f9", "#facc15", "#f1f5f9"], min: MIN, max: MAX })
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props, isDragged }: { props: any; isDragged: boolean }) => ( // Thêm type object
                  <div
                    {...props}
                    style={{ ...props.style }}
                    className={`h-5 w-5 rounded-full bg-white border-2 border-yellow-400 shadow-sm ${isDragged ? 'scale-125' : ''}`}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <div className="bg-white rounded-3xl p-5 border border-gray-50 flex flex-col h-full hover:shadow-xl transition-all">
              <div className="h-64 rounded-2xl mb-4 overflow-hidden bg-gray-50">
                <img src={product.images[0] || "/no-image.png"} className="w-full h-full object-contain group-hover:scale-105 transition-transform" alt={product.name} />
              </div>
              <h2 className="text-lg font-bold mb-2 uppercase line-clamp-1">{product.name}</h2>
              <div className="mt-auto">
                <p className="text-red-600 font-black text-xl">{Number(product.currentPrice).toLocaleString()} ₫</p>
                {product.isSale && <p className="text-gray-300 line-through text-xs italic">{Number(product.price).toLocaleString()} ₫</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </main>
  );
}