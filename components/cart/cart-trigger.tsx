"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

/*
 * This renders ONLY the bag button. The drawer itself is mounted at the root in
 * layout-shell.tsx — it must not live here.
 *
 * CartTrigger sits inside the navbar, which sits inside the fixed `z-40` header
 * wrapper. A positioned element with a z-index creates a stacking context, so every
 * z-index inside that wrapper is resolved *within* it: the drawer's z-49 competed at
 * z-40 against the rest of the page. The product page's sticky Add-to-Bag bar (z-45)
 * therefore painted on top of the open drawer, over its checkout buttons.
 */
export function CartTrigger() {
  const items      = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [mounted, setMounted] = useState(false);

  /* Avoid hydration mismatch — badge only renders after client mount */
  useEffect(() => setMounted(true), []);

  const totalQty  = items.reduce((s, i) => s + i.qty, 0);
  const itemCount = items.length; // distinct SKUs — shown on the badge

  return (
    <>
      <button
        type="button"
        aria-label={`Shopping bag${totalQty > 0 ? `, ${totalQty} item${totalQty !== 1 ? "s" : ""}` : ""}`}
        onClick={openDrawer}
        className="relative p-2 text-ink transition-colors hover:text-gold-dark"
      >
        <ShoppingBag className="h-[18px] w-[18px]" />

        {/* Badge shows number of distinct line items, not total quantity */}
        {mounted && itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ivory tabular-nums">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>
    </>
  );
}
