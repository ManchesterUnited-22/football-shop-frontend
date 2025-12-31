// app/products/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartBtn from "../../components/AddToCartBtn";

// 1. Định nghĩa Type chuẩn cho dữ liệu từ Backend
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

// 2. Hàm Fetch dữ liệu từ Backend NestJS
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:3001/products/${slug}`, {
      cache: "no-store", 
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

// 3. Interface Props này chỉ chứa những gì Next.js truyền vào từ URL
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetail({ params }: Props) {
  // Await params để lấy slug từ URL (Chuẩn Next.js 15)
  const { slug } = await params;
  
  // Lấy dữ liệu sản phẩm dựa trên slug
  const product = await getProduct(slug);

  // Nếu không tìm thấy sản phẩm, chuyển hướng sang trang 404
  if (!product) {
    notFound();
  }

  // Logic xử lý bổ trợ
  const isAccessory = product.categoryId === 3;
  const defaultVariantId = isAccessory && product.variants.length > 0 ? product.variants[0].id : undefined;

  // Hàm định dạng tiền tệ VNĐ
  const formatPrice = (amount: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      {/* Breadcrumb điều hướng */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Quay lại cửa hàng
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="md:w-1/2 relative bg-white flex items-center justify-center p-4">
            {product.images?.[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full max-h-[500px] object-contain" 
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400">Không có ảnh</div>
            )}
            
            {product.isSale && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                SALE {product.promoName && `• ${product.promoName}`}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="md:w-1/2 p-8 lg:p-12 border-l border-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 uppercase">
              {product.name}
            </h1>

            {/* HIỂN THỊ GIÁ */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
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
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
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

            {/* THÔNG BÁO KHUYẾN MÃI */}
            {product.isSale && product.promoEnd && (
              <div className="mt-8 text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <span className="font-bold">⏰ Kết thúc vào:</span>
                {new Date(product.promoEnd).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}