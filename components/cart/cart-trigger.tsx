"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "./cart-drawer";

export function CartTrigger() {
  const items      = useCartStore((s) => s.items);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const closeDrawer= useCartStore((s) => s.closeDrawer);
  const [mounted, setMounted] = useState(false);

  /* Avoid hydration mismatch — badge only renders after client mount */
  useEffect(() => setMounted(true), []);

  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <button
        type="button"
        aria-label={`Shopping bag${totalQty > 0 ? `, ${totalQty} item${totalQty !== 1 ? "s" : ""}` : ""}`}
        onClick={openDrawer}
        className="relative p-2 text-ink transition-colors hover:text-gold-dark"
      >
        <ShoppingBag className="h-[18px] w-[18px]" />

        {/* Dynamic badge — only after hydration to prevent mismatch */}
        {mounted && totalQty > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ivory tabular-nums">
            {totalQty > 99 ? "99+" : totalQty}
          </span>
        )}
      </button>

      <CartDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
