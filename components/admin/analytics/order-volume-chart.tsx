"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonChartCard } from "./skeleton";
import type { DateRange } from "./date-range-bar";

interface Bucket {
  date:  string;
  count: number;
}

interface TooltipPayload {
  value: number;
  color: string;
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
      <div className="mb-1 font-medium text-[var(--admin-text)]">{dateStr}</div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
        <span className="text-[var(--admin-text-muted)]">Orders:</span>
        <span className="font-medium text-[var(--admin-text)]">{payload[0]?.value ?? 0}</span>
      </div>
    </div>
  );
}

function fmtDate(date: string, totalDays: number): string {
  const d = new Date(date + "T12:00:00Z");
  if (totalDays <= 14) return d.toLocaleString("en", { weekday: "short" });
  return d.toLocaleString("en", { month: "short", day: "numeric" });
}

export function OrderVolumeChart({ dateRange }: { dateRange: DateRange }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<Bucket[]>({
    queryKey: ["analytics-order-volume", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res  = await fetch(`/api/admin/analytics/order-volume/?${params}`);
      const json = res.ok ? await res.json() : null;
      return json?.data ?? [];
    },
  });

  if (loading || !mounted) {
    return <SkeletonChartCard title="Daily order volume" subtitle h={120} />;
  }

  const totalOrders = (data ?? []).reduce((s, d) => s + d.count, 0);
  const peakCount   = Math.max(...(data ?? []).map((d) => d.count), 0);
  const hasOrders   = totalOrders > 0;
  const totalDays   = data?.length ?? 0;
  const tickInterval = totalDays <= 7 ? 0 : totalDays <= 14 ? 1 : Math.floor(totalDays / 7);

  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Daily order volume</h2>
          {hasOrders && (
            <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
              {totalOrders} total · peak {peakCount} in a day
            </p>
          )}
        </div>
      </div>

      {!hasOrders ? (
        <div className="flex h-[120px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data ?? []} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              tickFormatter={(v) => fmtDate(v, totalDays)}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--admin-surface-alt)" }} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={32}>
              {(data ?? []).map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.count === peakCount && peakCount > 0 ? "#2563eb" : "#93c5fd"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </AdminCard>
  );
}
