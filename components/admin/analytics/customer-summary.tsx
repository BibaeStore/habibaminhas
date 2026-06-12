"use client";

import { useQuery } from "@tanstack/react-query";
import { UserPlus, Repeat2, Users } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import type { DateRange } from "./date-range-bar";

interface CustomerData {
  new_count:       number;
  returning_count: number;
  total_in_period: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  loading,
  color,
}: {
  icon:     React.ComponentType<{ className?: string }>;
  label:    string;
  value:    number | string;
  sub:      string;
  loading:  boolean;
  color:    string;
}) {
  return (
    <AdminCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      {loading ? (
        <>
          <div className="h-8 w-20 animate-pulse rounded bg-[var(--admin-border)] mt-1" />
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--admin-border)] mt-2.5" />
        </>
      ) : (
        <>
          <div className="mt-1 text-[28px] font-bold tabular-nums text-[var(--admin-text)]">{value}</div>
          <div className="mt-1.5 text-[12px] text-[var(--admin-text-muted)]">{sub}</div>
        </>
      )}
    </AdminCard>
  );
}

export function CustomerSummary({ dateRange }: { dateRange: DateRange }) {
  // Shared cache key with TopCustomersTable — one request serves both
  const { data, isPending: loading } = useQuery<CustomerData | null>({
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

  const repeatRate = data && data.total_in_period > 0
    ? Math.round((data.returning_count / data.total_in_period) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={UserPlus}
        label="New customers"
        value={data?.new_count ?? 0}
        sub="first order in period"
        loading={loading}
        color="text-green-500"
      />
      <StatCard
        icon={Repeat2}
        label="Returning"
        value={data?.returning_count ?? 0}
        sub={`${repeatRate}% repeat rate`}
        loading={loading}
        color="text-blue-500"
      />
      <StatCard
        icon={Users}
        label="Total buyers"
        value={data?.total_in_period ?? 0}
        sub="unique customers"
        loading={loading}
        color="text-[var(--admin-text-muted)]"
      />
    </div>
  );
}
