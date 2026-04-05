/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Désactivé pour Leaflet en dev
};

module.exports = nextConfig;
