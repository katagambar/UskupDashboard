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

  // Headers for better caching and security
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Base security headers
    const securityHeaders = [
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
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      // CSP - Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://www.googleapis.com https://accounts.google.com",
          "frame-ancestors 'none'",
        ].join('; ')
      }
    ]

    // Add HSTS only in production (requires HTTPS)
    if (isProduction) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      })
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders
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
