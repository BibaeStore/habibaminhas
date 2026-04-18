"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, BarChart2, ShoppingBag, Users, DollarSign } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getOrderStats } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import { formatPrice } from "@/lib/utils";

// ─── Mock analytics data ───────────────────────────────────────────────────────

const KPI_DATA = {
  "7d":  { revenue: "Rs. 2,66,300", rChange: "+23.4%", rUp: true,  orders: 52,  oChange: "+18.2%", oUp: true,  customers: 14, cChange: "+12.6%", cUp: true,  aov: "Rs. 5,121", aovChange: "+2.1%", aovUp: true  },
  "30d": { revenue: "Rs. 9,84,200", rChange: "+31.1%", rUp: true,  orders: 194, oChange: "+24.8%", oUp: true,  customers: 58, cChange: "+19.4%", cUp: true,  aov: "Rs. 5,073", aovChange: "+3.9%", aovUp: true  },
  "90d": { revenue: "Rs. 28,62,000",rChange: "+14.7%", rUp: true,  orders: 557, oChange: "+11.3%", oUp: true,  customers: 147,cChange: "+9.8%",  cUp: true,  aov: "Rs. 5,135", aovChange: "-0.6%",aovUp: false },
};

const REVENUE_7D = [
  { day: "Mon", amount: 28400 }, { day: "Tue", amount: 35200 },
  { day: "Wed", amount: 19800 }, { day: "Thu", amount: 44100 },
  { day: "Fri", amount: 38600 }, { day: "Sat", amount: 52300 },
  { day: "Sun", amount: 47900 },
];

const REVENUE_30D = [
  28400, 35200, 19800, 44100, 38600, 52300, 47900, 31200, 29800, 43400,
  51200, 38700, 27600, 41800, 44500, 36900, 29100, 52800, 48600, 33200,
  40100, 46800, 38200, 43500, 57100, 41200, 35800, 49300, 44600, 38400,
].map((v, i) => ({ day: String(i + 1), amount: v }));

const ORDERS_SPARKLINE_7D  = [4,  7,  5,  9,  6,  11, 8];
const ORDERS_SPARKLINE_30D = [4,7,5,9,6,11,8,12,7,14,9,13,10,7,11,8,15,12,9,13,11,16,10,14,9,12,17,13,11,8];

const CAT_BREAKDOWN = [
  { label: "Ladies Stitched",  revenue: 828000, pct: 54, color: "#2563eb" },
  { label: "Baby Products",    revenue: 431200, pct: 28, color: "#eff6ff" },
  { label: "Kids Formal",      revenue: 184800, pct: 12, color: "#5c6dab" },
  { label: "Accessories",      revenue: 18300,  pct: 6,  color: "#c97a86" },
];

const TOP_PRODUCTS = [
  { name: "Rosewood Elegance 3-Piece Formal Suit",           category: "Ladies", sold: 48, revenue: 288000, growth: "+22%" },
  { name: "Pastel Dream Deluxe 10-Piece Nursery Set",        category: "Baby",   sold: 39, revenue: 351000, growth: "+41%" },
  { name: "Sandstone Gingham 5-Piece Bedding Set",           category: "Baby",   sold: 31, revenue: 213900, growth: "+18%" },
  { name: "Sunset Bloom Girls Festive Co-Ord Set",           category: "Kids",   sold: 27, revenue: 162000, growth: "+35%" },
  { name: "Royal Amethyst Kids Two-Tone Embroidered Gown",   category: "Kids",   sold: 22, revenue:  66000, growth: "+12%" },
];

const PAYMENT_SPLIT = [
  { label: "Cash on Delivery", pct: 58, color: "#2563eb" },
  { label: "JazzCash",         pct: 24, color: "#eff6ff" },
  { label: "Easypaisa",        pct: 12, color: "#5c6dab" },
  { label: "Bank / Card",      pct: 6,  color: "#c97a86" },
];

type Period = "7d" | "30d" | "90d";

// ─── Inline SVG bar chart ──────────────────────────────────────────────────────

function BarChart({ data, highlight = "#2563eb", h = 100 }: { data: { day: string; amount: number }[]; highlight?: string; h?: number }) {
  const visible = data.slice(-14); // show last 14 in 30d view
  const max = Math.max(...visible.map((d) => d.amount));
  const bw = 28; const gap = 8; const padX = 6;
  const totalW = visible.length * (bw + gap) + padX * 2;

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 28}`} className="w-full" style={{ display: "block", height: "100%" }} preserveAspectRatio="none">
      {visible.map((d, i) => {
        const barH  = (d.amount / max) * h;
        const x     = padX + i * (bw + gap);
        const y     = h - barH;
        const shade = i === visible.length - 1 ? highlight : highlight + "aa";
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={barH} fill={shade} rx="1" />
            {i % Math.ceil(visible.length / 7) === 0 && (
              <text x={x + bw / 2} y={h + 16} textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="inherit">
                {d.day}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Sparkline({ data, color = "#2563eb" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 280; const h = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 48 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / (max - min || 1)) * h} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const revenueData = period === "7d" ? REVENUE_7D : REVENUE_30D;
  const sparkData   = period === "7d" ? ORDERS_SPARKLINE_7D : ORDERS_SPARKLINE_30D;

  const [realStats, setRealStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      getOrderStats().catch(() => null),
      getCustomerStats().catch(() => null),
    ]).then(([os, cs]) => {
      if (!os && !cs) return;
      const totalOrders = os?.total ?? 0;
      const totalRevenue = os?.totalRevenue ?? 0;
      setRealStats({
        totalRevenue,
        totalOrders,
        totalCustomers: cs?.total ?? 0,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      });
    });
  }, []);

  const kpi = KPI_DATA[period];

  return (
    <AdminShell title="Analytics">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Analytics"
          subtitle="Habiba Minhas · Performance overview"
          actions={
            <div className="flex gap-0">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`h-9 px-5 text-[11px] font-semibold uppercase tracking-wide border transition-colors rounded-none ${
                    p === period
                      ? "bg-[var(--admin-primary)] border-[var(--admin-primary)] text-white"
                      : "border-[var(--admin-border)] text-[var(--admin-text-soft)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-alt)]"
                  } ${p !== "7d" ? "border-l-0" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />

        {/* KPI cards */}
        <div className="mt-6 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: DollarSign, label: "Total Revenue",    value: realStats ? formatPrice(realStats.totalRevenue)    : kpi.revenue,    change: kpi.rChange,   up: kpi.rUp,   sub: "all time" },
            { icon: ShoppingBag,label: "Total Orders",     value: realStats ? String(realStats.totalOrders)          : String(kpi.orders),  change: kpi.oChange,   up: kpi.oUp,   sub: "all time" },
            { icon: Users,       label: "Total Customers", value: realStats ? String(realStats.totalCustomers)       : String(kpi.customers),change: kpi.cChange,  up: kpi.cUp,   sub: "registered" },
            { icon: BarChart2,   label: "Avg. Order Value",value: realStats ? formatPrice(realStats.avgOrderValue)   : kpi.aov,        change: kpi.aovChange, up: kpi.aovUp, sub: "per order" },
          ].map(({ icon: Icon, label, value, change, up, sub }) => (
            <AdminCard key={label}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</div>
                <Icon className="h-4 w-4 text-[var(--admin-text-muted)]" />
              </div>
              <div className="mt-2 text-[28px] font-bold tabular-nums text-[var(--admin-text)]">{value}</div>
              <div className={`mt-1.5 flex items-center gap-1 text-[13px] ${up ? "text-green-600" : "text-red-600"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="font-medium">{change}</span>
                <span className="text-[var(--admin-text-muted)]">{sub}</span>
              </div>
            </AdminCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Revenue chart */}
          <div className="lg:col-span-8">
            <AdminCard>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Revenue</h2>
                  <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
                    Total: {formatPrice(revenueData.reduce((a, d) => a + d.amount, 0))}
                    <span className="ml-2 text-green-600">
                      {kpi.rChange} vs prev. period
                    </span>
                  </p>
                </div>
                <BarChart2 className="h-4 w-4 text-[var(--admin-text-muted)]" />
              </div>
              <div style={{ height: 148, overflow: "hidden" }}>
                <BarChart data={revenueData} h={100} />
              </div>
            </AdminCard>
          </div>

          {/* Category breakdown */}
          <div className="lg:col-span-4">
            <AdminCard>
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)] mb-4">Revenue by category</h2>
              <ul className="space-y-4">
                {CAT_BREAKDOWN.map((c) => (
                  <li key={c.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[var(--admin-text)]">{c.label}</span>
                      <span className="text-[11px] text-[var(--admin-text-muted)]">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden bg-[var(--admin-surface-alt)]">
                      <div className="h-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--admin-text-soft)]">{formatPrice(c.revenue)}</div>
                  </li>
                ))}
              </ul>
            </AdminCard>
          </div>

        </div>

        {/* Orders sparkline + Payment split */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AdminCard>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Daily order volume</h2>
                  <p className="text-[13px] text-[var(--admin-text-muted)] mt-0.5">
                    Total: {sparkData.reduce((a, n) => a + n, 0)} orders · Peak: {Math.max(...sparkData)}
                  </p>
                </div>
              </div>
              <Sparkline data={sparkData} color="#2563eb" />
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <span>{period === "7d" ? "Mon" : "Day 1"}</span>
                <span>{period === "7d" ? "Sun" : `Day ${sparkData.length}`}</span>
              </div>
            </AdminCard>
          </div>

          <div className="lg:col-span-5">
            <AdminCard>
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)] mb-4">Payment methods</h2>
              <ul className="space-y-3">
                {PAYMENT_SPLIT.map((p) => (
                  <li key={p.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-[var(--admin-text)]">{p.label}</span>
                        <span className="text-[12px] font-medium text-[var(--admin-text)]">{p.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-[var(--admin-surface-alt)]">
                        <div className="h-full" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </AdminCard>
          </div>
        </div>

        {/* Top products */}
        <div className="mt-6">
          <AdminCard padded={false}>
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Top selling products</h2>
              <Link href="/admin/products" className="text-[13px] font-medium text-[var(--admin-primary)] hover:text-[var(--admin-text)] transition-colors">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold w-8">#</th>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 text-center font-semibold">Units sold</th>
                    <th className="px-5 py-3 text-right font-semibold">Revenue</th>
                    <th className="px-5 py-3 text-right font-semibold">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {TOP_PRODUCTS.map((p, i) => (
                    <tr key={p.name} className="hover:bg-[var(--admin-surface-alt)] transition-colors">
                      <td className="px-5 py-3.5 text-[12px] text-[var(--admin-text-muted)] font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5 text-[12px] font-medium max-w-[280px] text-[var(--admin-text)]">
                        <span className="line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-2 py-0.5 text-[11px] font-medium text-[var(--admin-text-soft)]">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-[12px] tabular-nums text-[var(--admin-text)]">{p.sold}</td>
                      <td className="px-5 py-3.5 text-right text-[12px] font-medium text-[var(--admin-text)]">{formatPrice(p.revenue)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[11px] font-medium text-green-600">{p.growth}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

      </div>
    </AdminShell>
  );
}
