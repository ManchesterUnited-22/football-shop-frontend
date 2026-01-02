"use client";
import { apiFetch } from "./utils/apiFetch";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";
import Image from "next/image";
import { Facebook, MessageCircle } from "lucide-react"; // Icon Zalo dùng MessageCircle (gợi hình chat)

async function fetchProducts() {
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId.toString());
  if (searchQuery) params.append("q", searchQuery);
  params.append("minPrice", values[0].toString());
  params.append("maxPrice", values[1].toString());

  try {
    // Dùng apiFetch giúp tự động nhận link từ .env và xử lý lỗi chuyên nghiệp hơn
    const data = await apiFetch<Product[]>(`/products?${params.toString()}`);
    setProducts(data);
  } catch (error) {
    console.error("Lỗi fetch:", error);
  }
}
// Interface & Data
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  currentPrice: number;
  isSale: boolean;
  isNew: boolean;
  discount: number;
  promoEnd: string | null;
  images: string[];
}

const CATEGORIES = [
  { id: 1, title: "Áo Câu Lạc Bộ", sub: "Club Kits", img: "/categories/giaivodich.jpg" },
  { id: 2, title: "Áo Đội Tuyển", sub: "National Kits", img: "/categories/fifa.png" },
  { id: 3, title: "Áo Training", sub: "Training Wear", img: "/categories/trainingsuit.jpeg" },
  { id: 4, title: "Giày Đá Bóng", sub: "Football Boots", img: "/categories/giay-the-thao.jpg" },
  { id: 5, title: "Phụ Kiện", sub: "Accessories", img: "/categories/phu-kien-the-thao.jpg" },
];

const STEP = 50000;
const MIN = 0;
const MAX = 5000000;

// Component đếm ngược nhỏ
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
    <span className="font-bold text-yellow-400">
      {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:
      <span className="animate-pulse">{String(timeLeft.s).padStart(2, '0')}</span>
    </span>
  );
};

// Footer - Đã nâng cấp: thêm icon FB + Zalo, newsletter nổi bật hơn
const Footer = () => (
  <footer className="bg-gray-950 text-gray-300 pt-16 pb-10 mt-32 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      {/* Cột 1: Logo + Mô tả */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-emerald-600/30">
            4F
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight">FOOTBALL</span>
            <span className="text-red-500 font-black ml-1">STORE</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed opacity-80">
          Chuyên đồ đá bóng & phụ kiện thể thao chính hãng. Cháy cùng đam mê trên từng nhịp đập sân cỏ.
        </p>

        {/* Icon mạng xã hội */}
        <div className="flex gap-4 mt-6">
          <a
            href="https://facebook.com/4footballstore"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 shadow-lg"
          >
            <Facebook size={20} className="text-white" />
          </a>
          <a
            href="https://zalo.me/0327040026"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-all duration-300 shadow-lg"
          >
            <MessageCircle size={20} className="text-white" />
          </a>
        </div>
      </div>

      {/* Cột 2: Sản phẩm & Hỗ trợ */}
      <div className="grid grid-cols-2 gap-8 md:col-span-1">
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-wider opacity-80">
            Sản phẩm
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Áo thi đấu</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Giày bóng đá</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Áo training</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Phụ kiện</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-wider opacity-80">
            Hỗ trợ
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Chính sách đổi trả</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Hướng dẫn mua hàng</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Bảo hành</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Liên hệ</Link></li>
          </ul>
        </div>
      </div>

      {/* Cột 3: Liên hệ */}
      <div>
        <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-wider opacity-80">
          Liên hệ
        </h3>
        <p className="text-sm opacity-80 mb-3">252 Lý Thường Kiệt, Tam Kỳ, Quảng Nam</p>
        <p className="text-emerald-400 font-black text-2xl">0327 040 026</p>
      </div>

      {/* Cột 4: Newsletter - Nổi bật hơn */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-black text-emerald-400 tracking-wide">
            NHẬN ƯU ĐÃI ĐỘC QUYỀN
          </h3>
          <p className="text-sm text-gray-400 mt-2">Giảm giá, hàng mới, mã khuyến mãi chỉ dành cho thành viên!</p>
        </div>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="w-full bg-gray-800/70 border border-gray-700 rounded-full py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-inner"
          />
          <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black py-4 px-6 rounded-full uppercase tracking-wider transition-all shadow-xl hover:shadow-emerald-600/60 active:scale-95">
            Đăng ký ngay
          </button>
        </form>
      </div>
    </div>

    {/* Copyright */}
    <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600 uppercase tracking-wider">
      © 2025 4FOOTBALL STORE. All rights reserved.
    </div>
  </footer>
);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [values, setValues] = useState([MIN, MAX]);

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

  const hasSale = products.some(p => p.isSale && p.promoEnd);

  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Background sân cỏ mờ nhẹ */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517926967790-dab3f1b0da12?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
        />
      </div>

      {/* Sale Banner */}
      {hasSale && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 sticky top-0 z-50 shadow-lg flex items-center justify-center gap-4 font-bold uppercase text-sm">
          <span className="animate-pulse">⚡ SIÊU SALE CUỐI NĂM ĐANG DIỄN RA</span>
          <div className="bg-black/30 px-4 py-2 rounded-full">
            Kết thúc trong: <TimerSmall targetDate={products.find(p => p.isSale && p.promoEnd)?.promoEnd || ""} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/FOOTBALL.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/60" />
        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">
            4FOOTBALL
          </h1>
          <p className="text-xl md:text-3xl font-bold text-emerald-400 tracking-wider">
            CHÁY HẾT MÌNH TRÊN SÂN CỎ
          </p>
          <Link 
            href="#products"
            className="mt-10 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-2xl hover:shadow-emerald-600/50"
          >
            Khám phá ngay ⚽
          </Link>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-center mb-12">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
                categoryId === cat.id ? 'ring-4 ring-emerald-500 scale-95' : ''
              }`}
            >
              <Image
                src={cat.img}
                alt={cat.title}
                width={400}
                height={400}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="text-2xl font-black">{cat.title}</h3>
                <p className="text-sm text-gray-300 uppercase tracking-wide">{cat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bộ lọc tìm kiếm & giá */}
      <section className="max-w-7xl mx-auto px-6 py-12 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tìm kiếm sản phẩm</label>
            <div className="relative mt-3">
              <input
                type="text"
                placeholder="Tên sản phẩm, đội bóng, cầu thủ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/70 border border-gray-700 rounded-xl py-5 px-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Khoảng giá</label>
              <span className="text-emerald-400 font-bold">
                {values[0].toLocaleString()}₫ - {values[1] === MAX ? '5tr+' : values[1].toLocaleString() + '₫'}
              </span>
            </div>
            <Range
              values={values}
              step={STEP}
              min={MIN}
              max={MAX}
              onChange={(vals) => setValues(vals)}
              renderTrack={({ props, children }) => {
                const { key, ...trackProps } = props as any;
                return (
                  <div
                    key={key}
                    {...trackProps}
                    className="h-3 w-full rounded-full"
                    style={{
                      ...trackProps.style,
                      background: getTrackBackground({
                        values,
                        colors: ["#374151", "#10b981", "#374151"],
                        min: MIN,
                        max: MAX,
                      }),
                    }}
                  >
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props, isDragged }) => {
                const { key, ...thumbProps } = props as any;
                return (
                  <div
                    key={key}
                    {...thumbProps}
                    className={`h-8 w-8 rounded-full bg-emerald-500 shadow-lg outline-none transition-all ${
                      isDragged ? 'scale-125 shadow-emerald-500/50' : ''
                    }`}
                  />
                );
              }}
            />
          </div>
        </div>
      </section>

      {/* Hàng mới về */}
      {products.some(p => p.isNew) && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-black mb-10">Hàng mới về ⚡</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.filter(p => p.isNew).slice(0, 4).map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group">
                <div className="bg-gray-900/70 backdrop-blur border border-gray-800 rounded-2xl p-4 hover:shadow-xl transition">
                  <Image src={p.images[0]} alt={p.name} width={300} height={300} className="w-full h-40 object-contain rounded-lg mb-4" />
                  <h4 className="font-bold text-sm line-clamp-2 group-hover:text-emerald-400 transition">{p.name}</h4>
                  <p className="text-emerald-400 font-black text-lg mt-2">{p.currentPrice.toLocaleString()}₫</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Danh sách sản phẩm */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-center mb-12">Tất cả sản phẩm</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-20 text-xl">Không tìm thấy sản phẩm nào...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`} 
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/30 hover:-translate-y-3 transition-all duration-500">
                  {product.isSale && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm z-10 shadow-lg">
                      -{product.discount}%
                    </div>
                  )}
                  {product.isNew && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                      New
                    </div>
                  )}

                  <div className="h-80 bg-gray-800/50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={product.images[0] || "/no-image.png"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-emerald-400 transition">
                      {product.name}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        {product.isSale ? (
                          <>
                            <p className="text-2xl font-black text-red-500">{product.currentPrice.toLocaleString()}₫</p>
                            <p className="text-sm text-gray-500 line-through">{product.price.toLocaleString()}₫</p>
                          </>
                        ) : (
                          <p className="text-2xl font-black text-emerald-400">{product.price.toLocaleString()}₫</p>
                        )}
                      </div>
                    </div>
                    <button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />

      {/* Animation CSS nhẹ */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
      `}</style>
    </main>
  );
}