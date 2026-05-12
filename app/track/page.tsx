"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Truck, CheckCircle2, XCircle, Clock, MapPin, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { trackOrderByNumberAndPhone } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

type TrackedOrder = Awaited<ReturnType<typeof trackOrderByNumberAndPhone>>["order"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  pending:    { label: "Order Received",   color: "text-gold-dark",  bg: "bg-gold-light",   icon: <Clock className="h-5 w-5" />,        step: 1 },
  processing: { label: "Being Prepared",   color: "text-gold-dark",  bg: "bg-gold-light",   icon: <Package className="h-5 w-5" />,      step: 2 },
  dispatched: { label: "Out for Delivery", color: "text-sage",       bg: "bg-sage/10",      icon: <Truck className="h-5 w-5" />,        step: 3 },
  delivered:  { label: "Delivered",        color: "text-sage",       bg: "bg-sage/10",      icon: <CheckCircle2 className="h-5 w-5" />, step: 4 },
  cancelled:  { label: "Cancelled",        color: "text-sale",       bg: "bg-sale/10",      icon: <XCircle className="h-5 w-5" />,      step: 0 },
};

const STEPS = [
  { key: "pending",    label: "Order Placed",   icon: <Package className="h-4 w-4" /> },
  { key: "processing", label: "Preparing",      icon: <RotateCcw className="h-4 w-4" /> },
  { key: "dispatched", label: "On the Way",     icon: <Truck className="h-4 w-4" /> },
  { key: "delivered",  label: "Delivered",      icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [phone,    setPhone]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [result,   setResult]   = useState<TrackedOrder | null | "not-found">(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNum.trim() || !phone.trim()) { setError("Please enter both your order number and phone number."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    const res = await trackOrderByNumberAndPhone(orderNum.trim(), phone.trim());
    setLoading(false);
    if (!res.found || !res.order) {
      setResult("not-found");
    } else {
      setResult(res.order);
    }
  }

  const cfg = result && result !== "not-found" ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.pending) : null;
  const currentStep = cfg?.step ?? 0;

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-16 sm:px-6">

      {/* Page header */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">Order Tracking</span>
        <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Track your order.</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Enter your order number and the phone number you used at checkout to see your latest order status.
        </p>
      </div>

      {/* Lookup form */}
      <form onSubmit={handleTrack} className="mt-10 border border-border-soft bg-cream p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Order Number</span>
            <input
              type="text"
              required
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value.toUpperCase())}
              placeholder="ORD-2026-0001"
              className="h-12 border border-border-soft bg-ivory px-4 font-mono text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Phone Number</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              className="h-12 border border-border-soft bg-ivory px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-white"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-[13px] text-sale">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory" />
          ) : (
            <><Search className="h-4 w-4" /> Track Order</>
          )}
        </button>
      </form>

      {/* Not found */}
      {result === "not-found" && (
        <div className="mt-8 border border-sale/30 bg-sale/5 px-6 py-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-sale" />
          <h2 className="mt-3 font-display text-2xl italic">Order not found</h2>
          <p className="mt-2 text-[13px] text-ink-soft">
            We couldn&apos;t find an order with that number and phone combination.<br />
            Double-check the details or{" "}
            <a href="https://wa.me/923120295812" className="text-gold-dark hover:text-ink">WhatsApp us</a>.
          </p>
        </div>
      )}

      {/* Order found */}
      {result && result !== "not-found" && cfg && (
        <div className="mt-8 flex flex-col gap-6">

          {/* Status banner */}
          <div className={`flex items-center gap-4 border px-6 py-5 ${cfg.bg}`}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory ${cfg.color}`}>
              {cfg.icon}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-muted">Current Status</div>
              <div className={`mt-0.5 font-display text-2xl italic ${cfg.color}`}>{cfg.label}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Order</div>
              <div className="mt-0.5 font-mono text-[15px] font-bold text-ink">{result.order_number}</div>
            </div>
          </div>

          {/* Progress stepper (hidden for cancelled) */}
          {result.status !== "cancelled" && (
            <div className="border border-border-soft bg-ivory px-6 py-6">
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const done    = currentStep > i + 1;
                  const active  = currentStep === i + 1;
                  const pending = currentStep < i + 1;
                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                          done   ? "bg-gold-dark text-ivory" :
                          active ? "bg-ink text-ivory" :
                                   "bg-cream text-muted border border-border-soft"
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`hidden text-center text-[9px] uppercase tracking-[0.18em] sm:block ${
                          active ? "font-bold text-ink" : done ? "text-gold-dark" : "text-muted"
                        }`}>{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 sm:mx-2 ${done ? "bg-gold-dark" : "bg-border-soft"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order meta */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Placed",  value: new Date(result.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) },
              { label: "Payment", value: result.payment_method },
              { label: "City",    value: result.city || "—" },
              { label: "Courier", value: result.courier || "TCS" },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border-soft bg-cream px-4 py-4">
                <div className="text-[9px] uppercase tracking-[0.22em] text-muted">{label}</div>
                <div className="mt-1 text-[13px] font-medium text-ink">{value}</div>
              </div>
            ))}
          </div>

          {/* Tracking number */}
          {result.tracking_number && (
            <div className="flex items-center gap-3 border border-gold-dark/30 bg-gold-light px-5 py-4">
              <Truck className="h-4 w-4 shrink-0 text-gold-dark" />
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-gold-dark">Tracking Number</span>
                <p className="mt-0.5 font-mono text-[15px] font-bold text-ink">{result.tracking_number}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="border border-border-soft">
            <div className="border-b border-border-soft bg-cream px-5 py-3">
              <h2 className="text-[11px] uppercase tracking-[0.22em] text-ink">Items in your order</h2>
            </div>
            <ul className="divide-y divide-border-soft">
              {result.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  {item.product_image ? (
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-cream">
                      <Image src={item.product_image} alt={item.product_title} fill sizes="40px" className="object-cover object-top" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center bg-cream">
                      <Package className="h-5 w-5 text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 text-[13px] font-medium text-ink">{item.product_title}</div>
                    {item.size && <div className="mt-0.5 text-[11px] text-muted">Size: {item.size}</div>}
                    <div className="mt-0.5 text-[11px] text-muted">Qty: {item.quantity}</div>
                  </div>
                  <div className="shrink-0 text-[13px] font-medium text-ink">{formatPrice(item.total_price)}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="border border-border-soft bg-cream px-6 py-5">
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(result.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{formatPrice(result.shipping)}</span></div>
              <div className="flex justify-between border-t border-border-soft pt-3 text-[15px] font-semibold">
                <span>Total</span><span className="font-display text-2xl">{formatPrice(result.total)}</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="flex flex-col items-center gap-3 border border-border-soft bg-ivory px-6 py-6 text-center sm:flex-row">
            <ShieldCheck className="h-5 w-5 shrink-0 text-gold-dark" />
            <p className="text-[13px] text-ink-soft">
              Need help with your order?&nbsp;
              <a href="https://wa.me/923120295812" className="font-medium text-gold-dark hover:text-ink">WhatsApp us</a>
              &nbsp;or email&nbsp;
              <a href="mailto:support@habibaminhas.com" className="font-medium text-gold-dark hover:text-ink">support@habibaminhas.com</a>
            </p>
            <Link href="/shop" className="ml-auto hidden shrink-0 items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] text-ink hover:text-gold-dark sm:inline-flex">
              Continue shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      )}

      {/* Trust badges (always visible) */}
      {!result && (
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: <Package className="h-5 w-5 text-gold-dark" />, text: "Real-time status updates" },
            { icon: <MapPin className="h-5 w-5 text-gold-dark" />,  text: "City-level tracking" },
            { icon: <ShieldCheck className="h-5 w-5 text-gold-dark" />, text: "Secure — phone verified" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 border border-border-soft bg-cream px-4 py-3 text-[12px] text-ink-soft">
              {icon}<span>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
