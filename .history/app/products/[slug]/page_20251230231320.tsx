// app/products/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
// SỬA LỖI: Cần dùng ../../ để ra ngoài 2 cấp thư mục (vào app -> vào root)
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

  // Phụ kiện: categoryId === 3
  const isAccessory = product.categoryId === 3;
  
  // Lấy Variant đầu tiên làm mặc định cho phụ kiện để tránh lỗi undefined khi bấm thêm vào giỏ
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

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
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
          {/* Cột Ảnh */}
          <div className="lg:w-1/2 relative h-[400px] lg:h-auto flex items-center justify-center bg-gray-50 overflow-hidden">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 lg:p-12 transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200">
                <span className="text-6xl">⚽</span>
              </div>
            )}

            {product.isSale && (
              <div className="absolute top-6 left-6 bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase shadow-xl z-10">
                SALE {product.promoName ? `• ${product.promoName}` : ""}
              </div>
            )}
          </div>

          {/* Cột Thông tin */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight uppercase">
              {product.name}
            </h1>

            {/* Giá tiền */}
            <div className="mb-8">
              {product.isSale ? (
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-red-600">
                    {product.currentPrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
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
            <div className="mb-10">
               <h3 className="text-xs font-bold uppercase text-gray-400 tracking-[0.2em] mb-3">Mô tả sản phẩm</h3>
               <p className="text-gray-700 text-lg leading-relaxed">
                {product.description || "Sản phẩm chất lượng cao cấp, thiết kế dành cho thi đấu chuyên nghiệp."}
              </p>
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <div className="mb-8 pt-8 border-t border-gray-100">
              <AddToCartBtn
                product={product}
                variants={product.variants}
                isAccessory={isAccessory}
                defaultVariantId={defaultVariantId} 
              />
            </div>

            {/* Banner khuyến mãi */}
            {product.isSale && product.promoEnd && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-red-700 font-bold uppercase text-xs tracking-widest">Ưu đãi giới hạn</p>
                  <p className="text-gray-600 text-sm">Kết thúc vào: {new Date(product.promoEnd).toLocaleDateString("vi-VN")}</p>
                </div>
                <span className="text-3xl animate-pulse">🔥</span>
              </div>
            )}

            {/* Thông tin cam kết */}
            <div className="mt-12 grid grid-cols-2 gap-4 pt-8 border-t border-gray-50 text-xs font-bold text-gray-500 uppercase tracking-tighter">
              <div className="flex items-center gap-2">📦 Miễn phí vận chuyển</div>
              <div className="flex items-center gap-2">🛡️ Bảo hành 12 tháng</div>
              <div className="flex items-center gap-2">🔄 Đổi trả 30 ngày</div>
              <div className="flex items-center gap-2">💳 Thanh toán COD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}