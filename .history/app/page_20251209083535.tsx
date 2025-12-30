// app/page.tsx
import Link from 'next/link'; // <--- 1. Nhập khẩu cái "Cầu nối"

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: string[];
}

interface HomeProps {
    searchParams: {
        categoryId?: string; // category_id là tùy chọn, được truyền qua URL query
    }
}

async function getProducts() {
  const res = await fetch('http://localhost:3001/products', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function Home() {
  const products: Product[] = await getProducts();

  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-10 text-red-600">
        4FOOTBALL
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          // --- BẮT ĐẦU THAY ĐỔI Ở ĐÂY ---
          // Thay vì chỉ hiện thẻ <div>, ta bọc nó bằng thẻ <Link>
          // href chính là địa chỉ đích: /products/tên-của-cái-áo
          <Link key={product.id} href={`/products/${product.slug}`}>
            
            {/* Đây là giao diện cái thẻ sản phẩm cũ của bạn, giữ nguyên */}
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
              {/* BẮT ĐẦU SỬ DỤNG ẢNH THẬT */}
              <div className="h-48 rounded-md mb-4 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]} // Lấy URL ảnh thật từ database
                    alt={product.name}
                    className="w-full h-full object-cover" // Giúp ảnh vừa khung
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Ảnh áo đấu
                  </div>
                )}
              </div>
              {/* KẾT THÚC SỬ DỤNG ẢNH THẬT */}
              
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-red-500 font-bold text-lg">
                {Number(product.price).toLocaleString('vi-VN')} VNĐ
              </p>
              
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Xem chi tiết
              </button>
            </div>

          </Link>
          // --- KẾT THÚC THAY ĐỔI ---
        ))}
      </div>
    </main>
  );
}