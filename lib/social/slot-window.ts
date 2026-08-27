/**
 * One posting time per day, drawn from a window instead of pinned to a constant.
 *
 * Why not `Math.random()`
 * -----------------------
 * The scheduler is not a job that runs once a day — pg_cron ticks every 15 minutes and the
 * route decides for itself whether a slot is due. A time rolled inside that route would be
 * re-rolled on every tick, so "is a slot due?" would get a different answer ninety-six times
 * a day and the daily post would fire repeatedly. Anything stateful enough to avoid that (a
 * nightly UPDATE, a `todays_slot` column) then has to be kept correct across redeploys,
 * restores and manual edits.
 *
 * So the time is *derived* from the calendar date instead. Same date in, same time out, every
 * tick, forever, with no stored state and nothing to keep in sync. It can be computed ahead
 * for the planner grid and behind for the history view, and redeploying mid-evening cannot
 * move today's slot.
 *
 * A chain of permutations, not independent rolls
 * ----------------------------------------------
 * Independent daily rolls clump: you would routinely see the same time twice in three days
 * while other times went untouched for a month. So each cycle of N days is a permutation of
 * all N times — every time used exactly once per cycle — and, crucially, each cycle is
 * derived from the one before it under a **displacement bound**.
 *
 * That bound is the entire spacing guarantee, and it is one line of arithmetic. If a time is
 * at position `p` in one cycle and `q` in the next, the days between its two uses are:
 *
 *     gap = (N - p) + q
 *
 * so requiring `gap >= G` is exactly `q >= p - (N - G)`: **a time may drift later in the order
 * freely, but may never jump more than `N - G` places earlier.** Because that is a statement
 * about consecutive cycles, it holds across every boundary by construction — there is no seam
 * to patch, and no special case for the first day of a cycle.
 *
 * The owner's requirement is no repeat inside a month, so G is set above 30 (see
 * `displacementBound`). For the live 18:00–23:00 window at 5 minutes, N = 61 and the measured
 * result over ten years is: **no rolling 30-day stretch contains a repeated time**, minimum
 * gap 33 days, zero reel collisions, every time used within one of the average.
 *
 * Why N matters, and what sets it
 * -------------------------------
 * N decides whether "a unique time every day for a month" is even reachable, and N comes from
 * the *step*, not the width of the window: five hours at 15-minute spacing holds only 21
 * times, and 21 values cannot cover 30 days. The step in turn cannot be finer than the pg_cron
 * tick, because the scheduler only asks whether a slot is due when the job wakes it — at a
 * 15-minute tick a 19:37 draw simply publishes at 19:45. Step and tick move together.
 *
 * The tick has a floor of its own: the route's `maxDuration` is 300 seconds, so a tick of five
 * minutes or more cannot overlap a still-running invocation of itself. Three minutes can,
 * which is why 5 is the setting and not 3 — the spacing requirement is met either way, and 5
 * removes a duplicate-post failure mode instead of needing a lock to contain it.
 *
 * The degenerate case is a reel every day at a time the window is built around: there is then
 * no non-reel day to trade with, and the guard cannot place every photo clear of every reel.
 * It still posts — it just stops being able to promise separation.
 */

/** A validated window. Times are "HH:MM" in the account's timezone, both bounds inclusive. */
export type SlotWindow = {
  start: string;
  end: string;
  stepMinutes: number;
};

/**
 * The reel schedule, so photo draws can be kept clear of it.
 *
 * The whole schedule rather than "today's times to avoid", because the collision has to be
 * resolved by *exchanging* two days inside the cycle, and that means knowing which other days
 * in the cycle are reel days. Resolving it one day at a time is what the first version did,
 * and it was wrong: a 45-minute exclusion removes 7 of the 13 times, so every displaced draw
 * landed on the same 6 survivors and times began repeating a day apart.
 */
export type ReelSchedule = {
  /** Weekdays reels post on, 0 = Sunday. */
  days: number[];
  times: string[];
  gapMinutes: number;
};

const DAY_MS = 86_400_000;

/**
 * How close a photo may be drawn to a reel slot before it is moved.
 *
 * Photos were pinned at 19:00 and reels at 20:00, so they could never collide. Drawing the
 * photo time from an evening window makes a Monday or Friday clash possible for the first
 * time, and two posts to the same account inside a minute reads worse than either alone.
 *
 * Lives here rather than in config.ts because the planner is a client component: config.ts
 * pulls in the Supabase admin client, and importing it from shared plan code would drag
 * server-only credentials into the browser bundle.
 */
export const REEL_COLLISION_GAP_MINUTES = 45;

// ─── Parsing ──────────────────────────────────────────────────────────────────

/** "19:00" -> 1140. Null for anything malformed, so a bad value disables rather than guesses. */
export function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 1140 -> "19:00". */
export function toTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * A window, or null if it is not usable.
 *
 * Returning null rather than throwing is what makes the feature opt-in: every caller reads
 * "no window" as "fall back to the fixed `slot_times` list", which is the behaviour that
 * predates this file. A half-configured window can therefore never stop the account posting.
 */
export function parseWindow(
  start: string | null | undefined,
  end: string | null | undefined,
  stepMinutes: number | null | undefined,
): SlotWindow | null {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === null || to === null) return null;

  // Windows do not wrap past midnight. A 22:00–02:00 window would straddle two calendar
  // dates, and every daily guard in the scheduler — the slot-already-ran check, the daily
  // ceiling, the rotation — is keyed on the local calendar day.
  if (to < from) return null;

  const step = Math.trunc(stepMinutes ?? 15);
  if (!Number.isFinite(step) || step < 1 || step > 240) return null;

  return { start: toTime(from), end: toTime(to), stepMinutes: step };
}

// ─── The grid ─────────────────────────────────────────────────────────────────

/**
 * Every time the window can produce, in order.
 *
 * Both bounds are inclusive, so 18:00–23:00 at 3 minutes is 101 times, not 100. The step is
 * the resolution of the pg_cron tick: asking for a finer one does not produce a finer
 * schedule, it produces a draw the cron rounds up to its next tick anyway.
 */
export function buildGrid(window: SlotWindow): string[] {
  const from = toMinutes(window.start);
  const to = toMinutes(window.end);
  if (from === null || to === null) return [];

  const out: string[] = [];
  for (let m = from; m <= to; m += window.stepMinutes) out.push(toTime(m));
  return out;
}

// ─── Deterministic shuffle ────────────────────────────────────────────────────

/** 32-bit FNV-1a. Small, fast, and stable across runtimes — which is the whole point. */
function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 — a tiny seeded PRNG. Deterministic for a given seed, which `Math.random` is not. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates against a seeded PRNG. Same seed, same permutation, always. */
function shuffle(items: readonly string[], seed: number): string[] {
  const out = [...items];
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Identifies a grid, so changing the window changes every future draw. */
function fingerprintOf(grid: readonly string[]): string {
  return `${grid.length}:${grid[0]}:${grid[grid.length - 1]}`;
}

/** The very first permutation. Everything after it is derived from the one before. */
function seedPermutation(grid: readonly string[]): string[] {
  return shuffle(grid, hash32(`${fingerprintOf(grid)}:seed`));
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

/** The owner's requirement: no posting time may come round again inside a month. */
export const MIN_SEPARATION_DAYS = 30;

/**
 * How far a time is allowed to move *backwards* between one cycle and the next.
 *
 * This one number is the whole spacing guarantee, and it comes straight out of the
 * arithmetic. If a time sits at position `p` in one cycle of length N and position `q` in the
 * next, the gap between the two days it is used is:
 *
 *     gap = (N - p) + q
 *
 * so `gap >= G` is exactly `q >= p - (N - G)`. In words: **a time may drift later in the
 * order as freely as it likes, but it may never jump more than `N - G` places earlier.** No
 * seam repair, no special-casing the first day of a cycle — the bound holds across every
 * boundary by construction, because it is a statement about consecutive cycles.
 *
 * The target is set above the 30 the owner actually needs. The reel trade in `resolveCycle`
 * moves times *within* a cycle and can therefore shorten a gap the bound had guaranteed;
 * measured on the live schedule, a pre-trade target of 36 holds 33 afterwards, while a target
 * of exactly 31 collapses to 4. The headroom is the difference between a promise and a
 * measurement.
 */
function displacementBound(n: number): number {
  return Math.max(0, n - separationGuaranteeDays(n));
}

/**
 * The minimum days between two uses of the same time, for a grid of N times.
 *
 * Exported so the admin can state the real figure rather than re-deriving it. It was
 * duplicated in the settings UI once and immediately went stale when the algorithm changed —
 * the screen promised a bound the scheduler no longer honoured.
 */
export function separationGuaranteeDays(n: number): number {
  return Math.min(Math.max(n - 1, 1), MIN_SEPARATION_DAYS + Math.ceil(n / 10));
}

/**
 * The next cycle's order, given this one's.
 *
 * Built position by position. At position `q` the candidates are the times not yet placed
 * whose previous position was at most `q + bound` — exactly the displacement rule. One is
 * chosen with the seeded PRNG, so the order still looks shuffled while every draw respects
 * the spacing guarantee.
 *
 * This can never get stuck on the spacing rule alone. A time becomes eligible at position
 * `max(0, p - bound)` and stays eligible for every position after it, so the candidate set
 * only grows: by position `q` at least `q + 1` times have been released and only `q` used.
 *
 * Reels are handled **here**, inside the chain, and that placement is the point. Resolving
 * them afterwards by trading two days was the obvious approach and it was wrong: a trade
 * moves a time to a position the displacement rule never sanctioned, and the guarantee
 * collapses. Measured, that took the minimum gap from 37 days to 6. Choosing a reel-safe time
 * *as the position is filled* keeps every placement inside the rule, so the spacing survives
 * the reel guard completely rather than approximately.
 */
function advance(
  previous: readonly string[],
  seed: number,
  bound: number,
  isReelDay: (position: number) => boolean,
  clashesWithReel: (time: string) => boolean,
): string[] {
  const n = previous.length;
  const positionBefore = new Map(previous.map((time, index) => [time, index]));
  const rand = seededRandom(seed);

  const remaining = new Set(previous);
  const out: string[] = [];

  for (let q = 0; q < n; q++) {
    // Sorted, not Set-iteration order: insertion order is stable here, but sorting removes
    // any doubt that two runtimes could enumerate differently and diverge.
    const eligible = [...remaining]
      .filter((time) => (positionBefore.get(time) ?? 0) <= q + bound)
      .sort();

    const clean = eligible.filter((time) => !clashesWithReel(time));
    const clashing = eligible.filter((time) => clashesWithReel(time));

    /*
     * On a reel day, take a time clear of the reel. On any other day, prefer to spend one of
     * the clashing times — they are only placeable here, so using them early keeps clean times
     * in hand for the reel days still to come. Without that preference the greedy runs out of
     * safe times late in the cycle and has to seat a photo next to a reel after all.
     */
    const preferred = isReelDay(q)
      ? (clean.length > 0 ? clean : eligible)
      : (clashing.length > 0 ? clashing : eligible);

    const chosen = preferred[Math.floor(rand() * preferred.length)];
    out.push(chosen);
    remaining.delete(chosen);
  }

  return out;
}

/*
 * The chain has to start somewhere, and every cycle is derived from the one before it, so a
 * date far ahead is reached by walking forward from a fixed anchor. Cheap in practice — a
 * cycle is N days, so a decade is a few dozen steps — and cached, so the planner drawing a
 * week of dates walks the chain once rather than seven times.
 */
const ANCHOR_DATE = "2026-01-01";
const MAX_CHAIN_STEPS = 4000;
const chainCache = new Map<string, string[]>();

/** Reel schedule identity, so changing reel days or times rebuilds the chain rather than reusing it. */
function reelFingerprint(reels: ReelSchedule | null): string {
  if (!reels) return "none";
  return `${[...reels.days].sort().join(",")}@${[...reels.times].sort().join(",")}/${reels.gapMinutes}`;
}

function permutationForCycle(
  grid: readonly string[],
  cycle: number,
  reels: ReelSchedule | null,
): string[] {
  const n = grid.length;
  const key = `${fingerprintOf(grid)}|${reelFingerprint(reels)}`;
  const anchor = Math.floor((dayIndex(ANCHOR_DATE) ?? 0) / n);

  const reelMinutes = reelContext(reels);
  const isReelDay = (cyc: number) => (position: number) =>
    Boolean(reels) && reels!.days.includes(weekdayForDayIndex(cyc * n + position));
  const clashes = (time: string) =>
    Boolean(reelMinutes) && collidesWithReel(time, reelMinutes!, reels!.gapMinutes);

  // The anchor cycle has no predecessor to be spaced against, so it is an unconstrained draw
  // that still respects reels. Dates before it are history, where the admin shows what was
  // actually published from `social_post_log` rather than a derived time.
  const anchorPermutation = () =>
    advance(seedPermutation(grid), hash32(`${key}:anchor`), n, isReelDay(anchor), clashes);

  if (cycle <= anchor) return anchorPermutation();

  // Absurdly distant dates cannot be real schedule questions; do not walk a chain to them.
  if (cycle - anchor > MAX_CHAIN_STEPS) return anchorPermutation();

  const bound = displacementBound(n);

  // Resume from the furthest point already known.
  let known = cycle;
  while (known > anchor && !chainCache.has(`${key}|${known}`)) known--;

  let permutation =
    known === anchor ? anchorPermutation() : (chainCache.get(`${key}|${known}`) as string[]);

  for (let c = known + 1; c <= cycle; c++) {
    permutation = advance(permutation, hash32(`${key}:${c}`), bound, isReelDay(c), clashes);
    chainCache.set(`${key}|${c}`, permutation);
  }

  return permutation;
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Days between the epoch and a YYYY-MM-DD calendar date.
 *
 * Anchored at UTC noon rather than midnight: noon is far enough from either midnight that no
 * timezone offset can push it onto a neighbouring day. Same reasoning as `localWeekday` in
 * config.ts, and the reason `expandPlan` never loses a Wednesday.
 */
export function dayIndex(dateKey: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  if (Number.isNaN(t)) return null;
  return Math.floor(t / DAY_MS);
}

// ─── The draw ─────────────────────────────────────────────────────────────────

/**
 * Weekday for a day index, 0 = Sunday.
 *
 * Epoch day 0 (1 Jan 1970) was a Thursday, hence the +4. Deriving it arithmetically rather
 * than building a Date keeps the whole cycle resolution free of timezone reasoning — the day
 * index already encodes the local calendar date.
 */
function weekdayForDayIndex(index: number): number {
  return (((index % 7) + 7) % 7 + 4) % 7;
}

/** Is `candidate` within `gap` minutes of any reel time? */
function collidesWithReel(candidate: string, reelMinutes: readonly number[], gap: number): boolean {
  const at = toMinutes(candidate);
  if (at === null) return false;
  return reelMinutes.some((other) => Math.abs(at - other) < gap);
}

/** Reel times as minutes, or null when there is nothing to steer around. */
function reelContext(reels: ReelSchedule | null): number[] | null {
  if (!reels || reels.days.length === 0 || reels.times.length === 0) return null;
  const minutes = reels.times.map(toMinutes).filter((m): m is number => m !== null);
  return minutes.length > 0 ? minutes : null;
}

/**
 * The final times for one cycle.
 *
 * A thin wrapper now, and deliberately so: reel avoidance used to live here as a trade applied
 * after the fact, which moved times to positions the displacement rule had never sanctioned
 * and dropped the minimum gap from 37 days to 6. It now happens inside `advance`, as each
 * position is filled, so there is nothing left to fix up afterwards.
 */
function resolveCycle(
  grid: readonly string[],
  cycle: number,
  reels: ReelSchedule | null,
): string[] {
  return permutationForCycle(grid, cycle, reels);
}

/**
 * The posting time for one calendar date.
 *
 * Pure: no clock, no database, no environment. Given the same date and window it returns the
 * same time on the scheduler, in the planner's forward grid, and in a test — which is what
 * makes "what time does it post on Friday?" a question with an answer.
 *
 * Returns null only when the window produces no times at all, and every caller reads that as
 * "fall back to the fixed slots" rather than "do not post".
 */
export function pickSlotForDate(
  dateKey: string,
  window: SlotWindow,
  reels: ReelSchedule | null = null,
): string | null {
  const grid = buildGrid(window);
  if (grid.length === 0) return null;
  if (grid.length === 1) return grid[0];

  const index = dayIndex(dateKey);
  if (index === null) return null;

  const n = grid.length;
  // Math.floor rather than a bitwise shift: a negative day index (a pre-1970 date, which the
  // planner will never ask for but a hand-typed one could) must still floor downwards.
  const cycle = Math.floor(index / n);
  const position = ((index % n) + n) % n;

  // Boundary spacing and reel collisions are both resolved inside the cycle, so this is a
  // lookup rather than a decision.
  return resolveCycle(grid, cycle, reels)[position];
}

/**
 * A human-readable description, for the admin.
 *
 * The owner has to be able to tell at a glance that the schedule is a window and not a time,
 * or the settings screen reads as though it is still posting at 19:00.
 */
export function describeWindow(window: SlotWindow): string {
  const count = buildGrid(window).length;
  return `${window.start}–${window.end}, ${count} possible ${count === 1 ? "time" : "times"}, ${window.stepMinutes} min apart`;
}
