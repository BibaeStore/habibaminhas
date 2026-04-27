"use client";

import { useState } from "react";

interface Props {
  description: string;
}

const DETAILS = [
  { label: "Material", value: "Premium silk, lawn & chiffon" },
  { label: "Construction", value: "Hand-stitched with artisan embroidery" },
  { label: "Pieces", value: "3-piece (kameez, shalwar, dupatta)" },
  { label: "Care", value: "Dry clean recommended" },
  { label: "Origin", value: "Handcrafted in Karachi, Pakistan" },
];

export function MobileDetailTabs({ description }: Props) {
  const [tab, setTab] = useState<"details" | "description">("details");

  return (
    /* Visible on mobile only — lg:hidden */
    <div className="mt-8 lg:hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border-soft">
        {(["details", "description"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.3em] transition-colors ${
              tab === t
                ? "border-b-2 border-ink text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-5">
        {tab === "details" ? (
          <ul className="flex flex-col gap-3">
            {DETAILS.map(({ label, value }) => (
              <li key={label} className="flex items-start gap-3 text-[13px]">
                <span className="w-28 shrink-0 font-medium text-ink">{label}</span>
                <span className="text-ink-soft">{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {description ||
              "Cut from a featherweight lawn and finished with hand-threaded embroidery at the neckline and cuff. Pair the dupatta loose, or tucked at the shoulder for a cleaner line."}
          </p>
        )}
      </div>
    </div>
  );
}
