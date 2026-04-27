"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

const SHIPPING       = 250;
const FREE_THRESHOLD = 3500;

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

  /* Body scroll lock */
  useEffect(() => {
    if (open) {
      const sbWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow     = "hidden";
      document.body.style.paddingRight = `${sbWidth}px`;
    } else {
      document.body.style.overflow     = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow     = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  if (!mounted) return null;

  const itemCount = items.length; // distinct products — for the badge
  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING;
  const remaining = Math.max(FREE_THRESHOLD - subtotal, 0);
  const progress  = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        className={`fixed inset-0 z-[48] bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-[49] flex h-screen w-full max-w-[420px] flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-4px 0 40px rgba(26,22,18,0.15)" }}
      >

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-none items-center justify-between border-b border-border-soft px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold uppercase tracking-[0.3em] text-ink">
              Shopping Bag
            </span>
            {itemCount > 0 && (
              <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-ivory">
                {itemCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted" strokeWidth={1.25} />
            <p className="mt-5 text-[15px] font-semibold uppercase tracking-[0.2em] text-ink">
              Your bag is empty
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              Add some beautiful pieces to get started.
            </p>
            <Link
              href="/ladies"
              onClick={handleClose}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-gold-dark"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── Free-shipping banner + progress ─────────────────── */}
            <div className="flex-none border-b border-border-soft bg-cream px-5 py-3">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.26em] text-ink">
                Free Shipping Over {formatPrice(FREE_THRESHOLD)}
              </p>
              {remaining > 0 ? (
                <p className="mt-0.5 text-center text-[11px] text-gold-dark">
                  Amount Left for Free Shipping: <strong>{formatPrice(remaining)}</strong>
                </p>
              ) : (
                <p className="mt-0.5 text-center text-[11px] font-medium text-sage">
                  🎉 You've unlocked free shipping!
                </p>
              )}
              {/* Progress bar with Rs.0 — Rs.threshold labels */}
              <div className="mt-2">
                <div className="relative h-[4px] w-full overflow-hidden rounded-full bg-border-soft">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gold-dark transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                  <span>Rs.0</span>
                  <span>{formatPrice(FREE_THRESHOLD)}</span>
                </div>
              </div>
            </div>

            {/* ── Items list ──────────────────────────────────────── */}
            <ul className="flex-1 divide-y divide-border-soft overflow-y-auto overscroll-contain px-5">
              {items.map((item) => (
                <li key={item.cartKey} className="flex gap-4 py-5">

                  {/* Product image — larger, portrait */}
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={handleClose}
                    className="relative h-[110px] w-[82px] flex-none overflow-hidden bg-cream"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="82px"
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
                  </Link>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {/* Title */}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={handleClose}
                      className="line-clamp-2 text-[12px] font-semibold uppercase leading-snug tracking-[0.12em] text-ink transition-colors hover:text-gold-dark"
                    >
                      {item.title}
                    </Link>

                    {/* Price */}
                    <span className="text-[13px] font-semibold text-gold-dark">
                      {formatPrice(item.price)}
                    </span>

                    {/* In Stock + Size */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-sage">In Stock</span>
                      {item.size && item.size !== "onesize" && (
                        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                          · Size: {item.size}
                        </span>
                      )}
                    </div>

                    {/* Qty controls — circular Sapphire-style */}
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(item.cartKey, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-dark disabled:opacity-40"
                          disabled={item.qty <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-medium tabular-nums text-ink">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.cartKey, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-dark"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.cartKey)}
                        className="text-muted transition-colors hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Line total */}
                    {item.qty > 1 && (
                      <span className="text-[12px] font-medium tabular-nums text-ink">
                        = {formatPrice(item.price * item.qty)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Footer ──────────────────────────────────────────── */}
            <div className="flex-none border-t border-border-soft bg-white px-5 pb-6 pt-4">

              {/* Subtotal row */}
              <div className="flex items-center justify-between pb-4">
                <span className="text-[13px] font-bold uppercase tracking-[0.26em] text-ink">
                  Subtotal:
                </span>
                <span className="text-[16px] font-bold tabular-nums text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* VIEW BAG + CHECKOUT side by side */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={handleClose}
                  className="flex h-12 items-center justify-center bg-ink text-[11px] font-semibold uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout/shipping"
                  onClick={handleClose}
                  className="flex h-12 items-center justify-center bg-ink text-[11px] font-semibold uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
                >
                  Checkout
                </Link>
              </div>

              {/* CONTINUE SHOPPING */}
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 flex h-11 w-full items-center justify-center border border-ink text-[11px] font-semibold uppercase tracking-[0.28em] text-ink transition-colors hover:bg-cream"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
