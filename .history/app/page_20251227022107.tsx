"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ==========================================
// 1. INTERFACE
// ==========================================
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

// ==========================================
// 2. COMPONENT ĐỒNG HỒ MINI (Dùng cho thanh Bar)
// ==========================================
const TimerSmall = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60))), // Tính tổng số giờ còn lại
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
    <span className="inline-flex gap-1 font-mono font-black text-yellow-300 ml-2">
      <span>{String(timeLeft.h).padStart(2, '0')}</span>:
      <span>{String(timeLeft.m).padStart(2, '0')}</span>:
      <span className="text-white animate-pulse">{String(timeLeft.s).padStart(2, '0')}</span>
    </span>
  );
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy sản phẩm đầu tiên có khuyến mãi để hiển thị thời gian lên thanh Bar
  const flashSaleProduct = products.find(p => p.isSale && p.promoEnd);

  useEffect(() => {
    async function fetchProducts() {
      const url = `http://localhost:3001/products`; // Thay bằng URL API của bạn
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (e) { console.error(e); }
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      
      {/* --- THANH BAR THÔNG BÁO (TOP PROMO BAR) --- */}
      {flashSaleProduct && (
        <div className="w-full bg-red-600 text-white py-2.5 px-4 sticky top-0 z-[100] shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 md:gap-4 text-[11px] md:text-sm font-bold uppercase tracking-widest">
            <span className="hidden md:inline">🔥 CHƯƠNG TRÌNH SIÊU GIẢM GIÁ ĐANG DIỄN RA!</span>
            <span className="md:hidden">🔥 SIÊU SALE:</span>
            <div className="flex items-center bg-black/20 px-3 py-1 rounded-full border border-white/20">
              <span className="opacity-90">KẾT THÚC SAU:</span>
              <TimerSmall targetDate={flashSaleProduct.promoEnd!} />
            </div>
            <Link href="#shop" className="underline hover:text-yellow-300 transition-colors ml-2 hidden sm:block">
              MUA NGAY →
            </Link>
          </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="h-[400px] w-full relative flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
             <video autoPlay loop muted className="w-full h-full object-cover opacity-40">
                <source src="/FOOTBALL.mp4" type="video/mp4" />
             </video>
        </div>
        <h1 className="relative z-10 text-5xl font-black italic uppercase">4FOOTBALL STORE</h1>
      </section>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      <div id="shop" className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <div className="relative flex flex-col h-full transition-all duration-300">
              
              {/* Ảnh sản phẩm - ĐÃ DỌN DẸP SẠCH SẼ */}
              <div className="h-80 rounded-2xl overflow-hidden bg-gray-50 relative mb-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                
                {/* Badge Sale đỏ tròn - Giữ nguyên vì nó rất đẹp */}
                {product.isSale && (
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white w-12 h-12 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-white transform -rotate-12 group-hover:rotate-0 transition-transform">
                    <span className="text-[9px] leading-none opacity-80 uppercase">Sale</span>
                    <span className="text-sm leading-none">-{product.discount}%</span>
                  </div>
                )}

                <img
                  src={product.images[0] || "/no-image.png"}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thông tin sản phẩm */}
              <h2 className="font-bold text-gray-800 uppercase mb-2 group-hover:text-red-600 transition-colors">{product.name}</h2>
              
              <div className="mt-auto">
                {product.isSale ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-black text-xl">
                      {Number(product.currentPrice).toLocaleString("vi-VN")} VNĐ
                    </span>
                    <span className="text-gray-400 line-through text-xs font-bold">
                      {Number(product.price).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-900 font-black text-xl">
                    {Number(product.price).toLocaleString("vi-VN")} VNĐ
                  </span>
                )}
              </div>

              <button className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-colors shadow-sm">
                XEM CHI TIẾT
              </button>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}