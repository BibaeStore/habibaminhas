"use client";

import { type ComponentType } from "react";
import { AdminCard } from "@/components/admin/ui/card";

function Pulse({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-[var(--admin-border)] ${className}`} style={style} />;
}

export function SkeletonKPICard({
  label,
  icon: Icon,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <AdminCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[var(--admin-text-muted)]" />
      </div>
      <Pulse className="h-8 w-32 mt-1" />
      <Pulse className="h-3 w-20 mt-2.5" />
    </AdminCard>
  );
}

export function SkeletonChartCard({
  title,
  subtitle = false,
  h = 160,
}: {
  title: string;
  subtitle?: boolean;
  h?: number;
}) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[17px] font-semibold text-[var(--admin-text)]">{title}</span>
          {subtitle && <Pulse className="h-3 w-40" />}
        </div>
      </div>
      <Pulse className="w-full" style={{ height: h }} />
    </AdminCard>
  );
}

export function SkeletonBarListCard({
  title,
  rows = 4,
}: {
  title: string;
  rows?: number;
}) {
  return (
    <AdminCard>
      <span className="mb-5 block text-[17px] font-semibold text-[var(--admin-text)]">{title}</span>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="mb-1.5 flex items-center justify-between">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-3 w-8" />
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-alt)]">
              <Pulse className="h-full rounded-full" style={{ width: `${Math.max(25, 80 - i * 14)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function SkeletonTableCard({
  title,
  rows = 5,
  cols = 5,
}: {
  title: string;
  rows?: number;
  cols?: number;
}) {
  const colWidths = ["w-6", "w-52", "w-20", "w-16", "w-20"];
  return (
    <AdminCard padded={false}>
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
        <span className="text-[17px] font-semibold text-[var(--admin-text)]">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-5">
            {Array.from({ length: cols }).map((_, c) => (
              <Pulse key={c} className={`h-3 shrink-0 ${colWidths[c] ?? "w-16"}`} />
            ))}
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function SkeletonFeedCard({
  title,
  rows = 8,
}: {
  title: string;
  rows?: number;
}) {
  return (
    <AdminCard padded={false}>
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-5 py-4">
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="text-[17px] font-semibold text-[var(--admin-text)]">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-5">
            <Pulse className="h-3 w-24 shrink-0" />
            <Pulse className="h-3 w-16 shrink-0" />
            <Pulse className="h-3 flex-1" />
            <Pulse className="h-3 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function SkeletonInsightsCard() {
  return (
    <AdminCard>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[17px] font-semibold text-[var(--admin-text)]">AI Insights</span>
        <span className="rounded-full border border-[var(--admin-border)] px-3 py-1 text-[11px] font-medium text-[var(--admin-text-muted)]">
          Powered by Claude
        </span>
      </div>
      <div className="space-y-2.5">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-5/6" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-4/6" />
      </div>
    </AdminCard>
  );
}
