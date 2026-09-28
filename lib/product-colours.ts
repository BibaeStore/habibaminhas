/**
 * Colour variants on a single product — `products.colors` (see
 * supabase/migrations/20260928_product_colour_variants.sql).
 *
 * `null` on every single-colour product, and every shared component treats `null` as
 * "render exactly as before". That is deliberate: the ranking product pages must not change
 * by a single byte because one product gained swatches.
 */
export type ProductColour = {
  name: string;   // shown on the swatch and stored on the order line, e.g. "Pink"
  code: string;   // appended to the SKU on the order line, e.g. "PNK"
  hex: string;    // swatch fill
  images: string[];
  sizes_stock: Record<string, number>;
};

export function parseColours(raw: unknown): ProductColour[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const colours = raw.filter(
    (c): c is ProductColour =>
      !!c &&
      typeof c.name === "string" &&
      typeof c.code === "string" &&
      typeof c.hex === "string" &&
      Array.isArray(c.images) &&
      c.images.length > 0 &&
      !!c.sizes_stock &&
      typeof c.sizes_stock === "object",
  );
  return colours.length > 0 ? colours : null;
}

export function colourInStock(c: ProductColour): boolean {
  return Object.values(c.sizes_stock).some((n) => n > 0);
}

/** First colour that can still be bought — derived from props, so server and client agree. */
export function defaultColourIndex(colours: ProductColour[]): number {
  const i = colours.findIndex(colourInStock);
  return i === -1 ? 0 : i;
}
