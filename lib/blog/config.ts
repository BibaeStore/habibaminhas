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
    maxPerDay: Number(process.env.BLOG_MAX_PER_DAY ?? 2) || 2,
  };
}

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
