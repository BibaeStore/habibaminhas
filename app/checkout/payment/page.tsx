import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Lock, CreditCard } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Payment — Checkout" };

const lineItems = [
  { product: products[0], qty: 1, size: "M", colour: "Dusty Rose" },
  { product: products[8], qty: 2, size: "S", colour: "Ink" },
];
const subtotal = lineItems.reduce((s, l) => s + l.product.price * l.qty, 0);
const shipping = subtotal > 3500 ? 0 : 250;
const total = subtotal + shipping;

export default function PaymentPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">
      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-0">
        {[
          { n: 1, label: "Bag", href: "/cart", done: true },
          { n: 2, label: "Shipping", href: "/checkout/shipping", done: true },
          { n: 3, label: "Payment", href: "/checkout/payment", active: true },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center text-[12px] font-medium transition-colors ${
                step.done ? "bg-sage text-ivory" : step.active ? "bg-ink text-ivory" : "border border-border-soft bg-cream text-muted"
              }`}>
                {step.done ? "✓" : step.n}
              </div>
              <span className={`mt-1.5 hidden text-[10px] uppercase tracking-[0.24em] sm:block ${
                step.active ? "text-ink" : "text-muted"
              }`}>{step.label}</span>
            </div>
            {i < 2 && <div className="mx-3 h-px w-12 bg-border-soft sm:w-20" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Step 3 of 3</span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Payment.</h1>

          <form className="mt-8 flex flex-col gap-6">
            {/* Payment method selection */}
            <div className="flex flex-col gap-3">
              {/* Card */}
              <label className="flex cursor-pointer items-center gap-3 border border-ink bg-cream px-4 py-4">
                <input type="radio" name="payment" defaultChecked className="accent-ink" />
                <CreditCard className="h-4 w-4 text-gold-dark" />
                <span className="text-[13px] font-medium">Debit / Credit Card</span>
              </label>

              {/* Card fields */}
              <div className="border border-border-soft bg-ivory p-5">
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Card number</span>
                    <input placeholder="1234 5678 9012 3456" maxLength={19} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Name on card</span>
                    <input placeholder="As it appears on card" className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Expiry</span>
                      <input placeholder="MM / YY" maxLength={7} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted">CVV</span>
                      <input type="password" placeholder="•••" maxLength={4} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                    </label>
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <label className="flex cursor-pointer items-center gap-3 border border-border-soft bg-ivory px-4 py-4">
                <input type="radio" name="payment" className="accent-ink" />
                <span className="flex h-6 w-16 items-center justify-center bg-[#e8192c] text-[10px] font-bold text-white">JazzCash</span>
                <span className="text-[13px]">JazzCash</span>
              </label>

              {/* Easypaisa */}
              <label className="flex cursor-pointer items-center gap-3 border border-border-soft bg-ivory px-4 py-4">
                <input type="radio" name="payment" className="accent-ink" />
                <span className="flex h-6 w-16 items-center justify-center bg-[#00a651] text-[10px] font-bold text-white">Easypaisa</span>
                <span className="text-[13px]">Easypaisa</span>
              </label>

              {/* Cash on Delivery */}
              <label className="flex cursor-pointer items-center gap-3 border border-border-soft bg-ivory px-4 py-4">
                <input type="radio" name="payment" className="accent-ink" />
                <div className="flex h-6 w-6 items-center justify-center border border-border-soft bg-cream text-[11px]">₨</div>
                <div>
                  <div className="text-[13px]">Cash on Delivery</div>
                  <div className="text-[11px] text-ink-soft">Pay when your order arrives</div>
                </div>
              </label>
            </div>

            {/* Gift note */}
            <div className="border border-border-soft bg-ivory p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted mb-3">Gift message (optional)</div>
              <textarea rows={3} placeholder="Add a personal note — included with complimentary gift wrapping." className="w-full border border-border-soft bg-transparent px-3 py-2.5 text-[13px] outline-none focus:border-ink resize-none" />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 rounded-none border border-border-soft bg-cream p-4 text-[12px] text-ink-soft">
              <Lock className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
              Your payment information is encrypted and never stored on our servers.
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-4">
              <Link href="/checkout/shipping" className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink">
                ← Back to shipping
              </Link>
              <Link
                href="/order/HM-20260416"
                className="flex h-14 items-center gap-2 bg-ink px-10 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors"
              >
                Place order <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 flex flex-col gap-5 border border-border-soft bg-cream p-6">
            <h2 className="font-display text-2xl italic">Order summary</h2>
            <ul className="flex flex-col gap-4 border-b border-border-soft pb-5">
              {lineItems.map((l, i) => (
                <li key={i} className="flex gap-4">
                  <div className="relative w-14 flex-none aspect-[3/4] bg-ivory overflow-hidden">
                    {l.product.image ? (
                      <Image src={l.product.image} alt={l.product.title} fill sizes="56px" className="object-cover object-top" />
                    ) : (
                      <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${l.product.palette[0]}, ${l.product.palette[1]})` }} />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                      {l.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2 text-[13px]">
                    <div>
                      <div className="font-medium leading-snug">{l.product.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted">{l.size} · {l.colour}</div>
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(l.product.price * l.qty)}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Shipping address summary */}
            <div className="border-b border-border-soft pb-4 text-[12px]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted mb-1">Ships to</div>
              <div className="text-ink-soft">Ayesha Khan · House 14, Street 7, DHA Phase 6, Karachi</div>
              <Link href="/checkout/shipping" className="mt-1 inline-block text-gold-dark hover:text-ink">Edit</Link>
            </div>

            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{shipping === 0 ? <span className="text-gold-dark">Complimentary</span> : formatPrice(shipping)}</dd>
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
            <ul className="grid grid-cols-1 gap-2 pt-1 text-[11px] text-ink-soft">
              <li className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-gold-dark" /> Free shipping over Rs. 3,500</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-gold-dark" /> 14-day hassle-free returns</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Secure encrypted checkout</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
