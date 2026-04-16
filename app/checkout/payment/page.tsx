"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Lock, CreditCard } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

type PaymentMethod = "card" | "jazzcash" | "easypaisa" | "cod";

export default function PaymentPage() {
  const { items, clearCart } = useCartStore();
  const { shipping, setPaymentMethod, setGiftMessage, clearCheckout } = useCheckoutStore();
  const router = useRouter();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping?.shippingCost ?? 200;
  const total = subtotal + shippingCost;

  const [payMethod, setPayMethod] = useState<PaymentMethod>("cod");
  const [giftMessage, setGiftMsg] = useState(shipping?.giftMessage ?? "");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
    else if (!shipping) router.replace("/checkout/shipping");
  }, [items, shipping, router]);

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

      clearCart();
      clearCheckout();
      router.push(`/order/${newOrder.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  if (!shipping) return null;

  const shipsTo = `${shipping.firstName} ${shipping.lastName} · ${shipping.street}${shipping.city ? `, ${shipping.city}` : ""}`;

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

          <form onSubmit={handlePlaceOrder} className="mt-8 flex flex-col gap-6">
            {/* Payment method selection */}
            <div className="flex flex-col gap-3">
              {/* Cash on Delivery — default */}
              <label className={`flex cursor-pointer items-center gap-3 border px-4 py-4 ${payMethod === "cod" ? "border-ink bg-cream" : "border-border-soft bg-ivory"}`}>
                <input type="radio" name="payment" checked={payMethod === "cod"} onChange={() => setPayMethod("cod")} className="accent-ink" />
                <div className="flex h-6 w-6 items-center justify-center border border-border-soft bg-cream text-[11px]">₨</div>
                <div>
                  <div className="text-[13px]">Cash on Delivery</div>
                  <div className="text-[11px] text-ink-soft">Pay when your order arrives</div>
                </div>
              </label>

              {/* Card */}
              <label className={`flex cursor-pointer items-center gap-3 border px-4 py-4 ${payMethod === "card" ? "border-ink bg-cream" : "border-border-soft bg-ivory"}`}>
                <input type="radio" name="payment" checked={payMethod === "card"} onChange={() => setPayMethod("card")} className="accent-ink" />
                <CreditCard className="h-4 w-4 text-gold-dark" />
                <span className="text-[13px] font-medium">Debit / Credit Card</span>
              </label>

              {payMethod === "card" && (
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
              )}

              {/* JazzCash */}
              <label className={`flex cursor-pointer items-center gap-3 border px-4 py-4 ${payMethod === "jazzcash" ? "border-ink bg-cream" : "border-border-soft bg-ivory"}`}>
                <input type="radio" name="payment" checked={payMethod === "jazzcash"} onChange={() => setPayMethod("jazzcash")} className="accent-ink" />
                <span className="flex h-6 w-16 items-center justify-center bg-[#e8192c] text-[10px] font-bold text-white">JazzCash</span>
                <span className="text-[13px]">JazzCash</span>
              </label>

              {/* Easypaisa */}
              <label className={`flex cursor-pointer items-center gap-3 border px-4 py-4 ${payMethod === "easypaisa" ? "border-ink bg-cream" : "border-border-soft bg-ivory"}`}>
                <input type="radio" name="payment" checked={payMethod === "easypaisa"} onChange={() => setPayMethod("easypaisa")} className="accent-ink" />
                <span className="flex h-6 w-16 items-center justify-center bg-[#00a651] text-[10px] font-bold text-white">Easypaisa</span>
                <span className="text-[13px]">Easypaisa</span>
              </label>
            </div>

            {/* Gift note */}
            <div className="border border-border-soft bg-ivory p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted mb-3">Gift message (optional)</div>
              <textarea
                rows={3}
                value={giftMessage}
                onChange={(e) => setGiftMsg(e.target.value)}
                placeholder="Add a personal note — included with complimentary gift wrapping."
                className="w-full border border-border-soft bg-transparent px-3 py-2.5 text-[13px] outline-none focus:border-ink resize-none"
              />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 border border-border-soft bg-cream p-4 text-[12px] text-ink-soft">
              <Lock className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
              Your payment information is encrypted and never stored on our servers.
            </div>

            {error && (
              <div className="border border-sale bg-sale/5 p-4 text-[13px] text-sale">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-4">
              <Link href="/checkout/shipping" className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink">
                ← Back to shipping
              </Link>
              <button
                type="submit"
                disabled={placing}
                className="flex h-14 items-center gap-2 bg-ink px-10 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? "Placing order…" : "Place order"}
                {!placing && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 flex flex-col gap-5 border border-border-soft bg-cream p-6">
            <h2 className="font-display text-2xl italic">Order summary</h2>
            <ul className="flex flex-col gap-4 border-b border-border-soft pb-5">
              {items.map((item) => (
                <li key={item.cartKey} className="flex gap-4">
                  <div className="relative w-14 flex-none aspect-[3/4] bg-ivory overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover object-top" />
                    ) : (
                      <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${item.palette[0]}, ${item.palette[1] ?? item.palette[0]})` }} />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2 text-[13px]">
                    <div>
                      <div className="font-medium leading-snug">{item.title}</div>
                      {item.size && item.size !== "onesize" && (
                        <div className="mt-0.5 text-[11px] text-muted">{item.size}</div>
                      )}
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(item.price * item.qty)}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Shipping address summary */}
            <div className="border-b border-border-soft pb-4 text-[12px]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted mb-1">Ships to</div>
              <div className="text-ink-soft">{shipsTo}</div>
              <Link href="/checkout/shipping" className="mt-1 inline-block text-gold-dark hover:text-ink">Edit</Link>
            </div>

            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>
                  {shippingCost === 0 ? (
                    <span className="text-gold-dark">Complimentary</span>
                  ) : (
                    formatPrice(shippingCost)
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
