/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  transpilePackages: ['@pocket-maps/shared'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8888', 'localhost:8881', 'http://localhost:8888', 'http://localhost:8881'],
    },
  },
};

module.exports = nextConfig;
