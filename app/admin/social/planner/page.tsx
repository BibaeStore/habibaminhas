"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Trash2, Copy, Check, AlertTriangle, Images, Clapperboard, Play, Pause,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import {
  fetchPlans, fetchPlanContext, fetchPlanProgress, createPlan, updatePlan,
  duplicatePlan, deletePlan, activatePlan, deactivatePlan,
} from "@/lib/actions/social-plans";
import {
  validatePlan, expandPlan, describePlan, suggestDays, weeklyCapacity,
  weeklyToMonthly, monthlyToWeekly,
  type PlanRow, type PlanIssue,
} from "@/lib/social/plan";
import {
  Field, Pill, SectionHeading, EmptyState, DayPicker, TimeList, Toast, inputCls,
  SlotWindowEditor,
} from "@/components/admin/social/ui";
import { WeekCalendar, mondayOf, shiftWeek } from "@/components/admin/social/week-calendar";
import { useAct } from "@/components/admin/social/use-act";

/**
 * Planner — targets in, schedule out.
 *
 * The four ideas here are deliberately kept apart, because blurring them is what made the
 * old Schedule tab hard to reason about: a **plan** is a named saved configuration, a
 * **target** is how much content per week, a **schedule** is which days and times that
 * lands on, and **progress** is how much has actually gone out.
 *
 * Targets are what a month is planned in. The schedule is derived from them, and shown
 * back immediately — because the scheduler is capacity-driven (it fires every chosen time
 * on every chosen day), a plan whose target and schedule disagree does not miss slightly,
 * it quietly does something else entirely. That is why the mismatch is an error here and
 * not a warning.
 */

async function load() {
  const [plans, context, progress] = await Promise.all([
    fetchPlans(),
    fetchPlanContext(),
    fetchPlanProgress(),
  ]);
  return { plans, context, progress };
}

export default function SocialPlannerPage() {
  const { act, pending, notice, setNotice } = useAct();
  const { data, error } = useQuery({ queryKey: ["social-plans"], queryFn: load });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (error) {
    return (
      <AdminCard padded className="border-red-200 bg-red-50">
        <p className="text-[14px] text-red-800">{(error as Error).message}</p>
      </AdminCard>
    );
  }
  if (!data) return <EmptyState message="Loading…" />;

  const { plans, context, progress } = data;
  const selected = plans.find((p) => p.id === selectedId) ?? plans.find((p) => p.is_active) ?? plans[0] ?? null;

  return (
    <div className="space-y-8">
      <Toast message={notice} onClose={() => setNotice(null)} />

      {progress && (
        <section>
          <SectionHeading title="This week" hint={progress.summary} />
          <div className="grid gap-3 sm:grid-cols-2">
            <ProgressBar
              label="Photo posts"
              icon={<Images size={15} />}
              done={progress.photos.done}
              target={progress.photos.target}
            />
            <ProgressBar
              label="Reels"
              icon={<Clapperboard size={15} />}
              done={progress.reels.done}
              target={progress.reels.target}
            />
          </div>
        </section>
      )}

      <section>
        <SectionHeading
          title="Your plans"
          hint="Only one runs at a time. Activating a plan rewrites the posting schedule."
          action={
            <AdminButton
              size="sm"
              leadingIcon={<Plus size={15} />}
              loading={pending}
              onClick={() =>
                act(async () => {
                  const created = await createPlan();
                  setSelectedId(created.id);
                }, "Plan created — set its targets below")
              }
            >
              New plan
            </AdminButton>
          }
        />

        {plans.length === 0 ? (
          <EmptyState
            message="No plans yet."
            hint="Create one to set how much goes out each week."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selected?.id === plan.id}
                pending={pending}
                onSelect={() => setSelectedId(plan.id)}
                onAct={act}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <PlanEditor
          key={selected.id + selected.updated_at}
          plan={selected}
          context={context}
          pending={pending}
          onAct={act}
        />
      )}
    </div>
  );
}

function ProgressBar({
  label, icon, done, target,
}: {
  label: string;
  icon: React.ReactNode;
  done: number;
  target: number;
}) {
  const onTrack = target === 0 || done >= target;
  const pct = target > 0 ? Math.min(100, (done / target) * 100) : 0;
  return (
    <AdminCard padded>
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-text-muted)]">
          {icon} {label}
        </p>
        <p className="text-[15px] font-semibold text-[var(--admin-text)]">
          {done} <span className="font-normal text-[var(--admin-text-muted)]">of {target}</span>
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
        role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={target}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all ${onTrack ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </AdminCard>
  );
}

function PlanCard({
  plan, selected, pending, onSelect, onAct,
}: {
  plan: PlanRow;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  return (
    <AdminCard
      padded
      className={`cursor-pointer transition ${
        selected ? "ring-2 ring-[var(--admin-accent)]" : "hover:border-slate-400"
      }`}
    >
      <div onClick={onSelect} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onSelect(); }}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-[var(--admin-text)]">{plan.name}</h3>
          {plan.is_active
            ? <Pill tone="ok"><Check size={11} strokeWidth={3} /> Active</Pill>
            : <Pill tone="muted">Draft</Pill>}
        </div>
        <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{describePlan(plan)}</p>
        {(plan.active_from || plan.active_to) && (
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            {plan.active_from ?? "any time"} → {plan.active_to ?? "open-ended"}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--admin-border)] pt-3">
        {plan.is_active ? (
          <AdminButton
            size="sm" variant="outline" loading={pending} leadingIcon={<Pause size={14} />}
            onClick={() => onAct(() => deactivatePlan(plan.id), `“${plan.name}” stopped planning — the current schedule stays in place`)}
          >
            Deactivate
          </AdminButton>
        ) : (
          <AdminButton
            size="sm" loading={pending} leadingIcon={<Play size={14} />}
            onClick={() => onAct(() => activatePlan(plan.id), `“${plan.name}” is now running the schedule`)}
          >
            Activate
          </AdminButton>
        )}
        <button
          onClick={() => onAct(() => duplicatePlan(plan.id), "Copied")}
          disabled={pending}
          title="Duplicate"
          aria-label={`Duplicate ${plan.name}`}
          className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={() => onAct(() => deletePlan(plan.id), `“${plan.name}” deleted`)}
          disabled={pending || plan.is_active}
          title={plan.is_active ? "Activate another plan before deleting this one" : "Delete"}
          aria-label={`Delete ${plan.name}`}
          className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </AdminCard>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function PlanEditor({
  plan, context, pending, onAct,
}: {
  plan: PlanRow;
  context: Awaited<ReturnType<typeof fetchPlanContext>>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [draft, setDraft] = useState<PlanRow>(plan);

  const set = <K extends keyof PlanRow>(key: K, value: PlanRow[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  /*
   * Changing a target moves the days with it. The scheduler publishes days × times, so a
   * target the schedule cannot deliver is not a near miss — it is a different plan. Doing
   * this automatically means the common case never produces an error at all, while the
   * days remain editable afterwards for anyone who wants a specific pattern.
   */
  function setTarget(kind: "photo" | "reel", perWeek: number) {
    const n = Math.max(0, Math.min(21, perWeek));
    if (kind === "photo") {
      const times = draft.photo_times.length || 1;
      setDraft((d) => ({
        ...d,
        photos_per_week: n,
        photo_days: suggestDays(Math.ceil(n / times)),
      }));
    } else {
      const times = draft.reel_times.length || 1;
      setDraft((d) => ({
        ...d,
        reels_per_week: n,
        reel_days: suggestDays(Math.ceil(n / times)),
      }));
    }
  }

  const issues = validatePlan(draft, context);
  const errors = issues.filter((i) => i.level === "error");
  const dirty = JSON.stringify(draft) !== JSON.stringify(plan);

  return (
    <section className="space-y-4">
      <SectionHeading
        title={`Editing “${plan.name}”`}
        hint={plan.is_active ? "This plan is live — saving changes the schedule immediately." : undefined}
        action={
          <AdminButton
            loading={pending}
            disabled={!dirty || errors.length > 0}
            onClick={() =>
              onAct(
                () =>
                  updatePlan(draft.id, {
                    name: draft.name,
                    active_from: draft.active_from,
                    active_to: draft.active_to,
                    photos_per_week: draft.photos_per_week,
                    photo_days: draft.photo_days,
                    photo_times: draft.photo_times,
                    photo_window_start: draft.photo_window_start,
                    photo_window_end: draft.photo_window_end,
                    reels_per_week: draft.reels_per_week,
                    reel_days: draft.reel_days,
                    reel_times: draft.reel_times,
                    notes: draft.notes,
                  }),
                plan.is_active ? "Saved — the schedule has been updated" : "Saved",
              )
            }
          >
            {errors.length > 0 ? "Fix the errors first" : dirty ? "Save plan" : "Saved"}
          </AdminButton>
        }
      />

      {issues.length > 0 && <IssueList issues={issues} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard padded>
          <Field label="Plan name">
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="August — Eid push"
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Runs from" hint="Leave blank to start immediately.">
              <input
                type="date" className={inputCls}
                value={draft.active_from ?? ""}
                onChange={(e) => set("active_from", e.target.value || null)}
              />
            </Field>
            <Field label="Until" hint="Leave blank for open-ended.">
              <input
                type="date" className={inputCls}
                value={draft.active_to ?? ""}
                onChange={(e) => set("active_to", e.target.value || null)}
              />
            </Field>
          </div>

          <Field label="Notes" hint="Why this plan exists — only for your reference.">
            <textarea
              rows={2}
              className={`${inputCls} mt-4 text-[13px]`}
              value={draft.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              placeholder="Eid campaign — heavier on reels than usual."
            />
          </Field>
        </AdminCard>

        <SchedulePreview plan={draft} />
      </div>

      <CadenceEditor
        kind="photo"
        title="Photo posts"
        icon={<Images size={16} />}
        perWeek={draft.photos_per_week}
        days={draft.photo_days}
        times={draft.photo_times}
        onTarget={(n) => setTarget("photo", n)}
        onDays={(d) => set("photo_days", d)}
        onTimes={(t) => set("photo_times", t)}
        windowStart={draft.photo_window_start}
        windowEnd={draft.photo_window_end}
        onWindow={(start, end) =>
          setDraft((d) => ({ ...d, photo_window_start: start, photo_window_end: end }))
        }
      />

      <CadenceEditor
        kind="reel"
        title="Reels"
        icon={<Clapperboard size={16} />}
        perWeek={draft.reels_per_week}
        days={draft.reel_days}
        times={draft.reel_times}
        onTarget={(n) => setTarget("reel", n)}
        onDays={(d) => set("reel_days", d)}
        onTimes={(t) => set("reel_times", t)}
      />
    </section>
  );
}

function IssueList({ issues }: { issues: PlanIssue[] }) {
  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={`flex items-start gap-2.5 rounded-lg border-2 px-3 py-2.5 ${
            issue.level === "error"
              ? "border-red-300 bg-red-50"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          <AlertTriangle
            size={16}
            className={`mt-0.5 shrink-0 ${issue.level === "error" ? "text-red-700" : "text-amber-700"}`}
          />
          <p className={`text-[13px] ${issue.level === "error" ? "text-red-800" : "text-amber-900"}`}>
            {issue.message}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Target, days and times for one content type. */
function CadenceEditor({
  kind, title, icon, perWeek, days, times, onTarget, onDays, onTimes,
  windowStart = null, windowEnd = null, onWindow,
}: {
  kind: "photo" | "reel";
  title: string;
  icon: React.ReactNode;
  perWeek: number;
  days: number[];
  times: string[];
  onTarget: (n: number) => void;
  onDays: (days: number[]) => void;
  onTimes: (times: string[]) => void;
  /** Photos only — reels stay on fixed times, so a reel cadence cannot drift into a photo. */
  windowStart?: string | null;
  windowEnd?: string | null;
  onWindow?: (start: string | null, end: string | null) => void;
}) {
  // A window posts once per posting day, so capacity is the day count and the times list is
  // inert. Counting the list here would show a figure the scheduler does not honour.
  const usingWindow = Boolean(onWindow && windowStart && windowEnd);
  const capacity = usingWindow ? days.length : weeklyCapacity(days, times);

  return (
    <AdminCard padded>
      <h3 className="mb-4 inline-flex items-center gap-2 text-[16px] font-semibold text-[var(--admin-text)]">
        {icon} {title}
      </h3>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="space-y-4">
          <Field label="Per week">
            <input
              type="number" min={0} max={21} className={inputCls}
              value={perWeek}
              onChange={(e) => onTarget(Number(e.target.value))}
            />
          </Field>
          <Field label="Per month" hint="Kept in step with the weekly figure.">
            <input
              type="number" min={0} max={90} className={inputCls}
              value={weeklyToMonthly(perWeek)}
              onChange={(e) => onTarget(monthlyToWeekly(Number(e.target.value)))}
            />
          </Field>
          <p
            className={`text-[13px] ${
              capacity === perWeek ? "text-[var(--admin-text-muted)]" : "font-medium text-red-700"
            }`}
          >
            This schedule sends <strong>{capacity}</strong> a week.
          </p>
        </div>

        <div className="space-y-4">
          <Field label="Days" hint="Chosen for you when the target changes — adjust freely.">
            <DayPicker days={days} onChange={onDays} />
          </Field>

          {!usingWindow && (
            <Field label="Times" hint="Each time fires on each chosen day.">
              <TimeList
                times={times}
                onChange={onTimes}
                fallback={kind === "reel" ? "20:00" : "19:00"}
                label={`${title} time`}
              />
            </Field>
          )}

          {onWindow && (
            <SlotWindowEditor
              start={windowStart}
              end={windowEnd}
              onChange={onWindow}
            />
          )}
        </div>
      </div>
    </AdminCard>
  );
}

// ─── Schedule preview ─────────────────────────────────────────────────────────

/**
 * What the plan actually produces, week by week.
 *
 * Derived from the same `expandPlan` the compiler uses, so the calendar cannot claim
 * something the scheduler would not do.
 */
function SchedulePreview({ plan }: { plan: PlanRow }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const items = expandPlanToCalendar(plan, weekStart);

  return (
    <AdminCard padded>
      <WeekCalendar
        items={items}
        weekStart={weekStart}
        onShift={(w) => setWeekStart(w === "today" ? mondayOf() : shiftWeek(weekStart, w))}
        emptyHint="Nothing scheduled this week"
      />
    </AdminCard>
  );
}

/** The same expansion the compiler uses, so the calendar cannot promise something the scheduler would not do. */
function expandPlanToCalendar(plan: PlanRow, weekStart: string) {
  return expandPlan(plan, weekStart, shiftWeek(weekStart, 1)).map((s) => ({
    date: s.date,
    time: s.time,
    kind: s.kind,
  }));
}
