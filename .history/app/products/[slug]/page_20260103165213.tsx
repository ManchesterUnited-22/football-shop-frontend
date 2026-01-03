// app/products/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import AddToCartBtn from "../../components/AddToCartBtn";

interface Variant {
  id: number;
  sizeValue: string;
  stock: number;
  color: string;
  sku: string;
  originalVariantPrice: number;
  calculatedPrice: number;
  isSale: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  currentPrice: number;
  isSale: boolean;
  promoName?: string;
  promoEnd?: string;
  images: string[];
  description: string;
  categoryId: number;
  variants: Variant[];
}

async function getProduct(slug: string): Promise<Product | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
   const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("❌ Lỗi fetch sản phẩm:", err);
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-slate-950 flex items-center justify-center px-6">
        <div className="text-center py-32">
          <h1 className="text-5xl font-black text-white mb-8 tracking-tight">
            KHÔNG TÌM THẤY SẢN PHẨM 😞
          </h1>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-10 py-5 rounded-full font-black text-xl uppercase tracking-wider shadow-2xl shadow-emerald-900/50 transition-all duration-300 hover:scale-105"
          >
            ← Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const isAccessory = product.categoryId === 3;
  const rawImageUrl = product.images?.[0] || "";
  const displayImageUrl = rawImageUrl.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition mb-10 text-lg font-medium group"
        >
          <span className="group-hover:-translate-x-2 transition-transform">←</span>
          Quay lại cửa hàng
        </Link>

        {/* Product Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50 flex flex-col lg:flex-row hover:shadow-green-500/30 transition-shadow duration-300">
          {/* Cột Ảnh */}
          <div className="lg:w-1/2 relative h-[450px] lg:h-auto overflow-hidden bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
            {display ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                unoptimized
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8 lg:p-20 transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <span className="text-8xl opacity-50">⚽</span>
            )}

            {/* Badge SALE */}
            {product.isSale && (
              <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase shadow-2xl shadow-red-900/60 border-2 border-red-400/50 hover:scale-105 transition-transform duration-300">
                SALE {product.promoName ? `• ${product.promoName}` : ""}
              </div>
            )}
          </div>

          {/* Cột Thông tin */}
          <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tight hover:text-emerald-400 transition-colors duration-300">
                {product.name}
              </h1>

              {/* Giá tiền */}
              <div className="mb-8">
                {product.isSale ? (
                  <div className="flex items-baseline gap-6">
                    <span className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                      {product.currentPrice.toLocaleString("vi-VN")}₫
                    </span>
                    <span className="text-3xl text-gray-500 line-through">
                      {product.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ) : (
                  <span className="text-5xl lg:text-6xl font-black text-white hover:text-emerald-400 transition-colors duration-300">
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <div className="mb-10">
                <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest mb-4">
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed hover:text-white transition-colors duration-300">
                  {product.description || "Sản phẩm chất lượng cao cấp, thiết kế dành cho thi đấu chuyên nghiệp."}
                </p>
              </div>

              {/* Add to Cart */}
              <div className="mb-10">
                <AddToCartBtn
                  product={product}
                  variants={product.variants}
                  isAccessory={isAccessory}
                />
              </div>

              {/* Banner khuyến mãi */}
              {product.isSale && product.promoEnd && (
                <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-800/50 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm mb-10 hover:shadow-red-500/30 transition-shadow duration-300">
                  <div>
                    <p className="text-red-400 font-black uppercase text-sm tracking-widest">
                      Ưu đãi giới hạn
                    </p>
                    <p className="text-gray-300 mt-1">
                      Kết thúc: {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span className="text-5xl">🔥</span>
                </div>
              )}
            </div>

            {/* Cam kết dịch vụ */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-5 text-sm font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-3 hover:text-white transition-colors">📦 Miễn phí vận chuyển toàn quốc</div>
              <div className="flex items-center gap-3 hover:text-white transition-colors">🛡️ Bảo hành chính hãng 12 tháng</div>
              <div className="flex items-center gap-3 hover:text-white transition-colors">🔄 Đổi trả dễ dàng trong 30 ngày</div>
              <div className="flex items-center gap-3 hover:text-white transition-colors">💳 Thanh toán khi nhận hàng (COD)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
