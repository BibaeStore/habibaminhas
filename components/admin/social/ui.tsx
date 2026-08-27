"use client";

import { useState } from "react";
import { Check, X, ChevronDown, Clock, AlertTriangle, Loader2, Trash2, Plus } from "lucide-react";
import { PlatformIcon, platformLabel, platformBrand } from "@/components/admin/platform-icons";

/**
 * Shared furniture for the social admin.
 *
 * These lived inside `app/admin/social/page.tsx` when the whole feature was one 2,300-line
 * page. Splitting it into Photos / Reels / Planner / Settings would otherwise have meant
 * four copies of every control — and a control that drifts between copies is exactly how a
 * screen stops being learnable. Defined once here, imported everywhere.
 *
 * The rule this file exists to enforce: **a photo and a reel are shown with the same
 * components.** The two content types previously had separate, subtly different widgets,
 * which is why the page read as two applications sharing a URL.
 */

/** AdminShell supplies no padding — every admin page owns its own gutter. */
export const PAGE_PADDING = "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8";

/**
 * Inputs carry a visible border at rest and a ring on focus. A single-pixel
 * `--admin-border` on the cream background was close to invisible, so a text field and a
 * plain label looked the same until you clicked one.
 */
export const inputCls =
  "w-full rounded-lg border-2 border-slate-300 bg-[var(--admin-bg)] px-3 py-2 text-[15px] text-[var(--admin-text)] outline-none transition hover:border-slate-400 focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/25";

export function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  );
}

export function Pill({
  tone, children,
}: {
  tone: "ok" | "warn" | "bad" | "muted" | "info";
  children: React.ReactNode;
}) {
  // Text at -800 and borders at -300: the previous -700 on -50 with a -200 border sat close
  // to the 4.5:1 floor and read as washed out on the cream admin background.
  const cls = {
    ok: "bg-emerald-50 text-emerald-800 border-emerald-300",
    warn: "bg-amber-50 text-amber-900 border-amber-300",
    bad: "bg-red-50 text-red-800 border-red-300",
    muted: "bg-slate-100 text-slate-700 border-slate-300",
    info: "bg-sky-50 text-sky-800 border-sky-300",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

/**
 * The one checkbox visual, used everywhere a tick is shown.
 *
 * A 2px slate-500 border when unchecked, rather than 1px slate-300 which disappeared into
 * the cream background — the reported "I can't tell if I selected it". Checked is a solid
 * accent fill with a heavy white tick, so the two states differ in fill, border *and*
 * glyph rather than by shade alone.
 */
export function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition ${
        on
          ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
          : "border-slate-500 bg-white"
      }`}
    >
      {on && <Check size={13} strokeWidth={3.5} />}
    </span>
  );
}

/**
 * Accessible on/off switch.
 *
 * `bg-slate-300` when off against a cream card is roughly 1.3:1, so "off" and "on" were
 * genuinely hard to tell apart. Now: a 2px border gives the track an edge at any contrast,
 * off is slate-500, the knob carries its own ring, and an ON/OFF word means the state
 * never depends on colour alone.
 */
export function Toggle({
  checked, onChange, disabled, label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 ${
          checked
            ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]"
            : "border-slate-600 bg-slate-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-1 ring-black/20 transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`select-none text-[11px] font-bold tracking-wide ${
          checked ? "text-[var(--admin-accent)]" : "text-slate-600"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </span>
    </span>
  );
}

export function Modal({
  title, onClose, children, footer, wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Media needs the room; a confirmation dialog does not. */
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-[var(--admin-bg)] shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-bg)] px-5 py-4">
          <h3 className="text-[16px] font-semibold text-[var(--admin-text)]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Multi-select dropdown for post categories.
 *
 * Closed, it states the selection in words; open, it is a single scannable column with
 * live in-stock counts.
 */
export function CategoryPicker({
  categories, selected, onToggle,
}: {
  categories: Array<{ slug: string; name: string; liveProducts: number }>;
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const chosen = categories.filter((c) => selected.includes(c.slug));
  const totalLive = chosen.reduce((sum, c) => sum + c.liveProducts, 0);

  const summary =
    chosen.length === 0
      ? "No categories selected — nothing will post"
      : chosen.length === 1
        ? chosen[0].name
        : `${chosen[0].name} + ${chosen.length - 1} more`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 bg-[var(--admin-bg)] px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/40 ${
          chosen.length === 0
            ? "border-red-400 hover:border-red-500"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-[15px] ${
              chosen.length === 0 ? "text-red-700" : "text-[var(--admin-text)]"
            }`}
          >
            {summary}
          </span>
          {chosen.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[12px] font-semibold text-slate-700">
              {totalLive} live
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-600 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Click-away layer. Sits under the menu but over everything else. */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" />
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border-2 border-slate-300 bg-[var(--admin-bg)] py-1 shadow-xl"
          >
            {categories.map((c) => {
              const on = selected.includes(c.slug);
              return (
                <li key={c.slug} role="option" aria-selected={on}>
                  <button
                    type="button"
                    onClick={() => onToggle(c.slug)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-100 ${
                      on ? "bg-[var(--admin-accent)]/8" : ""
                    }`}
                  >
                    <CheckBox on={on} />
                    <span className="flex-1 truncate text-[14px] text-[var(--admin-text)]">
                      {c.name}
                    </span>
                    <span
                      className={`shrink-0 text-[12px] font-medium ${
                        c.liveProducts === 0 ? "text-red-700" : "text-slate-600"
                      }`}
                    >
                      {c.liveProducts} live
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Status vocabulary ────────────────────────────────────────────────────────

/**
 * Every state a piece of content can be in, and how it is drawn.
 *
 * One table, because the complaint that started this rebuild was that a stuck item and a
 * working one looked alike until you read carefully. Each state differs in **word, colour
 * and glyph** at once, so it survives a glance, a greyscale screen and colourblindness.
 *
 * `needsYou` is the one that drives the badges in the navigation: it marks the states
 * where nothing moves until a person acts.
 */
export type ContentState =
  | "draft" | "pending" | "approved" | "scheduled"
  | "posted" | "failed" | "archived" | "skipped";

export const STATE_META: Record<
  ContentState,
  { label: string; tone: "ok" | "warn" | "bad" | "muted" | "info"; icon: typeof Check; needsYou: boolean }
> = {
  draft:     { label: "Needs your review", tone: "warn",  icon: AlertTriangle, needsYou: true  },
  pending:   { label: "Needs your review", tone: "warn",  icon: AlertTriangle, needsYou: true  },
  approved:  { label: "Approved",          tone: "info",  icon: Check,         needsYou: false },
  scheduled: { label: "Scheduled",         tone: "info",  icon: Clock,         needsYou: false },
  posted:    { label: "Published",         tone: "ok",    icon: Check,         needsYou: false },
  failed:    { label: "Failed",            tone: "bad",   icon: AlertTriangle, needsYou: true  },
  archived:  { label: "Discarded",         tone: "muted", icon: X,             needsYou: false },
  skipped:   { label: "Skipped",           tone: "muted", icon: X,             needsYou: false },
};

/** The status of one item, stated in a word rather than implied by a colour. */
export function StatePill({ state }: { state: string }) {
  const meta = STATE_META[state as ContentState] ?? {
    label: state, tone: "muted" as const, icon: Clock, needsYou: false,
  };
  const Icon = meta.icon;
  return (
    <Pill tone={meta.tone}>
      <Icon size={12} strokeWidth={3} />
      {meta.label}
    </Pill>
  );
}

/**
 * Corner glyph marking a post's status on one platform.
 *
 * Status used to be carried by colour alone — a green icon versus a red icon of identical
 * shape, invisible to a red-green colourblind reader (around 8% of men). A tick, a warning
 * triangle and a clock differ in *form*, so colour reinforces the meaning instead of being
 * the only thing carrying it.
 */
export function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-white ring-2 ring-[var(--admin-bg)] ${tone}`}
    >
      {children}
    </span>
  );
}

/**
 * A platform shown in its own brand colour, with its delivery state as a corner glyph.
 *
 * The eye recognises Facebook blue and Instagram magenta far faster than it reads the word
 * beside them. Colour is never the only signal: the state glyph and the tooltip carry the
 * meaning independently.
 *
 * One component for photos and reels alike. Photos previously used a flat grey icon in the
 * review queue and a coloured one in history, so the same platform looked like two
 * different things on two screens.
 */
export function PlatformChip({
  platform, state, href, onRetry, busy, error, size = 32,
}: {
  platform: string;
  state: "posted" | "failed" | "pending";
  href?: string | null;
  onRetry?: () => void;
  busy?: boolean;
  error?: string | null;
  size?: number;
}) {
  const label = platformLabel(platform);
  const base =
    "relative inline-flex items-center justify-center rounded-full border-2 bg-white transition";
  const dim = { width: size, height: size };
  const glyph = Math.round(size * 0.47);

  if (state === "posted" && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={`View on ${label}`}
        aria-label={`View on ${label} — published`}
        className={`${base} border-emerald-400 hover:bg-emerald-50`}
        style={{ ...dim, color: platformBrand(platform) }}
      >
        <PlatformIcon platform={platform} size={glyph} />
        <StatusBadge tone="bg-emerald-600"><Check size={9} strokeWidth={4} /></StatusBadge>
      </a>
    );
  }

  if (state === "failed") {
    return (
      <button
        onClick={onRetry}
        disabled={busy || !onRetry}
        title={`${label} failed — ${error ?? "click to retry"}`}
        aria-label={`Retry ${label} — failed`}
        className={`${base} border-red-500 hover:bg-red-50 disabled:cursor-not-allowed`}
        style={{ ...dim, color: platformBrand(platform) }}
      >
        {busy
          ? <Loader2 size={glyph} className="animate-spin" />
          : <PlatformIcon platform={platform} size={glyph} />}
        <StatusBadge tone="bg-red-600"><AlertTriangle size={8} strokeWidth={3} /></StatusBadge>
      </button>
    );
  }

  return (
    <span
      title={`${label} — waiting`}
      aria-label={`${label} waiting`}
      className={`${base} border-slate-400`}
      style={{ ...dim, color: platformBrand(platform) }}
    >
      <PlatformIcon platform={platform} size={glyph} />
      <StatusBadge tone="bg-slate-500"><Clock size={8} strokeWidth={3} /></StatusBadge>
    </span>
  );
}

/**
 * Where a draft is going once approved, stated before it publishes rather than after.
 *
 * Platform pills used to appear only on published items, so a draft gave no indication of
 * whether Facebook would receive it.
 */
export function PublishTargets({ targets }: { targets: string[] }) {
  if (targets.length === 0) {
    return (
      <Pill tone="bad">
        <AlertTriangle size={12} /> No platform switched on — this cannot publish
      </Pill>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--admin-text-muted)]">
      <span>Will publish to</span>
      {targets.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 font-medium" style={{ color: platformBrand(t) }}>
          <PlatformIcon platform={t} size={13} />
          {platformLabel(t)}
        </span>
      ))}
    </span>
  );
}

/**
 * Per-post choice of where it goes, pre-ticked with everything enabled.
 *
 * A deliberately *per-post* control, separate from the registry toggles under Platforms.
 * Unticking here means "not this one", not "turn this platform off" — the distinction
 * matters because the two decisions have completely different lifespans, and conflating
 * them means a one-off exclusion silently becomes a permanent setting.
 *
 * Everything starts ticked because that is nearly always the intent; the picker exists for
 * the exception, and an owner who has to tick three boxes on every post has been given a
 * chore rather than a choice.
 */
export function PlatformPicker({
  available,
  selected,
  onChange,
  disabled,
}: {
  available: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  if (available.length === 0) {
    return (
      <Pill tone="bad">
        <AlertTriangle size={12} /> No platform switched on — this cannot publish
      </Pill>
    );
  }

  const toggle = (key: string) => {
    onChange(
      selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-[var(--admin-text-muted)]">Publish to</span>
      {available.map((key) => {
        const on = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => toggle(key)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-medium transition disabled:opacity-50 ${
              on
                ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-text)]"
                : "border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-slate-50"
            }`}
            style={on ? { color: platformBrand(key) } : undefined}
          >
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                on ? "border-current bg-current" : "border-slate-400"
              }`}
            >
              {on && <Check size={10} className="text-white" strokeWidth={3} />}
            </span>
            <PlatformIcon platform={key} size={13} />
            {platformLabel(key)}
          </button>
        );
      })}
      {selected.length === 0 && (
        <span className="text-[12px] font-medium text-rose-700">Pick at least one</span>
      )}
    </div>
  );
}

// ─── Page furniture ───────────────────────────────────────────────────────────

/**
 * The heading above each of the three sections every content page carries.
 *
 * Photos and reels use this in the same order — Upcoming, Needs your review, Published —
 * so learning one page teaches the other.
 */
export function SectionHeading({
  title, count, hint, action,
}: {
  title: string;
  count?: number;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-[var(--admin-text)]">
          {title}
          {count !== undefined && count > 0 && (
            <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[12px] font-bold text-slate-700">
              {count}
            </span>
          )}
        </h2>
        {hint && <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/** A section with nothing in it, saying why rather than showing a blank panel. */
export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--admin-border)] px-4 py-8 text-center">
      <p className="text-[14px] text-[var(--admin-text-muted)]">{message}</p>
      {hint && <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]/80">{hint}</p>}
    </div>
  );
}

/**
 * Sub-tabs within a page.
 *
 * Each page's sections used to be stacked one under another, so reaching "Published" meant
 * scrolling past every upcoming post and every item awaiting review — and a control at the
 * bottom of a long list is a control nobody knows exists. Sub-tabs make each section a
 * place you go rather than a place you scroll to.
 */
export function SubTabs<T extends string>({
  tabs, active, onChange,
}: {
  tabs: Array<{ id: T; label: string; count?: number; icon?: React.ReactNode }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-1.5" role="tablist">
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[13px] font-medium transition ${
              on
                ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                : "border-slate-300 text-[var(--admin-text)] hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                  on ? "bg-white/25 text-white" : "bg-amber-500 text-white"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 0 = Sunday, matching `Date.getDay()`. Monday-first for reading. */
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

/**
 * Which weekdays something runs on.
 *
 * Defined here rather than in the planner because the schedule settings need exactly the
 * same control — there was previously no way at all to say "four days a week", only what
 * time of day to post, so every configured time fired every single day.
 */
export function DayPicker({
  days, onChange, disabled,
}: {
  days: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MONDAY_FIRST.map((day) => {
        const on = days.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onChange(on ? days.filter((d) => d !== day) : [...days, day].sort())}
            className={`h-10 w-12 rounded-lg border-2 text-[13px] font-medium transition disabled:opacity-50 ${
              on
                ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                : "border-slate-300 text-[var(--admin-text)] hover:border-slate-400"
            }`}
          >
            {DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}

/** An editable list of times of day. */
export function TimeList({
  times, onChange, fallback = "19:00", label,
}: {
  times: string[];
  onChange: (times: string[]) => void;
  fallback?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      {times.map((time, i) => (
        <div key={i} className="flex items-center gap-2">
          <Clock size={15} className="shrink-0 text-[var(--admin-text-muted)]" />
          <input
            type="time"
            value={time}
            onChange={(e) => onChange(times.map((t, idx) => (idx === i ? e.target.value : t)))}
            className={`${inputCls} max-w-[150px]`}
            aria-label={`${label} ${i + 1}`}
          />
          {times.length > 1 && (
            <button
              onClick={() => onChange(times.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${time}`}
              className="text-[var(--admin-text-muted)] transition hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...times, fallback])}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--admin-accent)]"
      >
        <Plus size={14} /> Add a time
      </button>
    </div>
  );
}

/**
 * Feedback that cannot be scrolled away from.
 *
 * This replaces a notice card rendered at the top of the page, which was a genuine trap:
 * these pages are long, so pressing a button near the bottom put its only response several
 * hundred pixels above the viewport. A working action and a failing one then looked
 * identical — nothing happened where you were looking — which is exactly how "the generate
 * button does nothing" gets reported for a button that is in fact running.
 *
 * Fixed to the bottom-right, above everything, and it holds until dismissed: an error
 * worth reading should not vanish on a timer.
 */
export function Toast({
  message, onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[60] max-w-md animate-in rounded-xl border-2 border-[var(--admin-accent)] bg-[var(--admin-bg)] px-4 py-3 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <p className="text-[14px] leading-relaxed text-[var(--admin-text)]">{message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 rounded p-1 text-[var(--admin-text-muted)] transition hover:bg-slate-100 hover:text-[var(--admin-text)]"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * A long-running job's progress, shown next to the button that started it.
 *
 * Reel encoding takes about a minute. Without something stating that plainly and *in
 * place*, a minute of no visible change reads as a broken button.
 */
export function InlineProgress({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-[var(--admin-accent)] bg-[var(--admin-accent)]/5 px-3 py-2">
      <Loader2 size={15} className="animate-spin text-[var(--admin-accent)]" />
      <p className="text-[13px] font-medium text-[var(--admin-text)]">{message}</p>
    </div>
  );
}

/** Relative time, for tables where an exact timestamp is noise. */
export function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "—";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * The evening window a daily posting time is drawn from.
 *
 * Shared by all three screens that can change the photo schedule — the settings page, the
 * settings drawer and the planner — because the alternative is three controls that drift
 * apart, and the window is precisely the setting where the owner must be able to trust that
 * what one screen says is what another does.
 *
 * Switching the toggle off clears both bounds, which is what makes the fixed-times list take
 * over again: the scheduler treats a half-set window as no window at all.
 */
export function SlotWindowEditor({
  start, end, stepMinutes = 15, timezone, onChange, disabled,
}: {
  start: string | null;
  end: string | null;
  /** Read-only here — it has to match the pg_cron tick, so it is not an admin-editable field. */
  stepMinutes?: number;
  timezone?: string;
  onChange: (start: string | null, end: string | null) => void;
  disabled?: boolean;
}) {
  const on = Boolean(start && end);
  const preview = describeSlotWindow(start, end, stepMinutes);

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={on}
          disabled={disabled}
          onChange={(e) => (e.target.checked ? onChange("18:30", "21:30") : onChange(null, null))}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--admin-accent)]"
        />
        <span>
          <span className="block text-[14px] font-semibold text-[var(--admin-text)]">
            Vary the time each day
          </span>
          <span className="block text-[13px] text-[var(--admin-text-muted)]">
            One post a day at a time drawn from the window below, instead of the same clock time
            every day. The fixed times above are ignored while this is on.
          </span>
        </span>
      </label>

      {on && (
        <div className="space-y-2 rounded-lg border-2 border-slate-300 bg-[var(--admin-bg)] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Clock size={15} className="shrink-0 text-[var(--admin-text-muted)]" />
            <input
              type="time"
              value={start ?? ""}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value || null, end)}
              className={`${inputCls} max-w-[140px]`}
              aria-label="Window starts"
            />
            <span className="text-[14px] text-[var(--admin-text-muted)]">to</span>
            <input
              type="time"
              value={end ?? ""}
              disabled={disabled}
              onChange={(e) => onChange(start, e.target.value || null)}
              className={`${inputCls} max-w-[140px]`}
              aria-label="Window ends"
            />
          </div>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            {preview}
            {timezone ? ` · ${timezone}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * A plain-language summary of a window, including the bit that surprises people.
 *
 * The count matters: the scheduler ticks every 15 minutes, so a three-hour window holds 13
 * possible times and not "any time at all". Saying so here is the difference between an owner
 * who understands why a time recurred after a fortnight and one who thinks it is broken.
 */
export function describeSlotWindow(
  start: string | null,
  end: string | null,
  stepMinutes = 15,
): string {
  const from = timeToMinutes(start);
  const to = timeToMinutes(end);
  if (from === null || to === null) return "Set both ends of the window.";
  if (to < from) return "The window has to end after it starts.";

  const count = Math.floor((to - from) / stepMinutes) + 1;
  if (count <= 1) return "Only one time fits in that window — it will post at the same time daily.";

  const noRepeat = Math.floor(count / 3) + 1;
  return `${count} possible times, ${stepMinutes} minutes apart. Every one is used before any repeats, so the same time is typically ${count} days apart and rarely closer than ${noRepeat}.`;
}

function timeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
