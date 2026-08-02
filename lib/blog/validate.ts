import type { GeneratedPost } from "./generate";

/**
 * Quality gate.
 *
 * The owner chose fully automatic publishing, so this is the only thing standing
 * between a weak draft and a live page on a domain that currently ranks. A post that
 * fails any hard check is not published — the run retries or aborts.
 *
 * Thresholds come from the 2026-08-01 audit of the 31 existing posts, which found:
 * average 874 words, 20/31 titles truncating in search results, 24/31 meta
 * descriptions truncating, and zero in-content internal links across the whole site.
 * These are the numbers that stopped those posts competing.
 */

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    words: number;
    titleLength: number;
    metaLength: number;
    sections: number;
    faqCount: number;
    internalLinks: number;
  };
}

/** Extract all human-readable text from the block array. */
function bodyText(content: unknown[]): string {
  let out = "";
  const walk = (node: unknown): void => {
    if (typeof node === "string") {
      out += " " + node;
      return;
    }
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k === "type") continue;
        walk(v);
      }
    }
  };
  walk(content);
  return out;
}

const MARKDOWN_LINK = /\[[^\]]+\]\((\/[^)]+)\)/g;

export function validatePost(
  post: GeneratedPost,
  allowedUrls: Set<string>,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const blocks = Array.isArray(post.content) ? post.content : [];
  const text = bodyText(blocks);
  const words = text.split(/\s+/).filter(Boolean).length;

  const types = blocks.map((b: any) => b?.type);
  const sections = types.filter((t) => t === "section").length;
  const faqBlocks = blocks.filter((b: any) => b?.type === "faq");
  const faqCount = faqBlocks.reduce(
    (n: number, b: any) => n + (Array.isArray(b.questions) ? b.questions.length : 0),
    0,
  );

  // Internal links — must exist AND point at a real page.
  const found = [...text.matchAll(MARKDOWN_LINK)].map((m) => m[1]);
  const normalise = (u: string) => u.split("#")[0].replace(/\/$/, "");
  const valid = found.filter((u) => allowedUrls.has(normalise(u)));
  const invalid = found.filter((u) => !allowedUrls.has(normalise(u)));

  /* ── Hard failures ─────────────────────────────────────────────── */
  if (words < 1200) errors.push(`Too short: ${words} words (minimum 1200)`);
  if (words > 2600) warnings.push(`Long: ${words} words`);

  if (!post.title?.trim()) errors.push("Missing title");
  else if (post.title.length > 60)
    errors.push(`Title ${post.title.length} chars — truncates in search results (max 60)`);
  else if (post.title.length < 35) warnings.push(`Title short: ${post.title.length} chars`);

  if (!post.meta_description?.trim()) errors.push("Missing meta_description");
  else if (post.meta_description.length > 165)
    errors.push(`Meta description ${post.meta_description.length} chars (max 165)`);
  else if (post.meta_description.length < 120)
    warnings.push(`Meta description short: ${post.meta_description.length} chars`);

  if (!post.slug?.match(/^[a-z0-9]+(-[a-z0-9]+)*$/))
    errors.push(`Invalid slug: "${post.slug}"`);

  if (sections < 5) errors.push(`Only ${sections} sections (minimum 5)`);
  if (faqBlocks.length !== 1) errors.push(`Expected exactly 1 faq block, got ${faqBlocks.length}`);
  if (faqCount < 3) errors.push(`Only ${faqCount} FAQ entries (minimum 3)`);
  if (!types.includes("intro")) errors.push("Missing intro block");

  // A broken internal link on a live page is worse than no link at all.
  if (invalid.length > 0)
    errors.push(`Links to non-existent pages: ${invalid.slice(0, 3).join(", ")}`);
  if (valid.length < 3)
    errors.push(`Only ${valid.length} valid internal links (minimum 3)`);

  if (!post.keywords?.trim()) errors.push("Missing keywords");
  if (!post.excerpt?.trim()) errors.push("Missing excerpt");
  if (!post.imagePrompt?.trim()) errors.push("Missing imagePrompt");
  if (!post.category_tag?.trim()) errors.push("Missing category_tag");

  /* ── Slop detection ─────────────────────────────────────────────
   * These phrases are the tell of generic AI filler. Their presence usually
   * means the whole post drifted toward boilerplate.
   */
  const slop = [
    "in today's world",
    "in today's fast-paced",
    "delve into",
    "elevate your wardrobe",
    "game-changer",
    "look no further",
    "when it comes to",
    "the world of fashion",
  ];
  const hits = slop.filter((p) => text.toLowerCase().includes(p));
  if (hits.length >= 3) errors.push(`Generic AI phrasing: ${hits.slice(0, 3).join(", ")}`);
  else if (hits.length > 0) warnings.push(`Mild filler phrasing: ${hits.join(", ")}`);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      words,
      titleLength: post.title?.length ?? 0,
      metaLength: post.meta_description?.length ?? 0,
      sections,
      faqCount,
      internalLinks: valid.length,
    },
  };
}
