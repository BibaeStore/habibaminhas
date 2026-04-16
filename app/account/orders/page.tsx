import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "My Orders" };

const sidebar = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package, active: true },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

const orders = [
  {
    id: "HM-20260412",
    date: "12 Apr 2026",
    status: "Delivered",
    total: 12890,
    items: [
      { title: "Rosewood Silk 3-Piece Formal Suit", qty: 1, size: "M", price: 8490 },
      { title: "Floral Lawn Summer Suit", qty: 1, size: "M", price: 3200 },
      { title: "Silk Headband Set", qty: 1, size: "One Size", price: 1200 },
    ],
  },
  {
    id: "HM-20260328",
    date: "28 Mar 2026",
    status: "In transit",
    total: 5490,
    items: [
      { title: "Emerald Embroidered 2-Piece", qty: 1, size: "S", price: 5490 },
    ],
  },
  {
    id: "HM-20260302",
    date: "02 Mar 2026",
    status: "Delivered",
    total: 8240,
    items: [
      { title: "Sage Chiffon Dupatta Suit", qty: 1, size: "L", price: 4890 },
      { title: "Pastel Dream Baby Nest", qty: 1, size: "Standard", price: 3350 },
    ],
  },
  {
    id: "HM-20260210",
    date: "10 Feb 2026",
    status: "Delivered",
    total: 3200,
    items: [
      { title: "Ivory Floral Embroidered Shirt", qty: 2, size: "S", price: 1600 },
    ],
  },
  {
    id: "HM-20260118",
    date: "18 Jan 2026",
    status: "Cancelled",
    total: 6750,
    items: [
      { title: "Royal Amethyst Kids Gown", qty: 1, size: "7–8Y", price: 6750 },
    ],
  },
];

const statusStyle: Record<string, { text: string; dot: string }> = {
  Delivered: { text: "text-sage", dot: "#8c9b7e" },
  "In transit": { text: "text-gold-dark", dot: "#a8804b" },
  Processing: { text: "text-gold-dark", dot: "#a8804b" },
  Cancelled: { text: "text-sale", dot: "#b94a4a" },
};

export default function OrdersPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order history.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">{orders.length} orders placed · 2 in the last 30 days.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="flex flex-row gap-1 overflow-x-auto border border-border-soft bg-ivory p-1 lg:flex-col lg:overflow-visible">
            {sidebar.map(({ label, href, icon: Icon, active }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 whitespace-nowrap px-4 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors ${
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button className="mt-auto flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-sale hover:bg-cream">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-9">
          <div className="flex flex-col gap-4">
            {orders.map((o) => {
              const s = statusStyle[o.status] ?? statusStyle["Processing"];
              return (
                <div key={o.id} className="border border-border-soft bg-ivory">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-cream px-5 py-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Order</div>
                        <div className="mt-0.5 text-[13px] font-medium">{o.id}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Date</div>
                        <div className="mt-0.5 text-[13px] text-ink-soft">{o.date}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Total</div>
                        <div className="mt-0.5 text-[13px] font-medium">{formatPrice(o.total)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Status</div>
                        <div className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] ${s.text}`}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                          {o.status}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="flex items-center gap-1 text-[12px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink"
                    >
                      View details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <ul className="divide-y divide-border-soft px-5">
                    {o.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between py-4 text-[13px]">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                            Size: {item.size} · Qty: {item.qty}
                          </div>
                        </div>
                        <div className="text-[13px] font-medium">{formatPrice(item.price * item.qty)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
