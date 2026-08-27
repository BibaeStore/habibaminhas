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
 * The draw is a shuffled cycle, not an independent roll
 * ----------------------------------------------------
 * Independent daily rolls clump: over a 13-slot grid you would routinely see the same time
 * twice in three days while other slots went untouched for a month. Instead each cycle of N
 * days is a seeded permutation of all N times, so every time in the window is used exactly
 * once before any of them repeats.
 *
 * Guarantee, stated precisely, for a grid of N times:
 *   - within any single cycle of N days, no time repeats
 *   - across a cycle boundary — the only place two independent shuffles meet — the opening
 *     floor(N/3) days are held clear of the previous cycle's closing floor(N/3) days, so the
 *     shortest possible gap between two uses of one time is floor(N/3) + 1
 *   - the average gap is N days
 *
 * For the 18:30–21:30 window at 15 minutes that is N = 13: every one of the 13 times is used
 * once before any repeats, and no time can recur inside 5 days. A calendar month with no
 * repeat at all is not reachable — 30 days cannot be covered by 13 distinct times — so this
 * is the most spread the window arithmetic allows. Widening the window or shortening the step
 * is the only way to buy more, and both are data changes rather than code ones.
 *
 * `avoid` (the reel collision rule) is the one thing that can perturb the once-per-cycle
 * property, and only on days where a reel is already scheduled. That is a deliberate trade:
 * two posts to the same account inside a minute is worse than an uneven gap.
 */

/** A validated window. Times are "HH:MM" in the account's timezone, both bounds inclusive. */
export type SlotWindow = {
  start: string;
  end: string;
  stepMinutes: number;
};

export type PickOptions = {
  /** Times to stay clear of — in practice the reel slots, on a reel day. */
  avoid?: string[];
  /** How close to an `avoid` time counts as a collision. */
  minGapMinutes?: number;
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
 * Both bounds are inclusive, so 18:30–21:30 at 15 minutes is 13 times, not 12. The step is
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

/**
 * The permutation of the grid used for one cycle of N days.
 *
 * The window itself is folded into the seed alongside the cycle index, so editing the window
 * changes every future draw — which is what the owner expects after changing it — while
 * leaving the derivation reproducible.
 */
function rawPermutation(grid: readonly string[], cycle: number): string[] {
  const fingerprint = `${grid.length}:${grid[0]}:${grid[grid.length - 1]}:${cycle}`;
  return shuffle(grid, hash32(fingerprint));
}

/**
 * How many days either side of a cycle boundary are protected from repeating.
 *
 * A cycle boundary is the one seam a single permutation cannot see: the end of cycle C and
 * the start of C+1 are adjacent days drawn from two independent shuffles, so left alone they
 * can place the same time two days apart. Holding the opening `g` days of a cycle clear of
 * the previous cycle's closing `g` days raises the worst-case gap to `g + 1`.
 *
 * floor(N/3), not floor(N/2), and the difference is the whole correctness argument. The
 * repair below must not disturb its own cycle's tail, or the next cycle would be comparing
 * itself against a tail that no longer exists — the guarantee would read as proven while
 * being false. So the grid splits into three disjoint regions:
 *
 *     [0, g)          head     — constrained by the previous cycle's tail
 *     [g, N - g)      reserve  — unconstrained, the only place the repair may draw from
 *     [N - g, N)      tail     — never touched, so the next cycle can rely on it
 *
 * Filling up to `g` head positions from the reserve needs `N - 2g >= g`, hence `g <= N/3`.
 */
function boundaryGuard(n: number): number {
  return Math.floor(n / 3);
}

/**
 * The permutation for one cycle, repaired so its opening does not echo the previous cycle's
 * closing days.
 *
 * The repair is a swap rather than a reshuffle: reserve positions carry no constraint, so a
 * forbidden time in the head is exchanged with the first reserve position holding a permitted
 * one. Every time still appears exactly once, the tail is untouched, and the result stays a
 * pure function of the grid and the cycle index — no recursion into earlier cycles beyond the
 * single raw shuffle of the one before.
 */
function cyclePermutation(grid: readonly string[], cycle: number): string[] {
  const n = grid.length;
  const permutation = rawPermutation(grid, cycle);

  const guard = boundaryGuard(n);
  if (guard < 1) return permutation;

  // The previous cycle's tail is safe to read from its *raw* shuffle precisely because the
  // repair never writes into the tail region.
  const forbidden = new Set(rawPermutation(grid, cycle - 1).slice(n - guard));

  for (let i = 0; i < guard; i++) {
    if (!forbidden.has(permutation[i])) continue;
    for (let j = guard; j < n - guard; j++) {
      if (forbidden.has(permutation[j])) continue;
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
      break;
    }
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

/** Is `candidate` within `gap` minutes of anything in `avoid`? */
function collides(candidate: string, avoid: readonly number[], gap: number): boolean {
  const at = toMinutes(candidate);
  if (at === null) return false;
  return avoid.some((other) => Math.abs(at - other) < gap);
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
  options: PickOptions = {},
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

  // Cycle-boundary repeats are handled inside the permutation itself, so this is just a
  // lookup.
  const permutation = cyclePermutation(grid, cycle);

  const gap = options.minGapMinutes ?? 0;
  const avoid = (options.avoid ?? [])
    .map(toMinutes)
    .filter((m): m is number => m !== null);

  const chosen = permutation[position];
  if (gap <= 0 || avoid.length === 0 || !collides(chosen, avoid, gap)) return chosen;

  /*
   * Collision with a reel slot. Walk the rest of this cycle's permutation for the first time
   * that is clear, so the replacement still comes from the cycle's own ordering rather than
   * from a fresh roll — the day moves, the distribution does not.
   */
  for (let step = 1; step < n; step++) {
    const candidate = permutation[(position + step) % n];
    if (!collides(candidate, avoid, gap)) return candidate;
  }

  // Every time in the window collides, i.e. the window sits entirely inside the reel slot's
  // gap. That is a configuration problem, not a runtime one — post at the drawn time rather
  // than not at all, and let the planner's validation say so.
  return chosen;
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
