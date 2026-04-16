import Link from "next/link";
import { SectionHeading } from "@/components/common/section-heading";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export const metadata = { title: "Journal" };

const posts = [
  {
    slug: "dupatta-five-ways",
    title: "How to style a dupatta in five ways",
    excerpt: "From loose-draped to tuck-and-pin — an illustrated guide from the studio.",
    tag: "Style Notes",
    date: "12 Apr 2026",
    tone: ["#efe3d0", "#a8804b", "#2a1f17"] as [string, string, string],
    motif: "arch" as const,
  },
  {
    slug: "linen-notes",
    title: "The linen we love, and why it bruises beautifully",
    excerpt: "A brief history of flax, and why we picked Belgian over Egyptian this season.",
    tag: "Fabric",
    date: "04 Apr 2026",
    tone: ["#dcdccd", "#8c9b7e", "#3d4a36"] as [string, string, string],
    motif: "lattice" as const,
  },
  {
    slug: "layering-oud",
    title: "A perfumer's guide to layering oud",
    excerpt: "Base, middle, top — and what to wear underneath on a humid afternoon.",
    tag: "Fragrance",
    date: "29 Mar 2026",
    tone: ["#d7dbe4", "#6f7c8f", "#2a3244"] as [string, string, string],
    motif: "ogee" as const,
  },
  {
    slug: "summer-wardrobe-edit",
    title: "Seven pieces that travel all summer",
    excerpt: "A capsule our stylist packed for two weeks in Istanbul — in one carry-on.",
    tag: "Travel",
    date: "18 Mar 2026",
    tone: ["#ead7d1", "#c9917e", "#5a2a22"] as [string, string, string],
    motif: "floral" as const,
  },
  {
    slug: "behind-the-sukoon",
    title: "Behind Sukoon — photographs from the studio",
    excerpt: "Four days in Clifton, a spool of silk, and the quiet before a collection goes live.",
    tag: "The Studio",
    date: "09 Mar 2026",
    tone: ["#f2e6c9", "#d4b483", "#6b4a20"] as [string, string, string],
    motif: "floral" as const,
  },
];

export default function JournalPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <SectionHeading
        eyebrow="The Journal"
        title="Field notes, fabric notes, and the occasional recipe."
        description="We publish once a week. Everything is written in-house — no algorithms, no sponsored posts."
      />
      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Link
          href={`/journal/${posts[0].slug}`}
          className="group block lg:col-span-8"
        >
          <PlaceholderImage tone={posts[0].tone} motif={posts[0].motif} aspect="16/9" animate />
          <div className="mt-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
              {posts[0].tag}
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-ink-soft">{posts[0].date}</span>
            </div>
            <h2 className="mt-3 font-display text-4xl italic leading-tight group-hover:text-gold-dark-dark sm:text-5xl">
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
              <PlaceholderImage tone={p.tone} motif={p.motif} aspect="4/5" />
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                  {p.tag} · <span className="text-ink-soft">{p.date}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl italic leading-tight group-hover:text-gold-dark-dark">
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
            <PlaceholderImage tone={p.tone} motif={p.motif} aspect="16/9" />
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                {p.tag} · <span className="text-ink-soft">{p.date}</span>
              </div>
              <h3 className="mt-2 font-display text-3xl italic leading-tight group-hover:text-gold-dark-dark">
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
