/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    // GitHub Pages 部署配置
    basePath: process.env.NODE_ENV === 'production' ? '/nextjs-instruction-dataset' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/nextjs-instruction-dataset/' : '',
    // 在构建时忽略 ESLint 错误（仅用于部署）
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 在构建时忽略 TypeScript 错误（仅用于部署）
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
