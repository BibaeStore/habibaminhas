import type { NextConfig } from "next";
import { productRedirects } from "./lib/product-redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "ftrwdknlckzcwbibdicu.supabase.co" },
      { protocol: "https", hostname: "goykebkdqjrgbofmusjv.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async headers() {
    return [
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
    ];
  },
};

export default nextConfig;
