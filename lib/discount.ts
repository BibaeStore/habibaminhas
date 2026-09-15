/**
 * Discount maths, shared by the admin dashboard and the storefront.
 *
 * The data model is the pre-existing `compare_at` column, not a new `discount_percent`
 * one. The rule everywhere in this codebase:
 *
 *   price      = what the customer pays today
 *   compare_at = the original ("was") price, or NULL when the item is not discounted
 *
 * That ordering is load-bearing well beyond the product page: `lib/merchant/google-feed.ts`
 * inverts it into Google's `price` / `sale_price` pair, `/offers` selects on
 * `compare_at IS NOT NULL`, and the cart carries `compare_at` through to the order line.
 * Storing a percentage instead would have meant recomputing prices on every one of those
 * read paths, and orders must capture the rupee amount at purchase time regardless.
 *
 * Percentages are therefore derived, never stored — which also means the badge a customer
 * sees is always computed from the two prices actually in the database, and cannot drift
 * away from them.
 */

/** Smallest sale we allow. Below this the strikethrough is noise, not an offer. */
export const MIN_DISCOUNT_PERCENT = 1;

/**
 * Largest sale we allow. Not a business rule so much as a typo guard: the bulk tool acts
 * on many rows at once, and "95" entered for "9.5" would gut a whole collection's pricing
 * in one click.
 */
export const MAX_DISCOUNT_PERCENT = 90;

/**
 * The price this product would revert to if its discount ended.
 *
 * This is the single most important function here. Re-applying a discount to an item that
 * is already on sale must work from the ORIGINAL price, never the already-reduced one —
 * otherwise bumping a campaign from 20% to 30% would quietly charge 0.8 x 0.7 = 44% off,
 * and doing it twice more would approach zero. Every write path goes through this.
 */
export function originalPriceOf(product: { price: number; compare_at: number | null }): number {
  return isDiscounted(product) ? product.compare_at! : product.price;
}

/**
 * Is this product genuinely on sale?
 *
 * `compare_at` being merely non-null is not enough. A row where compare_at <= price is bad
 * data (an inverted edit, historically easy to produce — see the Add/Edit form mismatch this
 * feature fixed), and rendering it would show a strikethrough "was" price LOWER than the
 * price being charged. Treat those rows as not-on-sale rather than showing nonsense.
 */
export function isDiscounted(product: { price: number; compare_at: number | null }): boolean {
  return product.compare_at != null && product.compare_at > product.price;
}

/**
 * The discount as a whole-number percentage, or null when the item is not on sale.
 *
 * Rounded for display: an item cut from 4,550 to 3,640 is "20%", not "19.999%".
 */
export function discountPercentOf(product: { price: number; compare_at: number | null }): number | null {
  if (!isDiscounted(product)) return null;
  return Math.round((1 - product.price / product.compare_at!) * 100);
}

/**
 * Apply a percentage to an original price, in whole rupees.
 *
 * `price` is an integer column (PKR has no practical minor unit here), so the result is
 * rounded rather than left as a float that Postgres would truncate unpredictably. Clamped
 * to a minimum of 1 so a 90% cut on a very cheap item can never produce a free product.
 */
export function priceAfterDiscount(originalPrice: number, percent: number): number {
  return Math.max(1, Math.round(originalPrice * (1 - percent / 100)));
}

/** Rupees saved, for the "Save Rs. 1,000" line. Null when not on sale. */
export function amountSavedOf(product: { price: number; compare_at: number | null }): number | null {
  if (!isDiscounted(product)) return null;
  return product.compare_at! - product.price;
}

/**
 * What a bulk discount would do to one product, without touching the database.
 *
 * The admin preview and the server action both call this, so what the owner is shown
 * before clicking Apply is computed by the identical code that performs the write.
 */
export function previewDiscount(
  product: { price: number; compare_at: number | null },
  percent: number,
): { original: number; next: number; saved: number } {
  const original = originalPriceOf(product);
  const next = priceAfterDiscount(original, percent);
  return { original, next, saved: original - next };
}
