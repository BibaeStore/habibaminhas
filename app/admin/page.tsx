import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, AlertTriangle, ChevronRight,
  ArrowUpRight, Calendar, DollarSign, BarChart2,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getProducts } from "@/lib/actions/products";
import { getOrderStats } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;
import { formatPrice } from "@/lib/utils";

// ── Illustrative weekly data (no historical DB yet) ────────────────────────────
const WEEK_REVENUE = [38400, 52100, 41800, 63200, 57400, 74800, 68300];
const WEEK_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_ORDERS  = [4, 7, 5, 9, 8, 12, 10];

function MiniBarChart({ values, labels, color = "#a8804b" }: { values: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...values);
  const bw = 26; const gap = 6; const padX = 4; const h = 72;
  const totalW = values.length * (bw + gap) + padX * 2;
  return (
    <svg viewBox={`0 0 ${totalW} ${h + 22}`} className="w-full" style={{ display: "block", height: h + 22 }} preserveAspectRatio="none">
      {values.map((v, i) => {
        const barH = (v / max) * h;
        const x = padX + i * (bw + gap);
        const fill = i === values.length - 1 ? color : color + "99";
        return (
          <g key={i}>
            <rect x={x} y={h - barH} width={bw} height={barH} fill={fill} rx="1" />
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="7.5" fill="#9a9080" fontFamily="inherit">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniLineChart({ values, color = "#8c9b7e" }: { values: number[]; color?: string }) {
  const max = Math.max(...values); const min = Math.min(...values);
  const w = 300; const h = 60;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ display: "block", height: h }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * w} cy={h - ((v - min) / (max - min || 1)) * h} r="3" fill={color} />
      ))}
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border-soft bg-ivory p-6">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton mt-3 h-8 w-32 rounded" />
      <div className="skeleton mt-3 h-4 w-40 rounded" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="border border-border-soft bg-ivory">
      <div className="border-b border-border-soft px-6 py-5">
        <div className="skeleton h-6 w-40 rounded" />
      </div>
      <div className="space-y-4 px-6 py-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-14 w-11 shrink-0 rounded" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="flex flex-col gap-5">
      <div className="border border-border-soft bg-ivory p-6">
        <div className="skeleton h-6 w-36 rounded" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton mt-2 h-2 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border-soft bg-ink p-6">
        <div className="skeleton h-6 w-32 rounded opacity-30" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="skeleton h-10 w-full rounded opacity-20" />
          <div className="skeleton h-10 w-full rounded opacity-20" />
        </div>
      </div>
    </div>
  );
}

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

  const hasNoData = !orderStats && !customerStats && allProducts.length === 0;

  if (hasNoData) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-8">
          {/* Skeleton stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          {/* Skeleton charts */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="border border-border-soft bg-ivory p-6">
                <div className="skeleton h-6 w-40 rounded" />
                <div className="skeleton mt-4 h-24 w-full rounded" />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="border border-border-soft bg-ivory p-6">
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton mt-4 h-16 w-full rounded" />
              </div>
            </div>
          </div>
          {/* Skeleton content */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SkeletonTable />
            </div>
            <div className="lg:col-span-4">
              <SkeletonSidebar />
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard">
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-8">

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-6">
                <div className="text-sm tracking-wide text-muted">{s.label}</div>
                <div className="mt-2 font-display text-3xl italic text-ink">{s.value}</div>
                <div className="mt-2 flex items-center gap-2 text-base text-sage">
                  <TrendingUp className="h-5 w-5" />
                  <span>{s.change}</span>
                  <span className="text-muted">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Revenue chart */}
            <section className="lg:col-span-8 border border-border-soft bg-ivory p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl italic">Weekly Revenue</h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatPrice(WEEK_REVENUE.reduce((a, v) => a + v, 0))} this week
                    <span className="ml-2 text-sage">+18.4% vs last week</span>
                  </p>
                </div>
                <BarChart2 className="h-6 w-6 text-muted" />
              </div>
              <MiniBarChart values={WEEK_REVENUE} labels={WEEK_LABELS} color="#a8804b" />
            </section>

            {/* Orders sparkline */}
            <section className="lg:col-span-4 border border-border-soft bg-ivory p-6">
              <div className="mb-3">
                <h2 className="font-display text-2xl italic">Daily Orders</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {WEEK_ORDERS.reduce((a, v) => a + v, 0)} orders · peak {Math.max(...WEEK_ORDERS)}
                </p>
              </div>
              <MiniLineChart values={WEEK_ORDERS} color="#8c9b7e" />
              <div className="mt-2 flex items-center justify-between text-sm tracking-wide text-muted">
                <span>Mon</span><span>Sun</span>
              </div>
            </section>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Top products */}
            <section className="lg:col-span-8 border border-border-soft bg-ivory">
              <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
                <h2 className="font-display text-2xl italic">Active Products</h2>
                <Link href="/admin/products" className="flex items-center gap-2 text-sm tracking-wide text-gold-dark hover:text-ink">
                  View all <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream text-sm tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-4 font-medium">Product</th>
                      <th className="px-5 py-4 font-medium">Category</th>
                      <th className="px-5 py-4 text-center font-medium">Stock</th>
                      <th className="px-5 py-4 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-base text-muted">No products yet.</td>
                      </tr>
                    ) : topProducts.map((p: Product) => (
                      <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-cream">
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt={p.title} fill sizes="44px" className="object-cover object-top" />
                              ) : (
                                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                              )}
                            </div>
                            <span className="text-base font-medium line-clamp-1">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-base text-ink-soft">{p.category}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-base font-medium tabular-nums ${p.stock === 0 ? "text-sale" : p.stock <= 5 ? "text-gold-dark" : "text-sage"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-base font-medium">{formatPrice(p.price)}</td>
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
                <div className="border-b border-border-soft px-6 py-5">
                  <h2 className="font-display text-2xl italic">Order distribution</h2>
                  <p className="mt-0.5 text-sm tracking-wide text-muted">All time · {orderStats?.total ?? 0} total</p>
                </div>
                {orderStatusDist.length === 0 ? (
                  <p className="px-6 py-5 text-base text-muted">No orders yet.</p>
                ) : (
                  <ul className="space-y-4 px-6 py-5">
                    {orderStatusDist.map((s) => {
                      const pct = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
                      return (
                        <li key={s.label}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-sm tracking-wide text-ink-soft">{s.label}</span>
                            <span className="text-base font-medium tabular-nums">{s.count}</span>
                          </div>
                          <div className="h-2 w-full bg-cream overflow-hidden">
                            <div className={`h-full ${s.color} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="border-t border-border-soft px-6 py-4">
                  <Link href="/admin/orders" className="text-sm tracking-wide text-gold-dark hover:text-ink">
                    View all orders →
                  </Link>
                </div>
              </section>

              {/* Today's Activity */}
              <section className="border border-border-soft bg-ink text-ivory">
                <div className="border-b border-ivory/10 px-6 py-5">
                  <h2 className="font-display text-2xl italic text-ivory">Today&apos;s activity</h2>
                  <p className="mt-0.5 text-sm tracking-wide text-ivory/40">{today}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-ivory/10">
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 text-ivory/40 mb-1.5">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm tracking-wide">Orders</span>
                    </div>
                    <div className="font-display text-3xl italic text-ivory">{orderStats?.todayCount ?? 0}</div>
                  </div>
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 text-ivory/40 mb-1.5">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm tracking-wide">Revenue</span>
                    </div>
                    <div className="font-display text-3xl italic text-ivory">{formatPrice(orderStats?.todayRevenue ?? 0)}</div>
                  </div>
                </div>
              </section>

              {/* Low stock alert */}
              <section className="border border-border-soft bg-ivory">
                <div className="flex items-center gap-2 border-b border-border-soft px-6 py-5">
                  <AlertTriangle className="h-6 w-6 text-gold-dark" />
                  <h2 className="font-display text-2xl italic">Low stock</h2>
                </div>
                {lowStockProducts.length === 0 ? (
                  <p className="px-6 py-5 text-base text-muted">All products well stocked.</p>
                ) : (
                  <ul className="divide-y divide-border-soft">
                    {lowStockProducts.map((p: Product) => (
                      <li key={p.id} className="flex items-center gap-3 px-6 py-4">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-cream">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill sizes="44px" className="object-cover object-top" />
                          ) : (
                            <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-base font-medium">{p.title}</div>
                          <div className={`text-sm ${p.stock === 0 ? "text-sale font-medium" : "text-gold-dark"}`}>
                            {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-border-soft px-6 py-4">
                  <Link href="/admin/products" className="text-sm tracking-wide text-gold-dark hover:text-ink">
                    Manage inventory →
                  </Link>
                </div>
              </section>

              {/* Quick actions */}
              <section className="border border-border-soft bg-ivory p-6">
                <h2 className="font-display text-2xl italic mb-4">Quick actions</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Add new product", href: "/admin/products" },
                    { label: "Process pending orders", href: "/admin/orders" },
                    { label: "View customers", href: "/admin/customers" },
                    { label: "Update settings", href: "/admin/settings" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="flex items-center justify-between border border-border-soft px-5 py-4 text-base text-ink-soft hover:bg-cream hover:text-ink transition-colors"
                    >
                      {a.label}
                      <ArrowUpRight className="h-5 w-5 text-muted" />
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
