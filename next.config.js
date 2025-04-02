/** @type {import('next').NextConfig} */
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    // Optimize @aptos-labs packages
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        aptos: {
          test: /[\\/]node_modules[\\/](@aptos-labs)[\\/]/,
          name: 'aptos-libs',
          priority: 10,
          reuseExistingChunk: true,
        },
        firebase: {
          test: /[\\/]node_modules[\\/](firebase)[\\/]/,
          name: 'firebase-libs',
          priority: 8,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };
    return config;
  },
  transpilePackages: ['@aptos-labs/wallet-adapter-react'],
};

module.exports = nextConfig;
// module.exports = withBundleAnalyzer(nextConfig);