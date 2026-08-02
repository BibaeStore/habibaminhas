/**
 * Blog automation configuration + kill-switch.
 *
 * Same env-gate pattern as lib/courier/postex/config.ts: if the required keys are
 * absent the whole feature no-ops rather than half-running. Rollback in production is
 * deleting an environment variable, not reverting code.
 */

export interface BlogAutomationConfig {
  /** Empty string in queue mode — only "api" mode needs it. */
  anthropicKey: string;
  openaiKey: string;
  /** Posts to generate per cron run. */
  postsPerRun: number;
  /** Hard ceiling — refuse to run if the day already produced this many. */
  maxPerDay: number;
  /** Reasoning depth on the writing call — the main cost lever. */
  effort: BlogEffort;
  /** Where post text comes from: pre-written queue files (free) or the Claude API (paid). */
  source: "queue" | "api";
}

/** Returns config, or null when blog automation is not configured (the kill-switch). */
export function getBlogConfig(): BlogAutomationConfig | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  // The image key is always required — a post without a hero is not publishable.
  // The Anthropic key is only needed in "api" mode; queue mode runs without it.
  if (!openaiKey) return null;
  if (process.env.BLOG_SOURCE?.trim() === "api" && !anthropicKey) return null;
  if (process.env.BLOG_AUTOMATION_ENABLED?.trim().toLowerCase() === "false") return null;

  return {
    anthropicKey: anthropicKey ?? "",
    openaiKey,
    postsPerRun: Number(process.env.BLOG_POSTS_PER_RUN ?? 1) || 1,
    maxPerDay: Number(process.env.BLOG_MAX_PER_DAY ?? 1) || 1,
    /*
     * Reasoning depth on the writing call, and the main cost lever.
     *
     * Measured on the first real post: $0.49 of writing, of which roughly 14,500 of
     * ~17,600 output tokens were thinking rather than prose. Claude Opus 5 thinks by
     * default, and effort controls how much. Dropping to "medium" cuts the bill
     * materially for a modest quality trade; "high" is the quality default.
     *
     * Env-tunable so it can be changed in Vercel without a redeploy.
     */
    effort: (process.env.BLOG_WRITER_EFFORT?.trim() || "high") as BlogEffort,
    /*
     * "queue" (default) reads pre-written JSON from content/blog-queue and costs
     * nothing but the image. "api" generates fresh text with live web research and
     * costs ~$0.50 a post. Switch in Vercel without a redeploy.
     */
    source: (process.env.BLOG_SOURCE?.trim() === "api" ? "api" : "queue"),
  };
}

export type BlogEffort = "low" | "medium" | "high" | "xhigh";

export function isBlogAutomationEnabled(): boolean {
  return getBlogConfig() !== null;
}

/* ── Models ──────────────────────────────────────────────────────────────
 * The writer model is env-tunable because it is the single biggest cost lever,
 * bigger even than effort. Per-million-token rates:
 *
 *   claude-opus-5    $5 in / $25 out   — highest quality
 *   claude-sonnet-5  $3 in / $15 out   — near-Opus on long-form; ~40% cheaper
 *
 * Change BLOG_WRITER_MODEL in Vercel to switch; no redeploy needed.
 *
 * gpt-image-1-mini is cheaper than gpt-image-2 but OpenAI removes it on
 * 2026-12-01, and gpt-image-2 is the stated replacement — so build on that.
 */
export const WRITER_MODEL = process.env.BLOG_WRITER_MODEL?.trim() || "claude-opus-5";
export const IMAGE_MODEL = "gpt-image-2";

/** Per-million-token pricing, for the cost figure logged on each run. */
export const MODEL_PRICING: Record<string, { in: number; out: number }> = {
  "claude-opus-5": { in: 5, out: 25 },
  "claude-sonnet-5": { in: 3, out: 15 },
};

export function priceFor(model: string) {
  return MODEL_PRICING[model] ?? MODEL_PRICING["claude-opus-5"];
}

/** Storage: reuse the existing public `assets` bucket under a blog/ prefix. */
export const STORAGE_BUCKET = "assets";
export const STORAGE_PREFIX = "blog";
