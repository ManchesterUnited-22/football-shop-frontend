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
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-10 text-red-600">
        4FOOTBALL
      </h1>

      {/* Dropdown filter */}
      <div className="flex justify-center mb-8">
        <select
          value={categoryId ?? ""}
          onChange={(e) =>
            setCategoryId(e.target.value ? Number(e.target.value) : null)
          }
          className="px-4 py-2 border rounded bg-white shadow"
        >
          <option value="">Tất cả sản phẩm</option>
          <option value="1">Áo đấu</option>
          <option value="2">Giày bóng đá</option>
          <option value="3">Phụ kiện</option>
        </select>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
