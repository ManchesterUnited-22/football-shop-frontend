"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const url = categoryId
        ? `http://localhost:3001/products?categoryId=${categoryId}`
        : `http://localhost:3001/products`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, [categoryId]);

  return (
    <main
      className="min-h-screen p-10 relative overflow-hidden"
      style={{
        backgroundImage: "url('/football-stadium.jpg')", // ảnh nền đặt trong thư mục public
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed", // hiệu ứng parallax
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-red-600/40"></div>

      {/* Hiệu ứng ánh sáng nhấp nháy */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Quả bóng xoay chậm */}
      <div className="absolute top-10 right-10 w-32 h-32 opacity-20 animate-spin-slow">
        <img src="/football-ball.png" alt="Football" className="w-full h-full" />
      </div>

      <h1 className="relative text-3xl font-bold text-center mb-10 text-white z-10">
        4FOOTBALL
      </h1>

      {/* Dropdown lọc sản phẩm */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="relative w-64">
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">🛒 Tất cả sản phẩm</option>
            <option value="1">👕 Áo đấu</option>
            <option value="2">👟 Giày bóng đá</option>
            <option value="3">🎒 Phụ kiện</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
              <div className="h-48 rounded-md mb-4 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Ảnh sản phẩm
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-red-500 font-bold text-lg">
                {Number(product.price).toLocaleString("vi-VN")} VNĐ
              </p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Xem chi tiết
              </button>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
