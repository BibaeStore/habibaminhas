"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, BarChart2, ShoppingBag, Users, DollarSign } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
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
  { label: "Ladies Stitched",  revenue: 828000, pct: 54, color: "#a8804b" },
  { label: "Baby Products",    revenue: 431200, pct: 28, color: "#8c9b7e" },
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
  { label: "Cash on Delivery", pct: 58, color: "#a8804b" },
  { label: "JazzCash",         pct: 24, color: "#8c9b7e" },
  { label: "Easypaisa",        pct: 12, color: "#5c6dab" },
  { label: "Bank / Card",      pct: 6,  color: "#c97a86" },
];

type Period = "7d" | "30d" | "90d";

// ─── Inline SVG bar chart ──────────────────────────────────────────────────────

function BarChart({ data, highlight = "#a8804b", h = 100 }: { data: { day: string; amount: number }[]; highlight?: string; h?: number }) {
  const visible = data.slice(-14); // show last 14 in 30d view
  const max = Math.max(...visible.map((d) => d.amount));
  const bw = 28; const gap = 8; const padX = 6;
  const totalW = visible.length * (bw + gap) + padX * 2;

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 28}`} className="w-full" preserveAspectRatio="none">
      {visible.map((d, i) => {
        const barH  = (d.amount / max) * h;
        const x     = padX + i * (bw + gap);
        const y     = h - barH;
        const shade = i === visible.length - 1 ? highlight : highlight + "aa";
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={barH} fill={shade} rx="1" />
            {i % Math.ceil(visible.length / 7) === 0 && (
              <text x={x + bw / 2} y={h + 16} textAnchor="middle" fontSize="8" fill="#9a9080" fontFamily="inherit">
                {d.day}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Sparkline({ data, color = "#8c9b7e" }: { data: number[]; color?: string }) {
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
  const kpi = KPI_DATA[period];
  const revenueData = period === "7d" ? REVENUE_7D : REVENUE_30D;
  const sparkData   = period === "7d" ? ORDERS_SPARKLINE_7D : ORDERS_SPARKLINE_30D;

  return (
    <AdminShell title="Analytics">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Analytics</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Habiba Minhas · Performance overview</p>
            </div>
            <div className="flex gap-0">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`h-9 px-5 text-[11px] uppercase tracking-[0.2em] border transition-colors ${
                    p === period
                      ? "bg-ink border-ink text-ivory"
                      : "border-border-soft text-ink-soft hover:bg-cream"
                  } ${p !== "7d" ? "border-l-0" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: DollarSign, label: "Total Revenue",   value: kpi.revenue,   change: kpi.rChange,   up: kpi.rUp,   sub: "gross sales" },
              { icon: ShoppingBag,label: "Orders",          value: String(kpi.orders),  change: kpi.oChange,   up: kpi.oUp,   sub: "completed" },
              { icon: Users,       label: "New Customers",  value: String(kpi.customers),change: kpi.cChange,  up: kpi.cUp,   sub: "registered" },
              { icon: BarChart2,   label: "Avg. Order Value",value: kpi.aov,      change: kpi.aovChange, up: kpi.aovUp, sub: "per order" },
            ].map(({ icon: Icon, label, value, change, up, sub }) => (
              <div key={label} className="border border-border-soft bg-ivory p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted">{label}</span>
                  <Icon className="h-4 w-4 text-muted" />
                </div>
                <div className="font-display text-2xl italic">{value}</div>
                <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${up ? "text-sage" : "text-sale"}`}>
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="font-medium">{change}</span>
                  <span className="text-muted">{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Revenue chart */}
            <section className="lg:col-span-8 border border-border-soft bg-ivory p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl italic">Revenue</h2>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Total: {formatPrice(revenueData.reduce((a, d) => a + d.amount, 0))}
                    <span className="ml-2 text-sage">
                      {kpi.rChange} vs prev. period
                    </span>
                  </p>
                </div>
                <BarChart2 className="h-4 w-4 text-muted" />
              </div>
              <div style={{ height: 148 }}>
                <BarChart data={revenueData} h={100} />
              </div>
            </section>

            {/* Category breakdown */}
            <section className="lg:col-span-4 border border-border-soft bg-ivory p-5">
              <h2 className="font-display text-xl italic mb-4">Revenue by category</h2>
              <ul className="space-y-4">
                {CAT_BREAKDOWN.map((c) => (
                  <li key={c.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] font-medium">{c.label}</span>
                      <span className="text-[11px] text-muted">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden bg-cream">
                      <div className="h-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <div className="mt-1 text-[11px] text-ink-soft">{formatPrice(c.revenue)}</div>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* Orders sparkline + Payment split */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-7 border border-border-soft bg-ivory p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl italic">Daily order volume</h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    Total: {sparkData.reduce((a, n) => a + n, 0)} orders · Peak: {Math.max(...sparkData)}
                  </p>
                </div>
              </div>
              <Sparkline data={sparkData} color="#8c9b7e" />
              <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted">
                <span>{period === "7d" ? "Mon" : "Day 1"}</span>
                <span>{period === "7d" ? "Sun" : `Day ${sparkData.length}`}</span>
              </div>
            </section>

            <section className="lg:col-span-5 border border-border-soft bg-ivory p-5">
              <h2 className="font-display text-xl italic mb-4">Payment methods</h2>
              <ul className="space-y-3">
                {PAYMENT_SPLIT.map((p) => (
                  <li key={p.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px]">{p.label}</span>
                        <span className="text-[12px] font-medium">{p.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-cream">
                        <div className="h-full" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Top products */}
          <section className="mt-6 border border-border-soft bg-ivory">
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <h2 className="font-display text-xl italic">Top selling products</h2>
              <Link href="/admin/products" className="text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink transition-colors">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium w-8">#</th>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 text-center font-medium">Units sold</th>
                    <th className="px-5 py-3 text-right font-medium">Revenue</th>
                    <th className="px-5 py-3 text-right font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {TOP_PRODUCTS.map((p, i) => (
                    <tr key={p.name} className="hover:bg-cream/50 transition-colors">
                      <td className="px-5 py-3.5 text-[12px] text-muted font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5 text-[12px] font-medium max-w-[280px]">
                        <span className="line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="border border-border-soft bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-[12px] tabular-nums">{p.sold}</td>
                      <td className="px-5 py-3.5 text-right text-[12px] font-medium">{formatPrice(p.revenue)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[11px] font-medium text-sage">{p.growth}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
    </AdminShell>
  );
}
