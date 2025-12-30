import React from 'react';
import { AdminNotificationBar } from '../components/AdminNotificationBar';

// BẮT BUỘC: Phải có chữ 'default' ở đây
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout-container">
      {/* Thanh thông báo dành riêng cho Admin */}
      <AdminNotificationBar />
      
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
}