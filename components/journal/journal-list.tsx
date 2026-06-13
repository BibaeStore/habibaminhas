"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Journal listing with "Load more" (+3 at a time).
//
// SEO-safe: EVERY post is rendered into the DOM/SSR HTML; posts beyond the
// visible count are only visually hidden (`hidden` = display:none), so all
// /journal/[slug] links remain crawlable and the sitemap is unaffected. Only
// the on-screen display is limited for a shorter, friendlier page.
interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image: string;
}

const BATCH = 3;

export function JournalList({ posts }: { posts: JournalPost[] }) {
  const [visible, setVisible] = useState(BATCH);

  return (
    <div className="flex flex-col gap-16">
      {posts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/journal/${post.slug}`}
          className={`group block ${index >= visible ? "hidden" : ""}`}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
              {post.tag}
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-ink-soft">{post.date}</span>
            </div>
            <h2 className="mt-3 font-display text-4xl italic leading-tight transition-colors group-hover:text-gold-dark sm:text-5xl">
              {post.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
              {post.excerpt}
            </p>
          </div>
        </Link>
      ))}

      {visible < posts.length && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setVisible((v) => v + BATCH)}
            className="inline-flex h-12 items-center justify-center border border-ink px-10 text-[11px] uppercase tracking-[0.26em] transition-colors hover:bg-ink hover:text-ivory"
          >
            Load more
          </button>
          <span className="text-[11px] uppercase tracking-[0.24em] text-ink-soft">
            Showing {Math.min(visible, posts.length)} of {posts.length}
          </span>
        </div>
      )}
    </div>
  );
}
