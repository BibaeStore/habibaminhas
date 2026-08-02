import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

/**
 * Runs the publishing quality gate over every file in content/blog-queue/
 * without touching the database.
 *
 * The cron applies the same gate at publish time, but a failure there is silent —
 * the post is simply skipped and the day's slot is lost. Running it here means a bad
 * post is caught while it is still being written, which is the only moment it is
 * cheap to fix.
 *
 *   npx tsx scripts/validate-blog-queue.ts
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}
const sb = createClient(url, key);

const QUEUE_DIR = path.join(process.cwd(), "content", "blog-queue");

/** Mirrors lib/blog/topics.ts getLinkTargets() — every URL an article may link to. */
async function allowedUrls(): Promise<Set<string>> {
  const [{ data: posts }, { data: products }, { data: active }] = await Promise.all([
    sb.from("journal_posts").select("slug").eq("status", "published"),
    sb.from("products").select("slug, category").eq("status", "active"),
    sb.from("products").select("category, subcategory").eq("status", "active"),
  ]);

  const CATEGORY_PATH: Record<string, string> = {
    "ladies-suits": "ladies",
    "kids-formal": "kids",
    "baby-products": "baby",
  };

  const urls = new Set<string>([
    "/ladies",
    "/kids",
    "/baby",
    "/accessories",
    "/shop",
    "/virtual-try-room",
    "/content/size-guide",
    "/content/fabric-glossary",
    "/content/denim-fit-guide",
    "/help/faq",
    "/help/shipping",
    "/help/returns",
    "/help/payments",
  ]);

  for (const p of active ?? []) {
    const base = CATEGORY_PATH[p.category as string] ?? p.category;
    for (const sub of ((p.subcategory as string[] | null) ?? [])) {
      if (sub) urls.add(`/${base}/${sub}`);
    }
  }
  for (const p of posts ?? []) urls.add(`/journal/${p.slug}`);
  for (const p of products ?? []) urls.add(`/product/${p.category}/${p.slug}`);

  // Queue files may cross-link to each other — a post published tomorrow is a real
  // target for one published today, since the queue publishes in filename order.
  for (const f of fs.readdirSync(QUEUE_DIR).filter((f) => f.endsWith(".json"))) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), "utf8"));
      if (p?.slug) urls.add(`/journal/${p.slug}`);
    } catch {
      /* reported separately below */
    }
  }

  return urls;
}

async function main() {
  const { validatePost } = await import("../lib/blog/validate");
  const urls = await allowedUrls();
  const files = fs
    .readdirSync(QUEUE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  let pass = 0;
  let words = 0;
  const categories: Record<string, number> = {};

  for (const file of files) {
    let post: any;
    try {
      post = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, file), "utf8"));
    } catch (e) {
      console.log(`BROKEN ${file} — ${(e as Error).message}`);
      continue;
    }

    const r = validatePost(post, urls);
    words += r.stats.words;
    categories[post.category_tag] = (categories[post.category_tag] ?? 0) + 1;
    if (r.ok) pass++;

    const flag = r.ok ? "PASS" : "FAIL";
    console.log(
      `${flag} ${post.slug.padEnd(52)} ${String(r.stats.words).padStart(4)}w ` +
        `t${String(r.stats.titleLength).padStart(3)} m${String(r.stats.metaLength).padStart(3)} ` +
        `lnk${String(r.stats.internalLinks).padStart(2)} faq${r.stats.faqCount}`,
    );
    for (const e of r.errors) console.log(`       x ${e}`);
    for (const w of r.warnings) console.log(`       ~ ${w}`);
  }

  console.log(
    `\n${pass}/${files.length} pass · ${words.toLocaleString()} words · ` +
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
  );
  if (pass < files.length) process.exitCode = 1;
}

main();
