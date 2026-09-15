"use client";

import { useState, useSyncExternalStore } from "react";
import { Truck, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ShippingConfig } from "@/lib/actions/settings";

const DISMISS_KEY = "hm_free_delivery_bar_dismissed";

/*
  Read through useSyncExternalStore rather than an effect that calls setState.

  The requirement is only "do not touch localStorage until the client has it", which is
  exactly what a server snapshot expresses: false on the server and during hydration, the
  real value thereafter. Doing it with useEffect(() => setVisible(...)) would work but
  triggers a cascading render on every homepage load, which React flags.

  There is no subscribe: nothing else in the app writes this key, so there is nothing to
  listen to. The store is read once per mount.
*/
const noopSubscribe = () => () => {};

function readNotDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) !== "1";
  } catch {
    // Private mode or blocked site data. Showing the bar is the harmless failure.
    return true;
  }
}

/** Never visible in server-rendered HTML - that is what keeps this out of Google's copy. */
const readServerSnapshot = () => false;

/**
 * Campaign bar announcing a free-delivery offer.
 *
 * Two deliberate constraints, both from the SEO rules in AGENTS.md:
 *
 * 1. It renders nothing until after mount, so it is absent from the prerendered HTML. The
 *    homepage is statically generated and its indexed copy still says "Flat Rs. 250" in the
 *    announcement strip, the FAQ JSON-LD and the meta description. The owner chose to leave
 *    all of that untouched, so this bar must not add contradicting text to the page Google
 *    reads. Client-only components that render null during SSR are explicitly listed as
 *    SEO-safe.
 *
 * 2. It is `fixed`, not in the document flow. An element appearing after hydration inside the
 *    flow would push the page down and register as cumulative layout shift, which is a
 *    ranking factor. Fixed positioning means it cannot move anything.
 *
 * Stays clear of `try-room-popup`, which is a full-screen `z-[100]` overlay: this sits at
 * z-40, so the popup covers it rather than fighting with it.
 */
export function FreeDeliveryBar({ shipping }: { shipping: ShippingConfig }) {
  const notDismissedBefore = useSyncExternalStore(
    noopSubscribe,
    readNotDismissed,
    readServerSnapshot,
  );
  // Dismissal in this session, kept separately so the click takes effect immediately rather
  // than waiting on a storage read.
  const [dismissedNow, setDismissedNow] = useState(false);
  const visible = notDismissedBefore && !dismissedNow;

  const storeWideFree = shipping.standard <= 0;
  const hasThreshold = shipping.freeThreshold > 0;

  // Nothing to announce: delivery is charged at the normal rate with no threshold to reach.
  if (!storeWideFree && !hasThreshold) return null;
  if (!visible) return null;

  const message = storeWideFree
    ? "Free delivery on every order, nationwide"
    : `Free delivery on orders over ${formatPrice(shipping.freeThreshold)}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-ink px-4 py-3 text-ivory shadow-soft">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-3">
        <Truck className="h-4 w-4 shrink-0 text-gold" />
        <span className="text-[12px] uppercase tracking-[0.22em]">{message}</span>
        <button
          type="button"
          aria-label="Dismiss free delivery notice"
          onClick={() => {
            setDismissedNow(true);
            try {
              localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* dismissal simply will not persist - not worth failing over */
            }
          }}
          className="absolute right-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ivory/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
