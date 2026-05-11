import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutShell } from "@/components/layout/layout-shell";
import { getStorefrontSettings } from "@/lib/actions/settings";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    description: "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
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
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { seo } = await getStorefrontSettings();
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-ivory text-ink">
        <LayoutShell>{children}</LayoutShell>
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
