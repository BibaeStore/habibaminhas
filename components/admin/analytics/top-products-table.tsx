"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonTableCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface ProductRow {
  product_id:    string | null;
  product_title: string;
  units_sold:    number;
  revenue:       number;
  order_count:   number;
}

type SortKey = "units_sold" | "revenue" | "order_count";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: "asc" | "desc" }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === "desc"
    ? <ChevronDown className="h-3 w-3" />
    : <ChevronUp className="h-3 w-3" />;
}

export function TopProductsTable({ dateRange }: { dateRange: DateRange }) {
  const [sortKey, setSortKey] = useState<SortKey>("units_sold");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<ProductRow[]>({
    queryKey: ["analytics-top-products", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from:  dateRange.from.toISOString(),
        to:    dateRange.to.toISOString(),
        limit: "10",
      });
      const res  = await fetch(`/api/admin/analytics/top-products/?${params}`);
      const json = res.ok ? await res.json() : null;
      return json?.data ?? [];
    },
  });

  if (loading) return <SkeletonTableCard title="Top selling products" rows={5} cols={5} />;

  const hasData = (data ?? []).length > 0;

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...(data ?? [])].sort((a, b) =>
    sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
  );

  const thBase = "px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)] select-none";

  return (
    <AdminCard padded={false}>
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
        <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Top selling products</h2>
        <Link
          href="/admin/products"
          className="text-[13px] font-medium text-[var(--admin-primary)] transition-colors hover:text-[var(--admin-text)]"
        >
          View all →
        </Link>
      </div>

      {!hasData ? (
        <div className="flex h-[120px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No sales in this period
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--admin-surface-alt)]">
              <tr>
                <th className={`${thBase} w-10`}>#</th>
                <th className={thBase}>Product</th>
                <th
                  className={`${thBase} cursor-pointer text-right hover:text-[var(--admin-text)]`}
                  onClick={() => handleSort("units_sold")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Units sold <SortIcon col="units_sold" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${thBase} cursor-pointer text-right hover:text-[var(--admin-text)]`}
                  onClick={() => handleSort("revenue")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Revenue <SortIcon col="revenue" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className={`${thBase} cursor-pointer text-right hover:text-[var(--admin-text)]`}
                  onClick={() => handleSort("order_count")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Orders <SortIcon col="order_count" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {sorted.map((row, i) => (
                <tr key={row.product_title} className="transition-colors hover:bg-[var(--admin-surface-alt)]">
                  <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--admin-text-muted)]">
                    {i + 1}
                  </td>
                  <td className="px-5 py-3.5 max-w-[260px]">
                    <span className="line-clamp-1 text-[13px] font-medium text-[var(--admin-text)]">
                      {row.product_title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] tabular-nums text-[var(--admin-text)]">
                    {row.units_sold}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-medium tabular-nums text-[var(--admin-text)]">
                    {formatPrice(row.revenue)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] tabular-nums text-[var(--admin-text-muted)]">
                    {row.order_count}
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
