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
};

export default nextConfig;
