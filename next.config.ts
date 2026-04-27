import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "ftrwdknlckzcwbibdicu.supabase.co" },
      { protocol: "https", hostname: "goykebkdqjrgbofmusjv.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async redirects() {
    return [
      // Orphaned / old routes → correct destinations
      { source: "/women",              destination: "/ladies",    permanent: true  },
      { source: "/women/:slug*",       destination: "/ladies",    permanent: true  },
      { source: "/men",                destination: "/ladies",    permanent: true  },
      { source: "/men/:slug*",         destination: "/ladies",    permanent: true  },
      { source: "/stores",             destination: "/contact",   permanent: false },
      { source: "/edit",               destination: "/new",       permanent: false },
      { source: "/fragrances",         destination: "/accessories", permanent: true },
      { source: "/fragrances/:slug*",  destination: "/accessories", permanent: true },

      // Footer sub-category links (avoid double redirect via catch-all)
      { source: "/ladies/suits",       destination: "/ladies",    permanent: false },
      { source: "/kids/girls",         destination: "/kids",      permanent: false },
      { source: "/baby/bedding",       destination: "/baby",      permanent: false },
      { source: "/baby/nests",         destination: "/baby",      permanent: false },
      { source: "/accessories/hair",   destination: "/accessories", permanent: false },

      // /shop → show ladies as primary collection
      { source: "/shop",               destination: "/ladies",    permanent: false },
    ];
  },
};

export default nextConfig;
