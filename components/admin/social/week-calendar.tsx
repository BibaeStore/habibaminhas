"use client";

import { ChevronLeft, ChevronRight, Images, Image, Clapperboard, CalendarHeart } from "lucide-react";
import { DAY_LABELS } from "./ui";

/**
 * One week, seven columns.
 *
 * The calendar is the primary surface for "what is going out", which is how every
 * scheduling tool worth copying presents it — an ordered list tells you the sequence but
 * never which day something lands on, and the day is the thing being planned.
 *
 * Colour alone never carries meaning here: each card shows an icon and a time as well as
 * its tint, so the grid still reads in greyscale and to a colourblind viewer. That is the
 * one piece of the accessibility guidance that high-density calendars most often get
 * wrong.
 */

export type CalendarItem = {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  time: string;
  /**
   * Which stream the entry belongs to.
   *
   * "photo" predates the split and means the carousel. "static" was added on 2026-08-29: the
   * static stream had been publishing for a day with no way to tell its entries apart from a
   * carousel's on the calendar, which the owner reported as not being able to see what was what.
   */
  kind: "photo" | "static" | "reel" | "occasion";
  /** Product title or headline, when something is actually assigned to the slot. */
  label?: string | null;
  thumb?: string | null;
};

/**
 * Colour, icon and label per stream, defined once.
 *
 * A legend is only honest if the swatch and the entry are drawn from the same source; two
 * lists drift and then the key lies about the calendar.
 */
const KIND_STYLE = {
  photo:    { label: "Carousel", border: "border-sky-300",     bg: "bg-sky-50",     text: "text-sky-900",     icon: "text-sky-800",     dot: "bg-sky-400" },
  static:   { label: "Static",   border: "border-amber-300",   bg: "bg-amber-50",   text: "text-amber-900",   icon: "text-amber-800",   dot: "bg-amber-400" },
  reel:     { label: "Reel",     border: "border-fuchsia-300", bg: "bg-fuchsia-50", text: "text-fuchsia-900", icon: "text-fuchsia-800", dot: "bg-fuchsia-400" },
  occasion: { label: "Occasion", border: "border-violet-300",  bg: "bg-violet-50",  text: "text-violet-900",  icon: "text-violet-800",  dot: "bg-violet-400" },
} as const;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Monday and Wednesday", "Monday, Wednesday and Friday", "every day". */
function listDays(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 7) return "every day";
  if (sorted.length === 0) return "no days";
  const names = sorted.map((d) => DAY_NAMES[d]);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * Which days this stream runs, and whether today is one of them.
 *
 * The owner asked, reasonably, why the Static tab showed Saturday as a posting day when
 * statics only run Monday and Wednesday. Half the answer was a bug — the tab was drawing the
 * carousel's schedule — and the other half was that the cadence was written down nowhere they
 * could see it, so the only way to find out was to ask. Now the page says it.
 */
export function CadenceNote({ noun, days }: { noun: string; days: number[] | null }) {
  const today = new Date().getDay();
  if (!days) return null;

  return (
    <p className="mb-4 rounded-lg border border-[var(--admin-border)] bg-slate-50 px-3 py-2 text-[12.5px] text-[var(--admin-text-muted)]">
      <span className="font-medium text-[var(--admin-text)]">
        {noun} run {listDays(days)}.
      </span>{" "}
      {days.includes(today)
        ? "Today is " + DAY_NAMES[today] + ", so one is scheduled."
        : "Today is " + DAY_NAMES[today] + " \u2014 none is scheduled. Use \u201CPost now\u201D to send one anyway."}
    </p>
  );
}

export function WeekCalendar({
  items, weekStart, onShift, emptyHint,
}: {
  items: CalendarItem[];
  /** Monday of the displayed week, YYYY-MM-DD. */
  weekStart: string;
  onShift: (weeks: number | "today") => void;
  emptyHint?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const start = Date.parse(`${weekStart}T12:00:00Z`);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start + i * 86_400_000);
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      weekday: d.getUTCDay(),
      dayNumber: d.getUTCDate(),
      items: items.filter((s) => s.date === date),
    };
  });

  const label = (() => {
    const endDate = new Date(start + 6 * 86_400_000);
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return `${fmt(new Date(start))} – ${fmt(endDate)}`;
  })();

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-[var(--admin-text)]">{label}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onShift(-1)}
            aria-label="Previous week"
            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onShift("today")}
            className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--admin-text-muted)] transition hover:bg-slate-100"
          >
            Today
          </button>
          <button
            onClick={() => onShift(1)}
            aria-label="Next week"
            className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition hover:bg-slate-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/*
        * Seven columns on a wide screen; a scrolling row on a narrow one rather than a
        * squashed grid. Mobile guidance favours an agenda list over a grid, and a 7-column
        * grid at phone width is unreadable — horizontal scroll keeps each day legible.
        */}
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="grid min-w-[640px] grid-cols-7 gap-1.5">
          {days.map((day) => (
            <div
              key={day.date}
              className={`min-h-[124px] rounded-xl border-2 p-2 transition ${
                day.date === today
                  ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                  : "border-[var(--admin-border)] bg-[var(--admin-bg)]"
              }`}
            >
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  {DAY_LABELS[day.weekday]}
                </span>
                <span
                  className={`text-[13px] font-semibold ${
                    day.date === today
                      ? "text-[var(--admin-accent)]"
                      : "text-[var(--admin-text-muted)]"
                  }`}
                >
                  {day.dayNumber}
                </span>
              </div>

              <div className="space-y-1">
                {day.items.map((item, i) => (
                  <div
                    key={i}
                    title={`${KIND_STYLE[item.kind].label} at ${item.time}${
                      item.label ? ` — ${item.label}` : ""
                    }`}
                    className={`rounded-lg border px-1.5 py-1 ${KIND_STYLE[item.kind].border} ${KIND_STYLE[item.kind].bg}`}
                  >
                    <div className="flex items-center gap-1">
                      {item.kind === "reel"
                        ? <Clapperboard size={10} className={`shrink-0 ${KIND_STYLE[item.kind].icon}`} />
                        : item.kind === "occasion"
                          ? <CalendarHeart size={10} className={`shrink-0 ${KIND_STYLE[item.kind].icon}`} />
                          : item.kind === "static"
                            ? <Image size={10} className={`shrink-0 ${KIND_STYLE[item.kind].icon}`} />
                            : <Images size={10} className={`shrink-0 ${KIND_STYLE[item.kind].icon}`} />}
                      <span className={`text-[10px] font-bold ${KIND_STYLE[item.kind].text}`}>
                        {item.time}
                      </span>
                      {/* The stream named on the card itself, not only in the legend — the owner
                          should not have to match a colour to a key to read their own week. */}
                      <span className={`ml-auto text-[9px] font-semibold uppercase tracking-wide ${KIND_STYLE[item.kind].text} opacity-70`}>
                        {KIND_STYLE[item.kind].label}
                      </span>
                    </div>
                    {item.label && (
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-[var(--admin-text)]">
                        {item.label}
                      </p>
                    )}
                  </div>
                ))}
                {day.items.length === 0 && (
                  <p className="pt-1 text-center text-[10px] text-slate-400">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--admin-border)] pt-3">
        {(Object.keys(KIND_STYLE) as Array<keyof typeof KIND_STYLE>).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--admin-text-muted)]">
            <span className={`h-2.5 w-2.5 rounded-sm ${KIND_STYLE[k].dot}`} />
            {KIND_STYLE[k].label}
          </span>
        ))}
        <span className="ml-auto text-[11.5px] text-[var(--admin-text-muted)]">
          {items.length === 0 ? (emptyHint ?? "Nothing scheduled") : `${items.length} this week`}
        </span>
      </div>
    </div>
  );
}

/** Monday of the week containing `date`, as YYYY-MM-DD. */
export function mondayOf(date: Date = new Date()): string {
  const anchor = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  anchor.setUTCDate(anchor.getUTCDate() - ((anchor.getUTCDay() + 6) % 7));
  return anchor.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD Monday by whole weeks. */
export function shiftWeek(weekStart: string, weeks: number): string {
  return new Date(Date.parse(`${weekStart}T12:00:00Z`) + weeks * 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
}
