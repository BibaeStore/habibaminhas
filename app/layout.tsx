import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutShell } from "@/components/layout/layout-shell";

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
  title: {
    default: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    template: "%s | Habiba Minhas",
  },
  description:
    "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
      </body>
    </html>
  );
}
