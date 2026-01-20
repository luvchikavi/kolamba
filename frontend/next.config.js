/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ["localhost", "kolamba.com", "api.kolamba.com"],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
