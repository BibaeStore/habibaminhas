"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

const SHIPPING        = 200;
const FREE_THRESHOLD  = 3500;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQty } = useCartStore();
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleClose = () => { onClose(); closeDrawer(); };

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /*
   * Lock body scroll with scrollbar-width compensation.
   * Without this, hiding the scrollbar causes a layout shift that creates
   * a thin artifact line on the right edge of full-bleed sections.
   */
  useEffect(() => {
    if (open) {
      const sbWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow      = "hidden";
      document.body.style.paddingRight  = `${sbWidth}px`;
    } else {
      document.body.style.overflow      = "";
      document.body.style.paddingRight  = "";
    }
    return () => {
      document.body.style.overflow      = "";
      document.body.style.paddingRight  = "";
    };
  }, [open]);

  if (!mounted) return null;

  const totalQty  = items.reduce((s, i) => s + i.qty, 0);
  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING;
  const remaining = FREE_THRESHOLD - subtotal;
  const progress  = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  return (
    <>
      {/* Backdrop — z-[48] so it sits BELOW the panel */}
      <div
        aria-hidden
        onClick={handleClose}
        className={`fixed inset-0 z-[48] bg-ink/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel — z-[49] so it floats above backdrop */}
      <aside
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-[49] flex h-screen w-full max-w-[400px] flex-col bg-ivory transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-8px 0 40px rgba(26,22,18,0.12)" }}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-none items-center justify-between border-b border-border-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-ink" />
            <span className="text-[13px] uppercase tracking-[0.28em] text-ink">
              Your Bag
            </span>
            {totalQty > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold leading-none text-ivory">
                {totalQty}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Empty state ────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-9 w-9 text-muted" strokeWidth={1.25} />
            <p className="mt-4 font-display text-2xl italic text-ink">
              Your bag is empty
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              Add some beautiful pieces to get started.
            </p>
            <Link
              href="/ladies"
              onClick={handleClose}
              className="mt-7 inline-flex h-11 items-center gap-2 border border-ink px-7 text-[11px] uppercase tracking-[0.28em] text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              Shop Ladies <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── Free-shipping progress ───────────────────── */}
            <div className="flex-none border-b border-border-soft bg-cream/60 px-5 py-2.5">
              <div className="flex items-center justify-between text-[11px]">
                {remaining > 0 ? (
                  <span className="text-ink-soft">
                    <span className="font-medium text-ink">
                      {formatPrice(remaining)}
                    </span>{" "}
                    away from free shipping
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-gold-dark">
                    <Truck className="h-3 w-3" /> Free shipping unlocked
                  </span>
                )}
                <span className="tabular-nums text-muted">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="mt-1.5 h-[2px] w-full overflow-hidden bg-border-soft">
                <div
                  className="h-full bg-gold-dark transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ── Items list ───────────────────────────────── */}
            <ul className="flex-1 divide-y divide-border-soft overflow-y-auto overscroll-contain px-5">
              {items.map((item) => (
                <li key={item.cartKey} className="flex gap-4 py-5">
                  {/* Thumbnail */}
                  <div className="relative h-[88px] w-[66px] flex-none overflow-hidden bg-cream">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="66px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, ${item.palette[0]}, ${item.palette[1] ?? item.palette[0]})`,
                        }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={handleClose}
                        className="line-clamp-2 text-[13px] leading-snug text-ink transition-colors hover:text-gold-dark"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => removeItem(item.cartKey)}
                        className="flex-none p-0.5 text-muted transition-colors hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.size && item.size !== "onesize" && (
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">
                        Size: {item.size}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Qty stepper */}
                      <div className="inline-flex items-center border border-border-soft">
                        <button
                          type="button"
                          aria-label="Decrease"
                          onClick={() => updateQty(item.cartKey, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink-soft transition-colors hover:bg-cream"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-[12px] tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase"
                          onClick={() => updateQty(item.cartKey, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink-soft transition-colors hover:bg-cream"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-[13px] font-medium tabular-nums">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Footer ───────────────────────────────────── */}
            <div className="flex-none border-t border-border-soft px-5 py-4">
              {/* Order summary */}
              <div className="space-y-1.5 pb-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-soft">Subtotal</span>
                  <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-gold-dark">Complimentary</span>
                  ) : (
                    <span className="tabular-nums">{formatPrice(shipping)}</span>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <Link
                href="/checkout/shipping"
                onClick={handleClose}
                className="flex h-12 w-full items-center justify-center bg-ink text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-gold-dark"
              >
                Checkout &mdash; {formatPrice(subtotal + shipping)}
              </Link>
              <Link
                href="/cart"
                onClick={handleClose}
                className="mt-2 flex h-9 w-full items-center justify-center text-[11px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-ink"
              >
                View full bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
