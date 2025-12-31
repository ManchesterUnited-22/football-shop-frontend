// app/products/[slug]/page.tsx
import Link from "next/link";
import AddToCartBtn from "../../components/AddToCartBtn";

// 1. Cập nhật Interface khớp hoàn toàn với Backend mới
interface Variant {
  id: number;
  sizeValue: string;
  stock: number;
  color: string;
  sku: string;
  originalVariantPrice: number; // Giá gốc của size này (đã tính tăng % size)
  calculatedPrice: number;      // Giá cuối cùng sau khi trừ % Sale
  isSale: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;          // Giá gốc của sản phẩm
  currentPrice: number;   // Giá đã giảm (nếu có sale)
  isSale: boolean;        // Trạng thái sale thực tế từ server
  promoName?: string;
  promoEnd?: string;      // Dùng cho đồng hồ đếm ngược
  images: string[];
  description: string;
  categoryId: number;
  variants: Variant[];
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    // Gọi API từ Backend NestJS
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
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm! 😞</h1>
        <Link href="/" className="text-blue-500 underline mt-4 block">Quay lại trang chủ</Link>
      </div>
    );
  }

  const isAccessory = product.categoryId === 3;
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto mb-6 px-4">
        <Link href="/" className="text-gray-600 hover:text-black">← Quay lại cửa hàng</Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Cột Ảnh */}
        <div className="md:w-1/2 bg-gray-200 h-96 md:h-auto flex items-center justify-center relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl text-gray-400">Ảnh sản phẩm</span>
          )}
          
          {/* Badge giảm giá nếu có Sale */}
          {product.isSale && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold shadow-lg">
              SALE {product.promoName ? `- ${product.promoName}` : ''}
            </div>
          )}
        </div>

        {/* Cột Thông tin */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{product.name}</h1>

          {/* Hiển thị Giá (Quan trọng) */}
          <div className="mb-6">
            {product.isSale ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-red-600">
                  {product.currentPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
            ) : (
              <span className="text-4xl font-bold text-gray-900">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          
          {/* Nút thêm vào giỏ hàng (Client Component) */}
          {/* Chúng ta truyền toàn bộ product xuống để AddToCartBtn xử lý việc chọn Size */}
          <AddToCartBtn 
                product={product} 
                variants={product.variants} 
                isAccessory={isAccessory} 
                defaultVariantId={defaultVariantId}
            />

          {/* Hiển thị thời gian kết thúc khuyến mãi (nếu có) */}
          {product.isSale && product.promoEnd && (
            <p className="mt-6 text-sm text-gray-500 italic">
              * Khuyến mãi kết thúc vào: {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}