import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Params = { id: string };

const orders: Record<string, {
  id: string; date: string; status: string; total: number;
  shipping: number; subtotal: number;
  address: { name: string; line1: string; line2: string; phone: string };
  payment: string;
  tracking?: string;
  items: { title: string; collection: string; qty: number; size: string; colour: string; price: number }[];
  timeline: { label: string; date: string; done: boolean }[];
}> = {
  "HM-20260412": {
    id: "HM-20260412", date: "12 Apr 2026", status: "Delivered",
    subtotal: 12640, shipping: 250, total: 12890,
    tracking: "TCS-4829104",
    address: { name: "Ayesha Khan", line1: "House 14, Street 7, DHA Phase 6", line2: "Karachi, Sindh — 75500", phone: "+92 300 1234567" },
    payment: "Visa ending in 4242",
    items: [
      { title: "Rosewood Silk 3-Piece Formal Suit", collection: "Ladies Suits", qty: 1, size: "M", colour: "Dusty Rose", price: 8490 },
      { title: "Floral Lawn Summer Suit", collection: "Ladies Suits", qty: 1, size: "M", colour: "Ivory", price: 2950 },
      { title: "Silk Headband Set — 3 Pieces", collection: "Accessories", qty: 1, size: "One Size", colour: "Sage", price: 1200 },
    ],
    timeline: [
      { label: "Order placed", date: "12 Apr 2026, 10:42 AM", done: true },
      { label: "Payment confirmed", date: "12 Apr 2026, 10:43 AM", done: true },
      { label: "Packed & dispatched", date: "13 Apr 2026, 2:15 PM", done: true },
      { label: "Out for delivery", date: "15 Apr 2026, 9:30 AM", done: true },
      { label: "Delivered", date: "15 Apr 2026, 1:48 PM", done: true },
    ],
  },
  "HM-20260328": {
    id: "HM-20260328", date: "28 Mar 2026", status: "In transit",
    subtotal: 5490, shipping: 0, total: 5490,
    tracking: "TCS-4810293",
    address: { name: "Ayesha Khan", line1: "House 14, Street 7, DHA Phase 6", line2: "Karachi, Sindh — 75500", phone: "+92 300 1234567" },
    payment: "Cash on Delivery",
    items: [
      { title: "Emerald Embroidered 2-Piece", collection: "Ladies Suits", qty: 1, size: "S", colour: "Emerald", price: 5490 },
    ],
    timeline: [
      { label: "Order placed", date: "28 Mar 2026, 3:20 PM", done: true },
      { label: "Payment confirmed", date: "28 Mar 2026, 3:21 PM", done: true },
      { label: "Packed & dispatched", date: "29 Mar 2026, 11:00 AM", done: true },
      { label: "Out for delivery", date: "31 Mar 2026", done: false },
      { label: "Delivered", date: "Expected 1 Apr 2026", done: false },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(orders).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: orders[id] ? `Order ${id}` : "Order Not Found" };
}

const statusStyle: Record<string, { text: string; dot: string }> = {
  Delivered: { text: "text-sage", dot: "#8c9b7e" },
  "In transit": { text: "text-gold-dark", dot: "#a8804b" },
  Cancelled: { text: "text-sale", dot: "#b94a4a" },
};

export default async function OrderDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = orders[id];
  if (!order) notFound();

  const s = statusStyle[order.status] ?? statusStyle["In transit"];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted">
        <Link href="/account" className="hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account/orders" className="hover:text-ink">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">{order.id}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Order details</span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">{order.id}</h1>
          <p className="mt-1 text-[13px] text-ink-soft">Placed on {order.date}</p>
        </div>
        <div className={`inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] ${s.text}`}>
          <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
          {order.status}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Tracking Timeline */}
          <section className="border border-border-soft bg-ivory p-6">
            <h2 className="font-display text-2xl italic">Shipment tracking</h2>
            {order.tracking && (
              <p className="mt-1 text-[12px] uppercase tracking-[0.22em] text-muted">
                TCS Courier · <span className="text-ink-soft">{order.tracking}</span>
              </p>
            )}
            <ol className="mt-6 flex flex-col gap-0">
              {order.timeline.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                      step.done ? "border-sage bg-sage text-ivory" : "border-border-soft bg-cream text-muted"
                    }`}>
                      {step.done
                        ? <CheckCircle2 className="h-4 w-4" />
                        : i === order.timeline.findIndex(t => !t.done)
                        ? <Clock className="h-3.5 w-3.5 text-gold-dark" />
                        : <span className="h-1.5 w-1.5 rounded-full bg-border-soft" />
                      }
                    </div>
                    {i < order.timeline.length - 1 && (
                      <div className={`w-px flex-1 my-1 ${step.done ? "bg-sage/40" : "bg-border-soft"}`} style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-5">
                    <div className={`text-[13px] font-medium ${step.done ? "text-ink" : "text-muted"}`}>{step.label}</div>
                    <div className="text-[12px] text-ink-soft">{step.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Items */}
          <section className="border border-border-soft bg-ivory">
            <div className="border-b border-border-soft px-5 py-4">
              <h2 className="font-display text-2xl italic">Items ordered</h2>
            </div>
            <ul className="divide-y divide-border-soft px-5">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-5 text-[13px]">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-10 flex-none bg-cream" />
                    <div>
                      <div className="font-medium leading-snug">{item.title}</div>
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                        {item.collection}
                      </div>
                      <div className="mt-1 text-[12px] text-ink-soft">
                        Size: {item.size} · Colour: {item.colour} · Qty: {item.qty}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium shrink-0 pl-4">{formatPrice(item.price * item.qty)}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Order Summary */}
          <div className="border border-border-soft bg-cream p-5">
            <h3 className="font-display text-xl italic">Summary</h3>
            <dl className="mt-4 flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{order.shipping === 0 ? <span className="text-gold-dark">Complimentary</span> : formatPrice(order.shipping)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-4 text-[14px] font-medium">
              <span>Total</span>
              <span className="font-display text-xl">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border border-border-soft bg-ivory p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted">
              <MapPin className="h-3.5 w-3.5 text-gold-dark" /> Delivery address
            </div>
            <div className="mt-3 text-[13px] leading-relaxed">
              <div className="font-medium">{order.address.name}</div>
              <div className="text-ink-soft">{order.address.line1}</div>
              <div className="text-ink-soft">{order.address.line2}</div>
              <div className="mt-1 text-ink-soft">{order.address.phone}</div>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-border-soft bg-ivory p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted">
              <CreditCard className="h-3.5 w-3.5 text-gold-dark" /> Payment
            </div>
            <div className="mt-3 text-[13px] text-ink-soft">{order.payment}</div>
          </div>

          {/* Actions */}
          {order.status === "Delivered" && (
            <div className="flex flex-col gap-3">
              <button className="flex h-11 w-full items-center justify-center gap-2 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.24em] text-ink hover:bg-cream">
                <RotateCcw className="h-3.5 w-3.5" /> Request return
              </button>
              <Link
                href="/contact"
                className="flex h-11 w-full items-center justify-center gap-2 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.24em] text-ink hover:bg-cream"
              >
                Need help?
              </Link>
            </div>
          )}
          {order.status === "In transit" && (
            <Link
              href="/contact"
              className="flex h-11 w-full items-center justify-center gap-2 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.24em] text-ink hover:bg-cream"
            >
              <Package className="h-3.5 w-3.5" /> Contact about order
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
