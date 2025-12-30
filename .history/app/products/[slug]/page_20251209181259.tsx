// app/products/[slug]/page.tsx
import Link from "next/link";
import AddToCartBtn from "../../components/AddToCartBtn";

// Định nghĩa giao diện Product chi tiết
interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    images: string[];
    description: string;
    categoryId: number; // Thêm categoryId
    variants: { id: number; sizeValue: string; stock: number; color: string }[]; // Thêm variants
}


async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:3001/products/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    return JSON.parse(text);
  } catch (err) {
    console.error("Lỗi fetch sản phẩm:", err);
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>; 
}

export default async function ProductDetail({ params }: Props) {
  // unwrap Promise params
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm! 😞</h1>
        <Link href="/" className="text-blue-500 underline mt-4 block">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }
    
  // ⭐ LOGIC XÁC ĐỊNH PHỤ KIỆN (Giữ nguyên) ⭐
  const isAccessory = product.categoryId === 3;
    
    // Nếu là Phụ kiện, lấy ID của biến thể đầu tiên
    const defaultVariantId = isAccessory && product.variants.length > 0
        ? product.variants[0].id
        : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto mb-6 px-4">
        <Link href="/" className="text-gray-600 hover:text-black">
          ← Quay lại cửa hàng
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Cột Ảnh */}
        <div className="md:w-1/2 bg-gray-200 h-96 md:h-auto flex items-center justify-center text-gray-400 relative overflow-hidden">
          {product.images && product.images.length > 0 && product.images[0] !== "" ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">Ảnh sản phẩm</span>
          )}
        </div>

        {/* Cột Thông tin */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{product.name}</h1>
          <p className="text-3xl text-red-600 font-bold mb-6">
            {Number(product.price).toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          
            {/* ⭐ SỬA LỖI: TRUYỀN PROPS isAccessory và defaultVariantId ⭐ */}
          <AddToCartBtn 
                product={product} 
                variants={product.variants} 
                isAccessory={isAccessory} // Truyền biến kiểm tra
                defaultVariantId={defaultVariantId} // Truyền ID biến thể mặc định
            />
        </div>
      </div>
    </div>
  );
}