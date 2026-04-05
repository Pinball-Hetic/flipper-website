/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8888', 'localhost:8881', 'http://localhost:8888', 'http://localhost:8881'],
    },
  },
};

module.exports = nextConfig;
