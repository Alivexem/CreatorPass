/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Keep your image domain settings
  },
  experimental: {
    turbo: {}, // Turbo should be an object, not a boolean
  },
};

module.exports = nextConfig;