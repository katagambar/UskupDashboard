import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  typescript: {
    ignoreBuildErrors: true,
  },

  // Hide dev indicator (Turbopack floating button)
  devIndicators: false,

  // Performance optimizations
  reactStrictMode: true,

  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react', // Icon library
      '@radix-ui/react-dialog', // Radix UI components
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'date-fns' // Date utilities
    ]
  },

  // Image optimization
  images: {
    domains: [], // Configure if using external images
    formats: ['image/avif', 'image/webp'],
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Redirects for better SEO (if needed)
  async redirects() {
    return []
  },

  // Rewrites (if needed)
  async rewrites() {
    return []
  }
};

export default nextConfig
