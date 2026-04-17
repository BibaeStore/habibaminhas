"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, ChevronRight } from "lucide-react";
import { getOrdersByEmail } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

const sidebar = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package, active: true },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

const statusStyle: Record<string, { text: string; dot: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b" },
  processing: { text: "text-gold-dark", dot: "#a8804b" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e" },
  cancelled:  { text: "text-sale",      dot: "#b94a4a" },
};

type Order = Awaited<ReturnType<typeof getOrdersByEmail>>[number];

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hm_customer_email");
    if (saved) {
      setEmail(saved);
      setLoading(true);
      getOrdersByEmail(saved)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail) return;
    setLoading(true);
    const data = await getOrdersByEmail(inputEmail).catch(() => []);
    localStorage.setItem("hm_customer_email", inputEmail);
    setEmail(inputEmail);
    setOrders(data);
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("hm_customer_email");
    setEmail("");
    setOrders([]);
  };

  if (!mounted) return null;

  if (!email) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
        <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order lookup.</h1>
        <p className="mt-2 text-[13px] text-ink-soft">Enter the email you used at checkout.</p>
        <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email address</span>
            <input
              type="email"
              required
              autoFocus
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border border-border-soft bg-ivory px-4 text-[14px] outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark disabled:opacity-60 transition-colors"
          >
            {loading ? "Looking up…" : "View my orders"}
          </button>
        </form>
      </div>
    );
  }

  const inTransit = orders.filter((o) => ["pending", "processing", "dispatched"].includes(o.status)).length;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order history.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        {inTransit > 0 ? ` · ${inTransit} in transit` : ""}.
      </p>

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
            <button
              onClick={handleSignOut}
              className="mt-auto flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-sale hover:bg-cream"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse bg-cream" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-border-soft bg-cream px-6 py-14 text-center text-[13px] text-ink-soft">
              No orders found for {email}.
              <br />
              <Link href="/shop" className="mt-3 inline-block text-gold-dark hover:text-ink uppercase tracking-[0.18em] text-[11px]">
                Browse collections →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((o) => {
                const s = statusStyle[o.status] ?? statusStyle["processing"];
                const items = (o.order_items ?? []) as { product_title: string; quantity: number; size: string | null; unit_price: number }[];
                return (
                  <div key={o.id} className="border border-border-soft bg-ivory">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-cream px-5 py-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Order</div>
                          <div className="mt-0.5 text-[13px] font-medium">{o.order_number}</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Date</div>
                          <div className="mt-0.5 text-[13px] text-ink-soft">
                            {new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
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
                      {o.tracking_number && (
                        <div className="flex items-center gap-1 text-[12px] uppercase tracking-[0.22em] text-gold-dark">
                          <ChevronRight className="h-3.5 w-3.5" />
                          {o.tracking_number}
                        </div>
                      )}
                    </div>
                    <ul className="divide-y divide-border-soft px-5">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-center justify-between py-4 text-[13px]">
                          <div>
                            <div className="font-medium">{item.product_title}</div>
                            {item.size && (
                              <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                                Size: {item.size} · Qty: {item.quantity}
                              </div>
                            )}
                          </div>
                          <div className="text-[13px] font-medium">{formatPrice(item.unit_price * item.quantity)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
