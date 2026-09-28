"use client";

import { useColourSelectionStore } from "@/lib/colour-selection-store";
import { colourInStock, defaultColourIndex, type ProductColour } from "@/lib/product-colours";

/**
 * Colour swatches for a colour-variant product. Rendered only when `products.colors` is set,
 * so single-colour product pages are untouched.
 *
 * Lives in the scrolling info panel on both desktop and mobile rather than in the mobile
 * sticky bar: a colour is always pre-selected, so unlike size it never gates Add to Bag and
 * does not need to sit next to the button.
 */
export function ColourSelector({ slug, colours }: { slug: string; colours: ProductColour[] }) {
  const selected = useColourSelectionStore((s) => s.bySlug[slug] ?? defaultColourIndex(colours));
  const select = useColourSelectionStore((s) => s.select);
  const current = colours[selected] ?? colours[0];

  return (
    <div className="mt-8">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] uppercase tracking-[0.26em]">Colour</span>
        <span className="text-[11px] uppercase tracking-[0.26em] text-ink-soft">{current.name}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
        {colours.map((c, i) => {
          const inStock = colourInStock(c);
          const isSelected = i === selected;
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={inStock ? c.name : `${c.name} — sold out`}
              title={inStock ? c.name : `${c.name} — sold out`}
              onClick={() => select(slug, i)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                isSelected
                  ? "border-ink ring-[1.5px] ring-ink ring-offset-2 ring-offset-ivory"
                  : "border-border-soft hover:border-ink"
              } ${inStock ? "" : "opacity-40"}`}
            >
              <span className="h-7 w-7 rounded-full" style={{ backgroundColor: c.hex }} />
              {!inStock && (
                <span className="pointer-events-none absolute h-px w-9 rotate-45 bg-ink" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
