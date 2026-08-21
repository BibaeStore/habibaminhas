"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarHeart, RefreshCw, X, Check, Sparkles, RotateCcw, AlertTriangle, Clock,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import {
  listOccasionCalendar, listOccasions, runOccasionPlanner,
  generateOccasionArtwork, regenerateOccasionArtwork,
  cancelOccasionPost, restoreOccasionPost, approveOccasionPost, setOccasionEnabled,
  type CalendarEntry,
} from "@/lib/actions/social-occasions";
import {
  PAGE_PADDING, SectionHeading, EmptyState, Pill, Modal, Toggle, Toast,
} from "@/components/admin/social/ui";
import { useAct } from "@/components/admin/social/use-act";

/**
 * Occasions — what is coming, and what it will look like.
 *
 * The agent runs without anyone here, so this page is not a control panel; it is a window.
 * Posts publish on silence, which means the only thing that actually matters is being able
 * to *see* an image early enough to reject it. Everything is arranged around that: the
 * artwork is the largest element in every row, and Regenerate sits next to it rather than
 * behind a menu.
 *
 * Cancelled rows stay visible for the same reason. A Friday that silently disappeared
 * would read as the agent breaking, when in fact someone chose it.
 */

const STATUS_TONE: Record<string, { label: string; cls: string }> = {
  planned:    { label: "Planned",    cls: "bg-slate-100 text-slate-600 border-slate-200" },
  generating: { label: "Generating", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  ready:      { label: "Ready",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  publishing: { label: "Publishing", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  published:  { label: "Published",  cls: "bg-emerald-600 text-white border-emerald-600" },
  cancelled:  { label: "Cancelled",  cls: "bg-slate-100 text-slate-400 border-slate-200 line-through" },
  skipped:    { label: "Skipped",    cls: "bg-slate-100 text-slate-400 border-slate-200" },
  failed:     { label: "Failed",     cls: "bg-red-50 text-red-700 border-red-200" },
};

function StatusPill({ status }: { status: string }) {
  const t = STATUS_TONE[status] ?? STATUS_TONE.planned;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${t.cls}`}>
      {t.label}
    </span>
  );
}

/** "Fri 28 Aug" plus a relative hint, which is what actually tells you if there is time. */
function formatDate(key: string): { label: string; relative: string } {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const label = date.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  });
  const todayKey = new Date().toISOString().slice(0, 10);
  const days = Math.round(
    (Date.UTC(y, m - 1, d) - Date.parse(todayKey + "T00:00:00Z")) / 86400000,
  );
  const relative =
    days === 0 ? "today" : days === 1 ? "tomorrow" : days < 0 ? `${-days}d ago` : `in ${days}d`;
  return { label, relative };
}

async function load() {
  const [calendar, occasions] = await Promise.all([listOccasionCalendar(), listOccasions()]);
  return { calendar, occasions };
}

export default function OccasionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["social-occasions"], queryFn: load });
  const { act, pending, notice, setNotice } = useAct();
  const [preview, setPreview] = useState<CalendarEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const upcoming = useMemo(
    () => (data?.calendar ?? []).filter((e) => e.status !== "skipped"),
    [data],
  );

  const readyCount = upcoming.filter((e) => e.status === "ready").length;
  const needArt = upcoming.filter((e) => e.status === "planned").length;

  return (
    <div className={PAGE_PADDING}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--admin-text)]">
            <CalendarHeart size={20} /> Occasions
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[var(--admin-text-muted)]">
            Greetings for Jumma, Eid, national days and more — planned a month ahead, artwork
            made a week ahead, published automatically at 10:00. You do not need to do anything.
            Look here only if you want to change something before it goes out.
          </p>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={() => setShowSettings(true)}>
            Which occasions
          </AdminButton>
          <AdminButton
            onClick={() =>
              act(runOccasionPlanner, (r) => {
                const res = r as { ok: boolean; detail: string };
                return res.ok ? `Calendar refreshed — ${res.detail}` : `Failed: ${res.detail}`;
              })
            }
            disabled={pending}
          >
            <RefreshCw size={14} className={pending ? "animate-spin" : ""} /> Refresh calendar
          </AdminButton>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Pill tone="muted">{upcoming.length} upcoming</Pill>
        <Pill tone="ok">{readyCount} with artwork ready</Pill>
        {needArt > 0 && <Pill tone="warn">{needArt} awaiting artwork</Pill>}
      </div>

      {isLoading && <p className="text-[13px] text-[var(--admin-text-muted)]">Loading…</p>}

      {!isLoading && upcoming.length === 0 && (
        <EmptyState
          message="Nothing planned yet"
          hint="Press Refresh calendar to fill the next month."
        />
      )}

      <div className="space-y-3">
        {upcoming.map((entry) => {
          const { label, relative } = formatDate(entry.occasion_date);
          const dim = entry.status === "cancelled";
          return (
            <AdminCard key={entry.id} className={dim ? "opacity-55" : ""}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => entry.image_url && setPreview(entry)}
                  className="relative h-[150px] w-[120px] shrink-0 overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]"
                  aria-label={entry.image_url ? "Open preview" : "No artwork yet"}
                >
                  {entry.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[11px] text-[var(--admin-text-muted)]">
                      no artwork
                    </span>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--admin-text)]">{label}</span>
                    <span className="text-[12px] text-[var(--admin-text-muted)]">{relative}</span>
                    <StatusPill status={entry.status} />
                    {entry.approved_at && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                        <Check size={12} /> approved
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[15px] font-medium text-[var(--admin-text)]">
                    {entry.occasion_name}
                  </p>

                  {entry.product_title && (
                    <p className="mt-0.5 truncate text-[12px] text-[var(--admin-text-muted)]">
                      featuring {entry.product_title}
                    </p>
                  )}

                  {entry.status === "ready" && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-[var(--admin-text-muted)]">
                      <Clock size={12} /> publishes automatically at 10:00
                    </p>
                  )}

                  {entry.error && (
                    <p className="mt-1 flex items-start gap-1 text-[12px] text-red-600">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {entry.error}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.status === "planned" && (
                      <AdminButton
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          act(() => generateOccasionArtwork(entry.id), "Artwork generated")
                        }
                      >
                        <Sparkles size={14} /> Generate artwork
                      </AdminButton>
                    )}

                    {(entry.status === "ready" || entry.status === "failed") && (
                      <AdminButton
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          act(() => regenerateOccasionArtwork(entry.id), "New artwork generated")
                        }
                      >
                        <RefreshCw size={14} /> Regenerate
                      </AdminButton>
                    )}

                    {entry.status === "ready" && !entry.approved_at && (
                      <AdminButton
                        variant="outline"
                        disabled={pending}
                        onClick={() => act(() => approveOccasionPost(entry.id), "Approved")}
                      >
                        <Check size={14} /> Looks good
                      </AdminButton>
                    )}

                    {entry.status === "cancelled" ? (
                      <AdminButton
                        variant="outline"
                        disabled={pending}
                        onClick={() => act(() => restoreOccasionPost(entry.id), "Restored")}
                      >
                        <RotateCcw size={14} /> Restore
                      </AdminButton>
                    ) : (
                      entry.status !== "published" && (
                        <AdminButton
                          variant="danger"
                          disabled={pending}
                          onClick={() =>
                            act(() => cancelOccasionPost(entry.id), "Cancelled — it will not publish")
                          }
                        >
                          <X size={14} /> Don&apos;t post this
                        </AdminButton>
                      )
                    )}
                  </div>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {preview && (
        <Modal onClose={() => setPreview(null)} title={preview.occasion_name} wide>
          <div className="grid gap-5 md:grid-cols-2">
            {preview.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.image_url}
                alt=""
                className="w-full rounded-md border border-[var(--admin-border)]"
              />
            )}
            <div className="space-y-4 text-[13px]">
              <div>
                <SectionHeading title="Instagram" />
                <pre className="whitespace-pre-wrap font-sans text-[12px] text-[var(--admin-text-muted)]">
                  {preview.caption_instagram ?? "—"}
                </pre>
              </div>
              <div>
                <SectionHeading title="Facebook" />
                <pre className="whitespace-pre-wrap font-sans text-[12px] text-[var(--admin-text-muted)]">
                  {preview.caption_facebook ?? "—"}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Which occasions to post">
          <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
            Only these are ever posted. Solemn, medical, political and tragic observances are
            blocked in code and cannot be added here.
          </p>
          <div className="space-y-2">
            {(data?.occasions ?? []).map((o) => (
              <div
                key={o.slug as string}
                className="flex items-center justify-between rounded-md border border-[var(--admin-border)] px-3 py-2"
              >
                <div>
                  <p className="text-[13px] text-[var(--admin-text)]">{o.name as string}</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">
                    {o.category as string} · {o.recurrence as string}
                  </p>
                </div>
                <Toggle
                  checked={o.enabled as boolean}
                  label={`Post for ${o.name as string}`}
                  onChange={(next) =>
                    act(
                      () => setOccasionEnabled(o.slug as string, next),
                      next ? `${o.name} switched on` : `${o.name} switched off`,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </Modal>
      )}

      <Toast message={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
