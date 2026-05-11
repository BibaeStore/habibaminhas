"use client";

import { Check } from "lucide-react";

export type Palette = [string, string, string];

const PRESETS: Array<{ name: string; value: Palette }> = [
  { name: "Rosewood",     value: ["#f2e0d8", "#c97a86", "#5a2030"] },
  { name: "Indigo",       value: ["#dde0f0", "#5c6dab", "#1e2a5a"] },
  { name: "Bronze Mocha", value: ["#eedbc4", "#b08040", "#3a2010"] },
  { name: "Pearl",        value: ["#f0eae0", "#b0a890", "#3c3828"] },
  { name: "Golden Amber", value: ["#f5e8c0", "#c8900c", "#5a3800"] },
  { name: "Rose Jewel",   value: ["#f8dce4", "#c0607a", "#4a1828"] },
  { name: "Dusty Rose",   value: ["#e8d0c0", "#b07050", "#3c1a08"] },
  { name: "Royal Plum",   value: ["#e0d8e8", "#8878a8", "#2c2040"] },
  { name: "Teal",         value: ["#d0e4e0", "#507870", "#182c28"] },
  { name: "Ivory Grace",  value: ["#f4f0e8", "#989070", "#302c20"] },
  { name: "Maroon",       value: ["#f0c8c0", "#c04040", "#480808"] },
  { name: "Sandstone",    value: ["#d4e8d0", "#507848", "#182810"] },
];

function arrayEq(a: Palette, b: Palette) {
  return a[0].toLowerCase() === b[0].toLowerCase()
      && a[1].toLowerCase() === b[1].toLowerCase()
      && a[2].toLowerCase() === b[2].toLowerCase();
}

export function PalettePicker({
  value,
  onChange,
}: {
  value: Palette;
  onChange: (v: Palette) => void;
}) {
  const setSlot = (i: 0 | 1 | 2, hex: string) => {
    const next: Palette = [...value] as Palette;
    next[i] = hex;
    onChange(next);
  };

  return (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
      <div className="mb-1 text-[14px] font-semibold text-[var(--admin-text)]">Palette</div>
      <div className="mb-3 text-sm text-[var(--admin-text-muted)]">
        Three colours used to render a generated swatch when no image is present.
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        {(["Light", "Mid", "Dark"] as const).map((label, idx) => (
          <label key={label} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--admin-text-muted)]">{label}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value[idx as 0 | 1 | 2]}
                onChange={(e) => setSlot(idx as 0 | 1 | 2, e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-[var(--admin-border)] bg-transparent p-0.5"
                aria-label={`${label} colour`}
              />
              <input
                type="text"
                value={value[idx as 0 | 1 | 2]}
                onChange={(e) => setSlot(idx as 0 | 1 | 2, e.target.value)}
                className="h-9 flex-1 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 font-mono text-[12px] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="mt-2 text-xs font-medium text-[var(--admin-text-muted)]">Quick picks</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = arrayEq(value, preset.value);
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.value)}
              title={preset.name}
              className={`relative flex h-9 items-center gap-0.5 rounded-[var(--admin-radius)] border px-1 transition-colors ${
                active
                  ? "border-[var(--admin-primary)] ring-2 ring-[var(--admin-primary)]/30"
                  : "border-[var(--admin-border)] hover:border-[var(--admin-primary)]"
              }`}
            >
              {preset.value.map((c, i) => (
                <span key={i} className="h-6 w-4 rounded-sm" style={{ background: c }} />
              ))}
              {active && (
                <Check className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-[var(--admin-primary)] p-0.5 text-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
