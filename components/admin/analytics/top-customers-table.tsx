"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonTableCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface CustomerRow {
  email:            string;
  name:             string;
  tier:             string;
  city:             string | null;
  spent_in_period:  number;
  orders_in_period: number;
}

const TIER_STYLES: Record<string, string> = {
  VIP:     "bg-violet-100 text-violet-700",
  Regular: "bg-blue-100 text-blue-700",
  New:     "bg-gray-100 text-gray-600",
};

export function TopCustomersTable({ dateRange }: { dateRange: DateRange }) {
  // Same cache key as CustomerSummary — TanStack dedupes to a single request
  const { data: customersData, isPending: loading } = useQuery<{ top_customers?: CustomerRow[] } | null>({
    queryKey: ["analytics-customers", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/admin/analytics/customers/?${params}`);
      return res.ok ? res.json() : null;
    },
  });
  const data = customersData?.top_customers ?? [];

  if (loading) return <SkeletonTableCard title="Top customers" rows={5} cols={4} />;

  const hasData = (data ?? []).length > 0;

  return (
    <AdminCard padded={false}>
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
        <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Top customers</h2>
        <span className="text-[12px] text-[var(--admin-text-muted)]">by spend in period</span>
      </div>

      {!hasData ? (
        <div className="flex h-[100px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--admin-surface-alt)]">
              <tr>
                {["Customer", "Orders", "Spent", "Tier"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {(data ?? []).map((row) => (
                <tr key={row.email} className="transition-colors hover:bg-[var(--admin-surface-alt)]">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-medium text-[var(--admin-text)]">{row.name}</div>
                    <div className="text-[11px] text-[var(--admin-text-muted)]">{row.email}</div>
                    {row.city && (
                      <div className="text-[11px] text-[var(--admin-text-muted)]">{row.city}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] tabular-nums text-[var(--admin-text)]">
                    {row.orders_in_period}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium tabular-nums text-[var(--admin-text)]">
                    {formatPrice(row.spent_in_period)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TIER_STYLES[row.tier] ?? TIER_STYLES.New}`}
                    >
                      {row.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
