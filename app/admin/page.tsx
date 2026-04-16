import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, AlertTriangle, ChevronRight,
  ArrowUpRight, Calendar, DollarSign,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getProducts } from "@/lib/actions/products";
import { getOrderStats } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard | Admin" };

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  processing: { bg: "bg-gold/30",  text: "text-gold-dark", dot: "#a8804b" },
  dispatched:  { bg: "bg-blue-50",  text: "text-blue-700",  dot: "#2563eb" },
  delivered:   { bg: "bg-sage/20",  text: "text-sage",      dot: "#8c9b7e" },
  cancelled:   { bg: "bg-sale/10",  text: "text-sale",      dot: "#9c3b2f" },
  pending:     { bg: "bg-cream",    text: "text-ink-soft",   dot: "#a8804b" },
};

export default async function AdminDashboard() {
  const [orderStats, customerStats, allProducts] = await Promise.all([
    getOrderStats().catch(() => null),
    getCustomerStats().catch(() => null),
    getProducts().catch(() => []),
  ]);

  const lowStockProducts = allProducts
    .filter((p: Product) => p.stock <= 5)
    .sort((a: Product, b: Product) => a.stock - b.stock)
    .slice(0, 4);

  const topProducts = allProducts
    .filter((p: Product) => p.status === "active")
    .slice(0, 5);

  const stats = [
    {
      label: "Total Revenue",
      value: orderStats ? formatPrice(orderStats.totalRevenue) : "—",
      change: "+18.4%", up: true, sub: "all time",
    },
    {
      label: "Active orders",
      value: orderStats ? String(orderStats.byStatus.pending + orderStats.byStatus.processing + orderStats.byStatus.dispatched) : "—",
      change: `${orderStats?.todayCount ?? 0} today`, up: true, sub: "new today",
    },
    {
      label: "Total Customers",
      value: customerStats ? String(customerStats.total) : "—",
      change: `${customerStats?.newThisMonth ?? 0} new`, up: true, sub: "this month",
    },
    {
      label: "Avg. lifetime value",
      value: customerStats ? formatPrice(customerStats.avgLifetimeValue) : "—",
      change: `${customerStats?.vip ?? 0} VIP`, up: true, sub: "customers",
    },
  ];

  const orderStatusDist = orderStats ? [
    { label: "Pending",    count: orderStats.byStatus.pending,    total: orderStats.total, color: "bg-gold-dark" },
    { label: "Processing", count: orderStats.byStatus.processing, total: orderStats.total, color: "bg-blue-400" },
    { label: "Dispatched", count: orderStats.byStatus.dispatched, total: orderStats.total, color: "bg-ink" },
    { label: "Delivered",  count: orderStats.byStatus.delivered,  total: orderStats.total, color: "bg-sage" },
    { label: "Cancelled",  count: orderStats.byStatus.cancelled,  total: orderStats.total, color: "bg-sale" },
  ] : [];

  const today = new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

  return (
    <AdminShell title="Dashboard">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{s.label}</div>
                <div className="mt-2 font-display text-2xl italic text-ink">{s.value}</div>
                <div className="mt-2 flex items-center gap-1 text-[12px] text-sage">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{s.change}</span>
                  <span className="text-muted">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Top products */}
            <section className="lg:col-span-8 border border-border-soft bg-ivory">
              <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
                <h2 className="font-display text-xl italic">Active Products</h2>
                <Link href="/admin/products" className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 text-center font-medium">Stock</th>
                      <th className="px-4 py-3 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-[12px] text-muted">No products yet.</td>
                      </tr>
                    ) : topProducts.map((p: Product) => (
                      <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-cream">
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt={p.title} fill sizes="32px" className="object-cover object-top" />
                              ) : (
                                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                              )}
                            </div>
                            <span className="text-[12px] font-medium line-clamp-1">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-ink-soft">{p.category}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[12px] font-medium tabular-nums ${p.stock === 0 ? "text-sale" : p.stock <= 5 ? "text-gold-dark" : "text-sage"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-[12px] font-medium">{formatPrice(p.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right column */}
            <div className="lg:col-span-4 flex flex-col gap-5">

              {/* Order Status Distribution */}
              <section className="border border-border-soft bg-ivory">
                <div className="border-b border-border-soft px-5 py-4">
                  <h2 className="font-display text-xl italic">Order distribution</h2>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-muted">All time · {orderStats?.total ?? 0} total</p>
                </div>
                {orderStatusDist.length === 0 ? (
                  <p className="px-5 py-4 text-[12px] text-muted">No orders yet.</p>
                ) : (
                  <ul className="space-y-3 px-5 py-4">
                    {orderStatusDist.map((s) => {
                      const pct = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
                      return (
                        <li key={s.label}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">{s.label}</span>
                            <span className="text-[12px] font-medium tabular-nums">{s.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-cream overflow-hidden">
                            <div className={`h-full ${s.color} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="border-t border-border-soft px-5 py-3">
                  <Link href="/admin/orders" className="text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                    View all orders →
                  </Link>
                </div>
              </section>

              {/* Today's Activity */}
              <section className="border border-border-soft bg-ink text-ivory">
                <div className="border-b border-ivory/10 px-5 py-4">
                  <h2 className="font-display text-xl italic text-ivory">Today&apos;s activity</h2>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-ivory/40">{today}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-ivory/10">
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 text-ivory/40 mb-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.22em]">Orders</span>
                    </div>
                    <div className="font-display text-2xl italic text-ivory">{orderStats?.todayCount ?? 0}</div>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 text-ivory/40 mb-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.22em]">Revenue</span>
                    </div>
                    <div className="font-display text-2xl italic text-ivory">{formatPrice(orderStats?.todayRevenue ?? 0)}</div>
                  </div>
                </div>
              </section>

              {/* Low stock alert */}
              <section className="border border-border-soft bg-ivory">
                <div className="flex items-center gap-2 border-b border-border-soft px-5 py-4">
                  <AlertTriangle className="h-4 w-4 text-gold-dark" />
                  <h2 className="font-display text-xl italic">Low stock</h2>
                </div>
                {lowStockProducts.length === 0 ? (
                  <p className="px-5 py-4 text-[12px] text-muted">All products well stocked.</p>
                ) : (
                  <ul className="divide-y divide-border-soft">
                    {lowStockProducts.map((p: Product) => (
                      <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-cream">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill sizes="32px" className="object-cover object-top" />
                          ) : (
                            <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[12px] font-medium">{p.title}</div>
                          <div className={`text-[11px] ${p.stock === 0 ? "text-sale font-medium" : "text-gold-dark"}`}>
                            {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-border-soft px-5 py-3">
                  <Link href="/admin/products" className="text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                    Manage inventory →
                  </Link>
                </div>
              </section>

              {/* Quick actions */}
              <section className="border border-border-soft bg-ivory p-5">
                <h2 className="font-display text-xl italic mb-4">Quick actions</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Add new product", href: "/admin/products" },
                    { label: "Process pending orders", href: "/admin/orders" },
                    { label: "View customers", href: "/admin/customers" },
                    { label: "Update settings", href: "/admin/settings" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="flex items-center justify-between border border-border-soft px-4 py-2.5 text-[12px] text-ink-soft hover:bg-cream hover:text-ink transition-colors"
                    >
                      {a.label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

        </div>
    </AdminShell>
  );
}
