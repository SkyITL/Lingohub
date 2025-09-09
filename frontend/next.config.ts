import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove static export for Vercel deployment
  // output: 'export',
  // trailingSlash: true,
  images: {
    // Keep unoptimized for now, can be removed later for better performance
    unoptimized: true
  }
};

export default nextConfig;
