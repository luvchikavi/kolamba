/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kolamba.com" },
      { protocol: "https", hostname: "api.kolamba.com" },
      { protocol: "https", hostname: "kolamba-production.up.railway.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
