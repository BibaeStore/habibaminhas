"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonChartCard } from "./skeleton";
import type { DateRange } from "./date-range-bar";

interface FunnelRow {
  status: string;
  count:  number;
  pct:    number;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "#f59e0b" },
  processing: { label: "Processing", color: "#3b82f6" },
  dispatched: { label: "Dispatched", color: "#8b5cf6" },
  delivered:  { label: "Delivered",  color: "#10b981" },
  cancelled:  { label: "Cancelled",  color: "#ef4444" },
};

export function OrderFunnel({ dateRange }: { dateRange: DateRange }) {
  // Cached per date range — revisits render instantly
  const { data: funnelData, isPending: loading } = useQuery<{ data: FunnelRow[]; total: number }>({
    queryKey: ["analytics-order-funnel", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res  = await fetch(`/api/admin/analytics/order-funnel/?${params}`);
      const json = res.ok ? await res.json() : null;
      return { data: json?.data ?? [], total: json?.total ?? 0 };
    },
  });
  const data  = funnelData?.data ?? [];
  const total = funnelData?.total ?? 0;

  if (loading) return <SkeletonChartCard title="Order funnel" h={80} />;

  const hasData = total > 0;

  // max bar = the largest non-cancelled count (so funnel bars taper as they should)
  const nonCancelledMax = Math.max(
    ...((data ?? []).filter((d) => d.status !== "cancelled").map((d) => d.count)),
    1,
  );

  return (
    <AdminCard>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Order funnel</h2>
        {hasData && (
          <span className="text-[12px] text-[var(--admin-text-muted)]">{total} total orders</span>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-[80px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((row) => {
            const meta   = STATUS_META[row.status] ?? { label: row.status, color: "#6b7280" };
            const widthPct = row.status === "cancelled"
              ? (row.count / total) * 100
              : (row.count / nonCancelledMax) * 100;
            return (
              <div key={row.status} className="flex items-center gap-3">
                <div className="w-[80px] shrink-0 text-right text-[11px] font-medium text-[var(--admin-text-muted)]">
                  {meta.label}
                </div>
                <div className="flex-1 overflow-hidden rounded-full bg-[var(--admin-surface-alt)]" style={{ height: 10 }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%`, background: meta.color }}
                  />
                </div>
                <div className="w-[52px] shrink-0 text-[11px] tabular-nums text-[var(--admin-text-muted)]">
                  {row.count} <span className="opacity-60">({row.pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
