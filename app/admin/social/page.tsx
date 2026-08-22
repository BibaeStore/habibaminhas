"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check, X, Send, Trash2, RotateCcw, Undo2, GripVertical, ChevronLeft, ChevronRight,
  CalendarDays, ClipboardCheck, Share2,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import {
  fetchRotationStatus, fetchUpNext, fetchReviewQueue, fetchPostHistory, fetchPlatforms,
  approveAndPublishGroup, skipQueuedGroup,
  updateQueuedCaption, retryFailedPost, triggerPostNow,
  saveQueueOrder, clearQueueOrder, deletePost, repostPost, restorePost,
  type SocialLogRow, type SocialPlatformRow,
} from "@/lib/actions/social";
import { fetchActivePlan } from "@/lib/actions/social-plans";
import { expandPlan, type PlanRow } from "@/lib/social/plan";
import {
  Pill, Modal, EmptyState, StatePill, PlatformChip, PublishTargets, PlatformPicker,
  CheckBox, SubTabs, Toast, inputCls, relativeTime,
} from "@/components/admin/social/ui";
import { PlatformIcon, platformLabel, platformBrand } from "@/components/admin/platform-icons";
import { WeekCalendar, mondayOf, shiftWeek, type CalendarItem } from "@/components/admin/social/week-calendar";
import { useAct } from "@/components/admin/social/use-act";

/**
 * Posts — the static product post pipeline.
 *
 * Three sub-tabs rather than three stacked sections. Stacking meant reaching "Published"
 * required scrolling past every upcoming post and everything awaiting review, which is how
 * a screen stops being navigable: a section at the bottom of a long page is a section
 * nobody knows is there.
 *
 * `/admin/social/reels` carries the same tabs in the same order, so learning one teaches
 * the other.
 */

const PER_PAGE = 10;

type Tab = "upcoming" | "review" | "published";

async function load() {
  const [rotation, upNext, queue, history, platforms, plan] = await Promise.all([
    fetchRotationStatus(),
    fetchUpNext(24),
    fetchReviewQueue(),
    fetchPostHistory(200),
    fetchPlatforms(),
    fetchActivePlan(),
  ]);
  return { rotation, upNext, queue, history, platforms, plan };
}

function describeRun(result: unknown): string {
  const run = result as { action?: string; detail?: Record<string, unknown> } | null;
  const detail = (run?.detail ?? {}) as Record<string, unknown>;

  switch (run?.action) {
    case "queued_for_review": return "Queued — it is now under “Review”.";
    case "published":         return "Published.";
    case "daily_cap_reached":
      return `Nothing posted — the daily ceiling of ${detail.cap} is already used up (${detail.today} today). Raise it under Posting rules.`;
    case "nothing_eligible":
      return "Nothing eligible to post. Check the category, stock and minimum-image filters — a product already awaiting review is not selected again.";
    case "no_slot_due":      return "No posting slot is due right now.";
    case "slot_already_ran": return "That slot has already posted today.";
    case "skipped":          return `Skipped — ${String(detail ?? "no reason given")}`;
    case "error":            return `Run failed — ${String(detail ?? "unknown error")}`;
    default:                 return "Run triggered.";
  }
}

export default function SocialPostsPage() {
  const { act, pending, notice, setNotice } = useAct();
  const { data, error } = useQuery({ queryKey: ["social-photos"], queryFn: load });
  const [tab, setTab] = useState<Tab>("upcoming");

  if (error) {
    return (
      <AdminCard padded className="border-red-200 bg-red-50">
        <p className="text-[14px] text-red-800">{(error as Error).message}</p>
      </AdminCard>
    );
  }
  if (!data) return <EmptyState message="Loading…" />;

  const { rotation, upNext, queue, history, platforms, plan } = data;
  const targets = platforms.filter((p) => p.supports_photo && p.photo_enabled).map((p) => p.key);
  const published = history.filter((r) => r.status === "posted");
  /*
   * One card per logical post, not per platform row — the owner approves a post, once.
   *
   * Re-sorted oldest-first. `groupPosts` orders newest-first for the Published table, which
   * is right for history and wrong for a queue: the thing waiting longest should be dealt
   * with first, and that is the order this list has always been in.
   */
  const reviewGroups = groupPosts(queue).sort((a, b) => Date.parse(a.when) - Date.parse(b.when));

  return (
    <div>
      <Toast message={notice} onClose={() => setNotice(null)} />

      <SubTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "upcoming",  label: "Upcoming",  icon: <CalendarDays size={15} /> },
          { id: "review",    label: "Review",    icon: <ClipboardCheck size={15} />, count: reviewGroups.length },
          { id: "published", label: "Published", icon: <Share2 size={15} /> },
        ]}
      />

      {tab === "upcoming" && (
        <UpcomingTab
          plan={plan}
          upNext={upNext}
          published={published}
          rotation={rotation}
          targets={targets}
          pending={pending}
          onAct={act}
          onPostNow={() => act(() => triggerPostNow(), describeRun)}
        />
      )}

      {tab === "review" && (
        queue.length === 0 ? (
          <EmptyState
            message="Nothing waiting for you."
            hint="Posts appear here when a slot fires and review is switched on."
          />
        ) : (
          <div className="space-y-4">
            {reviewGroups.map((group) => (
              <ReviewItem key={group.groupId} group={group} pending={pending} onAct={act} />
            ))}
          </div>
        )
      )}

      {tab === "published" && (
        <PublishedTable rows={history} platforms={platforms} pending={pending} onAct={act} />
      )}
    </div>
  );
}

// ─── Upcoming ─────────────────────────────────────────────────────────────────

/**
 * The week ahead, and the order things go out in.
 *
 * The calendar is the primary view because the day is the thing being planned — an ordered
 * list tells you the sequence but never which day something lands on. Past days show what
 * actually published, so one grid answers both "what went out" and "what is coming".
 */
function UpcomingTab({
  plan, upNext, published, rotation, targets, pending, onAct, onPostNow,
}: {
  plan: PlanRow | null;
  upNext: Array<{ id: string; slug: string; title: string; images: string[] }>;
  published: SocialLogRow[];
  rotation: { cycle: number; postedThisCycle: number; eligibleTotal: number } | null;
  targets: string[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
  onPostNow: () => void;
}) {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const today = new Date().toISOString().slice(0, 10);

  /*
   * Products are matched to slots in rotation order, starting from the next future slot —
   * computed across the whole horizon rather than per displayed week, so paging forward
   * does not reshuffle which product lands where.
   */
  const items: CalendarItem[] = [];
  if (plan) {
    const horizon = shiftWeek(mondayOf(), 8);
    const future = expandPlan(plan, today, horizon).filter((s) => s.kind === "photo");
    future.forEach((slot, i) => {
      const product = upNext[i];
      items.push({
        date: slot.date,
        time: slot.time,
        kind: "photo",
        label: product?.title ?? null,
      });
    });
    // Reels are shown too, so the week reads as the whole schedule rather than half of it.
    for (const slot of expandPlan(plan, today, horizon).filter((s) => s.kind === "reel")) {
      items.push({ date: slot.date, time: slot.time, kind: "reel" });
    }
  }

  // What actually went out, on the days it went out.
  const seen = new Set<string>();
  for (const row of published) {
    const key = row.group_id ?? row.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const when = row.posted_at ?? row.created_at;
    items.push({
      date: when.slice(0, 10),
      time: new Date(when).toISOString().slice(11, 16),
      kind: "photo",
      label: row.product_title,
      done: true,
    });
  }

  return (
    <div className="space-y-5">
      <AdminCard padded>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <PublishTargets targets={targets} />
          <AdminButton
            size="sm" variant="outline" leadingIcon={<Send size={15} />}
            loading={pending} onClick={onPostNow}
          >
            Post now
          </AdminButton>
        </div>

        {!plan && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2.5">
            <p className="text-[13px] text-amber-900">
              No plan is active, so the calendar has nothing to lay out. Create one on the
              Planner page — posting still runs on the saved times in the meantime.
            </p>
          </div>
        )}

        <WeekCalendar
          items={items}
          weekStart={weekStart}
          onShift={(w) => setWeekStart(w === "today" ? mondayOf() : shiftWeek(weekStart, w))}
          emptyHint={plan ? "Nothing scheduled this week" : "No active plan"}
        />
      </AdminCard>

      <UpNextQueue
        items={upNext}
        rotation={rotation}
        pending={pending}
        onAct={onAct}
      />
    </div>
  );
}

/**
 * Drag-and-drop order.
 *
 * Dropping **saves immediately**. It previously only reordered local state and waited for a
 * separate "Save order" click — the list visibly reordered so the order looked saved, but
 * `social_queue_order` stayed empty and publishing fell back to automatic rotation.
 */
function UpNextQueue({
  items, rotation, pending, onAct,
}: {
  items: Array<{ id: string; slug: string; title: string; images: string[] }>;
  rotation: { cycle: number; postedThisCycle: number; eligibleTotal: number } | null;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const incomingIds = items.map((i) => i.id).join();
  const [syncedIds, setSyncedIds] = useState(incomingIds);
  if (!saving && dragIndex === null && incomingIds !== syncedIds) {
    setOrder(items);
    setSyncedIds(incomingIds);
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
    setSaving(true);
    onAct(async () => {
      try {
        await saveQueueOrder(next.map((o) => o.id));
      } finally {
        setSaving(false);
      }
    }, "Order saved");
  }

  if (order.length === 0) {
    return (
      <EmptyState
        message="No eligible products."
        hint="Check the category and stock filters under Posting rules."
      />
    );
  }

  return (
    <AdminCard padded>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--admin-text)]">Order</h3>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            {rotation
              ? `Cycle ${rotation.cycle} · ${rotation.postedThisCycle} of ${rotation.eligibleTotal} used. `
              : ""}
            Drag to reorder — saved on drop.
          </p>
        </div>
        {saving && <span className="text-[13px] text-[var(--admin-accent)]">Saving…</span>}
      </div>

      <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
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

      <button
        onClick={() => onAct(() => clearQueueOrder(), "Back to automatic rotation")}
        disabled={pending}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
      >
        <Undo2 size={14} /> Clear manual order
      </button>
    </AdminCard>
  );
}

// ─── Review ───────────────────────────────────────────────────────────────────

/**
 * One queued post, however many platforms it fans out to.
 *
 * The queue stores a row per platform, and this screen used to render one card per *row* —
 * so a three-platform post asked for the same decision three times, and adding Pinterest
 * made it worse rather than better. The owner reviews a *post*: one picture, one decision,
 * one button.
 *
 * Captions stay per-platform underneath, because they genuinely differ — Instagram cannot
 * have a clickable link so it says "link in bio", Facebook carries the URL, and a Pinterest
 * description is a different shape again. Collapsing them into one box would quietly throw
 * that away, so the caption is edited behind a small tab strip and only edited platforms are
 * saved.
 */
function ReviewItem({
  group, pending, onAct,
}: {
  group: PostGroup;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const platforms = useMemo(
    () => group.rows.map((r) => r.platform).sort((a, b) => a.localeCompare(b)),
    [group.rows],
  );

  const [selected, setSelected] = useState<string[]>(platforms);
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [captions, setCaptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(group.rows.map((r) => [r.id, r.caption ?? ""])),
  );

  const activeRow = group.rows.find((r) => r.platform === activePlatform) ?? group.rows[0];
  const activeCaption = captions[activeRow.id] ?? "";

  const editedRows = group.rows.filter(
    (r) => (captions[r.id] ?? "") !== (r.caption ?? ""),
  );

  const images = activeRow.image_urls ?? group.rows[0].image_urls ?? [];

  /** Save any edited captions, then publish the chosen platforms in one pass. */
  const publish = () =>
    onAct(async () => {
      for (const row of editedRows) {
        await updateQueuedCaption(row.id, captions[row.id] ?? "");
      }
      const result = await approveAndPublishGroup(group.groupId, selected);
      if (result.failed > 0 && result.published === 0) {
        throw new Error(`Publishing failed on ${result.failed} platform(s)`);
      }
      return result;
    }, `Published to ${selected.length} platform${selected.length === 1 ? "" : "s"}`);

  return (
    <AdminCard padded>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatePill state={activeRow.status} />
          <span className="text-[15px] font-semibold text-[var(--admin-text)]">
            {group.title}
          </span>
        </div>
        <span className="text-[12px] text-[var(--admin-text-muted)]">
          {activeCaption.length} / 2200
        </span>
      </div>

      <div className="mb-3">
        <PlatformPicker
          available={platforms}
          selected={selected}
          onChange={setSelected}
          disabled={pending}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="flex gap-2">
          {images.slice(0, 3).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="h-32 w-[102px] rounded object-cover" />
          ))}
        </div>
        <div>
          {platforms.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePlatform(p)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium transition ${
                    p === activePlatform
                      ? "bg-[var(--admin-accent)]/10 text-[var(--admin-text)]"
                      : "text-[var(--admin-text-muted)] hover:bg-slate-50"
                  }`}
                  style={p === activePlatform ? { color: platformBrand(p) } : undefined}
                >
                  <PlatformIcon platform={p} size={13} />
                  {platformLabel(p)}
                  {!selected.includes(p) && (
                    <span className="text-[11px] text-[var(--admin-text-muted)]">(off)</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <textarea
            className={`${inputCls} min-h-[160px] font-mono text-[13px]`}
            value={activeCaption}
            onChange={(e) =>
              setCaptions((prev) => ({ ...prev, [activeRow.id]: e.target.value }))
            }
            aria-label={`Caption for ${platformLabel(activePlatform)}`}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <AdminButton
              size="sm" loading={pending} leadingIcon={<Check size={15} />}
              disabled={selected.length === 0}
              onClick={publish}
            >
              Approve &amp; publish
            </AdminButton>
            {editedRows.length > 0 && (
              <AdminButton
                size="sm" variant="outline" loading={pending}
                onClick={() =>
                  onAct(async () => {
                    for (const row of editedRows) {
                      await updateQueuedCaption(row.id, captions[row.id] ?? "");
                    }
                  }, "Caption saved")
                }
              >
                Save edit
              </AdminButton>
            )}
            <AdminButton
              size="sm" variant="ghost" loading={pending} leadingIcon={<X size={15} />}
              onClick={() => onAct(() => skipQueuedGroup(group.groupId), "Skipped")}
            >
              Skip
            </AdminButton>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

// ─── Published ────────────────────────────────────────────────────────────────

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

function PublishedTable({
  rows, platforms, pending, onAct,
}: {
  rows: SocialLogRow[];
  platforms: SocialPlatformRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<PostGroup | null>(null);
  const [deleting, setDeleting] = useState<PostGroup | null>(null);

  const groups = groupPosts(rows);
  const pageCount = Math.max(1, Math.ceil(groups.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const visible = groups.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  if (groups.length === 0) {
    return <EmptyState message="No posts yet." hint="Approve one under Review to send it live." />;
  }

  return (
    <>
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[14px]">
            <thead className="border-b border-[var(--admin-border)] text-[13px] text-[var(--admin-text-muted)]">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Where</th>
                <th className="px-4 py-3">When</th>
                <th className="w-24 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((group) => (
                <tr
                  key={group.groupId}
                  onClick={() => setDetail(group)}
                  className="cursor-pointer border-b border-[var(--admin-border)] transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {group.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={group.thumbnail} alt=""
                          className={`h-12 w-10 shrink-0 rounded object-cover ${group.archived ? "opacity-40" : ""}`} />
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[var(--admin-text)]">{group.title}</p>
                        {group.archived && (
                          <span className="mt-0.5 inline-block"><Pill tone="muted">Discarded</Pill></span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {group.rows
                        .slice()
                        .sort((a, b) => a.platform.localeCompare(b.platform))
                        .map((row) => (
                          <PlatformChip
                            key={row.id}
                            platform={row.platform}
                            state={
                              row.status === "posted" ? "posted"
                              : row.status === "failed" ? "failed"
                              : "pending"
                            }
                            href={row.permalink}
                            error={row.error_message}
                            busy={pending}
                            onRetry={
                              row.status === "failed"
                                ? () => onAct(() => retryFailedPost(row.id), "Retried")
                                : undefined
                            }
                          />
                        ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--admin-text-muted)]"
                    title={new Date(group.when).toLocaleString("en-GB")}>
                    {relativeTime(group.when)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {group.archived ? (
                        <button
                          onClick={() => onAct(() => restorePost(group.groupId), "Restored to review")}
                          disabled={pending} title="Restore to the review queue" aria-label="Restore post"
                          className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
                        >
                          <Undo2 size={16} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onAct(() => repostPost(group.groupId), "Reposted with a fresh caption")}
                            disabled={pending}
                            title="Repost with a freshly generated caption — Instagram captions cannot be edited in place"
                            aria-label="Repost with fresh caption"
                            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => setDeleting(group)}
                            disabled={pending} title="Delete from platforms" aria-label="Delete post"
                            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] px-4 py-3">
            <p className="text-[13px] text-[var(--admin-text-muted)]">
              {current * PER_PAGE + 1}–{current * PER_PAGE + visible.length} of {groups.length} posts
            </p>
            <div className="flex items-center gap-2">
              <AdminButton size="sm" variant="outline" disabled={current === 0}
                onClick={() => setPage(current - 1)} leadingIcon={<ChevronLeft size={15} />}>
                Previous
              </AdminButton>
              <span className="text-[13px] text-[var(--admin-text-muted)]">
                {current + 1} / {pageCount}
              </span>
              <AdminButton size="sm" variant="outline" disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)} trailingIcon={<ChevronRight size={15} />}>
                Next
              </AdminButton>
            </div>
          </div>
        )}
      </AdminCard>

      {detail && <PostDetail group={detail} onClose={() => setDetail(null)} />}
      {deleting && (
        <DeleteModal group={deleting} platforms={platforms} pending={pending}
          onClose={() => setDeleting(null)} onAct={onAct} />
      )}
    </>
  );
}

function PostDetail({ group, onClose }: { group: PostGroup; onClose: () => void }) {
  const images = group.rows.find((r) => (r.image_urls ?? []).length > 0)?.image_urls ?? [];
  const caption = group.rows.find((r) => r.caption)?.caption ?? "";

  return (
    <Modal title={group.title} onClose={onClose} wide>
      <div className="space-y-5">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-44 w-[141px] rounded-lg object-cover" />
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">Where it went</p>
          <div className="space-y-2">
            {group.rows
              .slice()
              .sort((a, b) => a.platform.localeCompare(b.platform))
              .map((row) => (
                <div key={row.id} className="flex items-center gap-3">
                  <PlatformChip
                    platform={row.platform}
                    state={
                      row.status === "posted" ? "posted"
                      : row.status === "failed" ? "failed"
                      : "pending"
                    }
                    href={row.permalink}
                    error={row.error_message}
                  />
                  <div className="min-w-0 flex-1">
                    <StatePill state={row.status} />
                    {row.error_message && (
                      <p className="mt-1 break-words text-[12px] text-red-800">{row.error_message}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[12px] text-[var(--admin-text-muted)]"
                    title={new Date(row.posted_at ?? row.created_at).toLocaleString("en-GB")}>
                    {relativeTime(row.posted_at ?? row.created_at)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {caption && (
          <div>
            <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">Caption</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3 text-[13px] leading-relaxed text-[var(--admin-text)]">
              {caption}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DeleteModal({
  group, platforms, pending, onClose, onAct,
}: {
  group: PostGroup;
  platforms: SocialPlatformRow[];
  pending: boolean;
  onClose: () => void;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const live = group.rows.filter((r) => r.status === "posted");
  const [chosen, setChosen] = useState<string[]>(live.map((r) => r.platform));

  return (
    <Modal
      title="Delete post"
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            variant="danger" loading={pending} disabled={chosen.length === 0}
            onClick={() =>
              onAct(async () => {
                await deletePost(group.groupId, chosen);
                onClose();
              }, "Deleted")
            }
          >
            Delete from {chosen.length} {chosen.length === 1 ? "platform" : "platforms"}
          </AdminButton>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-[var(--admin-text)]">
        Remove <strong>{group.title}</strong> from the platforms you pick. The record is archived
        rather than destroyed, so it can be restored afterwards.
      </p>
      <div className="space-y-2">
        {live.map((row) => {
          const name = platforms.find((p) => p.key === row.platform)?.name ?? row.platform;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() =>
                setChosen((c) =>
                  c.includes(row.platform)
                    ? c.filter((p) => p !== row.platform)
                    : [...c, row.platform],
                )
              }
              className="flex w-full items-center gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <CheckBox on={chosen.includes(row.platform)} />
              <span className="text-[14px] text-[var(--admin-text)]">{name}</span>
            </button>
          );
        })}
        {live.length === 0 && (
          <p className="text-[14px] text-[var(--admin-text-muted)]">Nothing is live for this post.</p>
        )}
      </div>
    </Modal>
  );
}
