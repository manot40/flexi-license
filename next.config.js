/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  compiler: {
    emotion: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
};

module.exports = nextConfig;
