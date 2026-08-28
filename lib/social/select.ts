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
  subtype: string | null;
  sku: string | null;
  /** Units left. Zero is publishable when `require_in_stock` is off — see the query comment. */
  stock: number | null;
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
export type SelectStream = "carousel" | "static";

/** Which manual-order table a stream pins into. */
const ORDER_TABLE: Record<SelectStream, "social_queue_order" | "social_static_order"> = {
  carousel: "social_queue_order",
  static: "social_static_order",
};

export async function selectNextProducts(
  settings: SocialSettings,
  limit = settings.products_per_post,
  /**
   * Which rotation to advance.
   *
   * The two streams keep separate trackers and separate history, so a static post and a
   * carousel on the same day are different garments and each walks the catalogue at its own
   * pace. Sharing one rotation would have made them shadow each other -- which is precisely
   * what the owner asked to avoid.
   */
  stream: SelectStream = "carousel",
): Promise<SelectionResult> {
  const sb = createAdminClient();

  let query = sb
    .from("products")
    .select(
      // `stock` is read even though eligibility may ignore it: with require_in_stock off, a
      // sold-out garment still posts, and the caption has to know so it does not claim
      // availability it does not have.
      "id, slug, title, short_description, description, price, category, subcategory, subtype, sku, stock, images, palette, sizes_stock, seo_keywords, faqs, created_at",
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

  const history = await loadHistory(eligible.map((p) => p.id), stream);

  /*
   * A product already sitting in the review queue must not be selected again.
   *
   * Without this, `approval_required` would re-pick the same product on every run: the
   * pending row is not 'posted', so the rotation would consider the product untouched and
   * keep queueing duplicates until the owner got round to approving one.
   */
  const selectable = eligible.filter((p) => !history.inFlight.has(p.id));

  // Manual drag-and-drop overrides from the admin "Up next" list.
  const pinned = await loadManualOrder(stream);

  const ranked = [...selectable].sort((a, b) => {
    // 1. Anything the owner dragged into place wins, in the order they chose.
    const aPin = pinned.get(a.id);
    const bPin = pinned.get(b.id);
    if (aPin !== undefined && bPin !== undefined) return aPin - bPin;
    if (aPin !== undefined) return -1;
    if (bPin !== undefined) return 1;

    const aLast = history.lastPosted.get(a.id) ?? null;
    const bLast = history.lastPosted.get(b.id) ?? null;

    // 2. Never-posted next.
    if (aLast === null && bLast !== null) return -1;
    if (aLast !== null && bLast === null) return 1;

    // 3. Both never posted: newest product first, so fresh stock leads.
    if (aLast === null && bLast === null) {
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    }

    // 4. Both posted: least recently posted first.
    return Date.parse(aLast!) - Date.parse(bLast!);
  });

  return {
    products: ranked.slice(0, Math.max(1, limit)),
    status: buildStatus(eligible, history),
  };
}

/**
 * Manual ordering set by dragging rows in the admin "Up next" list.
 *
 * A pin is a one-shot instruction, not a permanent rank: `clearManualOrder` drops the row
 * once the product posts, so the catalogue returns to even rotation instead of the pinned
 * product monopolising the queue forever.
 */
async function loadManualOrder(stream: SelectStream): Promise<Map<string, number>> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from(ORDER_TABLE[stream])
    .select("product_id, position")
    .order("position");

  const map = new Map<string, number>();
  if (error || !data) return map;
  for (const row of data) map.set(row.product_id, row.position);
  return map;
}

/** Removes a product's manual pin — called once it has actually been posted. */
export async function clearManualOrder(
  productId: string,
  stream: SelectStream = "carousel",
): Promise<void> {
  const sb = createAdminClient();
  await sb.from(ORDER_TABLE[stream]).delete().eq("product_id", productId);
}

type History = {
  lastPosted: Map<string, string>;
  postCount: Map<string, number>;
  inFlight: Set<string>;
};

async function loadHistory(productIds: string[], stream: SelectStream): Promise<History> {
  const sb = createAdminClient();
  /*
   * History is per stream. A garment that went out as a carousel on Tuesday is still "unposted"
   * as far as the static rotation is concerned -- otherwise the two streams would consume one
   * shared runway and the second would run out of fresh products in half the time.
   */
  const { data, error } = await sb
    .from("social_post_log")
    .select("product_id, status, posted_at")
    .eq("stream", stream)
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
