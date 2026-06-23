import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pluggy.ai",
      },
      {
        protocol: "https",
        hostname: "**.pluggy.ai",
      },
    ],
  },
};

export default nextConfig;
