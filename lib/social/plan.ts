import type { Tables } from "@/lib/supabase/types";
import {
  parseWindow,
  pickSlotForDate,
  REEL_COLLISION_GAP_MINUTES,
  type SlotWindow,
} from "./slot-window";

export type PlanRow = Tables<"social_plans">;

/**
 * The plan's photo window, or null if it posts at fixed times.
 *
 * Everything downstream branches on this one function, so "does this plan use a window?" has
 * exactly one answer and the planner, the validator and the calendar cannot disagree about it.
 *
 * The step is read from the plan rather than passed in. It used to be a constant defaulted in
 * this module, which meant the planner previewed a window at one resolution while the
 * scheduler ran it at another — the calendar could show times that would never fire. Keeping
 * it on the row makes a plan self-describing, and `compilePlan` carries it across to
 * `social_settings` exactly as it already does for days and times.
 */
export function planPhotoWindow(
  plan: Pick<PlanRow, "photo_window_start" | "photo_window_end" | "photo_window_step_minutes">,
): SlotWindow | null {
  return parseWindow(
    plan.photo_window_start,
    plan.photo_window_end,
    plan.photo_window_step_minutes,
  );
}

/**
 * Photo posts a window-driven plan produces per day.
 *
 * Always one. A window is a single draw, not a list — which is exactly why capacity arithmetic
 * has to ask this rather than count `photo_times`, a list the window makes irrelevant.
 */
export const PHOTOS_PER_DAY_IN_WINDOW = 1;

/**
 * Plans — targets in, schedule out.
 *
 * A plan is what a marketing month is actually written in: "4 photos and 2 reels a week".
 * The scheduler, however, thinks in slots — a set of times it fires at. This module is the
 * translation between the two, and it exists as pure functions so the arithmetic can be
 * reasoned about without a database or a running scheduler.
 *
 * The one idea worth holding on to: **the scheduler is capacity-driven, the plan is
 * target-driven.** The scheduler posts at every configured time on every allowed day, so
 * it publishes `days × times` per week no matter what number the plan carries. A plan
 * whose target and capacity disagree is therefore not a plan that misses slightly — it is
 * a plan that silently does something other than what it says. `validatePlan` treats that
 * as an error rather than a warning for exactly that reason.
 */

/** 0 = Sunday, matching `Date.getDay()` and `social_settings.post_days`. */
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Monday-first ordering, which is how a working schedule is read. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/**
 * Average weeks in a month (365.25 / 12 / 7).
 *
 * Monthly figures are *derived* rather than stored. Campaigns are budgeted monthly but
 * schedules run weekly, and storing both invites the two to drift apart — the same class
 * of bug as the platform flag that meant two things at once.
 */
export const WEEKS_PER_MONTH = 4.348;

export function weeklyToMonthly(perWeek: number): number {
  return Math.round(perWeek * WEEKS_PER_MONTH);
}

export function monthlyToWeekly(perMonth: number): number {
  return Math.max(0, Math.round(perMonth / WEEKS_PER_MONTH));
}

// ─── Compilation ──────────────────────────────────────────────────────────────

export type CompiledSchedule = {
  slot_times: string[];
  post_days: number[];
  reel_times: string[];
  reel_days: number[];
  /**
   * Carried through so activating or saving a plan cannot silently drop the window.
   *
   * `writeScheduleFromPlan` overwrites `social_settings` wholesale. Before these two fields
   * existed, the first save in the planner would have reverted a randomised schedule to a
   * fixed time with nothing on screen to say it had happened.
   */
  slot_window_start: string | null;
  slot_window_end: string | null;
  /** Has to match the pg_cron tick, or a draw simply lands on the following one. */
  slot_window_step_minutes: number;
};

/**
 * A plan, expressed in the shape the existing scheduler already understands.
 *
 * Nothing about `runScheduledPost` is rewritten — the plan simply becomes the thing that
 * writes its settings. That keeps the blast radius small, and it means a plan being
 * deleted or deactivated leaves the last compiled schedule in place rather than stopping
 * posting altogether.
 */
export function compilePlan(plan: PlanRow): CompiledSchedule {
  const window = planPhotoWindow(plan);
  const reelWindow = parseWindow(
    plan.reel_window_start,
    plan.reel_window_end,
    plan.reel_window_step_minutes,
  );
  return {
    // `slot_times` is still written even in window mode. It costs nothing, and it is what the
    // scheduler falls back to if the window is ever cleared or fails to parse — so the
    // fallback lands on the owner's own last fixed schedule rather than on a hardcoded guess.
    slot_times: normaliseTimes(plan.photo_times),
    post_days: normaliseDays(plan.photo_days),
    reel_times: normaliseTimes(plan.reel_times),
    reel_days: normaliseDays(plan.reel_days),
    slot_window_start: window?.start ?? null,
    slot_window_end: window?.end ?? null,
    slot_window_step_minutes: plan.photo_window_step_minutes,
  };
}

function normaliseTimes(times: string[] | null): string[] {
  const cleaned = (times ?? [])
    .map((t) => t.trim())
    .filter((t) => /^\d{1,2}:\d{2}$/.test(t))
    .map((t) => (t.length === 4 ? `0${t}` : t));
  return [...new Set(cleaned)].sort();
}

function normaliseDays(days: number[] | null): number[] {
  return [...new Set((days ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
}

/** How many posts a day/time combination actually produces per week. */
export function weeklyCapacity(days: number[] | null, times: string[] | null): number {
  return normaliseDays(days).length * normaliseTimes(times).length;
}

/**
 * Days spread as evenly as possible across the week, Monday first.
 *
 * Used when a target changes, so the schedule follows the number rather than the owner
 * having to work out that "3 a week" means Monday, Wednesday and Saturday. Clustering
 * three posts on consecutive days and then going quiet for four reads as an abandoned
 * account, which is the opposite of what a cadence is for.
 */
export function suggestDays(count: number): number[] {
  const n = Math.max(0, Math.min(7, Math.trunc(count)));
  if (n === 0) return [];
  if (n >= 7) return [0, 1, 2, 3, 4, 5, 6];
  const picked = new Set<number>();
  for (let i = 0; i < n; i++) picked.add(WEEK_ORDER[Math.round((i * 7) / n) % 7]);
  // Rounding can collide; fill from the Monday-first order until the count is met.
  for (const day of WEEK_ORDER) {
    if (picked.size >= n) break;
    picked.add(day);
  }
  return [...picked].sort();
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type PlanIssue = {
  level: "error" | "warning";
  field: "photos" | "reels" | "period" | "general";
  message: string;
};

export type PlanContext = {
  /** Products eligible for a photo post right now. */
  eligibleProducts: number;
  /** Products with the 3+ images a single-product reel needs. */
  eligibleReelProducts: number;
  /** `social_settings.max_posts_per_day` — the hard safety ceiling. */
  dailyCeiling: number;
  /** Other plans, for overlap checking. */
  otherPlans?: Array<Pick<PlanRow, "id" | "name" | "active_from" | "active_to">>;
};

/**
 * The ways a plan fails quietly.
 *
 * Each of these produces a schedule that runs without error while doing something other
 * than what the owner believes. They are surfaced as the plan is typed rather than
 * discovered a fortnight later from the posting history.
 */
export function validatePlan(plan: PlanRow, ctx: PlanContext): PlanIssue[] {
  const issues: PlanIssue[] = [];

  for (const kind of ["photos", "reels"] as const) {
    const isPhoto = kind === "photos";
    const target = isPhoto ? plan.photos_per_week : plan.reels_per_week;
    const days = isPhoto ? plan.photo_days : plan.reel_days;
    const times = isPhoto ? plan.photo_times : plan.reel_times;
    const noun = isPhoto ? "photo posts" : "reels";

    if (target <= 0) continue;

    /*
     * A photo window replaces the times list entirely: one draw per posting day, so capacity
     * is the day count. Counting `photo_times` here instead would report a plan as balanced
     * while the scheduler published a different number — the exact class of quiet mismatch
     * this validator exists to catch.
     */
    const window = isPhoto ? planPhotoWindow(plan) : null;
    const dayCount = normaliseDays(days).length;
    const timeCount = window ? PHOTOS_PER_DAY_IN_WINDOW : normaliseTimes(times).length;
    const capacity = dayCount * timeCount;

    if (timeCount === 0) {
      issues.push({
        level: "error",
        field: kind,
        message: `No posting time set for ${noun}, so none will go out.`,
      });
    } else if (dayCount === 0) {
      issues.push({
        level: "error",
        field: kind,
        message: `No days chosen for ${noun}, so none will go out.`,
      });
    } else if (capacity < target) {
      issues.push({
        level: "error",
        field: kind,
        message: window
          ? `A random time posts once a day, so ${dayCount} ${dayCount === 1 ? "day" : "days"} gives ${capacity} ${noun} a week, but the target is ${target}. Add a day — otherwise only ${capacity} will go out.`
          : `${dayCount} ${dayCount === 1 ? "day" : "days"} × ${timeCount} ${timeCount === 1 ? "time" : "times"} gives ${capacity} ${noun} a week, but the target is ${target}. Add a day or a second time — otherwise only ${capacity} will go out.`,
      });
    } else if (capacity > target) {
      issues.push({
        level: "error",
        field: kind,
        message: window
          ? `A random time posts once on each of ${dayCount} days, so this schedule publishes ${capacity} ${noun} a week, more than the target of ${target}. Remove a day or raise the target.`
          : `This schedule posts ${capacity} ${noun} a week, more than the target of ${target}. The scheduler fires every chosen time on every chosen day, so it will publish ${capacity}, not ${target}.`,
      });
    }
  }

  // The hard daily ceiling is a safety net, not a target — a plan that exceeds it will be
  // silently truncated on the day rather than rejected.
  const photosPerDay = planPhotoWindow(plan)
    ? PHOTOS_PER_DAY_IN_WINDOW
    : normaliseTimes(plan.photo_times).length;
  if (photosPerDay > ctx.dailyCeiling) {
    issues.push({
      level: "error",
      field: "photos",
      message: `${photosPerDay} photo posts on a single day exceeds the hard daily ceiling of ${ctx.dailyCeiling}. Raise the ceiling in Settings or remove a time.`,
    });
  }

  // Catalogue runway. Repetition is not an error — it is a judgement about how quickly the
  // audience sees the same garment twice.
  if (plan.photos_per_week > 0 && ctx.eligibleProducts > 0) {
    const weeks = ctx.eligibleProducts / plan.photos_per_week;
    if (weeks < 3) {
      issues.push({
        level: "warning",
        field: "photos",
        message: `${ctx.eligibleProducts} eligible products at ${plan.photos_per_week} a week repeats the catalogue every ${weeks.toFixed(1)} weeks. Add products or lower the target if that feels too soon.`,
      });
    }
  }
  if (plan.photos_per_week > 0 && ctx.eligibleProducts === 0) {
    issues.push({
      level: "error",
      field: "photos",
      message: "No products are eligible to post. Check the category and stock filters in Settings.",
    });
  }

  if (plan.reels_per_week > 0 && ctx.eligibleReelProducts === 0) {
    issues.push({
      level: "warning",
      field: "reels",
      message:
        "No product has the 3+ images a single-product reel needs. Collection reels still work — they use one image each.",
    });
  }

  // Reels cannot be generated on a schedule: encoding runs on the owner's machine, not the
  // server. Saying so here is more honest than a plan that promises two a week and
  // produces none.
  if (plan.reels_per_week > 0) {
    issues.push({
      level: "warning",
      field: "reels",
      message: `Reels publish automatically but are not *made* automatically — video encoding runs on your computer. Generate a batch when you are at it, and the plan will send ${plan.reels_per_week} a week out from the approved queue.`,
    });
  }

  if (plan.active_from && plan.active_to && plan.active_to < plan.active_from) {
    issues.push({
      level: "error",
      field: "period",
      message: "The end date is before the start date.",
    });
  }

  for (const other of ctx.otherPlans ?? []) {
    if (other.id === plan.id) continue;
    if (overlaps(plan, other)) {
      issues.push({
        level: "warning",
        field: "period",
        message: `Its active period overlaps “${other.name}”. Only one plan runs at a time, so whichever is activated wins.`,
      });
    }
  }

  return issues;
}

function overlaps(
  a: Pick<PlanRow, "active_from" | "active_to">,
  b: Pick<PlanRow, "active_from" | "active_to">,
): boolean {
  // An open end means "runs indefinitely", so treat missing bounds as infinite.
  const aFrom = a.active_from ?? "0000-01-01";
  const aTo = a.active_to ?? "9999-12-31";
  const bFrom = b.active_from ?? "0000-01-01";
  const bTo = b.active_to ?? "9999-12-31";
  return aFrom <= bTo && bFrom <= aTo;
}

// ─── Expansion, for the grids ─────────────────────────────────────────────────

export type PlannedSlot = {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  time: string;
  /** "photo" is the carousel, for continuity with the calendar that predates the split. */
  kind: "photo" | "static" | "reel";
};

/**
 * Every slot a plan produces between two dates.
 *
 * Dates are handled as plain `YYYY-MM-DD` strings stepped through UTC noon, never as local
 * `Date` arithmetic: stepping by 86,400,000 milliseconds across a daylight-saving boundary
 * silently skips or repeats a day, and a calendar that loses a Wednesday is worse than no
 * calendar.
 */
export function expandPlan(plan: PlanRow, fromISO: string, toISO: string): PlannedSlot[] {
  const photoDays = new Set(normaliseDays(plan.photo_days));
  const reelDays = new Set(normaliseDays(plan.reel_days));
  const staticDays = new Set(normaliseDays(plan.static_days));
  const photoTimes = normaliseTimes(plan.photo_times);
  const reelTimes = normaliseTimes(plan.reel_times);
  const staticTimes = normaliseTimes(plan.static_times);

  // The static stream draws from its own window, exactly as the other two do.
  const staticWindow = parseWindow(
    plan.static_window_start,
    plan.static_window_end,
    plan.static_window_step_minutes,
  );

  /*
   * In window mode the calendar shows the *actual* time each day will post, not a placeholder.
   * That is the payoff of deriving the time from the date rather than rolling it at runtime:
   * the planner can compute next Friday's slot today, and it will be the time that fires.
   */
  const window = planPhotoWindow(plan);
  const reelWindow = parseWindow(
    plan.reel_window_start,
    plan.reel_window_end,
    plan.reel_window_step_minutes,
  );

  const out: PlannedSlot[] = [];
  const start = Date.parse(`${fromISO}T12:00:00Z`);
  const end = Date.parse(`${toISO}T12:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return out;

  for (let t = start; t <= end; t += 86_400_000) {
    const day = new Date(t);
    const date = day.toISOString().slice(0, 10);

    // Outside the plan's active period it produces nothing.
    if (plan.active_from && date < plan.active_from) continue;
    if (plan.active_to && date > plan.active_to) continue;

    const weekday = day.getUTCDay();
    if (plan.photos_per_week > 0 && photoDays.has(weekday)) {
      if (window) {
        // Same call the scheduler makes, including the reel-collision guard, so the calendar
        // shows the time that will actually fire rather than one the guard later moves.
        const drawn = pickSlotForDate(date, window, {
          days: [...reelDays],
          times: reelTimes,
          gapMinutes: REEL_COLLISION_GAP_MINUTES,
        });
        if (drawn) out.push({ date, time: drawn, kind: "photo" });
      } else {
        for (const time of photoTimes) out.push({ date, time, kind: "photo" });
      }
    }
    /*
     * Reels and statics resolve their windows the same way the scheduler does, so the calendar
     * shows the time that will actually fire. Before this they fell back to the fixed
     * `reel_times` / `static_times` while the scheduler used the window — the calendar was
     * quietly showing a different schedule from the one running.
     */
    if (plan.reels_per_week > 0 && reelDays.has(weekday)) {
      if (reelWindow) {
        const drawn = pickSlotForDate(date, reelWindow, null);
        if (drawn) out.push({ date, time: drawn, kind: "reel" });
      } else {
        for (const time of reelTimes) out.push({ date, time, kind: "reel" });
      }
    }

    if (plan.statics_per_week > 0 && staticDays.has(weekday)) {
      if (staticWindow) {
        const drawn = pickSlotForDate(date, staticWindow, null);
        if (drawn) out.push({ date, time: drawn, kind: "static" });
      } else {
        for (const time of staticTimes) out.push({ date, time, kind: "static" });
      }
    }
  }

  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

/** A one-line summary of what a plan does, for the plan list. */
export function describePlan(plan: PlanRow): string {
  const parts: string[] = [];
  if (plan.photos_per_week > 0) {
    parts.push(`${plan.photos_per_week} photo${plan.photos_per_week === 1 ? "" : "s"}`);
  }
  if (plan.reels_per_week > 0) {
    parts.push(`${plan.reels_per_week} reel${plan.reels_per_week === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) return "Nothing scheduled";
  return `${parts.join(" + ")} a week · about ${weeklyToMonthly(
    plan.photos_per_week + plan.reels_per_week,
  )} a month`;
}
