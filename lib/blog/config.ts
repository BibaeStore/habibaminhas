/**
 * Blog automation configuration + kill-switch.
 *
 * Same env-gate pattern as lib/courier/postex/config.ts: if the required keys are
 * absent the whole feature no-ops rather than half-running. Rollback in production is
 * deleting an environment variable, not reverting code.
 */

export interface BlogAutomationConfig {
  anthropicKey: string;
  openaiKey: string;
  /** Posts to generate per cron run. */
  postsPerRun: number;
  /** Hard ceiling — refuse to run if the day already produced this many. */
  maxPerDay: number;
  /** Reasoning depth on the writing call — the main cost lever. */
  effort: BlogEffort;
}

/** Returns config, or null when blog automation is not configured (the kill-switch). */
export function getBlogConfig(): BlogAutomationConfig | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  // Both are required: a post without a hero image is not publishable.
  if (!anthropicKey || !openaiKey) return null;
  if (process.env.BLOG_AUTOMATION_ENABLED?.trim().toLowerCase() === "false") return null;

  return {
    anthropicKey,
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
  };
}

export type BlogEffort = "low" | "medium" | "high" | "xhigh";

export function isBlogAutomationEnabled(): boolean {
  return getBlogConfig() !== null;
}

/* ── Models ──────────────────────────────────────────────────────────────
 * Pinned deliberately. gpt-image-1-mini is cheaper but OpenAI removes it on
 * 2026-12-01; gpt-image-2 is the stated replacement, so build on that.
 */
export const WRITER_MODEL = "claude-opus-5";
export const IMAGE_MODEL = "gpt-image-2";

/** Storage: reuse the existing public `assets` bucket under a blog/ prefix. */
export const STORAGE_BUCKET = "assets";
export const STORAGE_PREFIX = "blog";
