"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonBarListCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface CategoryRow {
  category: string;
  revenue:  number;
  pct:      number;
}

// Deterministic color palette — first 6 cover all expected categories
const PALETTE = ["#2563eb", "#8b5cf6", "#0891b2", "#d97706", "#059669", "#6b7280"];
const KNOWN_COLORS: Record<string, string> = {
  "Ladies Stitched":   "#2563eb",
  "Ladies Unstitched": "#3b82f6",
  "Baby Products":     "#8b5cf6",
  "Kids Formal":       "#0891b2",
  "Accessories":       "#d97706",
};

function catColor(name: string, idx: number): string {
  return KNOWN_COLORS[name] ?? PALETTE[idx % PALETTE.length];
}

export function CategoryBreakdown({ dateRange }: { dateRange: DateRange }) {
  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<CategoryRow[]>({
    queryKey: ["analytics-category-breakdown", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res  = await fetch(`/api/admin/analytics/category-breakdown/?${params}`);
      const json = res.ok ? await res.json() : null;
      return json?.data ?? [];
    },
  });

  if (loading) return <SkeletonBarListCard title="Revenue by category" rows={4} />;

  const hasData = (data ?? []).length > 0;

  return (
    <AdminCard>
      <h2 className="mb-5 text-[17px] font-semibold text-[var(--admin-text)]">
        Revenue by category
      </h2>

      {!hasData ? (
        <div className="flex h-[120px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders in this period
        </div>
      ) : (
        <ul className="space-y-4">
          {(data ?? []).map((row, i) => (
            <li key={row.category}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--admin-text)]">{row.category}</span>
                <span className="text-[11px] text-[var(--admin-text-muted)]">{row.pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-alt)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${row.pct}%`, background: catColor(row.category, i) }}
                />
              </div>
              <div className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                {formatPrice(row.revenue)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
