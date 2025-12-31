// app/products/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartBtn from "../../components/AddToCartBtn";

// 1. Định nghĩa Type chuẩn chỉnh
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

// 2. Hàm Fetch dữ liệu tối ưu
async function getProduct(slug: string): Promise<Product | null> {
  try {
    // Để "http://localhost:3001" nếu bạn chỉ muốn chạy ở máy
    const res = await fetch(`http://localhost:3001/products/${slug}`, {
      cache: "no-store", // Đảm bảo luôn lấy dữ liệu mới nhất khi sửa backend
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Lỗi Server: ${res.status}`);
    }
    
    return res.json();
  } catch (err) {
    console.error("❌ Lỗi Fetch sản phẩm:", err);
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetail({ params }: Props) {
  // Await params theo chuẩn Next.js 15
  const { slug } = await params;
  const product = await getProduct(slug);

  // Nếu không có sản phẩm, dùng hàm notFound() chuẩn của Next.js
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold text-gray-800">Sản phẩm không tồn tại</h2>
        <p className="text-gray-500 mt-2">Có vẻ như sản phẩm đã bị xóa hoặc sai đường dẫn.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  // Logic xử lý biến thể (Variants)
  const isAccessory = product.categoryId === 3;
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

  // Định dạng tiền tệ VNĐ
  const formatPrice = (amount: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      {/* Breadcrumb đơn giản */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
          Cửa hàng
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-sm text-gray-800 font-medium">{product.name}</span>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="md:w-1/2 relative bg-white flex items-center justify-center p-4">
            {product.images?.[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full max-h-[500px] object-contain hover:scale-105 transition duration-300" 
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400">Không có ảnh</div>
            )}
            
            {product.isSale && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                GIẢM GIÁ {product.promoName && `• ${product.promoName}`}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="md:w-1/2 p-8 lg:p-12 border-l border-gray-50">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* GIÁ CẢ */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl inline-block w-full">
              {product.isSale ? (
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.currentPrice)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>
            
            {/* NÚT THÊM VÀO GIỎ (Client Component) */}
            <div className="pt-6 border-t border-gray-100">
              <AddToCartBtn 
                product={product} 
                variants={product.variants} 
                isAccessory={isAccessory} 
                defaultVariantId={defaultVariantId}
              />
            </div>

            {/* THÔNG TIN SALE KHÁC */}
            {product.isSale && product.promoEnd && (
              <div className="mt-8 flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                <span className="font-bold">🔥 Ưu đãi kết thúc vào:</span>
                {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}