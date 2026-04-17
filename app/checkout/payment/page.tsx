"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Lock, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/common/product-image";

type PaymentMethod = "card" | "jazzcash" | "easypaisa" | "cod";

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  subtitle: string;
  logo: string;
  logoW: number;
  logoH: number;
}[] = [
  { value: "cod",       label: "Cash on Delivery",   subtitle: "Pay when your order arrives",    logo: "/logos/payments/cod.webp",          logoW: 56, logoH: 32 },
  { value: "card",      label: "Debit / Credit Card", subtitle: "Visa · Mastercard · Bank transfer", logo: "/logos/payments/bank-transfer.webp", logoW: 32, logoH: 32 },
  { value: "jazzcash",  label: "JazzCash",            subtitle: "Pay with your JazzCash account",  logo: "/logos/payments/jazzcash.webp",     logoW: 72, logoH: 36 },
  { value: "easypaisa", label: "Easypaisa",           subtitle: "Pay with your Easypaisa account", logo: "/logos/payments/easypaisa.webp",    logoW: 72, logoH: 36 },
];

export default function PaymentPage() {
  const { items, clearCart } = useCartStore();
  const { shipping, clearCheckout } = useCheckoutStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) router.replace("/cart");
    else if (!shipping) router.replace("/checkout/shipping");
  }, [mounted, items, shipping, router]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping?.shippingCost ?? 200;
  const total = subtotal + shippingCost;

  const [payMethod, setPayMethod] = useState<PaymentMethod>("cod");
  const [giftMessage, setGiftMsg] = useState(shipping?.giftMessage ?? "");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!shipping || items.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const address = {
        street: shipping.street,
        apartment: shipping.apartment,
        city: shipping.city,
        province: shipping.province,
        postalCode: shipping.postalCode,
        country: "Pakistan",
      };
      const orderItems = items.map((item) => ({
        product_id: item.id,
        product_title: item.title,
        product_image: item.image,
        sku: item.sku,
        size: item.size !== "onesize" ? item.size : null,
        quantity: item.qty,
        unit_price: item.price,
        total_price: item.price * item.qty,
      }));
      const newOrder = await createOrder(
        {
          customer_name: `${shipping.firstName} ${shipping.lastName}`,
          customer_email: shipping.email,
          customer_phone: shipping.phone,
          address,
          subtotal,
          shipping: shippingCost,
          total,
          payment_method: payMethod,
          payment_status: payMethod === "cod" ? "pending" : "paid",
          status: "pending",
          courier: shipping.shippingMethod === "express" ? "TCS Overnight" : "TCS",
        },
        orderItems
      );
      localStorage.setItem("hm_customer_email", shipping.email);
      clearCart();
      clearCheckout();
      router.push(`/order/${newOrder.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  if (!mounted || !shipping) return null;

  const shipName = `${shipping.firstName} ${shipping.lastName}`;
  const shipAddr = [shipping.street, shipping.city].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">

      {/* Step indicator */}
      <nav className="mb-12 flex items-center gap-0">
        {[
          { n: 1, label: "Bag",      done: true  },
          { n: 2, label: "Shipping", done: true  },
          { n: 3, label: "Payment",  done: false, active: true },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center text-[11px] font-medium transition-colors ${
                step.done
                  ? "bg-sage text-ivory"
                  : step.active
                  ? "bg-ink text-ivory"
                  : "border border-border-soft bg-cream text-muted"
              }`}>
                {step.done ? <Check className="h-3.5 w-3.5" /> : step.n}
              </div>
              <span className={`hidden text-[10px] uppercase tracking-[0.26em] sm:block ${
                step.active ? "text-ink font-medium" : "text-muted"
              }`}>{step.label}</span>
            </div>
            {i < 2 && <div className="mx-3 mb-5 h-px w-14 bg-border-soft sm:w-24" />}
          </div>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* ── Left: payment form ─────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <p className="text-[11px] uppercase tracking-[0.36em] text-gold-dark">Step 3 of 3</p>
          <h1 className="mt-2 font-display text-5xl italic sm:text-6xl">Payment.</h1>
          <p className="mt-2 text-[13px] text-ink-soft">
            All transactions are secure and encrypted.
          </p>

          <form onSubmit={handlePlaceOrder} className="mt-8 flex flex-col gap-4">

            {/* Payment method cards */}
            <div className="flex flex-col gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-4 border px-5 py-4 transition-colors ${
                    payMethod === opt.value
                      ? "border-ink bg-cream"
                      : "border-border-soft bg-ivory hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payMethod === opt.value}
                    onChange={() => setPayMethod(opt.value)}
                    className="accent-ink"
                  />
                  {/* Logo */}
                  <div className="flex h-10 w-20 shrink-0 items-center">
                    <Image
                      src={opt.logo}
                      alt={opt.label}
                      width={opt.logoW}
                      height={opt.logoH}
                      className="object-contain"
                    />
                  </div>
                  {/* Label */}
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-ink">{opt.label}</div>
                    <div className="text-[11px] text-ink-soft">{opt.subtitle}</div>
                  </div>
                  {/* Visa + Mastercard badge on card option */}
                  {opt.value === "card" && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Image src="/logos/payments/visa.webp"       alt="Visa"       width={36} height={22} className="object-contain" />
                      <Image src="/logos/payments/mastercard.webp" alt="Mastercard" width={28} height={22} className="object-contain" />
                    </div>
                  )}
                  {/* Active indicator dot */}
                  {payMethod === opt.value && (
                    <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-ink" />
                  )}
                </label>
              ))}
            </div>

            {/* Card fields (shown when card selected) */}
            {payMethod === "card" && (
              <div className="border border-border-soft bg-ivory p-5">
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted">Card number</span>
                    <input placeholder="1234 5678 9012 3456" maxLength={19} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted">Name on card</span>
                    <input placeholder="As it appears on card" className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-muted">Expiry</span>
                      <input placeholder="MM / YY" maxLength={7} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-muted">CVV</span>
                      <input type="password" placeholder="•••" maxLength={4} className="h-11 border border-border-soft bg-transparent px-3 text-[14px] outline-none focus:border-ink" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Gift note */}
            <div className="border border-border-soft bg-ivory p-5">
              <div className="mb-2 text-[10px] uppercase tracking-[0.26em] text-muted">Gift message <span className="normal-case tracking-normal">(optional)</span></div>
              <textarea
                rows={3}
                value={giftMessage}
                onChange={(e) => setGiftMsg(e.target.value)}
                placeholder="Add a personal note — included with complimentary gift wrapping."
                className="w-full resize-none border border-border-soft bg-transparent px-3 py-2.5 text-[13px] outline-none focus:border-ink"
              />
            </div>

            {/* Security note */}
            <div className="flex items-center gap-3 border border-border-soft bg-cream px-4 py-3 text-[12px] text-ink-soft">
              <Lock className="h-3.5 w-3.5 shrink-0 text-gold-dark" />
              Your payment is encrypted with 256-bit SSL security.
            </div>

            {error && (
              <div className="border border-sale/40 bg-sale/5 p-4 text-[13px] text-sale">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-5">
              <Link href="/checkout/shipping" className="text-[11px] uppercase tracking-[0.26em] text-ink-soft hover:text-ink transition-colors">
                ← Back
              </Link>
              <button
                type="submit"
                disabled={placing}
                className="group flex h-14 items-center gap-2.5 bg-ink px-10 text-[12px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory" />
                    Placing order…
                  </>
                ) : (
                  <>
                    Place order
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: order summary ───────────────────────────────────── */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 flex flex-col gap-0 border border-border-soft bg-cream">

            {/* Header */}
            <div className="border-b border-border-soft px-6 py-5">
              <h2 className="font-display text-2xl italic">Order summary</h2>
            </div>

            {/* Items */}
            <ul className="flex flex-col divide-y divide-border-soft px-6">
              {items.map((item) => (
                <li key={item.cartKey} className="flex gap-4 py-4">
                  <div className="relative w-14 flex-none aspect-[3/4] overflow-hidden bg-ivory">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      palette={item.palette}
                      sizes="56px"
                    />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2 text-[13px]">
                    <div>
                      <div className="font-medium leading-snug">{item.title}</div>
                      {item.size && item.size !== "onesize" && (
                        <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted">{item.size}</div>
                      )}
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(item.price * item.qty)}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Ships to */}
            <div className="border-t border-border-soft px-6 py-4 text-[12px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Ships to</div>
                  <div className="mt-1 font-medium text-ink">{shipName}</div>
                  <div className="mt-0.5 text-ink-soft">{shipAddr}</div>
                </div>
                <Link href="/checkout/shipping" className="shrink-0 text-[11px] text-gold-dark hover:text-ink transition-colors">
                  Edit
                </Link>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border-soft px-6 py-5">
              <dl className="flex flex-col gap-2.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd>{shippingCost === 0 ? <span className="text-gold-dark">Complimentary</span> : formatPrice(shippingCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Gift wrap</dt>
                  <dd>Free</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-4">
                <span className="text-[14px] font-medium">Total</span>
                <span className="font-display text-3xl">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="border-t border-border-soft px-6 py-4">
              <ul className="flex flex-col gap-2 text-[11px] text-ink-soft">
                <li className="flex items-center gap-2"><Truck      className="h-3.5 w-3.5 shrink-0 text-gold-dark" /> Flat Rs. 200 delivery nationwide</li>
                <li className="flex items-center gap-2"><RotateCcw  className="h-3.5 w-3.5 shrink-0 text-gold-dark" /> 14-day hassle-free returns</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gold-dark" /> Secure encrypted checkout</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
