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
  promoEnd: string | null;
  images: string[];
}


const PRICE_RANGES = [
  { label: "💰 Tất cả mức giá", min: null, max: null },
  { label: "Dưới 200.000 VNĐ", min: 0, max: 200000 },
  { label: "200.000 - 500.000 VNĐ", min: 200000, max: 500000 },
  { label: "500.000 - 1.000.000 VNĐ", min: 500000, max: 1000000 },
  { label: "Trên 1.000.000 VNĐ", min: 1000000, max: 10000000 },
];
const CATEGORIES = [
  { id: 1, title: "Áo quần bóng đá", sub: "Trendy", img: "/categories/ao-quan-bong-da.jpg" },
  { id: 2, title: "Giày", sub: "Unique", img: "/categories/giay-the-thao.jpg" },
  { id: 3, title: "Phụ kiện thể thao", sub: "Special", img: "/categories/phu-kien-the-thao.jpg" },
];
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
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 mt-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Cột 1: Brand & Social */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 text-xl shadow-lg">
              4F
            </div>
            <span className="text-white font-black italic tracking-tighter text-xl uppercase">
              FOOTBALL <span className="text-red-500">STORE</span>
            </span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Chuyên đồ đá bóng & phụ kiện thể thao chính hãng. Cháy cùng đam mê trên từng nhịp đập sân cỏ.
          </p>
          <div className="flex gap-4">
    {/* Facebook Icon */}
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 group">
      <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </a>

    {/* Instagram Icon */}
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent transition-all duration-300 group">
      <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.558.217.957.477 1.377.896.419.42.679.819.896 1.377.163.422.358 1.057.412 2.227.059 1.266.071 1.646.071 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.217.558-.477.957-.896 1.377-.42.419-.819.679-1.377.896-.422.163-1.057.358-2.227.412-1.266.059-1.646.071-4.85.071s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.558-.217-.957-.477-1.377-.896-.419-.42-.679-.819-.896-1.377-.163-.422-.358-1.057-.412-2.227-.059-1.266-.071-1.646-.071-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.217-.558.477-.957.896-1.377.42-.419.819-.679 1.377-.896.422-.163 1.057-.358 2.227-.412 1.266-.059 1.646-.071 4.85-.071zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.15.26-2.914.557-.79.307-1.459.718-2.125 1.384-.666.666-1.077 1.335-1.384 2.125-.296.763-.499 1.637-.557 2.914-.059 1.28-.073 1.688-.073 4.947s.014 3.667.072 4.947c.057 1.277.26 2.15.557 2.914.307.79.718 1.459 1.384 2.125.666.666 1.335 1.077 2.125 1.384.763.296 1.637.499 2.914.557 1.28.059 1.688.073 4.947.073s3.667-.014 4.947-.072c1.277-.057 2.15-.26 2.914-.557.79-.307 1.459-.718 2.125-1.384.666-.666 1.077-1.335 1.384-2.125.296-.763.499-1.637.557-2.914.059-1.28.073-1.688.073-4.947s-.014-3.667-.072-4.947c-.057-1.277-.26-2.15-.557-2.914-.307-.79-.718-1.459-1.384-2.125-.666-.666-1.335-1.077-2.125-1.384-.763-.296-1.637-.499-2.914-.557-1.28-.059-1.688-.073-4.947-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </a>
  </div>
        </div>

        {/* Cột 2: Sản phẩm & Hỗ trợ (Gộp lại để tối ưu không gian) */}
        <div className="grid grid-cols-2 gap-4 md:col-span-1">
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Sản phẩm</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Áo thi đấu</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Giày bóng đá</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Phụ kiện</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Đổi trả</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Chọn size</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Giao hàng</Link></li>
            </ul>
          </div>
        </div>

        {/* Cột 3: Liên hệ */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Liên hệ</h3>
          <div className="space-y-4 text-sm opacity-80">
            <p className="flex items-start gap-2">
              <span className="text-blue-400 font-bold italic">ADD:</span> 
              252 Lý Thường Kiệt, Tam Kỳ, Đà Nẵng
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-400 font-bold italic">HOTLINE:</span> 
              <span className="text-white font-black text-lg">0327 040 026</span>
            </p>
          </div>
        </div>

        {/* Cột 4: NHẬN ƯU ĐÃI (PHẦN MỚI THÊM) */}
        <div className="space-y-6">
          <h3 className="text-white font-black uppercase text-sm tracking-widest italic">
            NHẬN ƯU ĐÃI
          </h3>
          <div className="flex flex-col gap-3">
            {/* Ô nhập Email dạng tròn (Pill) */}
            <input
              type="email"
              placeholder="Nhập email"
              className="w-full bg-[#f3f4f6] text-slate-900 py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sm placeholder:text-gray-400 shadow-inner"
            />
            
            {/* Nút Đăng ký màu Vàng chuẩn */}
            <button className="w-full bg-[#facc15] hover:bg-yellow-500 text-slate-900 py-3.5 px-6 rounded-full font-black text-xs uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              Đăng ký nhận ưu đãi
            </button>
            <p className="text-[10px] opacity-50 italic text-center">
              * Chúng tôi cam kết bảo mật thông tin của bạn
            </p>
          </div>
        </div>

      </div>

      {/* Dòng bản quyền dưới cùng */}
      <div className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center text-[10px] opacity-40 uppercase tracking-[0.4em]">
        © 2025 4FOOTBALL STORE. Crafted with passion.
      </div>
    </footer>
  );
};
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
      {/* CHỖ CẦN THÊM: Thanh Bar đếm ngược */}
    {products.find(p => p.isSale && p.promoEnd) && (
      <div className="w-full bg-red-600 text-white py-2 px-4 sticky top-0 z-[100] shadow-md flex justify-center items-center gap-3 text-sm font-bold uppercase">
        <span>🔥 SIÊU SALE ĐANG DIỄN RA - KẾT THÚC SAU:</span>
        <div className="bg-black/20 px-3 py-1 rounded-full border border-white/20">
          <TimerSmall targetDate={products.find(p => p.isSale)!.promoEnd!} />
        </div>
      </div>
    )}
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
     {/* 1. DANH MỤC SẢN PHẨM (Hình 1) */}
<section className="max-w-6xl mx-auto px-4 py-10">
  <h2 className="text-2xl font-black text-center mb-8 text-slate-800 uppercase italic">Danh mục sản phẩm</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {CATEGORIES.map((cat) => (
      <div 
        key={cat.id}
        onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)} // Nhấn lại để bỏ lọc
        className={`group relative h-64 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${categoryId === cat.id ? 'border-yellow-400 scale-95' : 'border-transparent'}`}
      >
        <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        
        {/* Label mờ như Hình 1 */}
        <div className="absolute bottom-0 w-full p-4 backdrop-blur-md bg-white/20 border-t border-white/10">
          <h3 className="text-white font-bold text-sm leading-tight uppercase">{cat.title}</h3>
          <p className="text-white/70 text-[10px] uppercase tracking-widest">{cat.sub}</p>
        </div>
      </div>
    ))}
  </div>
</section>

{/* 2. THANH TÌM KIẾM VÀ LỌC GIÁ (Hình 2) */}
<div className="max-w-6xl mx-auto px-4 mb-10 flex flex-col md:flex-row items-end gap-8">
  {/* Ô tìm kiếm giữ nguyên nhưng chỉnh lại style cho hợp */}
  <div className="flex-[1.5] w-full relative">
    <label className="text-xs font-bold uppercase mb-2 block opacity-50">Tìm kiếm</label>
    <input
      type="text"
      placeholder="Bạn đang tìm gì?..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-white border border-gray-200 py-4 px-12 rounded-2xl shadow-sm font-medium outline-none focus:ring-2 focus:ring-yellow-400"
    />
    <span className="absolute left-5 bottom-4 text-xl">🔍</span>
  </div>

  {/* LỌC GIÁ (Hình 2) */}
  <div className="flex-1 w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-black uppercase tracking-widest">Mức giá</h3>
      <span className="text-xs font-bold text-yellow-600">
        {(priceRange.min || 0).toLocaleString()}đ - {(priceRange.max || 3000000).toLocaleString()}đ
      </span>
    </div>
    
    <div className="relative h-2 w-full bg-yellow-100 rounded-full mt-6">
      {/* Thanh màu vàng kết nối */}
      <div className="absolute h-full bg-yellow-400 rounded-full" style={{left: '10%', right: '30%'}}></div>
      
      {/* Nút kéo Min */}
      <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-6 h-6 bg-yellow-400 border-4 border-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"></div>
      
      {/* Nút kéo Max */}
      <div className="absolute top-1/2 left-[70%] -translate-y-1/2 w-6 h-6 bg-yellow-400 border-4 border-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"></div>
    </div>
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
      <Footer />
    </main>
  );
}