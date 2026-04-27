"use client";

import { usePathname } from "next/navigation";
import { PromoBar } from "@/components/layout/promo-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/common/page-loader";
import { CookieConsent } from "@/components/common/cookie-consent";
import { WhatsAppButton } from "@/components/common/whatsapp-button";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PageLoader />
      <CookieConsent />
      {/* Fixed header — always pinned to the viewport top */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <PromoBar />
        <Navbar />
      </div>
      {/* Spacer pushes page content below the fixed header */}
      <main className="flex-1" style={{ paddingTop: "var(--header-h)" }}>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
