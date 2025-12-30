import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; 
import { CartProvider } from "./context/CartContext"; // 1. Phải nhập cái này
import { DeliveryNotificationBar } from './components/DeliveryNotificationBar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cửa hàng bóng đá",
  description: "Web bán áo đấu xịn nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. QUAN TRỌNG: CartProvider phải bọc lấy Header và children */}
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        {/* ✅ Đặt Component thông báo ở đây */}
        <DeliveryNotificationBar /> 
      </body>
    </html>
  );
}