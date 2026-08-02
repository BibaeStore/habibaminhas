import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/server";
import type { GeneratedPost } from "./generate";

/**
 * Pre-written blog queue — the zero-API-cost source.
 *
 * Posts are written ahead of time (in a Claude Code session, which the owner's
 * subscription already covers) and committed as JSON files. The cron then only pays
 * for the hero image, which is ~$0.04 a post instead of ~$0.53.
 *
 * There is no separate tracker table. `journal_posts` IS the tracker: a queue file is
 * "pending" precisely when its slug is not yet in the database. That means the queue
 * cannot drift out of sync with what is actually live, and re-running is always safe.
 */

const QUEUE_DIR = path.join(process.cwd(), "content", "blog-queue");

export interface QueuedPost extends Omit<GeneratedPost, "usage"> {
  /** Source filename, for logging. */
  _file: string;
}

/** Every queue file on disk, in filename order (001-, 002-, ...). */
export function listQueueFiles(): string[] {
  if (!fs.existsSync(QUEUE_DIR)) return [];
  return fs
    .readdirSync(QUEUE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

function readQueueFile(file: string): QueuedPost | null {
  try {
    const raw = fs.readFileSync(path.join(QUEUE_DIR, file), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed?.slug || !Array.isArray(parsed?.content)) return null;
    return { ...parsed, _file: file };
  } catch {
    // A malformed file must not stop the whole queue — skip it and move on.
    return null;
  }
}

/** Slugs already in the database, published or draft. */
async function existingSlugs(): Promise<Set<string>> {
  const sb = createAdminClient();
  const { data } = await sb.from("journal_posts").select("slug");
  return new Set((data ?? []).map((r) => r.slug));
}

/** The next queued post that has not been published yet, or null when the queue is dry. */
export async function getNextQueuedPost(): Promise<QueuedPost | null> {
  const files = listQueueFiles();
  if (files.length === 0) return null;

  const published = await existingSlugs();
  for (const file of files) {
    const post = readQueueFile(file);
    if (post && !published.has(post.slug)) return post;
  }
  return null;
}

/** Queue health, for the admin/status view. */
export async function getQueueStatus(): Promise<{
  total: number;
  published: number;
  pending: number;
  nextSlug: string | null;
  daysRemaining: number;
}> {
  const files = listQueueFiles();
  const published = await existingSlugs();

  let done = 0;
  let next: string | null = null;
  for (const file of files) {
    const post = readQueueFile(file);
    if (!post) continue;
    if (published.has(post.slug)) done++;
    else if (!next) next = post.slug;
  }

  const pending = files.length - done;
  return {
    total: files.length,
    published: done,
    pending,
    nextSlug: next,
    daysRemaining: pending, // one post per day
  };
}
