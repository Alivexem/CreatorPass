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
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: '100mb',
  },
};

module.exports = nextConfig;