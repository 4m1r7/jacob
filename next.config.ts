import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.jacobcarpet.com',
      },
    ],
  },
};

export default nextConfig;
