import { getProducts } from "@/lib/actions/products";
import { buildFeedItems, buildFeedXml } from "@/lib/merchant/google-feed";

/**
 * Google Merchant Center scheduled fetch target.
 *
 * Same shape as app/sitemap.ts: query the live database on request, so stock and price
 * are never stale. Merchant Center re-fetches this URL on its own schedule (daily is the
 * usual setting), which is why nothing here needs a cron job.
 *
 * SEO posture — this route is deliberately invisible to Search:
 *   - `X-Robots-Tag: noindex` so Googlebot may FETCH it (Merchant Center needs that) but
 *     never lists it as a result. A robots.txt Disallow would have blocked the fetch too,
 *     which is why robots.txt is left untouched.
 *   - Not added to app/sitemap.ts, not linked from any page, no metadata.
 *   - Reads only. No existing page, URL, heading or structured-data output changes.
 */

export const runtime = "nodejs";
export const revalidate = 3600; // matches sitemap.ts; Merchant Center fetches far less often

export async function GET() {
  const products = await getProducts({ status: "active" });
  const xml = buildFeedXml(buildFeedItems(products));

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=0, s-maxage=3600, must-revalidate",
    },
  });
}
