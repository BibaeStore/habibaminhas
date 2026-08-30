"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { trackContact } from "@/lib/analytics";

export function WhatsAppButton() {
  const pathname = usePathname();

  /*
   * Product pages render a fixed Add-to-Bag bar along the bottom on mobile
   * (~73px tall plus the safe-area inset). At the default bottom-6 the 56px FAB
   * landed on top of that bar and covered the wishlist heart. Lift it clear there.
   * Everywhere else the bar does not exist, so the FAB keeps its normal position.
   *
   * Desktop (lg+) has no sticky bar — the lg:bottom-6 reset returns it to the corner.
   */
  const onProductPage = pathname?.startsWith("/product");

  return (
    <Link
      href="https://wa.me/923120295812"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => trackContact("whatsapp-fab")}
      // z-[46]: above page content, below the cart drawer (z-49) and its backdrop (z-48).
      // It was z-50, which painted the FAB on top of the drawer's Checkout / Continue
      // Shopping buttons and hijacked those taps to WhatsApp.
      className={`group fixed right-6 z-[46] transition-transform duration-300 hover:scale-110 lg:bottom-6 ${
        onProductPage
          ? "bottom-[calc(6rem+env(safe-area-inset-bottom))]"
          : "bottom-6"
      }`}
    >
      <Image
        src="/icons/whatsapp.png"
        alt="WhatsApp"
        width={56}
        height={56}
        className="h-14 w-14 drop-shadow-[0_4px_20px_rgba(37,211,102,0.5)]"
        priority
      />

      {/* Tooltip */}
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ivory opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
      </span>
    </Link>
  );
}
