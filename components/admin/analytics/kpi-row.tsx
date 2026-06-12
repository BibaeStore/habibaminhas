"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, BarChart2, TrendingUp } from "lucide-react";
import { KPICard } from "./kpi-card";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "./date-range-bar";

interface KPIData {
  confirmed_revenue: number;
  pending_revenue:   number;
  order_count:       number;
  aov:               number;
  delivered_count:   number;
  pending_count:     number;
}

export function KPIRow({ dateRange }: { dateRange: DateRange }) {
  // Cached per date range — revisits render instantly
  const { data, isPending: loading } = useQuery<KPIData | null>({
    queryKey: ["analytics-kpis", dateRange.from.getTime(), dateRange.to.getTime()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to:   dateRange.to.toISOString(),
      });
      const res = await fetch(`/api/admin/analytics/kpis/?${params}`);
      return res.ok ? res.json() : null;
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="Confirmed Revenue"
        icon={DollarSign}
        value={data ? formatPrice(data.confirmed_revenue) : "—"}
        subtext={data ? `${data.delivered_count} delivered order${data.delivered_count !== 1 ? "s" : ""}` : "—"}
        loading={loading}
      />
      <KPICard
        label="Pending Revenue"
        icon={TrendingUp}
        value={data ? formatPrice(data.pending_revenue) : "—"}
        subtext={data ? `${data.pending_count} in-transit order${data.pending_count !== 1 ? "s" : ""}` : "—"}
        loading={loading}
      />
      <KPICard
        label="Orders"
        icon={ShoppingBag}
        value={data ? String(data.order_count) : "—"}
        subtext={data ? `${data.delivered_count} delivered · ${data.pending_count} pending` : "—"}
        loading={loading}
      />
      <KPICard
        label="Avg. Order Value"
        icon={BarChart2}
        value={data ? (data.aov > 0 ? formatPrice(data.aov) : "—") : "—"}
        subtext="per completed order"
        loading={loading}
      />
    </div>
  );
}
