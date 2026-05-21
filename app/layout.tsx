import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutShell } from "@/components/layout/layout-shell";
import { getStorefrontSettings } from "@/lib/actions/settings";
import { getNavMenu } from "@/lib/actions/categories";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://habibaminhas.com"),
  title: {
    default: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    template: "%s | Habiba Minhas",
  },
  description:
    "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://habibaminhas.com/",
    siteName: "Habiba Minhas",
    title: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    description: "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
    images: [
      {
        url: "/logo/habiba-minhas-logo.png",
        width: 1200,
        height: 630,
        alt: "Habiba Minhas Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    description: "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
    images: ["/logo/habiba-minhas-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    other: {
      'msvalidate.01': 'FC185BBAD92362483C84F966F358A41C',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ seo }, navMenus] = await Promise.all([
    getStorefrontSettings(),
    getNavMenu(),
  ]);
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/HeroSection/ladies-suits.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://goykebkdqjrgbofmusjv.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://widget.trustpilot.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-ivory text-ink">
        <LayoutShell navMenus={navMenus}>{children}</LayoutShell>
        {/* TrustBox bootstrap script */}
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
        {seo.ga4_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.ga4_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${seo.ga4_id}');`}
            </Script>
          </>
        )}
        {seo.fb_pixel && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${seo.fb_pixel}');
fbq('track', 'PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
