"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar, Send, ClipboardCheck, Check, X, AlertTriangle,
  Power, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PlatformIcon, platformLabel } from "@/components/admin/platform-icons";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import {
  fetchSocialSettings, saveSocialSettings, fetchRotationStatus, fetchUpNext,
  fetchPostHistory, fetchReviewQueue, approveAndPublish, skipQueuedPost,
  updateQueuedCaption, retryFailedPost, triggerPostNow, fetchConnectionStatus,
  type SocialLogRow, type SocialSettingsRow,
} from "@/lib/actions/social";

type Tab = "schedule" | "queue" | "history";

const TABS: { id: Tab; icon: typeof Calendar; label: string }[] = [
  { id: "schedule", icon: Calendar,       label: "Schedule" },
  { id: "queue",    icon: ClipboardCheck, label: "Review queue" },
  { id: "history",  icon: Send,           label: "Posts" },
];

/**
 * AdminShell intentionally supplies no padding — every admin page owns its own gutter.
 * This is the same wrapper used by /admin/products, /admin/orders, /admin/customers,
 * /admin/settings and /admin/categories, so this page lines up with all of them.
 */
const PAGE_PADDING = "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8";

const inputCls =
  "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  );
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  const cls = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    bad: "bg-red-50 text-red-700 border-red-200",
    muted: "bg-slate-50 text-slate-600 border-slate-200",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

/** Everything the page needs, fetched together so the tabs never show mismatched state. */
async function loadDashboard() {
  const [settings, rotation, upNext, queue, history, connection] = await Promise.all([
    fetchSocialSettings(),
    fetchRotationStatus(),
    fetchUpNext(5),
    fetchReviewQueue(),
    fetchPostHistory(50),
    fetchConnectionStatus(),
  ]);
  return { settings, rotation, upNext, queue, history, connection };
}

export default function SocialAdminPage() {
  const [tab, setTab] = useState<Tab>("schedule");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const { data, error } = useQuery({
    queryKey: ["social-admin"],
    queryFn: loadDashboard,
  });

  function act(fn: () => Promise<unknown>, message?: string) {
    startTransition(async () => {
      try {
        await fn();
        await queryClient.invalidateQueries({ queryKey: ["social-admin"] });
        if (message) setNotice(message);
      } catch (e) {
        setNotice((e as Error).message);
      }
    });
  }

  if (error) {
    return (
      <AdminShell>
        <div className={PAGE_PADDING}>
          <PageHeader title="Social automation" />
          <AdminCard padded className="border-red-200 bg-red-50">
            <p className="text-[14px] text-red-800">{(error as Error).message}</p>
          </AdminCard>
        </div>
      </AdminShell>
    );
  }

  if (!data) {
    return (
      <AdminShell>
        <div className={PAGE_PADDING}>
          <PageHeader title="Social automation" subtitle="Loading…" />
        </div>
      </AdminShell>
    );
  }

  const { settings, rotation, upNext, queue, history, connection } = data;

  return (
    <AdminShell>
      <div className={PAGE_PADDING}>
        <PageHeader
          title="Social automation"
          subtitle="Automatic product posts to Facebook and Instagram"
          actions={
            <div className="flex items-center gap-2">
              <AdminButton
                variant={settings.enabled ? "danger" : "primary"}
                leadingIcon={<Power size={16} />}
                loading={pending}
                onClick={() =>
                  act(
                    () => saveSocialSettings({ enabled: !settings.enabled }),
                    settings.enabled ? "Automation paused" : "Automation enabled",
                  )
                }
              >
                {settings.enabled ? "Pause automation" : "Enable automation"}
              </AdminButton>
              <AdminButton
                variant="outline"
                leadingIcon={<Send size={16} />}
                loading={pending}
                onClick={() => act(() => triggerPostNow(), "Run triggered")}
              >
                Post now
              </AdminButton>
            </div>
          }
        />

        {/* ── Status strip ─────────────────────────────────────────────────── */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard padded>
            <p className="text-[13px] text-[var(--admin-text-muted)]">Status</p>
            <div className="mt-1">
              {settings.enabled
                ? <Pill tone="ok"><Check size={12} /> Running</Pill>
                : <Pill tone="muted">Paused</Pill>}
            </div>
          </AdminCard>

          <AdminCard padded>
            <p className="text-[13px] text-[var(--admin-text-muted)]">Rotation</p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--admin-text)]">
              {rotation
                ? `Cycle ${rotation.cycle} · ${rotation.postedThisCycle} of ${rotation.eligibleTotal}`
                : "—"}
            </p>
          </AdminCard>

          <AdminCard padded>
            <p className="text-[13px] text-[var(--admin-text-muted)]">Awaiting review</p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--admin-text)]">{queue.length}</p>
          </AdminCard>

          <AdminCard padded>
            <p className="text-[13px] text-[var(--admin-text-muted)]">Meta connection</p>
            <div className="mt-1">
              {!connection ? <Pill tone="muted">Checking…</Pill>
                : !connection.configured ? <Pill tone="bad"><AlertTriangle size={12} /> Not configured</Pill>
                : connection.error ? <Pill tone="warn"><AlertTriangle size={12} /> Token error</Pill>
                : <Pill tone="ok"><Check size={12} /> {connection.quota?.used ?? 0}/{connection.quota?.total ?? "—"} today</Pill>}
            </div>
          </AdminCard>
        </div>

        {connection && !connection.configured && (
          <AdminCard padded className="mb-5 border-red-200 bg-red-50">
            <p className="text-[14px] font-semibold text-red-800">Meta credentials missing</p>
            <p className="mt-1 text-[13px] text-red-700">
              Set {connection.missing.join(", ")} in the environment. Nothing will publish until then.
            </p>
          </AdminCard>
        )}
        {connection?.error && (
          <AdminCard padded className="mb-5 border-amber-200 bg-amber-50">
            <p className="text-[14px] font-semibold text-amber-900">Meta API returned an error</p>
            <p className="mt-1 break-words text-[13px] text-amber-800">{connection.error}</p>
          </AdminCard>
        )}
        {notice && (
          <AdminCard padded className="mb-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] text-[var(--admin-text)]">{notice}</p>
              <button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={16} /></button>
            </div>
          </AdminCard>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="mb-4 flex gap-1 border-b border-[var(--admin-border)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium transition ${
                tab === t.id
                  ? "border-b-2 border-[var(--admin-accent)] text-[var(--admin-text)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.id === "queue" && queue.length > 0 && (
                <span className="rounded-full bg-[var(--admin-accent)] px-1.5 text-[11px] text-white">
                  {queue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "schedule" && (
          // Keyed on updated_at so a saved change remounts the form with fresh defaults,
          // rather than syncing server state into local state inside an effect.
          <ScheduleTab
            key={settings.updated_at}
            settings={settings}
            upNext={upNext}
            pending={pending}
            onSave={act}
          />
        )}
        {tab === "queue" && <QueueTab rows={queue} pending={pending} onAct={act} />}
        {tab === "history" && <HistoryTab rows={history} pending={pending} onAct={act} />}
        </div>
      </AdminShell>
    );
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────────

    function ScheduleTab({
    settings, upNext, pending, onSave,
    }: {
    settings: SocialSettingsRow;
    upNext: Array<{ id: string; slug: string; title: string; images: string[] }>;
    pending: boolean;
    onSave: (fn: () => Promise<unknown>, message?: string) => void;
    }) {
    // Initial state only — the parent remounts this component via `key` when the saved
    // settings change, so there is no prop-to-state sync to keep in an effect.
    const [draft, setDraft] = useState(settings);

    const set = <K extends keyof SocialSettingsRow>(key: K, value: SocialSettingsRow[K]) =>
      setDraft((d) => ({ ...d, [key]: value }));

    return (
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminCard padded className="lg:col-span-2">
          <h3 className="mb-4 text-[16px] font-semibold text-[var(--admin-text)]">Cadence</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Posting times" hint="Local times, comma separated. One post per slot.">
              <input
                className={inputCls}
                value={draft.slot_times.join(", ")}
                onChange={(e) =>
                  set("slot_times", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                }
              />
            </Field>
            <Field label="Timezone">
              <input className={inputCls} value={draft.timezone}
                     onChange={(e) => set("timezone", e.target.value)} />
            </Field>
            <Field label="Products per post" hint="1 tells a clearer story than 2.">
              <input type="number" min={1} max={3} className={inputCls} value={draft.products_per_post}
                     onChange={(e) => set("products_per_post", Number(e.target.value))} />
            </Field>
            <Field label="Hard daily ceiling" hint="Safety net — a scheduler misfire cannot exceed this.">
              <input type="number" min={1} max={20} className={inputCls} value={draft.max_posts_per_day}
                     onChange={(e) => set("max_posts_per_day", Number(e.target.value))} />
            </Field>
            <Field label="Categories" hint="Comma separated product categories.">
              <input className={inputCls} value={draft.categories.join(", ")}
                     onChange={(e) =>
                       set("categories", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="Minimum images" hint="Below 2, the post is a single image rather than a carousel.">
              <input type="number" min={1} max={10} className={inputCls} value={draft.min_images}
                     onChange={(e) => set("min_images", Number(e.target.value))} />
            </Field>
          </div>

          <div className="mt-5 space-y-3 border-t border-[var(--admin-border)] pt-4">
            <label className="flex items-center gap-2 text-[14px] text-[var(--admin-text)]">
              <input type="checkbox" checked={draft.require_in_stock}
                     onChange={(e) => set("require_in_stock", e.target.checked)} />
              Only post products that are in stock
            </label>
            <label className="flex items-center gap-2 text-[14px] text-[var(--admin-text)]">
              <input type="checkbox" checked={draft.approval_required}
                     onChange={(e) => set("approval_required", e.target.checked)} />
              Hold posts for review before publishing
            </label>
            <div className="flex flex-wrap gap-4">
              {(["instagram", "facebook"] as const).map((p) => (
                <label key={p} className="flex items-center gap-2 text-[14px] text-[var(--admin-text)]">
                  <input
                    type="checkbox"
                    checked={draft.platforms.includes(p)}
                    onChange={(e) =>
                      set("platforms", e.target.checked
                        ? [...draft.platforms, p]
                        : draft.platforms.filter((x) => x !== p))}
                  />
                  Post to {p === "instagram" ? "Instagram" : "Facebook"}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <AdminButton loading={pending}
                         onClick={() => onSave(() => saveSocialSettings(draft), "Schedule saved")}>
              Save schedule
            </AdminButton>
          </div>
        </AdminCard>

        <AdminCard padded>
          <h3 className="mb-3 text-[16px] font-semibold text-[var(--admin-text)]">Up next</h3>
          {upNext.length === 0 ? (
            <p className="text-[14px] text-[var(--admin-text-muted)]">
              No eligible products. Check the category and stock filters.
            </p>
          ) : (
            <ol className="space-y-3">
              {upNext.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="text-[13px] text-[var(--admin-text-muted)]">{i + 1}</span>
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="h-11 w-9 rounded object-cover" />
                  )}
                  <span className="line-clamp-2 text-[13px] text-[var(--admin-text)]">{p.title}</span>
                </li>
              ))}
            </ol>
          )}
        </AdminCard>
      </div>
    );
    }

    // ─── Review queue ─────────────────────────────────────────────────────────────

    function QueueTab({
    rows, pending, onAct,
    }: {
    rows: SocialLogRow[];
    pending: boolean;
    onAct: (fn: () => Promise<unknown>, message?: string) => void;
    }) {
    if (rows.length === 0) {
      return (
        <AdminCard padded>
          <p className="text-[14px] text-[var(--admin-text-muted)]">
            Nothing waiting for review. Queued posts appear here when a slot fires.
          </p>
        </AdminCard>
      );
    }

    return (
      <div className="space-y-4">
        {rows.map((row) => (
          <QueueItem key={row.id} row={row} pending={pending} onAct={onAct} />
        ))}
      </div>
    );
    }

    function QueueItem({
    row, pending, onAct,
    }: {
    row: SocialLogRow;
    pending: boolean;
    onAct: (fn: () => Promise<unknown>, message?: string) => void;
    }) {
    const [caption, setCaption] = useState(row.caption ?? "");
    const dirty = caption !== (row.caption ?? "");

    return (
      <AdminCard padded>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pill tone="muted">{row.platform}</Pill>
            <span className="text-[14px] font-semibold text-[var(--admin-text)]">{row.product_title}</span>
          </div>
          <span className="text-[12px] text-[var(--admin-text-muted)]">{caption.length} / 2200</span>
        </div>

        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <div className="flex gap-2">
            {(row.image_urls ?? []).slice(0, 3).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-32 w-[102px] rounded object-cover" />
            ))}
          </div>
          <div>
            <textarea
              className={`${inputCls} min-h-[160px] font-mono text-[13px]`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton
                size="sm"
                loading={pending}
                leadingIcon={<Check size={15} />}
                onClick={() =>
                  onAct(async () => {
                    if (dirty) await updateQueuedCaption(row.id, caption);
                    return approveAndPublish(row.id);
                  }, "Published")
                }
              >
                Approve &amp; publish
              </AdminButton>
              {dirty && (
                <AdminButton size="sm" variant="outline" loading={pending}
                             onClick={() => onAct(() => updateQueuedCaption(row.id, caption), "Caption saved")}>
                  Save edit
                </AdminButton>
              )}
              <AdminButton size="sm" variant="ghost" loading={pending}
                           leadingIcon={<X size={15} />}
                           onClick={() => onAct(() => skipQueuedPost(row.id), "Skipped")}>
                Skip
              </AdminButton>
            </div>
          </div>
        </div>
      </AdminCard>
    );
    }

// ─── History ─────────────────────────────────────────────────────────────

/**
 * One post fans out across several platforms, so history groups by `group_id` and renders
 * a single row per post with one icon per platform. Each icon links to that platform's own
 * permalink. Adding YouTube, WhatsApp or TikTok later is one entry in the icon registry —
 * see components/admin/platform-icons.tsx.
 */
const POSTS_PER_PAGE = 10;

type PostGroup = {
  groupId: string;
  title: string;
  thumbnail: string | null;
  when: string;
  rows: SocialLogRow[];
};

function groupPosts(rows: SocialLogRow[]): PostGroup[] {
  const map = new Map<string, SocialLogRow[]>();
  for (const row of rows) {
    const key = row.group_id ?? row.id; // rows predating group_id stand alone
    const existing = map.get(key);
    if (existing) existing.push(row);
    else map.set(key, [row]);
  }

  return [...map.entries()]
    .map(([groupId, group]) => {
      const newest = group.reduce((a, b) =>
        Date.parse(b.posted_at ?? b.created_at) > Date.parse(a.posted_at ?? a.created_at) ? b : a,
      );
      return {
        groupId,
        title: newest.product_title ?? "\u2014",
        thumbnail: newest.image_urls?.[0] ?? null,
        when: newest.posted_at ?? newest.created_at,
        rows: group,
      };
    })
    .sort((a, b) => Date.parse(b.when) - Date.parse(a.when));
}

/** One platform icon, coloured by outcome and linked to that platform's own post. */
function PlatformLink({
  row,
  pending,
  onAct,
}: {
  row: SocialLogRow;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const label = platformLabel(row.platform);
  const base =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border transition";

  if (row.status === "posted" && row.permalink) {
    return (
      <a
        href={row.permalink}
        target="_blank"
        rel="noopener noreferrer"
        title={`View on ${label}`}
        aria-label={`View on ${label}`}
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
      >
        <PlatformIcon platform={row.platform} size={15} />
      </a>
    );
  }

  if (row.status === "failed") {
    return (
      <button
        onClick={() => onAct(() => retryFailedPost(row.id), `Retried ${label}`)}
        disabled={pending}
        title={`${label} failed \u2014 click to retry. ${row.error_message ?? ""}`.trim()}
        aria-label={`Retry ${label}`}
        className={`${base} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <PlatformIcon platform={row.platform} size={15} />}
      </button>
    );
  }

  return (
    <span
      title={`${label} \u2014 ${row.status}`}
      aria-label={`${label} ${row.status}`}
      className={`${base} border-slate-200 bg-slate-50 text-slate-400`}
    >
      <PlatformIcon platform={row.platform} size={15} />
    </span>
  );
}

function HistoryTab({
  rows,
  pending,
  onAct,
}: {
  rows: SocialLogRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [page, setPage] = useState(0);

  const groups = groupPosts(rows);
  const pageCount = Math.max(1, Math.ceil(groups.length / POSTS_PER_PAGE));
  // Clamped rather than reset, so deleting the last item on page 3 lands on page 2
  // instead of jumping back to the top.
  const current = Math.min(page, pageCount - 1);
  const visible = groups.slice(current * POSTS_PER_PAGE, current * POSTS_PER_PAGE + POSTS_PER_PAGE);

  if (groups.length === 0) {
    return (
      <AdminCard padded>
        <p className="text-[14px] text-[var(--admin-text-muted)]">No posts yet.</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-[var(--admin-border)] text-[13px] text-[var(--admin-text-muted)]">
            <tr>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Published to</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((group) => {
              const errors = group.rows.filter((r) => r.error_message);
              return (
                <tr key={group.groupId} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {group.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={group.thumbnail}
                          alt=""
                          className="h-12 w-10 shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[var(--admin-text)]">{group.title}</p>
                        {errors.map((r) => (
                          <p key={r.id} className="mt-0.5 text-[12px] text-red-600">
                            {r.platform}: {r.error_message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {group.rows
                        .slice()
                        .sort((a, b) => a.platform.localeCompare(b.platform))
                        .map((row) => (
                          <PlatformLink key={row.id} row={row} pending={pending} onAct={onAct} />
                        ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--admin-text-muted)]">
                    {new Date(group.when).toLocaleString("en-GB")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] px-4 py-3">
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            {current * POSTS_PER_PAGE + 1}\u2013{current * POSTS_PER_PAGE + visible.length} of{" "}
            {groups.length} posts
          </p>
          <div className="flex items-center gap-2">
            <AdminButton
              size="sm"
              variant="outline"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              leadingIcon={<ChevronLeft size={15} />}
            >
              Previous
            </AdminButton>
            <span className="text-[13px] text-[var(--admin-text-muted)]">
              {current + 1} / {pageCount}
            </span>
            <AdminButton
              size="sm"
              variant="outline"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
              trailingIcon={<ChevronRight size={15} />}
            >
              Next
            </AdminButton>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
