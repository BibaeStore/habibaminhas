"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, Settings } from "lucide-react";
import { getOrdersByEmail } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

const sidebar = [
  { label: "Overview", href: "/account", icon: User, active: true },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

const statusColor: Record<string, string> = {
  pending:    "text-gold-dark",
  processing: "text-gold-dark",
  dispatched: "text-gold-dark",
  delivered:  "text-sage",
  cancelled:  "text-sale",
};

type Order = Awaited<ReturnType<typeof getOrdersByEmail>>[number];

export default function AccountPage() {
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
        <p className="mt-2 text-[13px] text-ink-soft">Enter the email address you used when placing your order.</p>
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

  const recentOrders = orders.slice(0, 3);
  const inTransit = orders.filter((o) => ["pending", "processing", "dispatched"].includes(o.status)).length;
  const name = orders[0]?.customer_name ?? email.split("@")[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">
        Welcome, {name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        {inTransit > 0 ? `, ${inTransit} in transit` : ""}.
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Orders", value: String(orders.length) },
              { label: "In transit", value: String(inTransit) },
              { label: "Total spent", value: formatPrice(orders.reduce((s, o) => s + o.total, 0)) },
            ].map((s) => (
              <div key={s.label} className="border border-border-soft bg-cream p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{s.label}</div>
                <div className="mt-2 font-display text-2xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl italic sm:text-3xl">Recent orders</h2>
              <Link href="/account/orders" className="text-[12px] uppercase tracking-[0.24em] text-gold-dark">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse bg-cream" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="mt-4 border border-border-soft bg-cream px-6 py-10 text-center text-[13px] text-ink-soft">
                No orders found for {email}.
              </div>
            ) : (
              <div className="mt-4 overflow-hidden border border-border-soft">
                <table className="w-full text-left">
                  <thead className="bg-cream text-[11px] uppercase tracking-[0.22em] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft text-[13px]">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-cream/60">
                        <td className="px-4 py-4 font-medium">{o.order_number}</td>
                        <td className="px-4 py-4 text-ink-soft hidden sm:table-cell">
                          {new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] ${statusColor[o.status] ?? "text-ink-soft"}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium">{formatPrice(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
