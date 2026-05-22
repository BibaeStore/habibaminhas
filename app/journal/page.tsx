import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// SEO Focus Keyword: "Pakistani fashion blog"
// Target: Fashion-conscious Pakistanis seeking style guides and cultural insights
export const metadata: Metadata = {
  title: "Fashion Journal Pakistan — Habiba Minhas Blog | Style & Fabric Notes",
  description: "Pakistani fashion blog by Habiba Minhas. Style guides, fabric notes, Eid outfit ideas & cultural insights from Karachi. Weekly posts on Pakistani fashion, traditional wear & modern styling.",
  alternates: {
    canonical: "/journal/",
  },
  keywords: "Pakistani fashion blog, fashion blog Pakistan, style guide Pakistan, Pakistani fashion tips, Eid outfit ideas, fabric notes Pakistan, Karachi fashion blog",
};

const posts = [
  {
    slug: "dupatta-five-ways",
    title: "How to style a dupatta in five ways",
    excerpt: "From loose-draped to tuck-and-pin — an illustrated guide from the studio.",
    tag: "Style Notes",
    date: "12 Apr 2026",
    image: "/editorial/ladies-collection.webp",
  },
  {
    slug: "linen-notes",
    title: "The linen we love, and why it bruises beautifully",
    excerpt: "A brief history of flax, and why we picked Belgian over Egyptian this season.",
    tag: "Fabric",
    date: "04 Apr 2026",
    image: "/trending/sage-bloom.webp",
  },
  {
    slug: "layering-oud",
    title: "A perfumer's guide to layering oud",
    excerpt: "Base, middle, top — and what to wear underneath on a humid afternoon.",
    tag: "Fragrance",
    date: "29 Mar 2026",
    image: "/trending/emerald-embroidery.webp",
  },
  {
    slug: "summer-wardrobe-edit",
    title: "Seven pieces that travel all summer",
    excerpt: "A capsule our stylist packed for two weeks in Istanbul — in one carry-on.",
    tag: "Travel",
    date: "18 Mar 2026",
    image: "/trending/floral-lawn.webp",
  },
  {
    slug: "behind-the-sukoon",
    title: "Behind Sukoon — photographs from the studio",
    excerpt: "Four days in Clifton, a spool of silk, and the quiet before a collection goes live.",
    tag: "The Studio",
    date: "09 Mar 2026",
    image: "/editorial/accessories.webp",
  },
];

export default function JournalPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
          The Journal
        </span>
        <h1 className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-4xl md:text-[44px]">
          Field notes, fabric notes, and the occasional recipe.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[15px]">
          We publish once a week. Everything is written in-house — no algorithms, no sponsored posts.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Link href={`/journal/${posts[0].slug}`} className="group block lg:col-span-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={posts[0].image}
              alt={posts[0].title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
              {posts[0].tag}
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-ink-soft">{posts[0].date}</span>
            </div>
            <h2 className="mt-3 font-display text-4xl italic leading-tight group-hover:text-gold-dark sm:text-5xl">
              {posts[0].title}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
              {posts[0].excerpt}
            </p>
          </div>
        </Link>
        <div className="flex flex-col gap-10 lg:col-span-4">
          {posts.slice(1, 3).map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                  {p.tag} · <span className="text-ink-soft">{p.date}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl italic leading-tight group-hover:text-gold-dark">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        {posts.slice(3).map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="group block">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                {p.tag} · <span className="text-ink-soft">{p.date}</span>
              </div>
              <h3 className="mt-2 font-display text-3xl italic leading-tight group-hover:text-gold-dark">
                {p.title}
              </h3>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">
                {p.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
