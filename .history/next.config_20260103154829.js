/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Chúng ta loại bỏ hoàn toàn phần async rewrites() 
    vì bạn sẽ gọi trực tiếp link Koyeb từ file apiFetch.ts 
  */
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  
  // Các cấu hình bổ sung khác nếu cần (ví dụ: output: 'standalone') có thể thêm ở đây
};

module.exports = nextConfig;