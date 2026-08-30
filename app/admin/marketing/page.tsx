"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save, Plus, Trash2, RefreshCw, ShieldCheck, AlertTriangle, Radio,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { isValidPixelId, type MetaPixel, type TrackingSettings } from "@/lib/tracking/config";
import type { TrackedEvent, EventStatus } from "@/lib/tracking/event-map";

type Verification = {
  checkedAt: string;
  reachable: boolean;
  error: string | null;
  scriptTagPresent: boolean;
  noscriptBeaconPresent: boolean;
  pixels: { pixel_id: string; inPageSource: boolean }[];
};

type TrackingResponse = {
  settings: TrackingSettings;
  verification: Verification | null;
  siteUrl: string;
  eventMap: TrackedEvent[];
  eventSummary: { total: number; live: number; partial: number; missing: number };
};

type RowState = "yes" | "no" | "unknown" | "pending";

const inputCls =
  "h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[14px] outline-none focus:border-[var(--admin-primary)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  );
}

const ROW_TONE: Record<RowState, StatusTone> = {
  yes: "success", no: "danger", unknown: "warning", pending: "neutral",
};
const ROW_WORD: Record<RowState, string> = {
  yes: "Verified", no: "Not found", unknown: "Unknown", pending: "Checking…",
};

/** One line of the live-status panel. `state` drives both the pill and the wording. */
function StatusRow({ label, state, detail }: { label: string; state: RowState; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-[14px] font-medium text-[var(--admin-text)]">{label}</div>
        <div className="mt-0.5 text-[13px] text-[var(--admin-text-soft)]">{detail}</div>
      </div>
      <StatusPill tone={ROW_TONE[state]}>{ROW_WORD[state]}</StatusPill>
    </div>
  );
}

const EVENT_TONE: Record<EventStatus, StatusTone> = {
  live: "success", partial: "warning", missing: "danger",
};
const EVENT_WORD: Record<EventStatus, string> = {
  live: "Live", partial: "Partial", missing: "Missing",
};

export default function AdminMarketingPage() {
  const queryClient = useQueryClient();
  const [pixels, setPixels] = useState<MetaPixel[]>([]);
  const [testCode, setTestCode] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { data, isPending, isFetching, error: queryError } = useQuery({
    queryKey: ["tracking"],
    queryFn: async (): Promise<TrackingResponse> => {
      const res = await fetch("/api/admin/tracking/");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      return res.json();
    },
  });

  // Hydrate the editable form when data arrives, but never clobber unsaved edits.
  useEffect(() => {
    if (!data?.settings || dirty) return;
    setPixels(data.settings.meta_pixels);
    setTestCode(data.settings.test_event_code);
  }, [data?.settings, dirty]);

  const verification = data?.verification ?? null;
  const loadError = queryError instanceof Error ? queryError.message : "";

  function edit(next: MetaPixel[]) {
    setPixels(next);
    setDirty(true);
    setSaved(false);
  }

  const addPixel = () =>
    edit([
      ...pixels,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `pixel-${Date.now()}`,
        label: "",
        pixel_id: "",
        enabled: true,
      },
    ]);

  const updatePixel = (id: string, patch: Partial<MetaPixel>) =>
    edit(pixels.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const removePixel = (id: string) => edit(pixels.filter((p) => p.id !== id));

  const invalid = pixels.filter((p) => p.pixel_id.trim() !== "" && !isValidPixelId(p.pixel_id));
  const activeCount = pixels.filter((p) => p.enabled && isValidPixelId(p.pixel_id)).length;
  const primary = pixels.find((p) => p.enabled && isValidPixelId(p.pixel_id)) ?? null;

  async function save() {
    setError("");
    setSaving(true);
    try {
      const payload: TrackingSettings = {
        meta_pixels: pixels.filter((p) => p.pixel_id.trim() !== ""),
        test_event_code: testCode.trim(),
      };
      const res = await fetch("/api/admin/tracking/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Server error ${res.status}`);

      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await queryClient.invalidateQueries({ queryKey: ["tracking"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const reverify = () => queryClient.invalidateQueries({ queryKey: ["tracking"] });

  /* Live-status states. "Saved in settings" is what the database holds; every other row is
     what the live site actually served — so the two can visibly disagree, which is the point. */
  const primaryVerdict = primary
    ? verification?.pixels.find((v) => v.pixel_id === primary.pixel_id) ?? null
    : null;
  const inSource: RowState = !verification
    ? "pending"
    : !verification.reachable
      ? "unknown"
      : primaryVerdict?.inPageSource
        ? "yes"
        : "no";
  const scriptState: RowState = !verification
    ? "pending"
    : !verification.reachable
      ? "unknown"
      : verification.scriptTagPresent
        ? "yes"
        : "no";

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Marketing &amp; Tracking"
          subtitle="Meta Pixels, verified against the live site — stored separately from SEO settings so neither screen can overwrite the other."
          actions={
            <AdminButton
              variant="outline"
              onClick={reverify}
              loading={isFetching && !isPending}
              leadingIcon={<RefreshCw className="h-4 w-4" />}
            >
              Re-verify
            </AdminButton>
          }
        />

        {loadError && (
          <AdminCard className="border-[var(--admin-danger)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-danger)]" />
              <div>
                <div className="text-[15px] font-semibold text-[var(--admin-text)]">
                  Something went wrong
                </div>
                <p className="mt-1 text-[14px] text-[var(--admin-text-soft)]">{loadError}</p>
              </div>
            </div>
          </AdminCard>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Pixels ─────────────────────────────────────────────── */}
          <AdminCard>
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Meta Pixels</h2>
              <StatusPill tone={activeCount > 0 ? "success" : "danger"}>
                {activeCount} active
              </StatusPill>
            </div>

            {isPending ? (
              <p className="mt-6 text-[14px] text-[var(--admin-text-soft)]">Loading…</p>
            ) : (
              <>
                <div className="mt-5 flex flex-col gap-4">
                  {pixels.length === 0 && (
                    <p className="rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-border)] p-6 text-center text-[14px] text-[var(--admin-text-soft)]">
                      No pixel configured. Meta is recording nothing from this store.
                    </p>
                  )}

                  {pixels.map((p, i) => {
                    const bad = p.pixel_id.trim() !== "" && !isValidPixelId(p.pixel_id);
                    return (
                      <div
                        key={p.id}
                        className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                            {i === 0 ? "Primary" : `Pixel ${i + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePixel(p.id, { enabled: !p.enabled })}
                              role="switch"
                              aria-checked={p.enabled}
                              aria-label={`${p.enabled ? "Disable" : "Enable"} ${p.label || "this pixel"}`}
                              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                                p.enabled ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-border)]"
                              }`}
                            >
                              <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                                  p.enabled ? "left-6" : "left-1"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => removePixel(p.id)}
                              aria-label={`Remove ${p.label || "this pixel"}`}
                              className="rounded-md p-2 text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-danger-soft)] hover:text-[var(--admin-danger)]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="Label">
                            <input
                              value={p.label}
                              onChange={(e) => updatePixel(p.id, { label: e.target.value })}
                              placeholder="Main store pixel"
                              className={inputCls}
                            />
                          </Field>
                          <Field
                            label="Pixel ID"
                            hint={bad ? "Meta Pixel IDs are 15–16 digits, numbers only." : undefined}
                          >
                            <input
                              value={p.pixel_id}
                              onChange={(e) => updatePixel(p.id, { pixel_id: e.target.value })}
                              placeholder="123456789012345"
                              inputMode="numeric"
                              aria-invalid={bad}
                              className={`${inputCls} font-mono ${bad ? "border-[var(--admin-danger)]" : ""}`}
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={addPixel}
                  className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-primary)] transition-opacity hover:opacity-75"
                >
                  <Plus className="h-4 w-4" /> Add another pixel
                </button>
                <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">
                  For an agency&rsquo;s own pixel, or when you switch marketing partners. Switch one off
                  to revoke it without losing the ID.
                </p>

                {pixels.length > 1 && (
                  <p className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-warning-soft)] bg-[var(--admin-warning-soft)] p-3 text-[13px] text-[var(--admin-warning)]">
                    Only the primary pixel renders on the storefront today. The others are saved here
                    and start firing once the storefront reads this page directly.
                  </p>
                )}

                <div className="mt-6 border-t border-[var(--admin-border)] pt-5">
                  <Field
                    label="Test event code — optional"
                    hint="From Meta Events Manager › Test Events. Paste it, save, then browse the site and watch events arrive in real time. Clear it when you are done."
                  >
                    <input
                      value={testCode}
                      onChange={(e) => {
                        setTestCode(e.target.value);
                        setDirty(true);
                        setSaved(false);
                      }}
                      placeholder="TEST12345"
                      className={`${inputCls} font-mono max-w-xs`}
                    />
                  </Field>
                </div>

                {error && <p className="mt-4 text-[14px] text-[var(--admin-danger)]">{error}</p>}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <AdminButton
                    variant="primary"
                    onClick={save}
                    loading={saving}
                    disabled={isPending || invalid.length > 0 || !dirty}
                    leadingIcon={<Save className="h-4 w-4" />}
                  >
                    {saved ? "Saved!" : "Save & verify"}
                  </AdminButton>
                  {invalid.length > 0 && (
                    <span className="text-[13px] text-[var(--admin-danger)]">
                      Fix the highlighted pixel ID first.
                    </span>
                  )}
                  {!dirty && !saved && !isPending && (
                    <span className="text-[13px] text-[var(--admin-text-muted)]">
                      No unsaved changes.
                    </span>
                  )}
                </div>
              </>
            )}
          </AdminCard>

          {/* ── Live status ────────────────────────────────────────── */}
          <AdminCard>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--admin-primary)]" />
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Live status</h2>
            </div>
            <p className="mt-1 text-[13px] text-[var(--admin-text-soft)]">
              Checked by fetching {data?.siteUrl ?? "the live site"} and reading the HTML it really
              served — not by looking at the boxes on the left.
            </p>

            <div className="mt-4">
              <StatusRow
                label="Saved in settings"
                state={primary ? "yes" : "no"}
                detail={
                  primary
                    ? `${primary.label || "Unlabelled"} — ${primary.pixel_id}`
                    : "No enabled pixel with a valid ID."
                }
              />
              <StatusRow
                label="Present in page source"
                state={inSource}
                detail={
                  !verification
                    ? "Running the check…"
                    : !verification.reachable
                      ? verification.error ?? "The site could not be reached."
                      : primaryVerdict?.inPageSource
                        ? "The pixel ID appears in the served HTML."
                        : "Saved, but not in the page. It is collecting nothing."
                }
              />
              <StatusRow
                label="Meta loader referenced"
                state={scriptState}
                detail="connect.facebook.net appears in the page, so the pixel script is bootstrapped."
              />
              <StatusRow
                label="Test event code"
                state={testCode.trim() ? "yes" : "pending"}
                detail={
                  testCode.trim()
                    ? "Set — Meta's Test Events screen will light up."
                    : "Not set. Optional."
                }
              />
              <StatusRow
                label="Conversions API"
                state="unknown"
                detail="Not set up. Browser-only events are lost to ad-blockers and iOS."
              />
            </div>

            {verification && (
              <p className="mt-4 text-[13px] text-[var(--admin-text-muted)]">
                Last checked{" "}
                {new Date(verification.checkedAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            )}
          </AdminCard>
        </div>

        {/* ── Event map ─────────────────────────────────────────────── */}
        <AdminCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-[var(--admin-primary)]" />
              <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">
                What this site sends Meta
              </h2>
            </div>
            {data?.eventSummary && (
              <StatusPill tone="neutral">
                {data.eventSummary.live} live · {data.eventSummary.partial} partial ·{" "}
                {data.eventSummary.missing} missing
              </StatusPill>
            )}
          </div>
          <p className="mt-1 text-[13px] text-[var(--admin-text-soft)]">
            Read-only. Standard Meta event names unlock Meta&rsquo;s built-in optimisation, so they
            are not renameable from here.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-[13px] uppercase tracking-wide text-[var(--admin-text-muted)]">
                  <th className="pb-2 pr-4 font-semibold">What the shopper does</th>
                  <th className="pb-2 pr-4 font-semibold">Meta event</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {(data?.eventMap ?? []).map((e) => (
                  <tr
                    key={e.metaEvent}
                    className="border-b border-[var(--admin-border)] last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-[var(--admin-text)]">{e.action}</td>
                    <td className="py-3 pr-4">
                      <code className="font-mono text-[13px] text-[var(--admin-text)]">
                        {e.metaEvent}
                      </code>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone={EVENT_TONE[e.status]}>{EVENT_WORD[e.status]}</StatusPill>
                    </td>
                    <td className="py-3 text-[13px] text-[var(--admin-text-soft)]">{e.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
