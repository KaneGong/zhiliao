import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment if needed
  output: "standalone",

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Ensure shared data directory is accessible
  serverExternalPackages: [],
};

export default nextConfig;
