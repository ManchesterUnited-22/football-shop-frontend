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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Không tìm thấy sản phẩm 😞
          </h1>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Phụ kiện thường không cần chọn size → categoryId === 3 (hoặc tùy bạn set)
  const isAccessory = product.categoryId === 3;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-8 text-lg font-medium"
        >
          ← Quay lại cửa hàng
        </Link>

        {/* Product Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Cột Ảnh - HIỂN THỊ ĐẦY ĐỦ, KHÔNG BỊ CROP */}
          <div className="lg:w-1/2 relative h-96 lg:h-auto flex items-center justify-center bg-gray-100 overflow-hidden">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 lg:p-12"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-6xl text-gray-300">⚽</span>
              </div>
            )}

            {/* Badge SALE */}
            {product.isSale && (
              <div className="absolute top-6 left-6 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                SALE {product.promoName && `- ${product.promoName}`}
              </div>
            )}
          </div>

          {/* Cột Thông tin */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>

              {/* Giá tiền */}
              <div className="mb-8">
                {product.isSale ? (
                  <div className="flex items-end gap-5">
                    <span className="text-5xl font-black text-red-600">
                      {product.currentPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-3xl text-gray-500 line-through">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ) : (
                  <span className="text-5xl font-black text-gray-900">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <p className="text-gray-700 text-lg leading-relaxed mb-10">
                {product.description || "Sản phẩm chính hãng, chất lượng cao cấp. Được thiết kế dành cho những trận cầu đỉnh cao."}
              </p>

              {/* Add to Cart Button - ĐÃ XÓA defaultVariantId ĐỂ KHÔNG BỊ LỖI TS */}
              <div className="mb-8">
                <AddToCartBtn
                  product={product}
                  variants={product.variants}
                  isAccessory={isAccessory}
                />
              </div>

              {/* Thời gian khuyến mãi */}
              {product.isSale && product.promoEnd && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-bold uppercase text-sm tracking-wider mb-1">
                    Khuyến mãi kết thúc vào
                  </p>
                  <p className="text-2xl font-black text-red-600">
                    {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>

            {/* Thông tin bổ sung nhỏ */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✔</span>
                  <span>Miễn phí vận chuyển toàn quốc</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✔</span>
                  <span>Đổi trả trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✔</span>
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✔</span>
                  <span>Hàng chính hãng 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}