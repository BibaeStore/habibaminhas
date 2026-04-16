import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Shipping — Checkout" };

const lineItems = [
  { product: products[0], qty: 1, size: "M", colour: "Dusty Rose" },
  { product: products[8], qty: 2, size: "S", colour: "Ink" },
];
const subtotal = lineItems.reduce((s, l) => s + l.product.price * l.qty, 0);
const shipping = subtotal > 3500 ? 0 : 250;
const total = subtotal + shipping;

export default function ShippingPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">
      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-0">
        {[
          { n: 1, label: "Bag", href: "/cart", done: true },
          { n: 2, label: "Shipping", href: "/checkout/shipping", active: true },
          { n: 3, label: "Payment", href: "/checkout/payment" },
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
        {/* Form */}
        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Step 2 of 3</span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Shipping.</h1>

          <form className="mt-8 flex flex-col gap-8">
            {/* Contact */}
            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Contact</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">First name</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Last name</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Phone number (WhatsApp preferred)</span>
                  <input type="tel" placeholder="+92 3XX XXXXXXX" className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email address</span>
                  <input type="email" className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Delivery address</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Street address</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" placeholder="House/flat no., street, area" />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Apartment / Floor / Landmark (optional)</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">City</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Province</span>
                  <select className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink">
                    <option value="">Select province</option>
                    <option>Sindh</option>
                    <option>Punjab</option>
                    <option>KPK</option>
                    <option>Balochistan</option>
                    <option>Islamabad Capital Territory</option>
                    <option>AJK</option>
                    <option>Gilgit-Baltistan</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Postal code</span>
                  <input className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                </label>
              </div>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Delivery method</h2>
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex cursor-pointer items-center justify-between border border-ink bg-cream px-4 py-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" defaultChecked className="accent-ink" />
                    <div>
                      <div className="text-[13px] font-medium">Standard Delivery · 3–5 business days</div>
                      <div className="text-[12px] text-ink-soft">TCS Courier — tracking provided</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">
                    {shipping === 0 ? <span className="text-gold-dark">Complimentary</span> : formatPrice(shipping)}
                  </div>
                </label>
                <label className="flex cursor-pointer items-center justify-between border border-border-soft bg-ivory px-4 py-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" className="accent-ink" />
                    <div>
                      <div className="text-[13px] font-medium">Express Delivery · 1–2 business days</div>
                      <div className="text-[12px] text-ink-soft">TCS Overnight — Karachi, Lahore, Islamabad only</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">{formatPrice(500)}</div>
                </label>
              </div>
            </section>

            <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-6">
              <Link href="/cart" className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink">
                ← Back to bag
              </Link>
              <Link
                href="/checkout/payment"
                className="flex h-14 items-center gap-2 bg-ink px-10 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors"
              >
                Continue to payment <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </form>
        </div>

        {/* Order summary sidebar */}
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
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{shipping === 0 ? <span className="text-gold-dark">Complimentary</span> : formatPrice(shipping)}</dd>
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
