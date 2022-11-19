/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  compiler: {
    emotion: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
