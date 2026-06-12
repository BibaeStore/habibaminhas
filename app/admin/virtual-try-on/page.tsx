"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Save, Users, Activity, ToggleLeft, ToggleRight, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import type { VirtualTryOnConfig } from "@/lib/actions/settings";

type RecentEntry = {
  id: string;
  user_email: string;
  product_slug: string;
  category: string;
  created_at: string;
};

type VTRResponse = {
  config: VirtualTryOnConfig;
  today: number;
  recent: RecentEntry[];
  page: number;
  totalPages: number;
  total: number;
};

export default function VirtualTryOnAdminPage() {
  const queryClient = useQueryClient();
  const [page,   setPage]   = useState(1);
  const [config, setConfig] = useState<VirtualTryOnConfig>({
    enabled: true,
    per_user_limit: 3,
    global_daily_limit: 20,
  });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  // Each page cached separately — revisits and page flips render instantly
  const { data, isPending: loading, error: queryError } = useQuery({
    queryKey: ["tryon-log", page],
    queryFn: async (): Promise<VTRResponse> => {
      const res = await fetch(`/api/admin/virtual-try-on-settings/?page=${page}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const todayCount = data?.today ?? null;
  const recent     = data?.recent ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total ?? 0;
  const loadError  = error || (queryError instanceof Error ? queryError.message : "");

  // Hydrate the editable config form when fresh data arrives
  useEffect(() => {
    if (data?.config) setConfig(data.config);
  }, [data?.config]);

  const loadData = () =>
    queryClient.invalidateQueries({ queryKey: ["tryon-log"] });

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  }

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/virtual-try-on-settings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Save failed (${res.status})`);
      } else {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: ["tryon-log"] });
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    }
    setSaving(false);
  };

  // Build page numbers to show: always show first, last, current ±1, with … gaps
  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages));
    const sorted = Array.from(set).sort((a, b) => a - b);
    const result: (number | "…")[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
      result.push(sorted[i]);
    }
    return result;
  }

  return (
    <AdminShell>
      <div className="p-6 space-y-6 max-w-3xl">
        <PageHeader
          title="Virtual Try Room"
          subtitle="Control the AI fitting room — master switch, usage limits, and activity log."
        />

        {loadError && (
          <div className="rounded border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-4 py-3 text-[14px] text-[var(--admin-danger)]">
            {loadError}
          </div>
        )}

        {/* ── Master toggle ── */}
        <AdminCard>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold text-[var(--admin-text)]">Virtual Try Room</div>
                <div className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
                  Master switch — turns the feature on or off sitewide for all products.
                </div>
              </div>
              <button
                onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
                className="shrink-0 transition-colors"
              >
                {config.enabled ? (
                  <ToggleRight className="h-9 w-9 text-[var(--admin-primary)]" />
                ) : (
                  <ToggleLeft className="h-9 w-9 text-[var(--admin-text-muted)]" />
                )}
              </button>
            </div>
            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${
              config.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              <span className={`h-2 w-2 rounded-full ${config.enabled ? "bg-green-500" : "bg-gray-400"}`} />
              {config.enabled
                ? "Active — customers can use Virtual Try Room"
                : "Disabled — button hidden everywhere"}
            </div>
          </div>
        </AdminCard>

        {/* ── Usage limits ── */}
        <AdminCard>
          <div className="p-5 space-y-5">
            <div className="text-[16px] font-semibold text-[var(--admin-text)]">Usage Limits</div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-[var(--admin-text)]">Per-user daily limit</span>
                <span className="text-[12px] text-[var(--admin-text-muted)]">Max try-ons per customer every 24 hours</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={config.per_user_limit}
                  onChange={(e) => setConfig((c) => ({ ...c, per_user_limit: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="mt-1 h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-[var(--admin-text)]">Global daily limit</span>
                <span className="text-[12px] text-[var(--admin-text-muted)]">Max total try-ons across all users per day</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={config.global_daily_limit}
                  onChange={(e) => setConfig((c) => ({ ...c, global_daily_limit: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="mt-1 h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
                />
              </label>
            </div>
          </div>
        </AdminCard>

        {/* ── Save / Refresh ── */}
        <div className="flex items-center gap-3">
          <AdminButton variant="primary" loading={saving} onClick={handleSave}
            leadingIcon={<Save className="h-4 w-4" />}>
            {saved ? "Saved!" : saving ? "Saving…" : "Save Settings"}
          </AdminButton>
          <AdminButton variant="outline" onClick={() => loadData()}
            leadingIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </AdminButton>
        </div>

        {/* ── Today's usage ── */}
        <AdminCard>
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-[var(--admin-text)]">Today&rsquo;s Usage</div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--admin-text-muted)]" />
                <span className="text-[22px] font-bold text-[var(--admin-primary)]">
                  {loading ? "…" : (todayCount ?? 0)}
                </span>
                <span className="text-[13px] text-[var(--admin-text-muted)]">
                  / {config.global_daily_limit} today
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-border)]">
              <div
                className="h-full rounded-full bg-[var(--admin-primary)] transition-all duration-500"
                style={{
                  width: config.global_daily_limit > 0
                    ? `${Math.min(100, ((todayCount ?? 0) / config.global_daily_limit) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </AdminCard>

        {/* ── Recent activity ── */}
        <AdminCard>
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[16px] font-semibold text-[var(--admin-text)]">
                <Users className="h-4 w-4" />
                Recent Try-Ons
              </div>
              {!loading && total > 0 && (
                <span className="text-[12px] text-[var(--admin-text-muted)]">
                  {total} total
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]">No try-ons recorded yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[var(--admin-border)] text-left text-[11px] uppercase tracking-wider text-[var(--admin-text-muted)]">
                        <th className="pb-2 pr-4">User</th>
                        <th className="pb-2 pr-4">Product</th>
                        <th className="pb-2 pr-4">Category</th>
                        <th className="pb-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r) => (
                        <tr key={r.id} className="border-b border-[var(--admin-border)] last:border-0">
                          <td className="py-2.5 pr-4 text-[var(--admin-text)]">{r.user_email}</td>
                          <td className="py-2.5 pr-4 font-medium text-[var(--admin-primary)]">{r.product_slug}</td>
                          <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{r.category}</td>
                          <td className="py-2.5 text-[var(--admin-text-muted)] whitespace-nowrap">
                            {new Date(r.created_at).toLocaleString("en-PK", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--admin-border)] pt-4">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-1 rounded px-2 py-1.5 text-[13px] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {pageNumbers().map((n, i) =>
                        n === "…" ? (
                          <span key={`gap-${i}`} className="px-1 text-[13px] text-[var(--admin-text-muted)]">…</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => goToPage(n)}
                            className={`flex h-8 w-8 items-center justify-center rounded text-[13px] font-medium transition-colors ${
                              n === page
                                ? "bg-[var(--admin-primary)] text-white"
                                : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-text)]"
                            }`}
                          >
                            {n}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 rounded px-2 py-1.5 text-[13px] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
