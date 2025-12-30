'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';

// QUAN TRỌNG: Phải có chữ "export default" ở đây thì Next.js mới hiểu
export default function CartPage() {
  const { items, removeFromCart } = useCart();

  // Tính tổng tiền
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // Nếu giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-400 mb-4">Giỏ hàng đang trống 🛒</h1>
        <p className="text-gray-500 mb-8">Bạn chưa chọn món hàng nào cả.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          QUAY LẠI MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-900">GIỎ HÀNG CỦA BẠN ({items.length} món)</h1>
        </div>

        {/* Danh sách hàng */}
        <div className="p-6 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-4 last:border-0">
              <div className="flex items-center gap-4">
                {/* LOGIC HIỂN THỊ ẢNH TRONG GIỎ HÀNG (ĐÃ SỬA) */}
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} // Sử dụng URL ảnh từ CartContext
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>IMG</span> // Placeholder nếu không có ảnh
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">Size: <span className="font-bold text-black">{item.size}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <p className="font-bold text-blue-600">{item.price.toLocaleString()} đ</p>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="text-red-500 hover:text-red-700 font-bold text-sm underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="bg-gray-50 p-6 border-t flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-gray-600 text-lg">Tổng cộng:</span>
            <span className="text-3xl font-bold text-red-600 ml-3">{total.toLocaleString()} VNĐ</span>
          </div>

          <button 
            onClick={() => alert('Tính năng Thanh Toán sẽ làm ở bước sau! 😉')}
            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg w-full md:w-auto"
          >
            THANH TOÁN NGAY
          </button>
        </div>

      </div>
    </div>
  );
}