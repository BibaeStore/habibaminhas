"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar, Send, ClipboardCheck, Check, X, AlertTriangle, Power, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, Share2, Users, Trash2, RotateCcw,
  Plus, GripVertical, Undo2, ExternalLink, Clock, Clapperboard, Upload, RefreshCw,
} from "lucide-react";
import { PlatformIcon, platformLabel, platformBrand } from "@/components/admin/platform-icons";
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
  fetchReels, fetchReelUpNext, fetchReelProductTitles,
  approveReel, discardReel, restoreReel, generateReel, rebuildReel,
  approveAndPublishReel, publishReelNow,
  updateReelCaption, uploadOwnReel, saveReelQueueOrder, clearReelQueueOrder,
  fetchReelRotation, canGenerateReels,
  type SocialLogRow, type SocialSettingsRow, type SocialReelRow,
  type SocialPlatformRow, type SocialCollaboratorRow,
} from "@/lib/actions/social";
import { MAX_ENABLED_COLLABORATORS } from "@/lib/social/limits";

type Tab = "schedule" | "platforms" | "collaborators" | "queue" | "reels" | "history";

const TABS: { id: Tab; icon: typeof Calendar; label: string }[] = [
  { id: "schedule",      icon: Calendar,       label: "Schedule" },
  { id: "platforms",     icon: Share2,         label: "Platforms" },
  { id: "collaborators", icon: Users,          label: "Collaborators" },
  { id: "queue",         icon: ClipboardCheck, label: "Review queue" },
  { id: "reels",         icon: Clapperboard,   label: "Reels" },
  { id: "history",       icon: Send,           label: "Posts" },
];

/**
 * AdminShell intentionally supplies no padding — every admin page owns its own gutter.
 * Same wrapper as /admin/products, /admin/orders, /admin/settings and the rest.
 */
const PAGE_PADDING = "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8";

/**
 * Inputs carry a visible border at rest and a ring on focus. The old single-pixel
 * `--admin-border` on the cream background was close to invisible, so a text field and a
 * plain label looked the same until you clicked one.
 */
const inputCls =
  "w-full rounded-lg border-2 border-slate-300 bg-[var(--admin-bg)] px-3 py-2 text-[15px] text-[var(--admin-text)] outline-none transition hover:border-slate-400 focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/25";

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
  // Text at -800 and borders at -300: the previous -700 on -50 with a -200 border sat close
  // to the 4.5:1 floor and read as washed out on the cream admin background.
  const cls = {
    ok: "bg-emerald-50 text-emerald-800 border-emerald-300",
    warn: "bg-amber-50 text-amber-900 border-amber-300",
    bad: "bg-red-50 text-red-800 border-red-300",
    muted: "bg-slate-100 text-slate-700 border-slate-300",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

/**
 * The one checkbox visual, used everywhere a tick is shown.
 *
 * A 2px slate-500 border when unchecked, rather than the old 1px slate-300 which
 * disappeared into the cream background — the reported "I can't tell if I selected it".
 * Checked is a solid accent fill with a heavy white tick, so the two states differ in
 * fill, border *and* glyph rather than by shade alone.
 */
function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition ${
        on
          ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
          : "border-slate-500 bg-white"
      }`}
    >
      {on && <Check size={13} strokeWidth={3.5} />}
    </span>
  );
}

/**
 * Multi-select dropdown for post categories.
 *
 * Replaces a grid of inline cards that pushed the rest of the schedule down the page and
 * whose selected state was hard to read. Closed, it states the selection in words; open,
 * it is a single scannable column with live in-stock counts.
 */
function CategoryPicker({
  categories, selected, onToggle,
}: {
  categories: Array<{ slug: string; name: string; liveProducts: number }>;
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const chosen = categories.filter((c) => selected.includes(c.slug));
  const totalLive = chosen.reduce((sum, c) => sum + c.liveProducts, 0);

  const summary =
    chosen.length === 0
      ? "No categories selected — nothing will post"
      : chosen.length === 1
        ? chosen[0].name
        : `${chosen[0].name} + ${chosen.length - 1} more`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 bg-[var(--admin-bg)] px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/40 ${
          chosen.length === 0
            ? "border-red-400 hover:border-red-500"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-[15px] ${
              chosen.length === 0 ? "text-red-700" : "text-[var(--admin-text)]"
            }`}
          >
            {summary}
          </span>
          {chosen.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[12px] font-semibold text-slate-700">
              {totalLive} live
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-600 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Click-away layer. Sits under the menu but over everything else. */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" />
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border-2 border-slate-300 bg-[var(--admin-bg)] py-1 shadow-xl"
          >
            {categories.map((c) => {
              const on = selected.includes(c.slug);
              return (
                <li key={c.slug} role="option" aria-selected={on}>
                  <button
                    type="button"
                    onClick={() => onToggle(c.slug)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-100 ${
                      on ? "bg-[var(--admin-accent)]/8" : ""
                    }`}
                  >
                    <CheckBox on={on} />
                    <span className="flex-1 truncate text-[14px] text-[var(--admin-text)]">
                      {c.name}
                    </span>
                    <span
                      className={`shrink-0 text-[12px] font-medium ${
                        c.liveProducts === 0 ? "text-red-700" : "text-slate-600"
                      }`}
                    >
                      {c.liveProducts} live
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Accessible on/off switch.
 *
 * The previous version was `bg-slate-300` when off against a cream card — roughly 1.3:1,
 * so "off" and "on" were genuinely hard to tell apart, which is exactly the complaint
 * raised about the Collaborators tab. Now:
 *   - a 2px border gives the track an edge at any contrast
 *   - off is slate-500, not slate-300
 *   - the knob carries its own ring so it reads against both track states
 *   - an ON/OFF word means the state never depends on colour alone
 *   - a visible focus ring, so keyboard users can see where they are
 */
function Toggle({
  checked, onChange, disabled, label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 ${
          checked
            ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]"
            : "border-slate-600 bg-slate-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-1 ring-black/20 transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`select-none text-[11px] font-bold tracking-wide ${
          checked ? "text-[var(--admin-accent)]" : "text-slate-600"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </span>
    </span>
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
  const [settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories, reels, reelUpNext, reelRotation, canGenerate] =
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
      fetchReels(),
      fetchReelUpNext(10),
      fetchReelRotation(),
      canGenerateReels(),
    ]);
  const reelTitles = await fetchReelProductTitles([
    ...new Set(reels.flatMap((r) => r.product_ids ?? [])),
  ]);
  return { settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories, reels, reelUpNext, reelTitles, reelRotation, canGenerate };
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

  const { settings, rotation, upNext, queue, history, connection, platforms, collaborators, categories, reels, reelUpNext, reelTitles, reelRotation, canGenerate } = data;
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
              : t.id === "reels" ? reels.filter((r) => r.status === "draft").length
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
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--admin-accent)] px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
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
        {tab === "reels" && (
          <ReelsTab
            rows={reels}
            upNext={reelUpNext}
            titles={reelTitles}
            rotation={reelRotation}
            canGenerate={canGenerate}
            pending={pending}
            onAct={act}
          />
        )}
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

          <Field label="Categories" hint="Only main categories are offered — products store the main slug in `category`.">
            <CategoryPicker
              categories={categories}
              selected={draft.categories}
              onToggle={toggleCategory}
            />
          </Field>

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
              <GripVertical size={14} className="shrink-0 text-slate-500" />
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
            {/*
              * The glyph carries its real brand colour, which is what makes a nine-row list
              * scannable — the eye finds Facebook blue faster than it reads "Facebook".
              * A platform with no adapter yet is drawn at reduced opacity on grey rather
              * than in colour, so "available" and "not built" stay distinguishable without
              * relying on the pill alone.
              */}
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${
                p.supported ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100"
              }`}
              style={p.supported ? { color: platformBrand(p.key) } : undefined}
            >
              <PlatformIcon
                platform={p.key}
                size={20}
                className={p.supported ? "" : "text-slate-400 opacity-60"}
              />
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

/**
 * Corner glyph marking a post's status on one platform.
 *
 * Status used to be carried by colour alone — a green icon versus a red icon of identical
 * shape, which is invisible to a red-green colourblind reader (around 8% of men). A tick,
 * a warning triangle and a clock differ in *form*, so colour reinforces the meaning
 * instead of being the only thing that carries it.
 */
function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-white ring-2 ring-[var(--admin-bg)] ${tone}`}
    >
      {children}
    </span>
  );
}

function PlatformLink({
  row, pending, onAct,
}: {
  row: SocialLogRow;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const label = platformLabel(row.platform);
  const base =
    "relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition";

  if (row.status === "posted" && row.permalink) {
    return (
      <a
        href={row.permalink} target="_blank" rel="noopener noreferrer"
        title={`View on ${label}`} aria-label={`View on ${label} — posted`}
        className={`${base} border-emerald-400 hover:bg-emerald-50`}
        style={{ color: platformBrand(row.platform) }}
      >
        <PlatformIcon platform={row.platform} size={15} />
        <StatusBadge tone="bg-emerald-600"><Check size={9} strokeWidth={4} /></StatusBadge>
      </a>
    );
  }

  if (row.status === "failed") {
    return (
      <button
        onClick={() => onAct(() => retryFailedPost(row.id), `Retried ${label}`)}
        disabled={pending}
        title={`${label} failed — click to retry. ${row.error_message ?? ""}`.trim()}
        aria-label={`Retry ${label} — failed`}
        className={`${base} border-red-500 hover:bg-red-50`}
        style={{ color: platformBrand(row.platform) }}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <PlatformIcon platform={row.platform} size={15} />}
        <StatusBadge tone="bg-red-600"><AlertTriangle size={8} strokeWidth={3} /></StatusBadge>
      </button>
    );
  }

  return (
    <span
      title={`${label} — ${row.status}`} aria-label={`${label} ${row.status}`}
      className={`${base} border-slate-400 text-slate-500`}
    >
      <PlatformIcon platform={row.platform} size={15} />
      <StatusBadge tone="bg-slate-500"><Clock size={8} strokeWidth={3} /></StatusBadge>
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
                            <p key={r.id} className="mt-0.5 text-[12px] text-red-800">
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

// ─── Reels ────────────────────────────────────────────────────────────────────

type ReelView = "review" | "published" | "upload";

/**
 * Reels desk.
 *
 * Laid out as review-first: the decisions that need making are the whole left column, and
 * the queue sits beside them rather than above, so opening the tab shows work rather than
 * settings. On narrow screens the columns stack, review still first.
 *
 * Reels are a separate track from photo posts throughout — their own rotation, their own
 * counter, their own manual order. A garment shown as a carousel and again as a reel is
 * reinforcement rather than repetition, and mixing the two counters would misreport both.
 */
function ReelsTab({
  rows, upNext, titles, rotation, canGenerate, pending, onAct,
}: {
  rows: SocialReelRow[];
  upNext: Array<{ id: string; slug: string; title: string; images: string[] }>;
  titles: Record<string, string>;
  rotation: { made: number; eligible: number; awaitingReview: number; published: number };
  canGenerate: boolean;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [view, setView] = useState<ReelView>("review");

  const drafts = rows.filter((r) => r.status === "draft");
  const live = rows.filter((r) => r.status === "approved" || r.status === "posted" || r.status === "failed");
  const archived = rows.filter((r) => r.status === "archived");

  const views: { id: ReelView; label: string; count?: number }[] = [
    { id: "review", label: "To review", count: drafts.length },
    { id: "published", label: "Published", count: live.length },
    { id: "upload", label: "Upload" },
  ];

  return (
    <div className="space-y-4">
      <ReelStats rotation={rotation} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Review first — the column that carries the work. */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-medium transition ${
                  view === v.id
                    ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                    : "border-slate-300 text-[var(--admin-text)] hover:border-slate-400"
                }`}
              >
                {v.label}
                {v.count !== undefined && v.count > 0 && (
                  <span
                    className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                      view === v.id ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {v.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {view === "review" &&
            (drafts.length === 0 ? (
              <EmptyReels
                message="Nothing waiting for review."
                hint="Generate one from the queue on the right."
              />
            ) : (
              drafts.map((r) => (
                <ReelCard key={r.id} row={r} titles={titles} pending={pending} onAct={onAct} />
              ))
            ))}

          {view === "published" &&
            (live.length === 0 ? (
              <EmptyReels message="No reels published yet." hint="Approve one to send it live." />
            ) : (
              live.map((r) => (
                <ReelCard key={r.id} row={r} titles={titles} pending={pending} onAct={onAct} />
              ))
            ))}

          {view === "upload" && (
            <>
              <UploadReelCard pending={pending} onAct={onAct} />
              {archived.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[14px] font-semibold text-[var(--admin-text)]">
                    Discarded ({archived.length})
                  </h4>
                  {archived.map((r) => (
                    <ReelCard key={r.id} row={r} titles={titles} pending={pending} onAct={onAct} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <ReelQueueCard
          items={upNext}
          canGenerate={canGenerate}
          pending={pending}
          onAct={onAct}
        />
      </div>
    </div>
  );
}

function EmptyReels({ message, hint }: { message: string; hint: string }) {
  return (
    <AdminCard padded>
      <p className="text-[14px] text-[var(--admin-text)]">{message}</p>
      <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>
    </AdminCard>
  );
}

/**
 * The reel counter — deliberately its own, not the header's.
 *
 * The page header reports the *photo* rotation ("Cycle 1 · 4 of 25"). Reels run on a
 * separate track, so they get a separate count; sharing one number would misreport both.
 */
function ReelStats({
  rotation,
}: {
  rotation: { made: number; eligible: number; awaitingReview: number; published: number };
}) {
  const stats = [
    { label: "Reels made", value: `${rotation.made} of ${rotation.eligible}`, hint: "products with 3+ images" },
    { label: "Awaiting review", value: String(rotation.awaitingReview) },
    { label: "Published", value: String(rotation.published) },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <AdminCard key={s.label} padded>
          <p className="text-[13px] text-[var(--admin-text-muted)]">{s.label}</p>
          <p className="mt-1 text-[20px] font-semibold text-[var(--admin-text)]">{s.value}</p>
          {s.hint && <p className="mt-0.5 text-[12px] text-[var(--admin-text-muted)]">{s.hint}</p>}
        </AdminCard>
      ))}
    </div>
  );
}

/**
 * The reel queue — drag to reorder, and generate the next one.
 *
 * Its own order table, separate from the photo queue: a reel pin must never be able to
 * reorder photo posts. Saves on drop, like the photo queue does, because a drag is an
 * instruction rather than a draft.
 */
function ReelQueueCard({
  items, canGenerate, pending, onAct,
}: {
  items: Array<{ id: string; slug: string; title: string; images: string[] }>;
  canGenerate: boolean;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);

  const incomingIds = items.map((i) => i.id).join();
  const [syncedIds, setSyncedIds] = useState(incomingIds);
  if (!saving && dragIndex === null && incomingIds !== syncedIds) {
    setOrder(items);
    setSyncedIds(incomingIds);
  }

  function persist(next: typeof items) {
    setSaving(true);
    onAct(async () => {
      try {
        await saveReelQueueOrder(next.map((o) => o.id));
      } finally {
        setSaving(false);
      }
    }, "Reel order saved");
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
    setOrder(next);
    setDragIndex(null);
    setOverIndex(null);
    persist(next);
  }

  function generate(slug?: string, label?: string) {
    setBuilding(slug ?? "next");
    onAct(async () => {
      try {
        const res = await generateReel(slug);
        if (!res.ok) throw new Error(res.detail);
        return res;
      } finally {
        setBuilding(null);
      }
    }, label ?? "Reel ready — it is waiting in To review");
  }

  return (
    <AdminCard padded>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--admin-text)]">Reel queue</h3>
      <p className="mb-3 text-[12px] text-[var(--admin-text-muted)]">
        Separate from the photo rotation. Drag to reorder — saved automatically.
        {saving && <span className="ml-1 text-[var(--admin-accent)]">Saving…</span>}
      </p>

      {canGenerate ? (
        <AdminButton
          size="sm"
          className="mb-4 w-full"
          loading={building === "next"}
          disabled={pending || building !== null || order.length === 0}
          onClick={() => generate(undefined)}
        >
          {building === "next" ? "Making the reel…" : "Generate next reel"}
        </AdminButton>
      ) : (
        <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-2.5">
          <p className="text-[12px] text-amber-900">
            Reels are built on your own computer. Open this page there to generate one.
          </p>
        </div>
      )}

      {building && (
        <p className="mb-3 text-[12px] text-[var(--admin-text-muted)]">
          This takes about a minute — rendering, encoding, then uploading.
        </p>
      )}

      {order.length === 0 ? (
        <p className="text-[13px] text-[var(--admin-text-muted)]">
          No product has the 3 or more images a reel needs.
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
              className={`flex cursor-grab items-center gap-2 rounded-lg border-2 p-1.5 transition active:cursor-grabbing ${
                overIndex === i && dragIndex !== i
                  ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10"
                  : dragIndex === i
                    ? "border-slate-300 opacity-40"
                    : "border-transparent hover:border-slate-300"
              }`}
            >
              <GripVertical size={14} className="shrink-0 text-slate-500" />
              <span className="w-3 shrink-0 text-[11px] text-[var(--admin-text-muted)]">{i + 1}</span>
              {p.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt="" className="h-9 w-7 shrink-0 rounded object-cover" />
              )}
              <span className="line-clamp-2 min-w-0 flex-1 text-[12px] text-[var(--admin-text)]">
                {p.title}
              </span>
              {canGenerate && (
                <button
                  onClick={() => generate(p.slug, `Reel ready for ${p.title.split(/[–—-]/)[0].trim()}`)}
                  disabled={pending || building !== null}
                  title="Make a reel from this product now"
                  aria-label={`Make a reel from ${p.title}`}
                  className="shrink-0 rounded p-1 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-accent)] disabled:opacity-40"
                >
                  {building === p.slug ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Clapperboard size={14} />
                  )}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {order.length > 0 && (
        <button
          onClick={() => onAct(() => clearReelQueueOrder(), "Back to automatic reel rotation")}
          disabled={pending}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
        >
          <Undo2 size={13} /> Clear manual order
        </button>
      )}
    </AdminCard>
  );
}

/** Uploading a video made elsewhere — no encoding involved, so this works anywhere. */
function UploadReelCard({
  pending, onAct,
}: {
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <AdminCard padded>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--admin-text)]">
        Upload your own video
      </h3>
      <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
        Shot something yourself? It joins the same review queue — nothing publishes without
        your approval.
      </p>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-400 px-4 py-8 text-center transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/5">
        {busy ? (
          <Loader2 size={22} className="animate-spin text-[var(--admin-accent)]" />
        ) : (
          <Upload size={22} className="text-slate-500" />
        )}
        <span className="text-[14px] font-medium text-[var(--admin-text)]">
          {busy ? "Uploading…" : "Choose a video"}
        </span>
        <span className="text-[12px] text-[var(--admin-text-muted)]">
          MP4 or MOV, up to 100MB. Portrait 9:16 works best.
        </span>
        <input
          type="file"
          accept="video/mp4,video/quicktime"
          className="hidden"
          disabled={busy || pending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.set("file", file);
            e.target.value = "";
            setBusy(true);
            onAct(async () => {
              try {
                const res = await uploadOwnReel(form);
                if (!res.ok) throw new Error(res.detail ?? "Upload failed");
                return res;
              } finally {
                setBusy(false);
              }
            }, "Uploaded — it is waiting in To review");
          }}
        />
      </label>
    </AdminCard>
  );
}

/** One reel — player, caption, and the review decision. */
function ReelCard({
  row, titles, pending, onAct,
}: {
  row: SocialReelRow;
  titles: Record<string, string>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [caption, setCaption] = useState(row.caption ?? "");
  const [rebuilding, setRebuilding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const isDraft = row.status === "draft";
  const products = (row.product_ids ?? []).map((id) => titles[id]).filter(Boolean);

  return (
    <AdminCard padded>
      <div className="flex flex-col gap-4 sm:flex-row">
        {row.video_url ? (
          <video
            src={row.video_url}
            poster={row.thumbnail_url ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full shrink-0 rounded-xl bg-black object-contain sm:w-[190px]"
          />
        ) : (
          <div className="flex aspect-[9/16] w-full shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:w-[190px]">
            <Clapperboard size={26} className="text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {row.status === "draft" && <Pill tone="warn">Awaiting review</Pill>}
            {row.status === "approved" && <Pill tone="ok"><Check size={11} /> Approved</Pill>}
            {row.status === "posted" && <Pill tone="ok"><Check size={11} /> Published</Pill>}
            {row.status === "failed" && <Pill tone="bad">Failed</Pill>}
            {row.status === "archived" && <Pill tone="muted">Discarded</Pill>}
            <Pill tone="muted">{row.kind === "upload" ? "Uploaded" : row.kind}</Pill>
            {row.duration_seconds !== null && (
              <Pill tone="muted">{Number(row.duration_seconds).toFixed(0)}s</Pill>
            )}
          </div>

          {products.length > 0 && (
            <p className="mb-2 text-[13px] text-[var(--admin-text)]">{products.join(" · ")}</p>
          )}
          {row.audio_track && (
            <p className="mb-2 text-[12px] text-[var(--admin-text-muted)]">♪ {row.audio_track}</p>
          )}
          {row.error_message && <p className="mb-2 text-[12px] text-red-800">{row.error_message}</p>}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            readOnly={!isDraft}
            rows={5}
            aria-label="Reel caption"
            className={`${inputCls} text-[13px] leading-relaxed ${isDraft ? "" : "opacity-70"}`}
          />
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            {caption.length}/2200 characters
          </p>

          {isDraft && (
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton
                size="sm"
                loading={publishing}
                disabled={pending || rebuilding}
                onClick={() => {
                  setPublishing(true);
                  onAct(async () => {
                    try {
                      const res = await approveAndPublishReel(
                        row.id,
                        caption !== row.caption ? caption : undefined,
                      );
                      if (!res.ok) throw new Error(res.detail);
                      return res;
                    } finally {
                      setPublishing(false);
                    }
                  }, "Published to Instagram");
                }}
              >
                <Check size={14} /> {publishing ? "Publishing…" : "Approve & publish"}
              </AdminButton>
              <AdminButton
                size="sm"
                variant="outline"
                disabled={pending || publishing || rebuilding}
                onClick={() =>
                  onAct(async () => {
                    if (caption !== row.caption) await updateReelCaption(row.id, caption);
                    await approveReel(row.id);
                  }, "Approved — publish it when you are ready")
                }
              >
                Approve only
              </AdminButton>
              <AdminButton
                size="sm"
                variant="outline"
                loading={rebuilding}
                disabled={pending}
                onClick={() => {
                  setRebuilding(true);
                  onAct(async () => {
                    try {
                      const res = await rebuildReel(row.id);
                      if (!res.ok) throw new Error(res.detail);
                      return res;
                    } finally {
                      setRebuilding(false);
                    }
                  }, "New cut ready");
                }}
              >
                <RefreshCw size={14} /> Make another cut
              </AdminButton>
              <AdminButton
                size="sm"
                variant="ghost"
                onClick={() => onAct(() => discardReel(row.id), "Discarded — recoverable under Upload")}
              >
                <Trash2 size={14} /> Discard
              </AdminButton>
              {caption !== row.caption && (
                <AdminButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onAct(() => updateReelCaption(row.id, caption), "Caption saved")}
                >
                  Save caption
                </AdminButton>
              )}
            </div>
          )}

          {(row.status === "approved" || row.status === "failed") && (
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton
                size="sm"
                loading={publishing}
                disabled={pending}
                onClick={() => {
                  setPublishing(true);
                  onAct(async () => {
                    try {
                      const res = await publishReelNow(row.id);
                      if (!res.ok) throw new Error(res.detail);
                      return res;
                    } finally {
                      setPublishing(false);
                    }
                  }, "Published to Instagram");
                }}
              >
                {publishing
                  ? "Publishing…"
                  : row.status === "failed"
                    ? "Try publishing again"
                    : "Publish now"}
              </AdminButton>
              <AdminButton
                size="sm"
                variant="ghost"
                onClick={() => onAct(() => discardReel(row.id), "Discarded")}
              >
                <Trash2 size={14} /> Discard
              </AdminButton>
            </div>
          )}

          {publishing && (
            <p className="mt-2 text-[12px] text-[var(--admin-text-muted)]">
              Meta transcodes the video before it goes live — this can take a couple of minutes.
            </p>
          )}

          {row.status === "archived" && (
            <div className="mt-3">
              <AdminButton
                size="sm"
                variant="outline"
                loading={pending}
                onClick={() => onAct(() => restoreReel(row.id), "Restored for review")}
              >
                <Undo2 size={14} /> Restore
              </AdminButton>
            </div>
          )}

          {row.permalink && (
            <a
              href={row.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-accent)] hover:underline"
            >
              View on Instagram <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </AdminCard>
  );
}
