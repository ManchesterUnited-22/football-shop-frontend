// app/page.tsx
import Link from 'next/link'; 

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: string[];
}

interface HomeProps {
    searchParams: {
        category_id?: string; // category_id là tùy chọn, được truyền qua URL query
    }
}

// Hàm fetch dữ liệu sản phẩm, chấp nhận categoryId để lọc
async function getProducts(categoryId: string | undefined): Promise<Product[]> {
  let url = 'http://localhost:3001/products';
  // Sử dụng `categoryId` (Controller nhận tên này)
  if (categoryId) {
        url += `?categoryId=${categoryId}`; 
    }

    const res = await fetch(url, { cache: 'no-store' });
  
    if (!res.ok) {
        console.error('Failed to fetch products:', res.status, await res.text());
        // Trả về mảng rỗng thay vì throw error để trang không bị crash
        return []; 
    }
    
    return res.json();
}

// Home Component (Server Component)
export default async function Home({ searchParams }: HomeProps) {
    // 1. Lấy ID danh mục đang được chọn từ URL (nguyên nhân gây lỗi trước đó)
    // Việc này phải nằm trong async function Home
    const selectedCategoryId = searchParams.category_id;
    
    // 2. Gọi API để lấy sản phẩm đã được lọc
    const products: Product[] = await getProducts(selectedCategoryId);

    // 3. Dữ liệu các danh mục
    const categories = [
        { id: 1, name: 'Áo đấu' },
        { id: 2, name: 'Giày bóng đá' },
        { id: 3, name: 'Phụ kiện' },
    ];
    
    // URL để xem tất cả sản phẩm
    const allProductsUrl = '/';

  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-10 text-red-600">
        4FOOTBALL
      </h1>

        {/* ======================================================= */}
        {/* VÙNG BỘ LỌC SẢN PHẨM (ĐÃ THÊM) */}
        {/* ======================================================= */}
        <div className="max-w-6xl mx-auto mb-8 flex gap-4 justify-center flex-wrap">
            
            {/* Nút Xem Tất Cả Sản phẩm */}
            <Link 
                href={allProductsUrl} 
                className={`px-4 py-2 rounded font-medium transition whitespace-nowrap ${
                    !selectedCategoryId 
                        ? 'bg-blue-800 text-white shadow-lg' 
                        : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                }`}
            >
                Tất cả sản phẩm
            </Link>

            {/* Các Nút Lọc theo Danh mục */}
            {categories.map(category => (
                <Link 
                    key={category.id} 
                    // Khi click, chuyển hướng đến URL mới (Ví dụ: /?category_id=1)
                    href={`/?category_id=${category.id}`}
                    className={`px-4 py-2 rounded font-medium transition whitespace-nowrap ${
                        selectedCategoryId === String(category.id) 
                            ? 'bg-blue-800 text-white shadow-lg' 
                            : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                    }`}
                >
                    {category.name}
                </Link>
            ))}
        </div>
        {/* ======================================================= */}


        {/* ======================================================= */}
        {/* HIỂN THỊ DANH SÁCH SẢN PHẨM */}
        {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
              <div className="h-48 rounded-md mb-4 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Ảnh áo đấu
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-red-500 font-bold text-lg">
                {Number(product.price).toLocaleString('vi-VN')} VNĐ
              </p>
              
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Xem chi tiết
              </button>
            </div>

          </Link>
        ))}
      </div>
    </main>
  );
}