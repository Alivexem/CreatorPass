/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "punycode": false,
      "pino-pretty": false,
      "net": false,
      "tls": false,
      "fs": false,
    };
    return config;
  },
};

module.exports = nextConfig; 