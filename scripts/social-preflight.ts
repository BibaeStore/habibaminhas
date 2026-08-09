/**
 * Meta preflight — proves publishing will work, without publishing anything.
 *
 *   npx tsx --env-file=.env.local scripts/social-preflight.ts
 *
 * Creates a real Instagram media *container* from real derivative URLs and polls it to
 * FINISHED, then stops. A container is a staging object: nothing appears on the account,
 * and Meta discards it automatically after 24 hours if it is never published. Container
 * creation is also not counted against the 100-posts/24h limit, which is enforced on
 * media_publish.
 *
 * This is the strongest signal available short of going public, because reaching FINISHED
 * requires all of the following to already be true:
 *   - the System User token really carries instagram_content_publish (Standard Access)
 *   - the token is accepted despite the Page's 2FA requirement
 *   - Meta can fetch our Supabase Storage JPEG URLs
 *   - the 1080x1350 (4:5) aspect ratio is accepted
 *   - the caption is within limits
 *
 * It deliberately never calls media_publish.
 */
import { getMetaCredentials, getSocialSettings } from "../lib/social/config";
import { selectNextProducts } from "../lib/social/select";
import { buildCaption } from "../lib/social/caption";
import { prepareImages } from "../lib/social/images";
import { graphRequest, MetaApiError } from "../lib/social/adapters/types";

function rule(label: string) {
  console.log(`\n${"─".repeat(72)}\n${label}\n${"─".repeat(72)}`);
}

async function main() {
  const creds = getMetaCredentials();
  if (!creds) {
    console.error("✗ Meta credentials missing");
    process.exit(1);
  }
  const settings = await getSocialSettings();
  if (!settings) {
    console.error("✗ social_settings missing");
    process.exit(1);
  }

  rule("1. Token");
  const debug = await graphRequest<{
    data?: { type?: string; is_valid?: boolean; expires_at?: number; scopes?: string[] };
  }>(creds, "/debug_token", { input_token: creds.token }, "GET");
  const d = debug.data ?? {};
  console.log(`  type              ${d.type}`);
  console.log(`  valid             ${d.is_valid}`);
  console.log(`  expires           ${d.expires_at === 0 ? "never" : new Date((d.expires_at ?? 0) * 1000).toISOString()}`);
  const needed = ["instagram_content_publish", "pages_manage_posts", "instagram_basic", "pages_read_engagement"];
  for (const scope of needed) {
    console.log(`  ${d.scopes?.includes(scope) ? "✓" : "✗"} ${scope}`);
  }

  rule("2. Facebook Page access token");
  try {
    const page = await graphRequest<{ access_token?: string; name?: string }>(
      creds, `/${creds.pageId}`, { fields: "name,access_token" }, "GET",
    );
    console.log(`  page              ${page.name}`);
    console.log(`  page token        ${page.access_token ? "✓ minted from System User" : "✗ not returned"}`);
  } catch (e) {
    console.log(`  ✗ ${(e as Error).message}`);
  }

  rule("3. Build a real post (not published)");
  const { products } = await selectNextProducts(settings, 1);
  if (products.length === 0) {
    console.error("✗ nothing eligible");
    process.exit(1);
  }
  const product = products[0];
  const images = await prepareImages(product.images, product.palette?.[0]);
  const { caption, altText } = buildCaption(product, "instagram");
  console.log(`  product           ${product.title}`);
  console.log(`  images            ${images.length}`);
  console.log(`  caption           ${caption.length} chars`);

  rule("4. Instagram container — the real test");
  console.log("  Creating container(s)… (nothing is published)");

  let containerId: string;
  try {
    if (images.length >= 2) {
      const children: string[] = [];
      for (const url of images) {
        const child = await graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, {
          image_url: url,
          is_carousel_item: "true",
        });
        children.push(child.id);
        console.log(`    ✓ child container ${child.id}`);
      }
      const parent = await graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption,
      });
      containerId = parent.id;
      console.log(`    ✓ carousel container ${containerId}`);
    } else {
      const single = await graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, {
        image_url: images[0],
        caption,
        alt_text: altText,
      });
      containerId = single.id;
      console.log(`    ✓ container ${containerId}`);
    }
  } catch (e) {
    const m = e instanceof MetaApiError ? e : null;
    console.error(`\n  ✗ Container creation FAILED`);
    console.error(`    message  ${(e as Error).message}`);
    if (m) console.error(`    code ${m.code} subcode ${m.subcode} fbtrace ${m.fbtraceId}`);
    process.exit(1);
  }

  console.log("\n  Polling status…");
  for (let i = 0; i < 10; i++) {
    const res = await graphRequest<{ status_code?: string }>(
      creds, `/${containerId}`, { fields: "status_code" }, "GET",
    );
    console.log(`    ${res.status_code}`);
    if (res.status_code === "FINISHED") {
      console.log(`\n  ✓✓ READY TO PUBLISH — everything works.`);
      console.log(`     Standard Access, the 2FA/System-User combination, Meta fetching our`);
      console.log(`     Supabase URLs, the 4:5 ratio and the caption are all accepted.`);
      console.log(`\n  This container was NOT published. It expires by itself in 24 hours.`);
      return;
    }
    if (res.status_code === "ERROR" || res.status_code === "EXPIRED") {
      console.error(`\n  ✗ container ended ${res.status_code}`);
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log("\n  … still IN_PROGRESS after 30s (not a failure; large carousels can lag)");
}

main().catch((e) => {
  console.error("\nPreflight failed:", e);
  process.exit(1);
});
