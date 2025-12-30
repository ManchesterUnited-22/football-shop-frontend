// File: next.config.js (ĐÃ SỬA)

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // 1. QUY TẮC CỤ THỂ (Phải đặt lên trên)
            {
                // Frontend gọi: /api/products/cloudinary-signature
                source: '/api/products/cloudinary-signature',
                // Next.js chuyển hướng cụ thể sang: http://localhost:3001/products/cloudinary-signature
                destination: 'http://localhost:3001/products/cloudinary-signature',
            },
            
            // 2. QUY TẮC RỘNG (Đặt xuống dưới để bắt các request còn lại)
            {
                // Frontend gọi: /api/products/123, /api/auth/login, v.v.
                source: '/api/:path*',
                // Next.js chuyển hướng sang: http://localhost:3001/products/123, /auth/login, v.v.
                destination: 'http://localhost:3001/:path*', 
            },
        ];
    },
images: {
    // Sử dụng remotePatterns cho Next.js 13/14 trở lên
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ⭐️ Thêm tên miền Cloudinary ⭐️
        port: '',
        // Nếu bạn chỉ lưu ảnh trong một thư mục cụ thể, có thể thêm pathname:
        // pathname: '/dvxll7l8e/image/upload/**', 
      },
    ],
    // Hoặc nếu bạn dùng Next.js cũ hơn (trước v13.0), bạn sẽ dùng domains:
    // domains: ['res.cloudinary.com'],
  },

};

module.exports = nextConfig;