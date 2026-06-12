"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonBarListCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface PaymentRow {
  method:  string;
  count:   number;
  revenue: number;
  pct:     number;
}

interface TooltipPayload {
  name:  string;
  value: number;
}

const METHOD_COLORS: Record<string, string> = {
  "COD":           "#2563eb",
  "JazzCash":      "#8b5cf6",
  "Easypaisa":     "#059669",
  "Bank Transfer": "#d97706",
  "Other":         "#6b7280",
};
const PALETTE = ["#2563eb", "#8b5cf6", "#059669", "#d97706", "#6b7280"];

function methodColor(name: string, idx: number): string {
  return METHOD_COLORS[name] ?? PALETTE[idx % PALETTE.length];
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 shadow-md text-[12px]">
      <div className="font-medium text-[var(--admin-text)]">{payload[0]?.name}</div>
      <div className="text-[var(--admin-text-muted)]">{payload[0]?.value} orders</div>
    </div>
  );
}

export function PaymentSplit({ dateRange }: { dateRange: DateRange }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<PaymentRow[]>({
    queryKey: ["analytics-payment-split", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res  = await fetch(`/api/admin/analytics/payment-split/?${params}`);
      const json = res.ok ? await res.json() : null;
      return json?.data ?? [];
    },
  });

  if (loading) return <SkeletonBarListCard title="Payment methods" rows={4} />;

  const hasData = (data ?? []).length > 0;

  return (
    <AdminCard>
      <h2 className="mb-4 text-[17px] font-semibold text-[var(--admin-text)]">Payment methods</h2>

      {!hasData ? (
        <div className="flex h-[120px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <div className="flex items-center gap-5">
          {/* Donut — fixed size to avoid ResizeObserver on server */}
          {mounted && (
            <div className="shrink-0">
              <PieChart width={110} height={110}>
                <Pie
                  data={(data ?? []).map((d) => ({ name: d.method, value: d.count }))}
                  cx={55}
                  cy={55}
                  innerRadius={34}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(data ?? []).map((entry, i) => (
                    <Cell key={i} fill={methodColor(entry.method, i)} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </div>
          )}

          {/* Legend */}
          <ul className="flex-1 space-y-2.5">
            {(data ?? []).map((row, i) => (
              <li key={row.method} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: methodColor(row.method, i) }}
                />
                <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                  <span className="text-[12px] text-[var(--admin-text)] truncate">{row.method}</span>
                  <span className="shrink-0 text-[11px] font-medium text-[var(--admin-text-muted)]">
                    {row.pct}% · {formatPrice(row.revenue)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminCard>
  );
}
