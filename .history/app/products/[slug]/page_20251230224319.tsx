// app/products/[slug]/page.tsx
"use client";
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
  try {
    const res = await fetch(`http://localhost:3001/products/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Lỗi fetch sản phẩm:", err);
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white mb-8">
            Sản phẩm không tồn tại 😔
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-full font-bold text-xl transition-all hover:shadow-2xl hover:shadow-emerald-600/50"
          >
            ← Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const isAccessory = product.categoryId === 5; // Phụ kiện thường không có size
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-6 relative overflow-hidden">
      {/* Background sân cỏ mờ nhẹ */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517926967790-dab3f1b0da12?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition mb-10 text-lg font-medium"
        >
          ← Quay lại cửa hàng
        </Link>

        {/* Main Product Card */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Cột Ảnh - Siêu lớn, đẹp, hiện đại */}
            <div className="relative h-96 lg:h-full min-h-96 overflow-hidden group">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-8xl">⚽</span>
                </div>
              )}

              {/* Badge SALE nổi bật */}
              {product.isSale && (
                <div className="absolute top-8 left-8 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-black text-2xl shadow-2xl border border-white/20 animate-pulse">
                  SALE {product.promoName && `- ${product.promoName}`}
                </div>
              )}

              {/* Thumbnail nhỏ dưới cùng */}
              {product.images.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-gray-700">
                  {product.images.slice(0, 5).map((img, i) => (
                    <div 
                      key={i} 
                      className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-600 hover:border-emerald-500 transition-all cursor-pointer"
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cột Thông tin */}
            <div className="p-10 lg:p-16 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-8 tracking-tight">
                  {product.name}
                </h1>

                {/* Giá tiền - Siêu nổi bật */}
                <div className="mb-10">
                  {product.isSale ? (
                    <div className="flex items-end gap-6">
                      <span className="text-6xl lg:text-7xl font-black text-red-500">
                        {product.currentPrice.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-4xl text-gray-500 line-through mb-2">
                        {product.price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ) : (
                    <span className="text-6xl lg:text-7xl font-black text-emerald-400">
                      {product.price.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>

                {/* Mô tả sản phẩm */}
                <p className="text-gray-300 text-lg leading-relaxed mb-12 max-w-2xl">
                  {product.description || "Sản phẩm chính hãng 100%, chất lượng cao cấp. Được thiết kế dành riêng cho những trận cầu đỉnh cao. Cam kết đổi trả dễ dàng – bạn chỉ cần tập trung chơi bóng!"}
                </p>

                {/* Nút Thêm vào giỏ hàng - Client Component */}
                <div className="mb-10">
                  <AddToCartBtn
                    product={product}
                    variants={product.variants}
                    isAccessory={isAccessory}
                    defaultVariantId={defaultVariantId}
                  />
                </div>

                {/* Countdown khuyến mãi (nếu có) */}
                {product.isSale && product.promoEnd && (
                  <div className="bg-red-900/40 border border-red-700/50 rounded-2xl p-6 text-center shadow-lg">
                    <p className="text-red-300 uppercase font-bold tracking-wider mb-2">
                      Khuyến mãi kết thúc trong
                    </p>
                    <p className="text-4xl font-black text-white">
                      {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>

              {/* Thông tin bổ sung - Tinh tế, chuyên nghiệp */}
              <div className="mt-16 pt-12 border-t border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚚</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Miễn phí vận chuyển</p>
                      <p className="text-gray-400 text-sm">Toàn quốc</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Đổi trả dễ dàng</p>
                      <p className="text-gray-400 text-sm">Trong 30 ngày</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Thanh toán linh hoạt</p>
                      <p className="text-gray-400 text-sm">COD, chuyển khoản, thẻ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Hàng chính hãng</p>
                      <p className="text-gray-400 text-sm">Cam kết 100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation nhẹ */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}