"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Users, Activity, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
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

export default function VirtualTryOnAdminPage() {
  const [config, setConfig] = useState<VirtualTryOnConfig>({
    enabled: true,
    per_user_limit: 3,
    global_daily_limit: 20,
  });
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [recent,     setRecent]     = useState<RecentEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/virtual-try-on-settings/");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Server error ${res.status}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setConfig(data.config);
      setTodayCount(data.today ?? 0);
      setRecent(data.recent ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    }
    setSaving(false);
  };

  return (
    <AdminShell>
      <div className="p-6 space-y-6 max-w-3xl">
        <PageHeader
          title="Virtual Try Room"
          subtitle="Control the AI fitting room — master switch, usage limits, and activity log."
        />

        {error && (
          <div className="rounded border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-4 py-3 text-[14px] text-[var(--admin-danger)]">
            {error}
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
          <AdminButton variant="outline" onClick={loadData}
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
            <div className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-[var(--admin-text)]">
              <Users className="h-4 w-4" />
              Recent Try-Ons
            </div>

            {loading ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]">No try-ons recorded yet.</p>
            ) : (
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
            )}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
