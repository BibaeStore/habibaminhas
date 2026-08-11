/**
 * Command-line fallback for building a reel.
 *
 * The normal route is the **Generate reel** button in /admin/social → Reels, which runs
 * exactly the same code through `buildProductReel`. This script exists for the cases a
 * button cannot cover — building in bulk, or working while the admin is not running.
 *
 *   npx tsx --env-file=.env.local scripts/build-reel.ts            # next in the reel rotation
 *   npx tsx --env-file=.env.local scripts/build-reel.ts <slug>     # a specific product
 *   npx tsx --env-file=.env.local scripts/build-reel.ts --pending  # honour rebuild requests
 *
 * It never publishes: the only outputs are a file in Storage and a draft row.
 */
import { createAdminClient } from "../lib/supabase/server";
import { buildProductReel } from "../lib/social/reel/build";

/**
 * Reels the owner asked to be re-cut from the Reels tab.
 *
 * The admin cannot re-encode on demand when it is deployed, so "Ask for a different cut"
 * raises a flag rather than pretending to do the work. This honours the flag: the rejected
 * cut is archived first so the tab never shows two drafts of the same product competing
 * for approval, and the note is printed so it is in front of you as the new one builds.
 */
async function nextRebuild(): Promise<{ slug: string; note: string | null; id: string } | null> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_media_queue")
    .select("id, product_ids, rebuild_note")
    .eq("rebuild_requested", true)
    .eq("status", "draft")
    .order("created_at")
    .limit(1);

  const row = data?.[0];
  const productId = ((row?.product_ids as string[]) ?? [])[0];
  if (!row || !productId) return null;

  const { data: product } = await sb.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product?.slug) return null;

  return { slug: product.slug as string, note: row.rebuild_note as string | null, id: row.id as string };
}

async function main() {
  const args = process.argv.slice(2);
  let slug = args.find((a) => !a.startsWith("--"));

  if (args.includes("--pending")) {
    const pending = await nextRebuild();
    if (!pending) {
      console.log("Nothing to rebuild — no reel has a pending request.");
      return;
    }
    console.log(`Rebuilding ${pending.slug}${pending.note ? `\n  note: "${pending.note}"` : ""}`);

    const sb = createAdminClient();
    await sb
      .from("social_media_queue")
      .update({ status: "archived", archived_at: new Date().toISOString(), rebuild_requested: false })
      .eq("id", pending.id);
    slug = pending.slug;
  }

  const result = await buildProductReel({
    slug,
    onProgress: (step) => console.log(`  ${step}…`),
  });

  console.log(`\n✓ ${result.productTitle}`);
  console.log(`  ${result.durationSeconds}s · ${result.sizeMb} MB`);
  console.log(`  Queued as a DRAFT — review and approve it in /admin/social → Reels.`);
}

main().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
