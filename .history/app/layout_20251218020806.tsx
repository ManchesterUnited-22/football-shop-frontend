import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; 
import { CartProvider } from "./context/CartContext";
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
        {/* CartProvider bọc toàn bộ ứng dụng để quản lý giỏ hàng */}
        <CartProvider>
          <Header />
          
          {
          */}
          <DeliveryNotificationBar />

          <main>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
