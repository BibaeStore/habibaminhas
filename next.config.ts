import type { NextConfig } from "next";
import { productRedirects } from "./lib/product-redirects";
import { legacyProductRedirects } from "./lib/legacy-product-redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,

  /*
   * The Amiri font files must reach the serverless bundle.
   *
   * Occasion posters render their Arabic with resvg, which is handed the .ttf by path and
   * loads no system fonts — deliberately, so a Linux runner with no Arabic fonts installed
   * produces the identical image to a Windows laptop. Next's tracer cannot see a file
   * referenced only as a runtime string, so without this the dua renders as empty space in
   * production and nowhere else.
   */
  outputFileTracingIncludes: {
    "/api/cron/social-occasion": ["./assets/fonts/**"],
    "/admin/social/**": ["./assets/fonts/**"],
  },

  // Enable CSS optimization and compression
  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  // Enable production optimizations
  compress: true,

  // Optimize bundles - Turbopack handles tree-shaking automatically
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    remotePatterns: [
      { protocol: "https", hostname: "ftrwdknlckzcwbibdicu.supabase.co" },
      { protocol: "https", hostname: "goykebkdqjrgbofmusjv.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "localhost" },
    ],
  },

  async headers() {
    return [
      // Security headers + Link headers for all routes
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
              // connect.facebook.net serves fbevents.js for the Meta Pixel. Without it the
              // pixel is present in the HTML but the browser refuses to load the script,
              // so no events are ever recorded. See docs/analytics/META-PIXEL.md.
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' widget.trustpilot.com *.supabase.co *.googletagmanager.com *.google-analytics.com js.puter.com connect.facebook.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              // Reels are served from Supabase Storage. Without an explicit media-src,
              // <video> falls back to default-src 'self' and the browser blocks the file
              // silently — the player renders but never loads, which made reels
              // impossible to review in /admin/social.
              "media-src 'self' blob: data: *.supabase.co",
              "font-src 'self' data:",
              // www.facebook.com receives the event beacons (/tr), connect.facebook.net is
              // contacted by fbevents.js after it loads. img-src is deliberately not touched
              // here: it already allows the `https:` scheme, which covers the <noscript>
              // tracking pixel served from www.facebook.com.
              "connect-src 'self' *.supabase.co wss://*.supabase.co *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.puter.com *.openai.com connect.facebook.net www.facebook.com",
              "frame-src 'self' widget.trustpilot.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Link headers for AI agent discovery (RFC 8288)
          // Help AI agents discover sitemap, collections, and key pages
          {
            key: "Link",
            value: [
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
              '</journal/>; rel="collection"; title="Fashion & Lifestyle Blog"',
              '</ladies/>; rel="collection"; title="Ladies Collection"',
              '</kids/>; rel="collection"; title="Kids Festive Wear"',
              '</baby/>; rel="collection"; title="Baby & Nursery"',
              '</about/>; rel="about"; title="About Habiba Minhas"',
            ].join(", "),
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
      { source: "/edit",               destination: "/new/",       permanent: false },
      { source: "/fragrances",         destination: "/accessories/", permanent: true },
      { source: "/fragrances/:slug*",  destination: "/accessories/", permanent: true },

      // Deleted products → category pages (301 redirects for SEO)
      { source: "/product/biba-mrn-kds-s-017/", destination: "/kids/", permanent: true },
      { source: "/product/biba-midnight-noirs-stitched-3-piece-silk-suit-with-organza-dupatta/", destination: "/ladies/", permanent: true },

      // Product slug migrations (old → new SEO-friendly URLs)
      ...productRedirects,

      // Legacy /shop/ URL structure redirects
      ...legacyProductRedirects,
    ];
  },
};

export default nextConfig;
