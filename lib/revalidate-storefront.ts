import { revalidatePath } from "next/cache";

/**
 * Storefront cache invalidation for anything that changes product availability.
 *
 * Every route listed here is statically prerendered, so its HTML embeds the stock
 * value that was true at build time and keeps serving it until something explicitly
 * invalidates it. Before this existed, `updateProduct` revalidated only `/shop` and
 * the product's own page, and an order placement — which decrements stock — revalidated
 * nothing customer-facing at all.
 *
 * The visible symptom (2026-08-02): `/ladies` served a 20-hour-old prerender showing
 * all nine first-page products as "Out of Stock" while four of them had been restocked
 * eight hours after that page was built. The reverse case is worse — an item that sells
 * out keeps advertising itself as available until the next deploy.
 *
 * Subcategory routes (`/ladies/[...slug]` and siblings), `/search` and the journal are
 * deliberately absent: they are dynamic or client-rendered and already re-query per
 * request. Adding them here would be a no-op that later readers would mistake for a
 * requirement.
 *
 * This is belt-and-braces with the `revalidate = 300` on those same pages. The timer is
 * the safety net for stock paths nobody remembered to wire up; this is the fast path
 * that makes an admin edit show up immediately rather than within five minutes.
 */
const STOREFRONT_PATHS = [
  "/",
  "/shop",
  "/ladies",
  "/kids",
  "/baby",
  "/accessories",
  "/new",
  "/offers",
] as const;

/**
 * Invalidate every prerendered storefront route that displays stock.
 *
 * Pass the affected product to also invalidate its own detail page — that route is
 * generated with `generateStaticParams`, so it is frozen in exactly the same way.
 *
 * Must be called from a Server Action or Route Handler (a `revalidatePath` constraint).
 */
export function revalidateStorefront(
  product?: { category?: string | null; slug?: string | null } | null,
): void {
  for (const path of STOREFRONT_PATHS) revalidatePath(path);
  if (product?.category && product.slug) {
    revalidatePath(`/product/${product.category}/${product.slug}/`);
  }
}
