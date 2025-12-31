// app/products/[slug]/page.tsx - Phiên bản ĐẸP NHẤT 2025, đồng bộ theme bóng đá

import Link from "next/link";
import AddToCartBtn from "../../components/AddToCartBtn";
import Image from "next/image";

// Interface giữ nguyên (khớp backend)
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
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-6">Sản phẩm không tồn tại 😞</h1>
          <Link href="/" className="bg-gradient-to-r from-red-600 to-red-800 text-white px-10 py-4 rounded-full font-bold text-xl hover:scale-110 transition-all shadow-2xl inline-flex items-center gap-3">
            ← Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const isAccessory = product.categoryId === 3;
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-black to-green-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition mb-8 text-lg font-medium">
          ← Quay lại cửa hàng
        </Link>

        {/* Main Product Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Cột Ảnh - Lớn, đẹp, hover zoom */}
            <div className="relative h-96 lg:h-full overflow-hidden group">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl text-gray-600">⚽</span>
                </div>
              )}

              {/* Badge SALE nổi bật */}
              {product.isSale && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-full font-black text-lg shadow-2xl animate-pulse">
                  🔥 SALE {product.promoName && `- ${product.promoName}`}
                </div>
              )}

              {/* Nhiều ảnh thumbnail nhỏ (nếu có) */}
              {product.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                  {product.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cột Thông tin */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                  {product.name}
                </h1>

                {/* Giá tiền - Nổi bật nhất */}
                <div className="mb-8">
                  {product.isSale ? (
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl lg:text-6xl font-black text-red-500">
                        {product.currentPrice.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-3xl text-gray-500 line-through">
                        {product.price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ) : (
                    <span className="text-5xl lg:text-6xl font-black text-green-400">
                      {product.price.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>

                {/* Mô tả */}
                <p className="text-gray-300 text-lg leading-relaxed mb-10">
                  {product.description || "Sản phẩm chất lượng cao, chính hãng 100%. Được các cầu thủ tin dùng."}
                </p>

                {/* Nút Thêm vào giỏ hàng - Client Component */}
                <div className="mb-6">
                  <AddToCartBtn
                    product={product}
                    variants={product.variants}
                    isAccessory={isAccessory}
                    defaultVariantId={defaultVariantId}
                  />
                </div>

                {/* Thời gian khuyến mãi còn lại */}
                {product.isSale && product.promoEnd && (
                  <div className="bg-red-900/30 border border-red-600/50 rounded-2xl p-4 text-center">
                    <p className="text-red-300 text-sm uppercase font-bold tracking-wider">Khuyến mãi kết thúc</p>
                    <p className="text-2xl font-black text-white">
                      {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>

              {/* Thông tin bổ sung nhỏ */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="grid grid-cols-2 gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✔</span> Miễn phí vận chuyển toàn quốc
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✔</span> Đổi trả trong 30 ngày
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✔</span> Thanh toán khi nhận hàng
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✔</span> Hàng chính hãng 100%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 