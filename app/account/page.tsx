"use client";

import type { Metadata } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { ProductImage } from "@/components/common/product-image";
import { getOrdersByEmail } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

const STATUS_STYLE: Record<string, { text: string; dot: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b" },
  processing: { text: "text-gold-dark", dot: "#a8804b" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e" },
  cancelled:  { text: "text-sale",      dot: "#9c3b2f" },
};

type Order = Awaited<ReturnType<typeof getOrdersByEmail>>[number];

export default function AccountPage() {
  const [email, setEmail]           = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hm_customer_email");
    if (saved) {
      setEmail(saved);
      setLoading(true);
      getOrdersByEmail(saved).then(setOrders).catch(() => {}).finally(() => setLoading(false));
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

  if (!mounted) return null;

  /* ── Email lookup ───────────────────────────────────────────── */
  if (!email) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
        <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order lookup.</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          Enter the email address you used when placing your order to view your history.
        </p>
        <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Email address</span>
            <input
              type="email" required autoFocus
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none placeholder:text-muted/60 transition-colors focus:border-ink focus:bg-ivory"
            />
          </label>
          <button
            type="submit" disabled={loading}
            className="h-12 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
          >
            {loading ? "Looking up…" : "View my orders"}
          </button>
        </form>
      </div>
    );
  }

  /* ── Dashboard ──────────────────────────────────────────────── */
  const recentOrders = orders.slice(0, 3);
  const inTransit    = orders.filter((o) => ["pending", "processing", "dispatched"].includes(o.status)).length;
  const totalSpent   = orders.reduce((s, o) => s + o.total, 0);
  const name         = orders[0]?.customer_name ?? email.split("@")[0];
  const firstName    = name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Welcome, {firstName}.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        {inTransit > 0 ? `, ${inTransit} in transit` : ""}.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        {/* Main content */}
        <div className="lg:col-span-9 flex flex-col gap-10">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Orders</div>
              <div className="mt-2 font-display text-3xl italic">{orders.length}</div>
            </div>
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">In transit</div>
              <div className="mt-2 font-display text-3xl italic">{inTransit}</div>
            </div>
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Total spent</div>
              <div className="mt-2 font-display text-2xl italic">{formatPrice(totalSpent)}</div>
            </div>
          </div>

          {/* Recent orders */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl italic sm:text-3xl">Recent orders</h2>
              <Link href="/account/orders" className="text-[11px] uppercase tracking-[0.24em] text-gold-dark transition-colors hover:text-ink">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-cream" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="border border-border-soft bg-cream px-6 py-10 text-center">
                <p className="text-[13px] text-ink-soft">No orders found for {email}.</p>
                <Link href="/ladies" className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-gold-dark hover:text-ink">
                  Shop now →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden border border-border-soft">
                {recentOrders.map((order, idx) => {
                  const items = (order.order_items ?? []) as {
                    product_title: string; product_image: string | null;
                    size: string | null; quantity: number;
                  }[];
                  const firstImg = items[0]?.product_image ?? null;
                  const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;

                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.order_number}`}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream/60 ${idx > 0 ? "border-t border-border-soft" : ""}`}
                    >
                      {/* Product thumbnail */}
                      <div className="relative h-14 w-10 flex-none overflow-hidden bg-parchment">
                        <ProductImage src={firstImg} alt={items[0]?.product_title ?? "Product"} sizes="40px" />
                      </div>

                      {/* Order info */}
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-1">
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{order.order_number}</div>
                          <div className="text-[12px] text-ink-soft">
                            {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                            {items.length > 0 && ` · ${items.length} item${items.length !== 1 ? "s" : ""}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {order.status}
                          </span>
                          <span className="text-[13px] font-semibold text-ink">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick links */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/account/addresses"
              className="flex items-center justify-between border border-border-soft bg-ivory px-5 py-4 transition-colors hover:bg-cream"
            >
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink">Delivery addresses</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">Manage your saved addresses</div>
              </div>
              <span className="text-gold-dark">→</span>
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center justify-between border border-border-soft bg-ivory px-5 py-4 transition-colors hover:bg-cream"
            >
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink">Account settings</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">Profile, password, notifications</div>
              </div>
              <span className="text-gold-dark">→</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
