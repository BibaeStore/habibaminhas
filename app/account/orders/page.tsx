"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, ChevronRight } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { ProductImage } from "@/components/common/product-image";
import { getOrdersByEmail } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";

const STATUS_STYLE: Record<string, { text: string; dot: string; bg: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  processing: { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e", bg: "bg-sage/10" },
  cancelled:  { text: "text-sale",      dot: "#9c3b2f", bg: "bg-sale/10" },
};

type Order = Awaited<ReturnType<typeof getOrdersByEmail>>[number];

export default function OrdersPage() {
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
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">Enter the email you used at checkout.</p>
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

  /* ── Order history ──────────────────────────────────────────── */
  const inTransit = orders.filter((o) => ["pending", "processing", "dispatched"].includes(o.status)).length;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Orders</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order history.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        {orders.length} order{orders.length !== 1 ? "s" : ""}
        {inTransit > 0 ? ` · ${inTransit} in transit` : ""}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        {/* Orders list */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-36 animate-pulse bg-cream" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-border-soft bg-cream px-6 py-14 text-center">
              <p className="text-[13px] text-ink-soft">No orders found for <strong>{email}</strong>.</p>
              <Link href="/ladies" className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-gold-dark hover:text-ink">
                Browse collections →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {orders.map((order) => {
                const items = (order.order_items ?? []) as {
                  product_title: string; product_image: string | null;
                  size: string | null; quantity: number; unit_price: number;
                }[];
                const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;

                return (
                  <div key={order.id} className="overflow-hidden border border-border-soft bg-ivory">

                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-cream px-5 py-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Order</div>
                          <Link
                            href={`/account/orders/${order.order_number}`}
                            className="mt-0.5 block text-[13px] font-semibold text-ink transition-colors hover:text-gold-dark"
                          >
                            {order.order_number}
                          </Link>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Date</div>
                          <div className="mt-0.5 text-[13px] text-ink-soft">
                            {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Total</div>
                          <div className="mt-0.5 text-[13px] font-semibold">{formatPrice(order.total)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Status</div>
                          <div className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {order.status}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/account/orders/${order.order_number}`}
                          className="inline-flex items-center gap-1.5 border border-border-soft px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-parchment"
                        >
                          View order
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/order/${order.order_number}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 border border-border-soft px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-parchment"
                        >
                          <Download className="h-3 w-3" />
                          Invoice
                        </Link>
                      </div>
                    </div>

                    {/* Product image strip + items */}
                    <div className="px-5 py-4">
                      {/* Thumbnail row */}
                      {items.length > 0 && (
                        <div className="mb-4 flex gap-2">
                          {items.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative h-16 w-12 flex-none overflow-hidden bg-parchment">
                              <ProductImage
                                src={item.product_image}
                                alt={item.product_title}
                                sizes="48px"
                              />
                            </div>
                          ))}
                          {items.length > 4 && (
                            <div className="flex h-16 w-12 flex-none items-center justify-center bg-cream text-[11px] text-muted">
                              +{items.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item list */}
                      <ul className="flex flex-col divide-y divide-border-soft">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-center justify-between py-3 text-[13px]">
                            <div>
                              <div className="font-medium">{item.product_title}</div>
                              {(item.size || item.quantity > 0) && (
                                <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && ` · `}
                                  Qty: {item.quantity}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 pl-4 font-medium">{formatPrice(item.unit_price * item.quantity)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
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
