"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

export type DatePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "this-month"
  | "last-month"
  | "this-year"
  | "all-time"
  | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today",      label: "Today" },
  { key: "yesterday",  label: "Yesterday" },
  { key: "7d",         label: "Last 7 days" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "this-year",  label: "This year" },
  { key: "all-time",   label: "All time" },
  { key: "custom",     label: "Custom" },
];

export function getPresetRange(preset: Exclude<DatePreset, "custom">): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: today, to: now };
    case "yesterday": {
      const yd = new Date(today);
      yd.setDate(yd.getDate() - 1);
      const endOfYd = new Date(today.getTime() - 1);
      return { from: yd, to: endOfYd };
    }
    case "7d": {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: d, to: now };
    }
    case "this-month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case "last-month":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case "this-year":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "all-time":
      return { from: new Date(2020, 0, 1), to: now };
  }
}

function toInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateRangeBar({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [customFrom, setCustomFrom] = useState(() => toInputValue(value.from));
  const [customTo, setCustomTo] = useState(() => toInputValue(value.to));

  function selectPreset(preset: DatePreset) {
    if (preset === "custom") {
      onChange({ from: value.from, to: value.to, preset: "custom" });
      return;
    }
    const { from, to } = getPresetRange(preset);
    onChange({ from, to, preset });
  }

  function applyCustom() {
    const from = new Date(customFrom + "T00:00:00");
    const to = new Date(customTo + "T23:59:59");
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return;
    onChange({ from, to, preset: "custom" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => selectPreset(key)}
          className={`flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-3 py-1.5 text-[12px] font-medium transition-colors ${
            value.preset === key
              ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
              : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          }`}
        >
          {key === "custom" && <Calendar className="h-3 w-3" />}
          {label}
        </button>
      ))}

      {value.preset === "custom" && (
        <div className="mt-1 flex w-full items-center gap-2 sm:mt-0 sm:w-auto">
          <input
            type="date"
            value={customFrom}
            max={customTo}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-8 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 text-[12px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
          />
          <span className="text-[12px] text-[var(--admin-text-muted)]">–</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-8 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 text-[12px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
          />
          <button
            onClick={applyCustom}
            className="h-8 rounded-[var(--admin-radius)] bg-[var(--admin-primary)] px-3 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
