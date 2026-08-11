"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar, Send, ClipboardCheck, Check, X, AlertTriangle, Power, Loader2,
  ChevronLeft, ChevronRight, Share2, Users, Trash2, RotateCcw,
  Plus, GripVertical, Undo2, ExternalLink, Clock,
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
  fetchPlatforms, setPlatformEnabled, fetchCollaborators, addCollaborator,
  setCollaboratorEnabled, deleteCollaborator,
  fetchPostableCategories, saveQueueOrder, clearQueueOrder,
  deletePost, repostPost, restorePost,
  type SocialLogRow, type SocialSettingsRow,
  type SocialPlatformRow, type SocialCollaboratorRow,
} from "@/lib/actions/social";
import { MAX_ENABLED_COLLABORATORS } from "@/lib/social/limits";

type Tab = "schedule" | "platforms" | "collaborators" | "queue" | "history";

const TABS: { id: Tab; icon: typeof Calendar; label: string }[] = [
  { id: "schedule",      icon: Calendar,       label: "Schedule" },
  { id: "platforms",     icon: Share2,         label: "Platforms" },
  { id: "collaborators", icon: Users,          label: "Collaborators" },
  { id: "queue",         icon: ClipboardCheck, label: "Review queue" },
  { id: "history",       icon: Send,           label: "Posts" },
];

/**
 * AdminShell intentionally supplies no padding — every admin page owns its own gutter.
 * Same wrapper as /admin/products, /admin/orders, /admin/settings and the rest.
 */
const PAGE_PADDING = "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8";

const inputCls =
  "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-[15px] text-[var(--admin-text)] outline-none transition focus:border-[var(--admin-accent)]";

const POSTS_PER_PAGE = 10;

// ─── Shared bits ──────────────────────────────────────────────────────────────

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

/** Accessible on/off switch — used wherever a checkbox would look cheap. */
function Toggle({
  checked, onChange, disabled, label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-[var(--admin-accent)]" : "bg-slate-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Modal({
  title, onClose, children, footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--admin-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
          <h3 className="text-[16px] font-semibold text-[var(--admin-text)]">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Turns a run result into something the owner can act on.
 *
 * "Post now" used to report "Run triggered" no matter what happened, including when the
 * run was skipped — so a blocked run was indistinguishable from a successful one, and the
 * only way to find out was to read the server logs. Every outcome now says what happened
 * and, where it applies, what to change.
 */
function describeRun(result: unknown): string {
  const run = result as { action?: string; detail?: Record<string, unknown> } | null;
  const detail = (run?.detail ?? {}) as Record<string, unknown>;

  switch (run?.action) {
    case "queued_for_review":
      return "Queued for review — approve it in the Review queue tab to publish.";
    case "published":
      return "Published.";
    case "daily_cap_reached":
      return `Nothing posted — the hard daily ceiling of ${detail.cap} is already used up (${detail.today} today). Raise it on the Schedule tab to post again today.`;
    case "nothing_eligible":
      return "Nothing eligible to post. Check the category, stock and minimum-image filters — and note a product already awaiting review is not selected again.";
    case "no_slot_due":
      return "No posting slot is due right now.";
    case "slot_already_ran":
      return "That slot has already posted today.";
    case "skipped":
      return `Skipped — ${String(detail ?? "no reason given")}`;
    case "error":
      return `Run failed — ${String(detail ?? "unknown error")}`;
    default:
      return "Run triggered.";
  }
}

async function loadDashboard() {
  const [settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories] =
    await Promise.all([
      fetchSocialSettings(),
      fetchRotationStatus(),
      fetchUpNext(12),
      fetchReviewQueue(),
      fetchPostHistory(200),
      fetchConnectionStatus(),
      fetchPlatforms(),
      fetchCollaborators(),
      fetchPostableCategories(),
    ]);
  return { settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories };
}

export default function SocialAdminPage() {
  const [tab, setTab] = useState<Tab>("schedule");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const { data, error } = useQuery({ queryKey: ["social-admin"], queryFn: loadDashboard });

  function act(
    fn: () => Promise<unknown>,
    message?: string | ((result: unknown) => string),
  ) {
    startTransition(async () => {
      try {
        const result = await fn();
        await queryClient.invalidateQueries({ queryKey: ["social-admin"] });
        if (message) setNotice(typeof message === "function" ? message(result) : message);
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

  const { settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories } = data;
  const activeCollaborators = collaborators.filter((c) => c.enabled).length;

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
                onClick={() => act(() => triggerPostNow(), describeRun)}
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
              {settings.enabled ? <Pill tone="ok"><Check size={12} /> Running</Pill> : <Pill tone="muted">Paused</Pill>}
            </div>
          </AdminCard>

          <AdminCard padded>
            <p className="text-[13px] text-[var(--admin-text-muted)]">Rotation</p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--admin-text)]">
              {rotation ? `Cycle ${rotation.cycle} · ${rotation.postedThisCycle} of ${rotation.eligibleTotal}` : "—"}
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
        <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--admin-border)]">
          {TABS.map((t) => {
            const badge =
              t.id === "queue" ? queue.length
              : t.id === "collaborators" ? activeCollaborators
              : 0;
            return (
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
                {badge > 0 && (
                  <span className="rounded-full bg-[var(--admin-accent)] px-1.5 text-[11px] text-white">{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "schedule" && (
          <ScheduleTab
            key={settings.updated_at}
            settings={settings}
            upNext={upNext}
            categories={categories}
            pending={pending}
            onAct={act}
          />
        )}
        {tab === "platforms" && <PlatformsTab rows={platforms} pending={pending} onAct={act} />}
        {tab === "collaborators" && <CollaboratorsTab rows={collaborators} pending={pending} onAct={act} />}
        {tab === "queue" && <QueueTab rows={queue} pending={pending} onAct={act} />}
        {tab === "history" && <HistoryTab rows={history} platforms={platforms} pending={pending} onAct={act} />}
      </div>
    </AdminShell>
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

function ScheduleTab({
  settings, upNext, categories, pending, onAct,
}: {
  settings: SocialSettingsRow;
  upNext: Array<{ id: string; slug: string; title: string; images: string[] }>;
  categories: Array<{ slug: string; name: string; liveProducts: number }>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [draft, setDraft] = useState(settings);

  const set = <K extends keyof SocialSettingsRow>(key: K, value: SocialSettingsRow[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setSlot = (i: number, value: string) =>
    set("slot_times", draft.slot_times.map((s, idx) => (idx === i ? value : s)));

  const addSlot = () => set("slot_times", [...draft.slot_times, "13:00"]);
  const removeSlot = (i: number) => set("slot_times", draft.slot_times.filter((_, idx) => idx !== i));

  const toggleCategory = (slug: string) =>
    set(
      "categories",
      draft.categories.includes(slug)
        ? draft.categories.filter((c) => c !== slug)
        : [...draft.categories, slug],
    );

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <AdminCard padded>
          <h3 className="mb-1 text-[16px] font-semibold text-[var(--admin-text)]">Posting times</h3>
          <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
            One post per slot, in {draft.timezone}. Evening slots perform best for this audience.
          </p>

          <div className="space-y-2">
            {draft.slot_times.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-[var(--admin-text-muted)]" />
                <input
                  type="time"
                  value={slot}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className={`${inputCls} max-w-[160px]`}
                  aria-label={`Posting time ${i + 1}`}
                />
                {draft.slot_times.length > 1 && (
                  <button
                    onClick={() => removeSlot(i)}
                    aria-label={`Remove slot ${slot}`}
                    className="text-[var(--admin-text-muted)] transition hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addSlot}
            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--admin-accent)]"
          >
            <Plus size={15} /> Add another slot
          </button>

          <div className="mt-5 grid gap-4 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2">
            <Field label="Timezone">
              <input className={inputCls} value={draft.timezone} onChange={(e) => set("timezone", e.target.value)} />
            </Field>
            <Field label="Hard daily ceiling" hint="Safety net — a scheduler misfire cannot exceed this.">
              <input
                type="number" min={1} max={20} className={inputCls}
                value={draft.max_posts_per_day}
                onChange={(e) => set("max_posts_per_day", Number(e.target.value))}
              />
            </Field>
          </div>
        </AdminCard>

        <AdminCard padded>
          <h3 className="mb-1 text-[16px] font-semibold text-[var(--admin-text)]">Which products</h3>
          <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
            Live counts come straight from the catalogue. A category with no in-stock products contributes nothing.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((c) => {
              const on = draft.categories.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  onClick={() => toggleCategory(c.slug)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                    on
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                      : "border-[var(--admin-border)] hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        on ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white" : "border-slate-300"
                      }`}
                    >
                      {on && <Check size={11} />}
                    </span>
                    <span className="text-[14px] text-[var(--admin-text)]">{c.name}</span>
                  </span>
                  <span className="text-[12px] text-[var(--admin-text-muted)]">
                    {c.liveProducts} live
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2">
            <Field label="Products per post" hint="1 tells a clearer story than 2.">
              <input
                type="number" min={1} max={3} className={inputCls}
                value={draft.products_per_post}
                onChange={(e) => set("products_per_post", Number(e.target.value))}
              />
            </Field>
            <Field label="Minimum images" hint="Below 2, the post is a single image rather than a carousel.">
              <input
                type="number" min={1} max={10} className={inputCls}
                value={draft.min_images}
                onChange={(e) => set("min_images", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
              <Toggle
                checked={draft.require_in_stock}
                onChange={(v) => set("require_in_stock", v)}
                label="Only post in-stock products"
              />
              Only post products that are in stock
            </label>
            <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
              <Toggle
                checked={draft.approval_required}
                onChange={(v) => set("approval_required", v)}
                label="Hold posts for review"
              />
              Hold posts for review before publishing
            </label>
          </div>

          <div className="mt-5">
            <AdminButton loading={pending} onClick={() => onAct(() => saveSocialSettings(draft), "Schedule saved")}>
              Save schedule
            </AdminButton>
          </div>
        </AdminCard>
      </div>

      <UpNextCard items={upNext} pending={pending} onAct={onAct} />
    </div>
  );
}

/**
 * Drag-and-drop "Up next".
 *
 * Uses native HTML5 drag events rather than pulling in a library — the list is short and
 * the interaction is simple.
 *
 * Dropping **saves immediately**. It previously only reordered local state and waited for
 * a separate "Save order" click, which is a trap: the list visibly reordered, so the order
 * looked saved, but `social_queue_order` stayed empty and publishing silently fell back to
 * automatic rotation. A drag is an instruction, not a draft — so it persists on drop.
 *
 * Pins still clear themselves once a product posts, so an arrangement nudges the rest of
 * the current cycle rather than permanently reranking the catalogue.
 */
function UpNextCard({
  items, pending, onAct,
}: {
  items: Array<{ id: string; slug: string; title: string; images: string[] }>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const incomingIds = items.map((i) => i.id).join();
  const [syncedIds, setSyncedIds] = useState(incomingIds);

  /*
   * Adopt the server's list when it changes underneath us — a product posted, stock moved,
   * filters changed. Adjusting state during render (React's documented pattern) rather
   * than in an effect keeps the rows updating in place, with no page reload and no flash
   * of stale order. Skipped mid-drag or mid-save so the owner's arrangement is never
   * yanked out from under them.
   */
  if (!saving && dragIndex === null && incomingIds !== syncedIds) {
    setOrder(items);
    setSyncedIds(incomingIds);
  }

  function persist(next: typeof items) {
    setSaving(true);
    onAct(async () => {
      try {
        await saveQueueOrder(next.map((o) => o.id));
      } finally {
        setSaving(false);
      }
    }, "Order saved");
  }

  function onDrop(target: number) {
    if (dragIndex === null || dragIndex === target) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);
    // Optimistic: the row moves under the cursor straight away, then the write follows.
    setOrder(next);
    setDragIndex(null);
    setOverIndex(null);
    persist(next);
  }

  return (
    <AdminCard padded>
      <h3 className="mb-1 text-[16px] font-semibold text-[var(--admin-text)]">Up next</h3>
      <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
        Drag to reorder — saved automatically. Posts go out in exactly this order. Each
        product drops its place once it has posted, then automatic rotation resumes.
        {saving && <span className="ml-1.5 text-[var(--admin-accent)]">Saving…</span>}
      </p>

      {order.length === 0 ? (
        <p className="text-[14px] text-[var(--admin-text-muted)]">
          No eligible products. Check the category and stock filters.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {order.map((p, i) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
              onDragLeave={() => setOverIndex((v) => (v === i ? null : v))}
              onDrop={() => onDrop(i)}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
              className={`flex cursor-grab items-center gap-2.5 rounded-lg border p-1.5 transition active:cursor-grabbing ${
                overIndex === i && dragIndex !== i
                  ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                  : dragIndex === i
                    ? "border-slate-300 opacity-40"
                    : "border-transparent hover:border-[var(--admin-border)]"
              }`}
            >
              <GripVertical size={14} className="shrink-0 text-slate-400" />
              <span className="w-4 shrink-0 text-[12px] text-[var(--admin-text-muted)]">{i + 1}</span>
              {p.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt="" className="h-11 w-9 shrink-0 rounded object-cover" />
              )}
              <span className="line-clamp-2 text-[13px] text-[var(--admin-text)]">{p.title}</span>
            </li>
          ))}
        </ol>
      )}

      {order.length > 0 && (
        <button
          onClick={() => onAct(() => clearQueueOrder(), "Back to automatic rotation")}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
        >
          <Undo2 size={14} /> Clear manual order
        </button>
      )}
    </AdminCard>
  );
}

// ─── Platforms ────────────────────────────────────────────────────────────────

function PlatformsTab({
  rows, pending, onAct,
}: {
  rows: SocialPlatformRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  return (
    <div className="space-y-3">
      <AdminCard padded>
        <p className="text-[13px] text-[var(--admin-text-muted)]">
          Every account the brand has. A platform can only be switched on once it has a working
          adapter — the rest are listed so the roadmap is visible, not hidden.
        </p>
      </AdminCard>

      {rows.map((p) => (
        <AdminCard key={p.key} padded>
          <div className="flex items-start gap-4">
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                p.enabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : p.supported
                    ? "border-[var(--admin-border)] bg-slate-50 text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-300"
              }`}
            >
              <PlatformIcon platform={p.key} size={19} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold text-[var(--admin-text)]">{p.name}</h4>
                {p.enabled && <Pill tone="ok"><Check size={11} /> Posting</Pill>}
                {!p.supported && <Pill tone="muted">Not built yet</Pill>}
                {p.supported && !p.enabled && <Pill tone="warn">Off</Pill>}
              </div>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--admin-text-muted)]">{p.description}</p>

              {p.handle && (
                <p className="mt-1.5 text-[12px] text-[var(--admin-text-muted)]">
                  {p.profile_url ? (
                    <a
                      href={p.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--admin-accent)]"
                    >
                      {p.handle} <ExternalLink size={11} />
                    </a>
                  ) : (
                    p.handle
                  )}
                </p>
              )}
            </div>

            <div className="shrink-0 pt-1">
              <Toggle
                checked={p.enabled}
                disabled={!p.supported || pending}
                label={`Post to ${p.name}`}
                onChange={(v) =>
                  onAct(() => setPlatformEnabled(p.key, v), `${p.name} ${v ? "enabled" : "disabled"}`)
                }
              />
            </div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}

// ─── Collaborators ────────────────────────────────────────────────────────────

function CollaboratorsTab({
  rows, pending, onAct,
}: {
  rows: SocialCollaboratorRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-4">
      <AdminCard padded>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h3 className="text-[16px] font-semibold text-[var(--admin-text)]">Instagram co-authors</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--admin-text-muted)]">
              A tagged account receives an invite; once accepted, the post appears on their profile
              too and both profiles share one engagement count. Instagram allows{" "}
              <strong>{MAX_ENABLED_COLLABORATORS} per post</strong> — keep as many accounts on file
              as you like and switch between them.
            </p>
          </div>
          <AdminButton size="sm" leadingIcon={<Plus size={15} />} onClick={() => setAdding(true)}>
            Add collaborator
          </AdminButton>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle size={15} className="shrink-0 text-amber-700" />
          <p className="text-[13px] text-amber-800">
            The account must have collaborator tagging enabled (Instagram → Settings → Tags and
            mentions), otherwise Meta drops the invite without an error.
          </p>
        </div>
      </AdminCard>

      {rows.length === 0 ? (
        <AdminCard padded>
          <p className="text-[14px] text-[var(--admin-text-muted)]">No collaborators yet.</p>
        </AdminCard>
      ) : (
        rows.map((c) => (
          <AdminCard key={c.id} padded>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-slate-50 text-slate-500">
                <PlatformIcon platform={c.platform} size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.instagram.com/${c.username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-[var(--admin-text)] hover:underline"
                  >
                    @{c.username}
                  </a>
                  {c.enabled ? <Pill tone="ok"><Check size={11} /> On every post</Pill> : <Pill tone="muted">Off</Pill>}
                </div>
                {c.display_name && (
                  <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">{c.display_name}</p>
                )}
                {c.notes && <p className="mt-0.5 text-[12px] text-[var(--admin-text-muted)]">{c.notes}</p>}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Toggle
                  checked={c.enabled}
                  disabled={pending || (!c.enabled && enabledCount >= MAX_ENABLED_COLLABORATORS)}
                  label={`Tag @${c.username} on new posts`}
                  onChange={(v) =>
                    onAct(
                      () => setCollaboratorEnabled(c.id, v),
                      v ? `@${c.username} will be tagged` : `@${c.username} turned off`,
                    )
                  }
                />
                <button
                  onClick={() => onAct(() => deleteCollaborator(c.id), `@${c.username} removed`)}
                  disabled={pending}
                  aria-label={`Remove @${c.username}`}
                  className="text-[var(--admin-text-muted)] transition hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </AdminCard>
        ))
      )}

      {adding && (
        <Modal
          title="Add collaborator"
          onClose={() => setAdding(false)}
          footer={
            <>
              <AdminButton variant="ghost" onClick={() => setAdding(false)}>Cancel</AdminButton>
              <AdminButton
                loading={pending}
                disabled={!username.trim()}
                onClick={() =>
                  onAct(async () => {
                    await addCollaborator({ username, displayName });
                    setAdding(false);
                    setUsername("");
                    setDisplayName("");
                  }, "Collaborator added — switch it on to start tagging")
                }
              >
                Add
              </AdminButton>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Instagram username" hint="A profile URL or @handle works too.">
              <input
                className={inputCls}
                placeholder="ummehabiba989"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Label" hint="Only for your reference — never shown publicly.">
              <input
                className={inputCls}
                placeholder="Personal account"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Field>
            <p className="text-[13px] text-[var(--admin-text-muted)]">
              New collaborators start switched off, so adding one never changes the next post by surprise.
            </p>
          </div>
        </Modal>
      )}
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
      {rows.map((row) => <QueueItem key={row.id} row={row} pending={pending} onAct={onAct} />)}
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
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--admin-border)] bg-slate-50 text-slate-600">
            <PlatformIcon platform={row.platform} size={14} />
          </span>
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
            <AdminButton size="sm" variant="ghost" loading={pending} leadingIcon={<X size={15} />}
              onClick={() => onAct(() => skipQueuedPost(row.id), "Skipped")}>
              Skip
            </AdminButton>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────

type PostGroup = {
  groupId: string;
  title: string;
  thumbnail: string | null;
  when: string;
  rows: SocialLogRow[];
  archived: boolean;
};

function groupPosts(rows: SocialLogRow[]): PostGroup[] {
  const map = new Map<string, SocialLogRow[]>();
  for (const row of rows) {
    const key = row.group_id ?? row.id;
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
        title: newest.product_title ?? "—",
        thumbnail: newest.image_urls?.[0] ?? null,
        when: newest.posted_at ?? newest.created_at,
        rows: group,
        archived: group.every((r) => r.status === "archived"),
      };
    })
    .sort((a, b) => Date.parse(b.when) - Date.parse(a.when));
}

function PlatformLink({
  row, pending, onAct,
}: {
  row: SocialLogRow;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const label = platformLabel(row.platform);
  const base = "inline-flex h-8 w-8 items-center justify-center rounded-full border transition";

  if (row.status === "posted" && row.permalink) {
    return (
      <a
        href={row.permalink} target="_blank" rel="noopener noreferrer"
        title={`View on ${label}`} aria-label={`View on ${label}`}
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
        title={`${label} failed — click to retry. ${row.error_message ?? ""}`.trim()}
        aria-label={`Retry ${label}`}
        className={`${base} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <PlatformIcon platform={row.platform} size={15} />}
      </button>
    );
  }

  return (
    <span
      title={`${label} — ${row.status}`} aria-label={`${label} ${row.status}`}
      className={`${base} border-slate-200 bg-slate-50 text-slate-400`}
    >
      <PlatformIcon platform={row.platform} size={15} />
    </span>
  );
}

function HistoryTab({
  rows, platforms, pending, onAct,
}: {
  rows: SocialLogRow[];
  platforms: SocialPlatformRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<PostGroup | null>(null);

  const groups = groupPosts(rows);
  const pageCount = Math.max(1, Math.ceil(groups.length / POSTS_PER_PAGE));
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
    <>
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-[var(--admin-border)] text-[13px] text-[var(--admin-text-muted)]">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Published to</th>
                <th className="px-4 py-3">When</th>
                <th className="w-24 px-4 py-3 text-right">Actions</th>
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
                          <img src={group.thumbnail} alt=""
                            className={`h-12 w-10 shrink-0 rounded object-cover ${group.archived ? "opacity-40" : ""}`} />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[var(--admin-text)]">{group.title}</p>
                          {group.archived && <span className="mt-0.5 inline-block"><Pill tone="muted">Archived</Pill></span>}
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
                          .map((row) => <PlatformLink key={row.id} row={row} pending={pending} onAct={onAct} />)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--admin-text-muted)]">
                      {new Date(group.when).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {group.archived ? (
                          <button
                            onClick={() => onAct(() => restorePost(group.groupId), "Restored to review queue")}
                            disabled={pending}
                            title="Restore to review queue"
                            aria-label="Restore post"
                            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
                          >
                            <Undo2 size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                onAct(() => repostPost(group.groupId), "Reposted with a fresh caption")
                              }
                              disabled={pending}
                              title="Repost with a freshly generated caption (Instagram captions cannot be edited in place)"
                              aria-label="Repost with fresh caption"
                              className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={() => setDeleting(group)}
                              disabled={pending}
                              title="Delete from platforms"
                              aria-label="Delete post"
                              className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
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
              {current * POSTS_PER_PAGE + 1}–{current * POSTS_PER_PAGE + visible.length} of {groups.length} posts
            </p>
            <div className="flex items-center gap-2">
              <AdminButton size="sm" variant="outline" disabled={current === 0}
                onClick={() => setPage(current - 1)} leadingIcon={<ChevronLeft size={15} />}>
                Previous
              </AdminButton>
              <span className="text-[13px] text-[var(--admin-text-muted)]">{current + 1} / {pageCount}</span>
              <AdminButton size="sm" variant="outline" disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)} trailingIcon={<ChevronRight size={15} />}>
                Next
              </AdminButton>
            </div>
          </div>
        )}
      </AdminCard>

      {deleting && (
        <DeleteModal
          group={deleting}
          platforms={platforms}
          pending={pending}
          onClose={() => setDeleting(null)}
          onAct={onAct}
        />
      )}
    </>
  );
}

/**
 * Per-platform delete.
 *
 * A post can be wrong on one platform and fine on another, so the owner picks where it is
 * removed rather than losing everything. The row is archived rather than destroyed, so it
 * stays restorable.
 */
function DeleteModal({
  group, platforms, pending, onClose, onAct,
}: {
  group: PostGroup;
  platforms: SocialPlatformRow[];
  pending: boolean;
  onClose: () => void;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const published = group.rows.filter((r) => r.status === "posted" || r.status === "failed");
  const [selected, setSelected] = useState<string[]>(published.map((r) => r.platform));

  const toggle = (platform: string) =>
    setSelected((s) => (s.includes(platform) ? s.filter((p) => p !== platform) : [...s, platform]));

  const nameFor = (key: string) => platforms.find((p) => p.key === key)?.name ?? platformLabel(key);

  return (
    <Modal
      title="Delete post"
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            variant="danger"
            loading={pending}
            disabled={selected.length === 0}
            leadingIcon={<Trash2 size={15} />}
            onClick={() =>
              onAct(async () => {
                await deletePost(group.groupId, selected);
                onClose();
              }, `Removed from ${selected.map(nameFor).join(", ")}`)
            }
          >
            Delete from {selected.length} {selected.length === 1 ? "platform" : "platforms"}
          </AdminButton>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-[var(--admin-text)]">{group.title}</p>

      <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text)]">Remove from</p>
      <div className="space-y-2">
        {published.map((row) => {
          const on = selected.includes(row.platform);
          return (
            <button
              key={row.id}
              onClick={() => toggle(row.platform)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                on ? "border-red-300 bg-red-50" : "border-[var(--admin-border)] hover:border-slate-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  on ? "border-red-500 bg-red-500 text-white" : "border-slate-300"
                }`}
              >
                {on && <Check size={11} />}
              </span>
              <PlatformIcon platform={row.platform} size={16} />
              <span className="flex-1 text-[14px] text-[var(--admin-text)]">{nameFor(row.platform)}</span>
              {row.status === "failed" && <Pill tone="bad">failed</Pill>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-700" />
        <p className="text-[13px] text-amber-800">
          The live post is deleted permanently and its likes, comments and saves are lost. The
          record is <strong>archived, not destroyed</strong> — you can restore it to the review
          queue and publish it again later.
        </p>
      </div>
    </Modal>
  );
}
