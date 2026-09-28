"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { SizeGuideModal } from "./size-guide-modal";

/** House chart for ladies suits — shirt and trouser, S / M / L, in inches. */
export const LADIES_SIZE_CHART = "/size-guide/habiba-minhas-ladies-size-chart.webp";

/**
 * The product's own chart if it has a real one, else the house chart for ladies suits.
 *
 * `size_guide` holds junk on older rows: the string "false" on 15 ladies suits (which opened
 * the pop-up on a broken image) and a `/placeholder-size-guide.png` that does not exist.
 * Anything that is not an http(s) URL or a real public path is treated as "no chart".
 */
function resolveChart(url: string | null, category: string): string | null {
  const real = !!url && /^(https?:\/\/|\/)/.test(url) && !url.includes("placeholder");
  if (real) return url;
  return category === "ladies-suits" ? LADIES_SIZE_CHART : null;
}

export function SizeGuideButton({
  sizeGuideUrl,
  category,
}: {
  sizeGuideUrl: string | null;
  category: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const chart = resolveChart(sizeGuideUrl, category);

  if (!chart) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-gold-dark-dark"
      >
        <Ruler className="h-3 w-3" /> Size guide
      </button>
      <SizeGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} imageUrl={chart} />
    </>
  );
}
