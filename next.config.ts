import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment if needed
  output: "standalone",

  // Hide the Next.js dev indicator in local product testing
  devIndicators: false,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Ensure shared data directory is accessible
  serverExternalPackages: [],
};

export default nextConfig;
