import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // `standalone` ships a self-contained server bundle that the runtime
  // Dockerfile stage copies — keeps the production image small.
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    proxyClientMaxBodySize: '50mb',
  },
  images: {
    remotePatterns: [
      // Allow Supabase Storage public URLs (and any other https origin we
      // surface sponsor logos from).
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
