"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

// 1. Interface Sản phẩm
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

// 2. Data Cố định
const CATEGORIES = [
  { id: 1, title: "Áo quần bóng đá", sub: "Trendy", img: "/categories/ao-quan-bong-da.jpg" },
  { id: 2, title: "Giày", sub: "Unique", img: "/categories/giay-the-thao.jpg" },
  { id: 3, title: "Phụ kiện", sub: "Special", img: "/categories/phu-kien-the-thao.jpg" },
 
];

const STEP = 50000;
const MIN = 0;
const MAX = 5000000;

// 3. Component đếm ngược nhỏ
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

// 4. Component Footer
const Footer = () => (
  <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 mt-20 border-t border-white/5">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 text-xl shadow-lg">4F</div>
          <span className="text-white font-black italic tracking-tighter text-xl uppercase">FOOTBALL <span className="text-red-500">STORE</span></span>
        </div>
        <p className="text-sm opacity-70 leading-relaxed">Chuyên đồ đá bóng & phụ kiện thể thao chính hãng. Cháy cùng đam mê trên từng nhịp đập sân cỏ.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:col-span-1">
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Sản phẩm</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Áo thi đấu</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Giày bóng đá</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Hỗ trợ</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Đổi trả</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Giao hàng</Link></li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Liên hệ</h3>
        <p className="text-sm opacity-80 mb-2">ADD: 252 Lý Thường Kiệt, Tam Kỳ</p>
        <p className="text-white font-black text-lg">0327 040 026</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-white font-black uppercase text-sm tracking-widest italic">NHẬN ƯU ĐÃI</h3>
        <input type="email" placeholder="Nhập email" className="w-full bg-[#f3f4f6] text-slate-900 py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sm shadow-inner" />
        <button className="w-full bg-[#facc15] hover:bg-yellow-500 text-slate-900 py-3.5 px-6 rounded-full font-black text-xs uppercase transition-all shadow-lg active:scale-95">Đăng ký ngay</button>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center text-[10px] opacity-40 uppercase tracking-[0.4em]">© 2025 4FOOTBALL STORE.</div>
  </footer>
);

// 5. Component CHÍNH
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [values, setValues] = useState([MIN, MAX]); // State cho thanh kéo giá

  // Logic Fetch dữ liệu (Tự động chạy khi thay đổi lọc)
  useEffect(() => {
    async function fetchProducts() {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (searchQuery) params.append("q", searchQuery);
      
      // Gửi giá trị Min - Max từ thanh kéo lên Backend
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

    const timer = setTimeout(fetchProducts, 400); // Debounce để mượt hơn khi kéo
    return () => clearTimeout(timer);
  }, [categoryId, searchQuery, values]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">
      
      {/* Banner Khuyến mãi */}
      {products.some(p => p.isSale && p.promoEnd) && (
        <div className="w-full bg-red-600 text-white py-2 px-4 sticky top-0 z-[100] shadow-md flex justify-center items-center gap-3 text-sm font-bold uppercase">
          <span>🔥 SIÊU SALE ĐANG DIỄN RA:</span>
          <div className="bg-black/20 px-3 py-1 rounded-full border border-white/20">
            <TimerSmall targetDate={products.find(p => p.isSale)!.promoEnd!} />
          </div>
        </div>
      )}

      {/* Hero Video Section */}
      <section className="h-[450px] w-full relative flex items-center justify-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase drop-shadow-2xl">4FOOTBALL STORE</h1>
          <p className="mt-2 text-gray-300 font-medium tracking-widest uppercase text-sm">Cháy cùng đam mê sân cỏ</p>
        </div>
      </section>

      {/* --- CÔNG CỤ LỌC & TÌM KIẾM --- */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        
        {/* 1. Danh mục */}
        <h2 className="text-2xl font-black text-center mb-8 uppercase italic">Danh mục sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              className={`group relative h-64 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-300 ${categoryId === cat.id ? 'border-yellow-400 scale-95 shadow-xl' : 'border-transparent'}`}
            >
              <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 w-full p-4 backdrop-blur-md bg-white/20 border-t border-white/10">
                <h3 className="text-white font-bold text-sm uppercase">{cat.title}</h3>
                <p className="text-white/70 text-[10px] uppercase tracking-widest">{cat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Thanh Tìm kiếm & Lọc giá (HÌNH 2) */}
        <div className="flex flex-col md:flex-row items-stretch gap-8">
          {/* Ô Tìm kiếm */}
          <div className="flex-[1.5] relative">
            <label className="text-[10px] font-black uppercase mb-2 block opacity-40 tracking-widest ml-1">Bạn muốn tìm gì?</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm, hãng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 py-5 px-14 rounded-3xl shadow-sm font-medium outline-none focus:border-yellow-400 transition-all"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
          </div>

          {/* Lọc Giá Xịn (Sử dụng react-range) */}
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Mức giá lọc</h3>
              <span className="text-sm font-black text-slate-800 bg-yellow-400/20 px-3 py-1 rounded-lg">
                {values[0].toLocaleString()}đ - {values[1].toLocaleString()}đ
              </span>
            </div>
            <div className="px-2 pt-4">
              <Range
                values={values}
                step={STEP}
                min={MIN}
                max={MAX}
                onChange={(newVals) => setValues(newVals)}
               renderTrack={({ props, children }) => {
  const { key, ...restProps } = props; // Tách key ra
  return (
    <div key={key} {...restProps} className="...">
      {children}
    </div>
  );
}}
               renderThumb={({ props, isDragged }) => {
  const { key, ...restProps } = props; // Tách key ra
  return (
    <div key={key} {...restProps} style={{ ...restProps.style }} className="..." />
  );
}}
              />
              <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-300 uppercase">
                <span>0đ</span>
                <span>2.5tr</span>
                <span>5tr+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <div className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-500 relative border border-gray-50 flex flex-col h-full">
              
              {/* Badge Sale */}
              {product.isSale && (
                <div className="absolute top-4 left-4 z-30 bg-red-600 text-white w-12 h-12 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-white -rotate-12 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] uppercase opacity-80">Sale</span>
                  <span className="text-sm">-{product.discount}%</span>
                </div>
              )}

              {/* Ảnh */}
              <div className="h-72 rounded-2xl mb-6 overflow-hidden bg-[#f8f9fa] relative">
                <img src={product.images[0] || "/no-image.png"} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
              </div>

              {/* Info */}
              <div className="flex flex-col flex-grow">
                <h2 className="text-lg font-bold text-slate-800 mb-3 uppercase line-clamp-2 group-hover:text-red-600 transition-colors tracking-tight leading-tight">
                  {product.name}
                </h2>

                <div className="mt-auto">
                  {product.isSale ? (
                    <div className="flex items-baseline gap-3">
                      <p className="text-red-600 font-black text-2xl">{Number(product.currentPrice).toLocaleString()} ₫</p>
                      <p className="text-slate-300 line-through text-xs font-bold">{Number(product.price).toLocaleString()} ₫</p>
                    </div>
                  ) : (
                    <p className="text-slate-900 font-black text-2xl">{Number(product.price).toLocaleString()} ₫</p>
                  )}
                </div>

                <button className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] group-hover:bg-red-600 transition-all shadow-lg active:scale-95">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </main>
  );
}