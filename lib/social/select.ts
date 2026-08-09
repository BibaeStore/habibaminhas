import { createAdminClient } from "@/lib/supabase/server";
import type { SocialSettings } from "./config";

/**
 * Product rotation — "never repeat until everything has had a turn".
 *
 * The requirement, restated precisely:
 *   Never repeat a product until every eligible product has been posted. When new
 *   products appear, post those *before* starting to repeat.
 *
 * Two ordering rules do all the work:
 *   1. Never-posted products outrank everything already posted. A product added today
 *      jumps the queue automatically — no special "is there new stock?" branch is needed,
 *      it falls out of the ordering.
 *   2. Among already-posted products, least-recently-posted comes first, so the catalogue
 *      cycles evenly rather than favouring whatever happens to sort first.
 *
 * This runs in TypeScript rather than as a Postgres function on purpose. The catalogue is
 * ~20 eligible rows (70 total), so sorting in memory is free, and it avoids exposing an
 * RPC endpoint on a table that is otherwise unreachable outside the service role.
 */

export type ProductCandidate = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  price: number;
  category: string;
  subcategory: string[] | null;
  sku: string | null;
  images: string[];
  palette: string[] | null;
  sizes_stock: Record<string, number> | null;
  seo_keywords: string | null;
  faqs: unknown;
  created_at: string;
};

export type RotationStatus = {
  /** Which pass through the catalogue we are on. 1 = nothing has repeated yet. */
  cycle: number;
  /** How many eligible products have been posted so far in this cycle. */
  postedThisCycle: number;
  /** Total eligible products right now. */
  eligibleTotal: number;
  /** Products currently sitting in the review queue or approved but not yet published. */
  inFlight: number;
};

export type SelectionResult = {
  products: ProductCandidate[];
  status: RotationStatus;
};

/**
 * Picks the next product(s) to post, and reports where the rotation stands.
 *
 * Eligibility is evaluated fresh on every call — a product that sells out between being
 * queued and being posted is skipped, because stock is checked at selection time rather
 * than cached from an earlier run.
 */
export async function selectNextProducts(
  settings: SocialSettings,
  limit = settings.products_per_post,
): Promise<SelectionResult> {
  const sb = createAdminClient();

  let query = sb
    .from("products")
    .select(
      "id, slug, title, short_description, description, price, category, subcategory, sku, images, palette, sizes_stock, seo_keywords, faqs, created_at",
    )
    .eq("status", "active");

  if (settings.categories.length > 0) query = query.in("category", settings.categories);
  if (settings.require_in_stock) query = query.gt("stock", 0);

  const { data: rows, error } = await query;
  if (error) throw new Error(`Product selection failed: ${error.message}`);

  // PostgREST cannot filter on array_length, so the image-count rule is applied here.
  const eligible = (rows ?? []).filter(
    (p) => (p.images?.length ?? 0) >= settings.min_images,
  ) as unknown as ProductCandidate[];

  if (eligible.length === 0) {
    return {
      products: [],
      status: { cycle: 1, postedThisCycle: 0, eligibleTotal: 0, inFlight: 0 },
    };
  }

  const history = await loadHistory(eligible.map((p) => p.id));

  /*
   * A product already sitting in the review queue must not be selected again.
   *
   * Without this, `approval_required` would re-pick the same product on every run: the
   * pending row is not 'posted', so the rotation would consider the product untouched and
   * keep queueing duplicates until the owner got round to approving one.
   */
  const selectable = eligible.filter((p) => !history.inFlight.has(p.id));

  const ranked = [...selectable].sort((a, b) => {
    const aLast = history.lastPosted.get(a.id) ?? null;
    const bLast = history.lastPosted.get(b.id) ?? null;

    // Never-posted first.
    if (aLast === null && bLast !== null) return -1;
    if (aLast !== null && bLast === null) return 1;

    // Both never posted: newest product first, so fresh stock leads.
    if (aLast === null && bLast === null) {
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    }

    // Both posted: least recently posted first.
    return Date.parse(aLast!) - Date.parse(bLast!);
  });

  return {
    products: ranked.slice(0, Math.max(1, limit)),
    status: buildStatus(eligible, history),
  };
}

type History = {
  lastPosted: Map<string, string>;
  postCount: Map<string, number>;
  inFlight: Set<string>;
};

async function loadHistory(productIds: string[]): Promise<History> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_post_log")
    .select("product_id, status, posted_at")
    .in("product_id", productIds);

  if (error) throw new Error(`Rotation history lookup failed: ${error.message}`);

  const lastPosted = new Map<string, string>();
  const postCount = new Map<string, number>();
  const inFlight = new Set<string>();

  for (const row of data ?? []) {
    const id = row.product_id as string | null;
    if (!id) continue;

    if (row.status === "posted") {
      postCount.set(id, (postCount.get(id) ?? 0) + 1);
      const at = row.posted_at as string | null;
      if (at) {
        const prev = lastPosted.get(id);
        if (!prev || Date.parse(at) > Date.parse(prev)) lastPosted.set(id, at);
      }
    } else if (row.status === "pending" || row.status === "approved") {
      inFlight.add(id);
    }
  }

  return { lastPosted, postCount, inFlight };
}

/**
 * Rotation position, for the admin UI to show "cycle 2 · 7 of 20 posted".
 *
 * The cycle number is derived rather than stored: it is one more than the *fewest* times
 * any eligible product has been posted. That stays correct when products are added or
 * removed mid-cycle, which a stored counter would not.
 */
function buildStatus(eligible: ProductCandidate[], history: History): RotationStatus {
  const counts = eligible.map((p) => history.postCount.get(p.id) ?? 0);
  const min = counts.length ? Math.min(...counts) : 0;
  return {
    cycle: min + 1,
    postedThisCycle: counts.filter((c) => c > min).length,
    eligibleTotal: eligible.length,
    inFlight: history.inFlight.size,
  };
}

/** Rotation status alone, without selecting anything. Used by the admin dashboard. */
export async function getRotationStatus(settings: SocialSettings): Promise<RotationStatus> {
  const { status } = await selectNextProducts(settings, 1);
  return status;
}
