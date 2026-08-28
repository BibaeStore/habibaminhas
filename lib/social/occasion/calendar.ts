/**
 * Which occasions fall on which dates.
 *
 * Deliberately split from everything else so the hardest part of this feature — dates —
 * can be reasoned about and tested without a database, an API key, or a scheduler.
 *
 * Three of the four recurrence kinds are computed here and are exact. The fourth, `lunar`,
 * cannot be: Eid, Ramadan and Milad un-Nabi move every year and in Pakistan are settled by
 * moon sighting, not arithmetic. Those are resolved in `discover.ts` by asking the web a
 * few days ahead, and are the only reason this feature needs the internet at all.
 */
import type { OccasionRow } from "./types";
import { parseWindow, pickSlotForDate } from "@/lib/social/slot-window";

/** Pakistan does not observe DST, but this is derived rather than assumed. */
export const TZ = "Asia/Karachi";

/** The hour occasion greetings go out — before the 19:00 product post, never clashing. */
export const OCCASION_HOUR = 10;

/**
 * The window an occasion post is drawn from, in Karachi time.
 *
 * Greetings used to publish at exactly 10:00, every single time. The owner asked for the same
 * treatment the product posts got: somewhere between mid-morning and early afternoon, but not
 * the same minute every Friday.
 *
 * A 3-hour window on a 15-minute grid is 13 slots — more than the ~4 Fridays in a month, so a
 * Jumma time cannot recur inside a month. Occasions are far too sparse to need the 5-minute
 * resolution the product streams use, and a coarser grid keeps the times readable.
 */
export const OCCASION_WINDOW_START = "10:00";
export const OCCASION_WINDOW_END = "13:00";
export const OCCASION_WINDOW_STEP = 15;

/**
 * The UTC instant corresponding to a wall-clock time in `tz`.
 *
 * `new Date("2026-08-21T10:00")` is parsed in the *server's* zone, which on Vercel is UTC
 * and locally is whatever the laptop says — so the naive version silently shifts the post
 * by hours depending on where the code runs. This measures the zone's actual offset at
 * that moment instead, which also survives any future DST rule change.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  tz: string = TZ,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const asSeen = new Date(guess);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(asSeen).map((x) => [x.type, x.value]));
  const seen = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour) % 24, Number(p.minute),
  );
  // `seen - guess` is the zone's offset; subtracting it lands the wall clock where we want.
  return new Date(guess - (seen - guess));
}

/** `YYYY-MM-DD` for a date as it reads in `tz`, not as it reads in UTC. */
export function localDateKey(d: Date, tz: string = TZ): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(d); // en-CA is already YYYY-MM-DD
}

/** 0 = Sunday … 6 = Saturday, in `tz`. */
export function localWeekday(d: Date, tz: string = TZ): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/** Parses `YYYY-MM-DD` into its parts without going through Date, avoiding zone drift. */
export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** The date `n` days after `key`, still as a `YYYY-MM-DD` string. */
export function addDays(key: string, n: number): string {
  const { year, month, day } = parseDateKey(key);
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return d.toISOString().slice(0, 10);
}

/** The calendar date of the `nth` `weekday` of a month — e.g. 2nd Sunday of May. */
export function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): number {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - firstDow + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

/**
 * Does this occasion fall on this date?
 *
 * `lunar` is matched against an explicit per-year date written by the web-search resolver,
 * never computed. An unresolved lunar occasion therefore matches nothing and quietly does
 * not fire, which is the right failure: a missing Eid post is recoverable, an Eid post on
 * the wrong day is not.
 */
export function occursOn(occasion: OccasionRow, dateKey: string): boolean {
  if (!occasion.enabled) return false;
  const { year, month, day } = parseDateKey(dateKey);

  switch (occasion.recurrence) {
    case "weekly": {
      const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      return dow === occasion.weekday;
    }
    case "fixed":
      return month === occasion.month && day === occasion.day;
    case "nth_weekday": {
      if (month !== occasion.month) return false;
      if (occasion.weekday == null || occasion.nth == null) return false;
      return day === nthWeekdayOfMonth(year, month, occasion.weekday, occasion.nth);
    }
    case "lunar":
      // Never computed. The resolver writes an explicit date per year and this matches it
      // exactly, so an unresolved lunar occasion simply does not fire rather than firing
      // on a guessed day.
      return occasion.resolved_dates?.[String(year)] === dateKey;
    default:
      return false;
  }
}

/**
 * Every computable occasion between two dates, inclusive, most important first per day.
 *
 * Two occasions on one day is expected, not an edge case — a Friday that is also Women's
 * Day should produce both posts, which is exactly what the owner asked for.
 */
export function occurrencesInRange(
  occasions: OccasionRow[],
  fromKey: string,
  toKey: string,
): Array<{ dateKey: string; occasion: OccasionRow }> {
  const out: Array<{ dateKey: string; occasion: OccasionRow }> = [];
  let cursor = fromKey;
  // Bounded so a bad range can never spin: a year of days is plenty for a planner.
  for (let i = 0; i < 400 && cursor <= toKey; i++) {
    const hits = occasions
      .filter((o) => occursOn(o, cursor))
      .sort((a, b) => a.priority - b.priority);
    for (const occasion of hits) out.push({ dateKey: cursor, occasion });
    cursor = addDays(cursor, 1);
  }
  return out;
}

/**
 * The UTC instant an occasion post for `dateKey` should publish at.
 *
 * Derived from the date rather than rolled, exactly as the product streams are: the planner
 * writes `scheduled_for` days ahead, and it has to still agree with itself when the publisher
 * reads it back. Same date in, same minute out.
 *
 * Falls back to a flat 10:00 if the window is somehow unusable — a greeting at a predictable
 * hour is much better than a greeting that never goes out.
 */
export function scheduledForDate(dateKey: string): Date {
  const { year, month, day } = parseDateKey(dateKey);

  const window = parseWindow(OCCASION_WINDOW_START, OCCASION_WINDOW_END, OCCASION_WINDOW_STEP);
  const drawn = window ? pickSlotForDate(dateKey, window, null) : null;
  if (!drawn) return zonedTimeToUtc(year, month, day, OCCASION_HOUR, 0);

  const [h, m] = drawn.split(":").map(Number);
  return zonedTimeToUtc(year, month, day, h, m);
}
