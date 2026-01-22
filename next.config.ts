import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    proxyClientMaxBodySize: '50mb',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow Supabase images
      },
    ],
  },
};

export default nextConfig;