"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { formatPrice } from "@/lib/utils";

interface OrderRow {
  id:              string;
  order_number:    string;
  customer_name:   string;
  customer_email:  string;
  total:           number;
  status:          string;
  payment_method:  string;
  created_at:      string;
}

const STATUS_BADGE: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  dispatched: "bg-violet-100 text-violet-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LiveOrderFeed() {
  const queryClient = useQueryClient();

  // Cached + background-refreshed every 60s; silent updates, no remount
  const { data, isPending: loading, dataUpdatedAt } = useQuery<OrderRow[]>({
    queryKey: ["analytics-live-feed"],
    queryFn: async () => {
      const res  = await fetch("/api/admin/analytics/live-feed/").catch(() => null);
      const json = res?.ok ? await res.json().catch(() => null) : null;
      return json?.orders ?? [];
    },
    refetchInterval: 60_000,
    staleTime: 0,
  });
  const orders = data ?? [];
  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const load = () =>
    queryClient.invalidateQueries({ queryKey: ["analytics-live-feed"] });

  return (
    <AdminCard padded={false}>
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Recent orders</h2>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
        >
          <RefreshCw className="h-3 w-3" />
          {lastRefresh ? `Updated ${timeAgo(lastRefresh.toISOString())}` : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="px-5 py-4 space-y-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--admin-border)]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--admin-border)]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-[var(--admin-border)]" />
              <div className="h-3 w-16 animate-pulse rounded bg-[var(--admin-border)]" />
            </div>
          ))}
        </div>
      ) : !(orders ?? []).length ? (
        <div className="flex h-[100px] items-center justify-center text-[13px] text-[var(--admin-text-muted)]">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--admin-surface-alt)]">
              <tr>
                {["Order", "Customer", "Amount", "Status", "Time"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-[var(--admin-surface-alt)]">
                  <td className="px-5 py-3 text-[12px] font-medium text-[var(--admin-primary)]">
                    #{order.order_number}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-[12px] font-medium text-[var(--admin-text)]">{order.customer_name}</div>
                    <div className="text-[11px] text-[var(--admin-text-muted)]">{order.payment_method}</div>
                  </td>
                  <td className="px-5 py-3 text-[12px] font-medium tabular-nums text-[var(--admin-text)]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] text-[var(--admin-text-muted)] whitespace-nowrap">
                    {timeAgo(order.created_at)}
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
