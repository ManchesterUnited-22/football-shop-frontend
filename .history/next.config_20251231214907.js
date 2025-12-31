/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Tự động lấy link Backend từ môi trường, nếu không có thì dùng localhost
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`, 
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // ⭐️ THÊM DÒNG NÀY ĐỂ HẾT LỖI ẢNH ⭐️
      },
    ],
  },
};

module.exports = nextConfig;