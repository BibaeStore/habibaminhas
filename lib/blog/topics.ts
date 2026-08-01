import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Topic queue for the blog automation.
 *
 * `docs/blogging/topical-map.md` is the editorial plan — 106 posts, each with a title,
 * slug, target keywords, NLP entities, and intended internal links. It was written by
 * hand and is the source of truth for WHAT to write about; this module turns it into a
 * queue by subtracting whatever is already in `journal_posts`.
 *
 * Parsing a markdown doc is deliberate. The alternative — a second topics table — would
 * drift from the plan the owner actually maintains.
 */

export interface Topic {
  postNumber: number;
  title: string;
  slug: string;
  searchIntent?: string;
  keywords: string[];
  entities: string[];
  /** Raw "Internal Links → to" line, e.g. "/kids, Post 22, Post 24". */
  internalLinkHints: string[];
  cta?: string;
}

const MAP_PATH = path.join(process.cwd(), "docs", "blogging", "topical-map.md");

function field(block: string, label: string): string | undefined {
  // Matches:  - **Title:** Some title
  const m = block.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, "i"));
  return m ? m[1].replace(/`/g, "").trim() : undefined;
}

function list(block: string, label: string): string[] {
  const raw = field(block, label);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse every topic out of the topical map. */
export function parseTopicalMap(): Topic[] {
  if (!fs.existsSync(MAP_PATH)) return [];
  const md = fs.readFileSync(MAP_PATH, "utf8");

  // Each entry starts with **Post N** and runs to the next one.
  const blocks = md.split(/\*\*Post\s+(\d+)\*\*/i);
  const topics: Topic[] = [];

  // split() yields [preamble, "1", body1, "2", body2, ...]
  for (let i = 1; i < blocks.length; i += 2) {
    const postNumber = Number(blocks[i]);
    const body = blocks[i + 1] ?? "";
    const title = field(body, "Title");
    const slug = field(body, "Slug");
    if (!title || !slug) continue;

    topics.push({
      postNumber,
      title,
      slug,
      searchIntent: field(body, "Search Intent"),
      keywords: list(body, "Target Keywords"),
      entities: list(body, "NLP Entities"),
      internalLinkHints: list(body, "Internal Links → to"),
      cta: field(body, "CTA"),
    });
  }

  // De-dupe by slug — the map has been renumbered before and could repeat one.
  const seen = new Set<string>();
  return topics.filter((t) => (seen.has(t.slug) ? false : seen.add(t.slug)));
}

/**
 * Topics not yet in `journal_posts`, in plan order.
 * Published slugs are subtracted, so re-running is always safe.
 */
export async function getPendingTopics(): Promise<Topic[]> {
  const all = parseTopicalMap();
  if (all.length === 0) return [];

  const sb = createAdminClient();
  const { data } = await sb.from("journal_posts").select("slug");
  const published = new Set((data ?? []).map((r) => r.slug));

  return all
    .filter((t) => !published.has(t.slug))
    .sort((a, b) => a.postNumber - b.postNumber);
}

/** The next topic to write, or null when the plan is exhausted. */
export async function getNextTopic(): Promise<Topic | null> {
  const pending = await getPendingTopics();
  return pending[0] ?? null;
}

/**
 * Real internal-link targets for the writer.
 *
 * The map's link hints are things like "Post 22" and "/kids". The model cannot be
 * trusted to resolve those, and a hallucinated URL is a broken link on a live page —
 * so we resolve them here and hand the model only URLs that actually exist.
 */
export async function getLinkTargets(): Promise<{
  collections: { url: string; label: string }[];
  posts: { url: string; title: string }[];
  products: { url: string; title: string }[];
}> {
  const sb = createAdminClient();

  const [{ data: posts }, { data: products }] = await Promise.all([
    sb.from("journal_posts").select("slug, title").eq("status", "published").limit(60),
    sb
      .from("products")
      .select("slug, title, category")
      .eq("status", "active")
      .gt("stock", 0)
      .limit(40),
  ]);

  return {
    collections: [
      { url: "/ladies", label: "Ladies Suits" },
      { url: "/kids", label: "Kids Formal Wear" },
      { url: "/baby", label: "Baby & Nursery" },
      { url: "/accessories", label: "Accessories" },
      { url: "/shop", label: "Shop All" },
      { url: "/virtual-try-room", label: "Virtual Try Room" },
    ],
    posts: (posts ?? []).map((p) => ({ url: `/journal/${p.slug}`, title: p.title })),
    products: (products ?? []).map((p) => ({
      url: `/product/${p.category}/${p.slug}`,
      title: p.title,
    })),
  };
}
