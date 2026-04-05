/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'http://localhost:3000', 'client:3001'],
    },
  },
};

module.exports = nextConfig;
