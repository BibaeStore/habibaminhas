import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShieldCheck, Truck, RotateCcw, Tag } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Your Bag" };

export default function CartPage() {
  const lineItems = [
    { product: products[0], qty: 1, size: "M", colour: "Dusty Rose" },
    { product: products[8], qty: 2, size: "S", colour: "Ink" },
  ];
  const subtotal = lineItems.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal > 3500 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Step 1 of 3
          </span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Your Bag</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            {lineItems.length} pieces · Held for 30 minutes.
          </p>
        </div>
        <Link
          href="/women"
          className="hidden text-[12px] uppercase tracking-[0.24em] text-ink-soft underline-offset-4 hover:text-ink hover:underline sm:block"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ul className="divide-y divide-border-soft border-y border-border-soft">
            {lineItems.map((l, idx) => (
              <li key={idx} className="flex gap-5 py-6">
                <div className="relative w-24 flex-none sm:w-32 aspect-[3/4] bg-cream overflow-hidden">
                  {l.product.image ? (
                    <Image src={l.product.image} alt={l.product.title} fill sizes="128px" className="object-cover object-top" />
                  ) : (
                    <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${l.product.palette[0]}, ${l.product.palette[1]})` }} />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${l.product.slug}`}
                        className="line-clamp-2 text-[14px] leading-snug text-ink hover:text-gold-dark"
                      >
                        {l.product.title}
                      </Link>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted">
                        {l.product.collection}
                      </div>
                    </div>
                    <button
                      aria-label="Remove"
                      className="text-muted hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-ink-soft">
                    <span>Size: <strong className="font-medium">{l.size}</strong></span>
                    <span>Colour: <strong className="font-medium">{l.colour}</strong></span>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="inline-flex items-center border border-border-soft">
                      <button
                        aria-label="Decrease"
                        className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-cream"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-[13px]">{l.qty}</span>
                      <button
                        aria-label="Increase"
                        className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-cream"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[14px] font-medium">
                      {formatPrice(l.product.price * l.qty)}
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
              href="/women"
              className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink sm:hidden"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 flex flex-col gap-5 border border-border-soft bg-cream p-6">
            <h2 className="font-display text-2xl italic">Order Summary</h2>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>
                  {shipping === 0 ? (
                    <span className="text-gold-dark">Complimentary</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </dd>
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
            <button className="h-14 w-full bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark">
              Proceed to checkout
            </button>
            <ul className="grid grid-cols-1 gap-3 pt-2 text-[11px] text-ink-soft">
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-gold-dark" /> Free shipping over Rs. 3,500
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
