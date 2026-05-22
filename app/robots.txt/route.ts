import { NextResponse } from "next/server";

/**
 * Robots.txt with Content Signals for AI Agent Discovery
 *
 * This route handler generates robots.txt with standard directives
 * PLUS Content-Signal directives for AI agent content usage preferences.
 *
 * Content-Signal values:
 * - ai-train=no: Do not use our content to train AI models
 * - search=yes: AI can use our content to answer search queries
 * - ai-input=yes: AI can read and summarize our content for users
 *
 * Reference: https://contentsignals.org/
 */
export async function GET() {
  const robotsTxt = `# Habiba Minhas - Robots.txt with Content Signals
# Last Updated: ${new Date().toISOString().split('T')[0]}

# Content Signals for AI Agents (https://contentsignals.org/)
# Protect our unique Pakistani fashion content from AI training
# but allow AI to search and recommend our products
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Standard Robots.txt Rules
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order/

# Sitemap
Sitemap: https://habibaminhas.com/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
