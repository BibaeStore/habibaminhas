"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShieldCheck, Truck, RotateCcw, Tag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { ShippingConfig } from "@/lib/actions/settings";

export function CartView({ shipping: shippingCfg }: { shipping: ShippingConfig }) {
  const { items, removeItem, updateQty } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = shippingCfg.standard;
  const total = subtotal + shipping;

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-24 sm:px-8 text-center">
        <div className="h-12 w-48 mx-auto bg-cream animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-24 sm:px-8 text-center">
        <h1 className="font-display text-4xl italic sm:text-5xl">Your bag is empty</h1>
        <p className="mt-4 text-[14px] text-ink-soft">Add some beautiful pieces to get started.</p>
        <Link
          href="/ladies"
          className="mt-8 inline-flex h-12 items-center gap-2 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors"
        >
          Shop ladies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Step 1 of 3
          </span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Your Bag</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            {items.length} {items.length === 1 ? "piece" : "pieces"} · Held for 30 minutes.
          </p>
        </div>
        <Link
          href="/ladies"
          className="hidden text-[12px] uppercase tracking-[0.24em] text-ink-soft underline-offset-4 hover:text-ink hover:underline sm:block"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ul className="divide-y divide-border-soft border-y border-border-soft">
            {items.map((item) => (
              <li key={item.cartKey} className="flex gap-5 py-6">
                <div className="relative w-24 flex-none sm:w-32 aspect-[3/4] bg-cream overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="128px"
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
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={item.category ? `/product/${item.category}/${item.slug}` : `/product/${item.slug}`}
                        className="line-clamp-2 text-[14px] leading-snug text-ink hover:text-gold-dark"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <button
                      aria-label="Remove"
                      onClick={() => removeItem(item.cartKey)}
                      className="text-muted hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-ink-soft">
                    {item.size && item.size !== "onesize" && (
                      <span>Size: <strong className="font-medium">{item.size}</strong></span>
                    )}
                    {item.sku && (
                      <span className="text-muted">SKU: {item.sku}</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="inline-flex items-center border border-border-soft">
                      <button
                        aria-label="Decrease"
                        onClick={() => updateQty(item.cartKey, item.qty - 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-cream"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-[13px]">{item.qty}</span>
                      <button
                        aria-label="Increase"
                        onClick={() => updateQty(item.cartKey, item.qty + 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-cream"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[14px] font-medium">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-ink-soft">
              <Tag className="h-4 w-4 text-gold-dark" />
              Got a code? Apply at checkout.
            </div>
            <Link
              href="/ladies"
              className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink sm:hidden"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-[116px] flex flex-col gap-5 border border-border-soft bg-cream p-6">
            <h2 className="font-display text-2xl italic">Order Summary</h2>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Gift wrap</dt>
                <dd>Free</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t border-border-soft pt-4 text-[15px] font-medium">
              <span>Total</span>
              <span className="font-display text-2xl">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout/shipping"
              className="flex h-14 w-full items-center justify-center bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors"
            >
              Proceed to checkout
            </Link>
            <ul className="grid grid-cols-1 gap-3 pt-2 text-[11px] text-ink-soft">
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-gold-dark" />
                {`Flat ${formatPrice(shippingCfg.standard)} delivery nationwide`}
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-gold-dark" /> 14-day hassle-free returns
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Secure encrypted checkout
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
