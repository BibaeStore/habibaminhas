import { NextResponse } from "next/server";

/**
 * Robots.txt - Standard compliant, fully crawlable
 *
 * This route handler generates a clean robots.txt file that:
 * - Welcomes ALL crawlers (Google, Bing, AI bots, etc.)
 * - Allows full access to public content
 * - Only blocks private/user-specific areas
 * - Passes Google validation (no unknown directives)
 */
export async function GET() {
  const robotsTxt = `# Habiba Minhas - Robots.txt
# Last Updated: ${new Date().toISOString().split('T')[0]}
# All search engines and AI bots are welcome to crawl our public content

# Allow all bots (Google, Bing, ChatGPT, Claude, Perplexity, etc.)
User-agent: *
Allow: /

# Block only private/user-specific areas (not public content)
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order/

# Sitemap for search engines
Sitemap: https://habibaminhas.com/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
