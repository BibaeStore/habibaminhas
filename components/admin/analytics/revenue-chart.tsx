"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonChartCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface Bucket {
  date: string;
  confirmed_revenue: number;
  pending_revenue:   number;
}

interface TooltipPayload {
  dataKey: string;
  name:    string;
  value:   number;
  color:   string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: TooltipPayload[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  const d = new Date((label ?? "") + "T12:00:00Z");
  const dateStr = d.toLocaleString("en", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 shadow-md text-[12px]">
      <div className="mb-1.5 font-medium text-[var(--admin-text)]">{dateStr}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--admin-text-muted)]">{p.name}:</span>
          <span className="font-medium text-[var(--admin-text)]">{formatPrice(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function fmtDate(date: string, totalDays: number): string {
  const d = new Date(date + "T12:00:00Z");
  if (totalDays <= 14) return d.toLocaleString("en", { weekday: "short" });
  return d.toLocaleString("en", { month: "short", day: "numeric" });
}

function fmtYAxis(v: number): string {
  if (v === 0) return "0";
  if (v >= 100_000) return `${Math.round(v / 1_000)}K`;
  if (v >= 1_000)   return `${Math.round(v / 1_000)}K`;
  return String(v);
}

export function RevenueChart({ dateRange }: { dateRange: DateRange }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<Bucket[]>({
    queryKey: ["analytics-revenue-chart", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res  = await fetch(`/api/admin/analytics/revenue-chart/?${params}`);
      const json = res.ok ? await res.json() : null;
      return json?.data ?? [];
    },
  });

  if (loading || !mounted) {
    return <SkeletonChartCard title="Revenue" subtitle h={148} />;
  }

  const hasActivity = (data ?? []).some(
    (d) => d.confirmed_revenue > 0 || d.pending_revenue > 0,
  );
  const totalConfirmed = (data ?? []).reduce((s, d) => s + d.confirmed_revenue, 0);
  const totalPending   = (data ?? []).reduce((s, d) => s + d.pending_revenue,   0);
  const totalDays      = data?.length ?? 0;

  const tickInterval = totalDays <= 7 ? 0 : totalDays <= 14 ? 1 : Math.floor(totalDays / 7);

  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Revenue</h2>
          <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
            Confirmed:{" "}
            <span className="font-medium text-[var(--admin-text)]">{formatPrice(totalConfirmed)}</span>
            {totalPending > 0 && (
              <>
                {" · "}Pending:{" "}
                <span className="font-medium text-[var(--admin-text)]">{formatPrice(totalPending)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {!hasActivity ? (
        <div className="flex h-[148px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={148}>
          <AreaChart data={data ?? []} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-confirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="grad-pending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#93c5fd" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              tickFormatter={(v) => fmtDate(v, totalDays)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtYAxis}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="confirmed_revenue"
              name="Confirmed"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#grad-confirmed)"
              dot={false}
              activeDot={{ r: 4, fill: "#2563eb" }}
            />
            <Area
              type="monotone"
              dataKey="pending_revenue"
              name="Pending"
              stroke="#93c5fd"
              strokeWidth={2}
              fill="url(#grad-pending)"
              dot={false}
              activeDot={{ r: 4, fill: "#93c5fd" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </AdminCard>
  );
}
