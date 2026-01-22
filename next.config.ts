import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // We also need to authorize image domains for the map details page later
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