import type { NextConfig } from "next";
import { productRedirects } from "./lib/product-redirects";
import { legacyProductRedirects } from "./lib/legacy-product-redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,

  // Enable CSS optimization and compression
  experimental: {
    optimizeCss: true,
  },

  // Enable production optimizations
  compress: true,

  // Optimize bundles - Turbopack handles tree-shaking automatically
  productionBrowserSourceMaps: false,

  // Compiler optimizations for modern browsers
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Target modern browsers (uses .browserslistrc)
  // Reduces polyfills for ES2022+ features
  swcMinify: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    remotePatterns: [
      { protocol: "https", hostname: "ftrwdknlckzcwbibdicu.supabase.co" },
      { protocol: "https", hostname: "goykebkdqjrgbofmusjv.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' widget.trustpilot.com *.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' *.supabase.co wss://*.supabase.co",
              "frame-src 'self' widget.trustpilot.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Cache static assets
      {
        source: "/HeroSection/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/editorial/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/banners/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Orphaned / old routes → correct destinations
      { source: "/women",              destination: "/ladies/",    permanent: true  },
      { source: "/women/:slug*",       destination: "/ladies/",    permanent: true  },
      { source: "/men",                destination: "/ladies/",    permanent: true  },
      { source: "/men/:slug*",         destination: "/ladies/",    permanent: true  },
      { source: "/stores",             destination: "/contact/",   permanent: false },
      { source: "/edit",               destination: "/new/",       permanent: false },
      { source: "/fragrances",         destination: "/accessories/", permanent: true },
      { source: "/fragrances/:slug*",  destination: "/accessories/", permanent: true },

      // Product slug migrations (old → new SEO-friendly URLs)
      ...productRedirects,

      // Legacy /shop/ URL structure redirects
      ...legacyProductRedirects,
    ];
  },
};

export default nextConfig;
