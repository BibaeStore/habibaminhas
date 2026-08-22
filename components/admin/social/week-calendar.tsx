"use client";

import { ChevronLeft, ChevronRight, Images, Clapperboard } from "lucide-react";
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
  kind: "photo" | "reel";
  /** Product title or headline, when something is actually assigned to the slot. */
  label?: string | null;
  thumb?: string | null;
  /** Already published, rather than still to come. */
  done?: boolean;
};

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
                    title={`${item.kind === "photo" ? "Photo post" : "Reel"} at ${item.time}${
                      item.label ? ` — ${item.label}` : ""
                    }`}
                    className={`rounded-lg border px-1.5 py-1 ${
                      item.done
                        ? "border-emerald-300 bg-emerald-50"
                        : item.kind === "photo"
                          ? "border-sky-300 bg-sky-50"
                          : "border-fuchsia-300 bg-fuchsia-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {item.kind === "photo"
                        ? <Images size={10} className="shrink-0 text-sky-800" />
                        : <Clapperboard size={10} className="shrink-0 text-fuchsia-800" />}
                      <span
                        className={`text-[10px] font-bold ${
                          item.kind === "photo" ? "text-sky-900" : "text-fuchsia-900"
                        }`}
                      >
                        {item.time}
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

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[var(--admin-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Images size={12} className="text-sky-700" /> Photo post
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clapperboard size={12} className="text-fuchsia-700" /> Reel
        </span>
        <span className="ml-auto">
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
