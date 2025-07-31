/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 暂时移除静态导出配置，因为动态路由不兼容
  // output: 'export',
};

export default nextConfig;
