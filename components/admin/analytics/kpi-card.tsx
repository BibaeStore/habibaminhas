"use client";

import { type ComponentType } from "react";
import { AdminCard } from "@/components/admin/ui/card";

interface KPICardProps {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  subtext: string;
  loading?: boolean;
}

export function KPICard({ label, icon: Icon, value, subtext, loading = false }: KPICardProps) {
  return (
    <AdminCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[var(--admin-text-muted)]" />
      </div>

      {loading ? (
        <>
          <div className="h-8 w-32 animate-pulse rounded bg-[var(--admin-border)] mt-1" />
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--admin-border)] mt-2.5" />
        </>
      ) : (
        <>
          <div className="mt-1 text-[28px] font-bold tabular-nums text-[var(--admin-text)]">{value}</div>
          <div className="mt-1.5 text-[12px] text-[var(--admin-text-muted)]">{subtext}</div>
        </>
      )}
    </AdminCard>
  );
}
