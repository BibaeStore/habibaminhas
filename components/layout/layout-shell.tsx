"use client";

import { usePathname } from "next/navigation";
import { PromoBar } from "@/components/layout/promo-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/common/page-loader";
import { CookieConsent } from "@/components/common/cookie-consent";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { PurchaseNotification } from "@/components/common/purchase-notification";
import { useCartStore } from "@/lib/cart-store";
import type { MegaMenu } from "@/lib/data";

export function LayoutShell({
  children,
  navMenus,
}: {
  children: React.ReactNode;
  navMenus: MegaMenu[];
}) {
  const pathname = usePathname();
  const isAdmin   = pathname?.startsWith("/admin");
  const isInvoice = pathname?.endsWith("/invoice");

  const drawerOpen = useCartStore((s) => s.drawerOpen);

  /*
   * Overlay suppression inside the funnel.
   *
   * Anything floating over the page competes with the purchase. Both of these used to
   * render everywhere, including on top of the cart drawer and the checkout form:
   *   - the WhatsApp FAB sat on the drawer's Continue Shopping / Checkout buttons
   *   - the purchase notification is near-full-width on mobile and covered the
   *     PDP's Add to Bag button for 8s out of every 60s
   * Lowering their z-index fixes the stacking; hiding them here removes the collision
   * outright, and keeps checkout free of exit ramps.
   */
  const inCheckout   = pathname?.startsWith("/checkout");
  const showOverlays = !drawerOpen && !inCheckout;

  if (isAdmin || isInvoice) {
    return <>{children}</>;
  }

  return (
    <>
      <PageLoader />
      <CookieConsent />
      {/* Fixed header — always pinned to the viewport top */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <PromoBar />
        <Navbar menus={navMenus} />
      </div>
      {/* Spacer pushes page content below the fixed header */}
      <main className="flex-1" style={{ paddingTop: "var(--header-h)" }}>{children}</main>
      <Footer />
      {showOverlays && <WhatsAppButton />}
      {showOverlays && <PurchaseNotification />}
    </>
  );
}
