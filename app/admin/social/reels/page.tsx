"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check, Trash2, Undo2, GripVertical, Clapperboard, Upload, RefreshCw, Loader2,
  ExternalLink, CalendarDays, ClipboardCheck, Share2, ChevronDown,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import {
  fetchReels, fetchReelUpNext, fetchReelProductTitles, fetchReelRotation, canGenerateReels,
  fetchPlatforms, approveReel, discardReel, restoreReel, generateReel, rebuildReel,
  generateCollectionReel, approveAndPublishReel, publishReelNow, updateReelCaption,
  saveReelQueueOrder, clearReelQueueOrder, createReelUploadUrl, registerUploadedReel,
  suggestUploadCaption,
  type SocialReelRow,
} from "@/lib/actions/social";
import { fetchActivePlan } from "@/lib/actions/social-plans";
import { expandPlan, type PlanRow } from "@/lib/social/plan";
import {
  Field, Pill, Modal, EmptyState, StatePill, PlatformChip, PublishTargets, PlatformPicker, SubTabs,
  Toast, InlineProgress, inputCls, relativeTime,
} from "@/components/admin/social/ui";
import {
  WeekCalendar, mondayOf, shiftWeek, type CalendarItem,
} from "@/components/admin/social/week-calendar";
import { useAct } from "@/components/admin/social/use-act";

/**
 * Reels — video, whether generated here or shot elsewhere.
 *
 * The same tab shape as Posts, in the same order, so learning one page teaches the other.
 * Upload has a tab of its own because it is a distinct job rather than a corner of another
 * screen — and because previously you uploaded on one tab and the video appeared on a
 * different one, which is why it looked like nothing had happened.
 */

const PER_PAGE = 10;

type Tab = "upcoming" | "upload" | "review" | "published";

async function load() {
  const [rows, upNext, rotation, canGenerate, platforms, plan] = await Promise.all([
    fetchReels(),
    fetchReelUpNext(10),
    fetchReelRotation(),
    canGenerateReels(),
    fetchPlatforms(),
    fetchActivePlan(),
  ]);
  const titles = await fetchReelProductTitles([
    ...new Set(rows.flatMap((r) => r.product_ids ?? [])),
  ]);
  return { rows, upNext, rotation, canGenerate, platforms, titles, plan };
}

export default function SocialReelsPage() {
  const { act, pending, notice, setNotice } = useAct();
  const { data, error } = useQuery({ queryKey: ["social-reels"], queryFn: load });
  const [tab, setTab] = useState<Tab>("upcoming");

  if (error) {
    return (
      <AdminCard padded className="border-red-200 bg-red-50">
        <p className="text-[14px] text-red-800">{(error as Error).message}</p>
      </AdminCard>
    );
  }
  if (!data) return <EmptyState message="Loading…" />;

  const { rows, upNext, rotation, canGenerate, platforms, titles, plan } = data;
  const targets = platforms.filter((p) => p.supports_video && p.video_enabled).map((p) => p.key);

  const drafts = rows.filter((r) => r.status === "draft");
  const done = rows.filter((r) => ["approved", "posted", "failed"].includes(r.status));
  const discarded = rows.filter((r) => r.status === "archived");

  return (
    <div>
      <Toast message={notice} onClose={() => setNotice(null)} />

      <SubTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "upcoming",  label: "Upcoming",  icon: <CalendarDays size={15} /> },
          { id: "upload",    label: "Upload",    icon: <Upload size={15} /> },
          { id: "review",    label: "Review",    icon: <ClipboardCheck size={15} />, count: drafts.length },
          { id: "published", label: "Published", icon: <Share2 size={15} /> },
        ]}
      />

      {tab === "upcoming" && (
        <UpcomingTab
          plan={plan}
          rows={rows}
          upNext={upNext}
          rotation={rotation}
          targets={targets}
          canGenerate={canGenerate}
          pending={pending}
          onAct={act}
        />
      )}

      {tab === "upload" && <UploadCard pending={pending} onAct={act} onDone={() => setTab("review")} />}

      {tab === "review" && (
        drafts.length === 0 ? (
          <EmptyState
            message="Nothing waiting for you."
            hint="Generate one under Upcoming, or upload a video you shot yourself."
          />
        ) : (
          <div className="space-y-4">
            {drafts.map((r) => (
              <ReviewReel key={r.id} row={r} titles={titles} targets={targets}
                pending={pending} onAct={act} />
            ))}
          </div>
        )
      )}

      {tab === "published" && (
        <div className="space-y-6">
          <ReelTable rows={done} titles={titles} pending={pending} onAct={act} />
          {discarded.length > 0 && (
            <DiscardedSection rows={discarded} titles={titles} pending={pending} onAct={act} />
          )}
        </div>
      )}
    </div>
  );
}

function DiscardedSection({
  rows, titles, pending, onAct,
}: {
  rows: SocialReelRow[];
  titles: Record<string, string>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[14px] font-medium text-[var(--admin-text-muted)] transition hover:text-[var(--admin-text)]"
      >
        <ChevronDown size={16} className={open ? "" : "-rotate-90"} />
        Discarded ({rows.length})
      </button>
      {open && (
        <div className="mt-3">
          <ReelTable rows={rows} titles={titles} pending={pending} onAct={onAct} restorable />
        </div>
      )}
    </div>
  );
}

// ─── Upcoming ─────────────────────────────────────────────────────────────────

function UpcomingTab({
  plan, rows, upNext, rotation, targets, canGenerate, pending, onAct,
}: {
  plan: PlanRow | null;
  rows: SocialReelRow[];
  upNext: Array<{ id: string; slug: string; title: string; images: string[] }>;
  rotation: { made: number; eligible: number; awaitingReview: number; published: number };
  targets: string[];
  canGenerate: boolean;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const today = new Date().toISOString().slice(0, 10);

  const items: CalendarItem[] = [];
  if (plan) {
    const horizon = shiftWeek(mondayOf(), 8);
    const approved = rows.filter((r) => r.status === "approved");
    expandPlan(plan, today, horizon)
      .filter((s) => s.kind === "reel")
      .forEach((slot, i) => {
        items.push({
          date: slot.date,
          time: slot.time,
          kind: "reel",
          // Only what is genuinely approved and queued can be promised for a slot.
          label: approved[i] ? "Approved reel" : "Nothing approved yet",
        });
      });
  }
  for (const row of rows.filter((r) => r.status === "posted")) {
    const when = row.posted_at ?? row.created_at;
    items.push({
      date: when.slice(0, 10),
      time: new Date(when).toISOString().slice(11, 16),
      kind: "reel",
      label: row.kind === "upload" ? "Uploaded video" : "Reel",
      done: true,
    });
  }

  return (
    <div className="space-y-5">
      <AdminCard padded>
        <div className="mb-4"><PublishTargets targets={targets} /></div>

        {!plan && (
          <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2.5">
            <p className="text-[13px] text-amber-900">
              No plan is active, so nothing is laid out on the calendar. Create one on the
              Planner page.
            </p>
          </div>
        )}

        <WeekCalendar
          items={items}
          weekStart={weekStart}
          onShift={(w) => setWeekStart(w === "today" ? mondayOf() : shiftWeek(weekStart, w))}
          emptyHint={plan ? "No reel slots this week" : "No active plan"}
        />

        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-[var(--admin-text-muted)]">
          Reels publish automatically at their slot, but they are not{" "}
          <em>made</em> automatically — video encoding runs on your computer. Generate a
          batch below and approve them; the schedule sends them out one at a time.
        </p>
      </AdminCard>

      <ReelQueue
        items={upNext}
        rotation={rotation}
        canGenerate={canGenerate}
        pending={pending}
        onAct={onAct}
      />
    </div>
  );
}

function ReelQueue({
  items, rotation, canGenerate, pending, onAct,
}: {
  items: Array<{ id: string; slug: string; title: string; images: string[] }>;
  rotation: { made: number; eligible: number; awaitingReview: number; published: number };
  canGenerate: boolean;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);
  const [headline, setHeadline] = useState("New arrivals");

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
        await saveReelQueueOrder(next.map((o) => o.id));
      } finally {
        setSaving(false);
      }
    }, "Reel order saved");
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
    }, label ?? "Reel ready — it is waiting under Review");
  }

  return (
    <AdminCard padded>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--admin-text)]">Make a reel</h3>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            {rotation.made} of {rotation.eligible} products made into a reel · drag to reorder
          </p>
        </div>
        {saving && <span className="text-[13px] text-[var(--admin-accent)]">Saving…</span>}
      </div>

      {canGenerate ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <AdminButton
            loading={building === "next"}
            disabled={pending || building !== null || order.length === 0}
            onClick={() => generate(undefined)}
          >
            {building === "next" ? "Making the reel…" : "Generate next product reel"}
          </AdminButton>

          <div className="rounded-lg border-2 border-slate-300 p-2.5">
            <p className="mb-2 text-[12px] font-semibold text-[var(--admin-text)]">
              Collection reel
              <span className="ml-1 font-normal text-[var(--admin-text-muted)]">
                — one shot each from the next 4
              </span>
            </p>
            <input
              className={`${inputCls} mb-2 py-1.5 text-[13px]`}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="New arrivals"
              aria-label="Collection reel headline"
            />
            <AdminButton
              size="sm" variant="outline" className="w-full"
              loading={building === "collection"}
              disabled={pending || building !== null}
              onClick={() => {
                setBuilding("collection");
                onAct(async () => {
                  try {
                    const res = await generateCollectionReel(headline || undefined, 4);
                    if (!res.ok) throw new Error(res.detail);
                    return res;
                  } finally {
                    setBuilding(null);
                  }
                }, "Collection reel ready — waiting under Review");
              }}
            >
              {building === "collection" ? "Making the reel…" : "Make collection reel"}
            </AdminButton>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-2.5">
          <p className="text-[12px] text-amber-900">
            Reels are built on your own computer — video encoding cannot run on the server.
            Open this page there to generate one.
          </p>
        </div>
      )}

      {building && (
        <div className="mb-3">
          <InlineProgress message="Making the reel — rendering frames, encoding, then uploading. About a minute." />
        </div>
      )}

      {order.length === 0 ? (
        <p className="text-[13px] text-[var(--admin-text-muted)]">
          No product has the 3 or more images a product reel needs. A collection reel works
          with one image each, so it can still run.
        </p>
      ) : (
        <ol className="grid gap-1.5 sm:grid-cols-2">
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
                  {building === p.slug
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Clapperboard size={14} />}
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

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploading a video made elsewhere.
 *
 * The file goes **straight from the browser into Storage** via a one-time signed URL,
 * never through the Next.js server, which is what removes the body-size limit that used to
 * kill anything between 20MB and the advertised 100MB.
 *
 * On success it switches you to Review, where the video now is. Uploading on one tab and
 * having the result appear silently on another is exactly why it looked as though nothing
 * had been saved.
 */
function UploadCard({
  pending, onAct, onDone,
}: {
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function readDuration(f: File) {
    const url = URL.createObjectURL(f);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setDuration(Number.isFinite(probe.duration) ? Number(probe.duration.toFixed(2)) : null);
      URL.revokeObjectURL(url);
    };
    probe.src = url;
  }

  function upload() {
    if (!file) return;
    setProgress("Preparing…");
    onAct(async () => {
      try {
        const slot = await createReelUploadUrl(file.type);
        if (!slot.ok || !slot.signedUrl || !slot.publicUrl) {
          throw new Error(slot.detail ?? "Could not start the upload");
        }

        setProgress(`Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB…`);
        const res = await fetch(slot.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);

        setProgress("Saving…");
        const saved = await registerUploadedReel({
          publicUrl: slot.publicUrl,
          caption,
          durationSeconds: duration ?? undefined,
        });
        if (!saved.ok) throw new Error(saved.detail ?? "Could not save the reel");

        setFile(null);
        setCaption("");
        setDuration(null);
        onDone();
        return saved;
      } finally {
        setProgress(null);
      }
    }, "Uploaded — it is here under Review");
  }

  return (
    <AdminCard padded>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--admin-text)]">
        Upload your own video
      </h3>
      <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
        It joins the same review queue as a generated reel — nothing publishes without your
        approval. You will be taken to Review once it uploads.
      </p>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-400 px-4 py-10 text-center transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/5">
        {progress
          ? <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
          : <Upload size={24} className="text-slate-500" />}
        <span className="text-[14px] font-medium text-[var(--admin-text)]">
          {progress ?? (file ? file.name : "Choose a video")}
        </span>
        <span className="text-[12px] text-[var(--admin-text-muted)]">
          {file
            ? `${(file.size / 1024 / 1024).toFixed(1)} MB${duration ? ` · ${duration.toFixed(0)}s` : ""}`
            : "MP4 or MOV, up to 100MB. Portrait 9:16 works best."}
        </span>
        <input
          type="file"
          accept="video/mp4,video/quicktime"
          className="hidden"
          disabled={pending || progress !== null}
          onChange={(e) => {
            const chosen = e.target.files?.[0] ?? null;
            e.target.value = "";
            if (!chosen) return;
            if (chosen.size > 100 * 1024 * 1024) {
              onAct(async () => {
                throw new Error(
                  `That file is ${(chosen.size / 1024 / 1024).toFixed(0)}MB — the limit is 100MB.`,
                );
              });
              return;
            }
            setFile(chosen);
            setDuration(null);
            readDuration(chosen);
            if (!caption.trim()) {
              suggestUploadCaption().then(setCaption).catch(() => {});
            }
          }}
        />
      </label>

      {file && (
        <div className="mt-4 space-y-3">
          <Field
            label="Caption"
            hint="Written for you and ready to publish — a different one each time, so uploads never read identically."
          >
            <textarea
              rows={6}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={`${inputCls} text-[13px] leading-relaxed`}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <AdminButton loading={progress !== null} disabled={pending} onClick={upload}>
              Upload for review
            </AdminButton>
            <AdminButton
              variant="outline" disabled={progress !== null}
              onClick={() => { void suggestUploadCaption().then(setCaption); }}
            >
              <RefreshCw size={14} /> Suggest another
            </AdminButton>
            <AdminButton
              variant="ghost" disabled={progress !== null}
              onClick={() => { setFile(null); setCaption(""); setDuration(null); }}
            >
              Cancel
            </AdminButton>
          </div>
        </div>
      )}
    </AdminCard>
  );
}

// ─── Review ───────────────────────────────────────────────────────────────────

function ReviewReel({
  row, titles, targets, pending, onAct,
}: {
  row: SocialReelRow;
  titles: Record<string, string>;
  targets: string[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [caption, setCaption] = useState(row.caption ?? "");
  const [rebuilding, setRebuilding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const products = (row.product_ids ?? []).map((id) => titles[id]).filter(Boolean);

  /*
   * Where this one reel goes, pre-ticked with every enabled platform. A per-reel decision,
   * not a settings change — unticking here leaves the registry alone.
   */
  const [selected, setSelected] = useState<string[]>(targets);

  return (
    <AdminCard padded>
      <div className="flex flex-col gap-4 sm:flex-row">
        {row.video_url ? (
          <video
            src={row.video_url}
            poster={row.thumbnail_url ?? undefined}
            controls playsInline preload="metadata"
            className="aspect-[9/16] w-full shrink-0 rounded-xl bg-black object-contain sm:w-[190px]"
          />
        ) : (
          <div className="flex aspect-[9/16] w-full shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:w-[190px]">
            <Clapperboard size={26} className="text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <StatePill state={row.status} />
            <Pill tone="muted">{row.kind === "upload" ? "Uploaded" : row.kind}</Pill>
            {row.duration_seconds !== null && (
              <Pill tone="muted">{Number(row.duration_seconds).toFixed(0)}s</Pill>
            )}
          </div>

          {products.length > 0 && (
            <p className="mb-2 text-[13px] text-[var(--admin-text)]">{products.join(" · ")}</p>
          )}

          <div className="mb-2">
            <PlatformPicker
              available={targets}
              selected={selected}
              onChange={setSelected}
              disabled={pending || publishing}
            />
          </div>

          {row.error_message && (
            <p className="mb-2 text-[12px] text-red-800">{row.error_message}</p>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            aria-label="Reel caption"
            className={`${inputCls} text-[13px] leading-relaxed`}
          />
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            {caption.length}/2200 characters
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <AdminButton
              size="sm" loading={publishing}
              disabled={pending || rebuilding || selected.length === 0}
              onClick={() => {
                setPublishing(true);
                onAct(async () => {
                  try {
                    const res = await approveAndPublishReel(
                      row.id, caption !== row.caption ? caption : undefined, selected,
                    );
                    if (!res.ok) throw new Error(res.detail);
                    return res;
                  } finally {
                    setPublishing(false);
                  }
                }, "Published");
              }}
            >
              <Check size={14} /> {publishing ? "Publishing…" : "Approve & publish"}
            </AdminButton>
            <AdminButton
              size="sm" variant="outline" disabled={pending || publishing || rebuilding}
              onClick={() =>
                onAct(async () => {
                  if (caption !== row.caption) await updateReelCaption(row.id, caption);
                  await approveReel(row.id);
                }, "Approved — it will go out at its next slot")
              }
            >
              Approve for its slot
            </AdminButton>
            <AdminButton
              size="sm" variant="outline" loading={rebuilding} disabled={pending}
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
              size="sm" variant="ghost"
              onClick={() => onAct(() => discardReel(row.id), "Discarded — recoverable under Published")}
            >
              <Trash2 size={14} /> Discard
            </AdminButton>
          </div>

          {publishing && (
            <p className="mt-2 text-[12px] text-[var(--admin-text-muted)]">
              Meta transcodes the video before it goes live — about 45 seconds.
            </p>
          )}
        </div>
      </div>
    </AdminCard>
  );
}

// ─── Published ────────────────────────────────────────────────────────────────

function ReelTable({
  rows, titles, pending, onAct, restorable,
}: {
  rows: SocialReelRow[];
  titles: Record<string, string>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
  restorable?: boolean;
}) {
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<SocialReelRow | null>(null);

  const sorted = [...rows].sort(
    (a, b) => Date.parse(b.posted_at ?? b.created_at) - Date.parse(a.posted_at ?? a.created_at),
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  if (sorted.length === 0) {
    return <EmptyState message="No reels published yet." hint="Approve one under Review to send it live." />;
  }

  return (
    <>
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[14px]">
            <thead className="border-b border-[var(--admin-border)] text-[13px] text-[var(--admin-text-muted)]">
              <tr>
                <th className="px-4 py-3">Reel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Where</th>
                <th className="px-4 py-3">When</th>
                <th className="w-20 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const products = (row.product_ids ?? []).map((id) => titles[id]).filter(Boolean);
                const results = (row.platform_results ?? {}) as Record<
                  string, { ok?: boolean; permalink?: string | null; error?: string }
                >;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setDetail(row)}
                    className="cursor-pointer border-b border-[var(--admin-border)] transition last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-14 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-900">
                          {row.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Clapperboard size={14} className="text-slate-500" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[var(--admin-text)]">
                            {products.length > 0
                              ? products.join(" · ")
                              : row.kind === "upload" ? "Uploaded video" : "Collection reel"}
                          </p>
                          <p className="text-[12px] text-[var(--admin-text-muted)]">
                            {row.kind === "upload" ? "Uploaded" : row.kind}
                            {row.duration_seconds !== null &&
                              ` · ${Number(row.duration_seconds).toFixed(0)}s`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatePill state={row.status} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {Object.entries(results).map(([platform, result]) => (
                          <PlatformChip
                            key={platform}
                            platform={platform}
                            state={result.ok ? "posted" : "failed"}
                            href={result.permalink}
                            error={result.error}
                          />
                        ))}
                        {Object.keys(results).length === 0 && (
                          <span className="text-[13px] text-[var(--admin-text-muted)]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--admin-text-muted)]"
                      title={new Date(row.posted_at ?? row.created_at).toLocaleString("en-GB")}>
                      {relativeTime(row.posted_at ?? row.created_at)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        {restorable ? (
                          <button
                            onClick={() => onAct(() => restoreReel(row.id), "Restored for review")}
                            disabled={pending} title="Restore for review" aria-label="Restore reel"
                            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
                          >
                            <Undo2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onAct(() => discardReel(row.id), "Discarded")}
                            disabled={pending} title="Discard" aria-label="Discard reel"
                            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
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
              {current * PER_PAGE + 1}–{current * PER_PAGE + visible.length} of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <AdminButton size="sm" variant="outline" disabled={current === 0}
                onClick={() => setPage(current - 1)}>Previous</AdminButton>
              <span className="text-[13px] text-[var(--admin-text-muted)]">
                {current + 1} / {pageCount}
              </span>
              <AdminButton size="sm" variant="outline" disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}>Next</AdminButton>
            </div>
          </div>
        )}
      </AdminCard>

      {detail && (
        <ReelDetail row={detail} titles={titles} pending={pending} onAct={onAct}
          onClose={() => setDetail(null)} />
      )}
    </>
  );
}

function ReelDetail({
  row, titles, pending, onAct, onClose,
}: {
  row: SocialReelRow;
  titles: Record<string, string>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
  onClose: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const products = (row.product_ids ?? []).map((id) => titles[id]).filter(Boolean);
  const results = (row.platform_results ?? {}) as Record<
    string, { ok?: boolean; permalink?: string | null; error?: string }
  >;

  return (
    <Modal title={products.length > 0 ? products.join(" · ") : "Reel"} onClose={onClose} wide>
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        {row.video_url ? (
          <video
            src={row.video_url}
            poster={row.thumbnail_url ?? undefined}
            controls autoPlay playsInline
            className="aspect-[9/16] w-full rounded-xl bg-black object-contain"
          />
        ) : (
          <div className="flex aspect-[9/16] w-full items-center justify-center rounded-xl bg-slate-100">
            <Clapperboard size={26} className="text-slate-400" />
          </div>
        )}

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatePill state={row.status} />
            <Pill tone="muted">{row.kind === "upload" ? "Uploaded" : row.kind}</Pill>
            {row.duration_seconds !== null && (
              <Pill tone="muted">{Number(row.duration_seconds).toFixed(0)}s</Pill>
            )}
          </div>

          {Object.keys(results).length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                Where it went
              </p>
              <div className="space-y-2">
                {Object.entries(results).map(([platform, result]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <PlatformChip
                      platform={platform}
                      state={result.ok ? "posted" : "failed"}
                      href={result.permalink}
                      error={result.error}
                    />
                    <div className="min-w-0 flex-1">
                      <StatePill state={result.ok ? "posted" : "failed"} />
                      {result.error && (
                        <p className="mt-1 break-words text-[12px] text-red-800">{result.error}</p>
                      )}
                    </div>
                    {result.permalink && (
                      <a href={result.permalink} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-[var(--admin-accent)]"
                        aria-label={`Open on ${platform}`}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {row.caption && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">Caption</p>
              <p className="whitespace-pre-wrap rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3 text-[13px] leading-relaxed text-[var(--admin-text)]">
                {row.caption}
              </p>
            </div>
          )}

          {(row.status === "approved" || row.status === "failed") && (
            <AdminButton
              size="sm" loading={publishing} disabled={pending}
              onClick={() => {
                setPublishing(true);
                onAct(async () => {
                  try {
                    const res = await publishReelNow(row.id);
                    if (!res.ok) throw new Error(res.detail);
                    onClose();
                    return res;
                  } finally {
                    setPublishing(false);
                  }
                }, "Published");
              }}
            >
              {row.status === "failed" ? "Try publishing again" : "Publish now"}
            </AdminButton>
          )}
        </div>
      </div>
    </Modal>
  );
}
