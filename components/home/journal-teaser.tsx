import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { SectionHeading } from "@/components/common/section-heading";

const posts = [
  {
    title: "How to style a dupatta in five ways",
    excerpt: "From the classic drape to the modern throw — five ways to wear your dupatta this season.",
    tag: "Style Notes",
    href: "/journal/dupatta-five-ways",
    image: "/editorial/ladies-collection.webp",
    tone: ["#efe3d0", "#a8804b", "#2a1f17"] as [string, string, string],
    motif: "arch" as const,
  },
  {
    title: "Modest dressing: comfort meets elegance",
    excerpt: "Discover how clean silhouettes and breathable fabrics can elevate your everyday look.",
    tag: "Modest Wear",
    href: "/journal/modest-dressing",
    image: "/editorial/baby-nursery.webp",
    tone: ["#dcdccd", "#8c9b7e", "#3d4a36"] as [string, string, string],
    motif: "lattice" as const,
  },
  {
    title: "Dressing for Eid: tradition in every thread",
    excerpt: "How to choose the perfect ensemble for Eid celebrations — from fabric to embroidery.",
    tag: "Occasion",
    href: "/journal/eid-dressing",
    image: "/editorial/kids-festive.webp",
    tone: ["#d7dbe4", "#6f7c8f", "#2a3244"] as [string, string, string],
    motif: "ogee" as const,
  },
];

export function JournalTeaser() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
        <SectionHeading
          eyebrow="The Journal"
          title="Style, culture & craft."
        />
        <Link
          href="/journal"
          className="link-underline text-[12px] uppercase tracking-[0.28em] text-ink"
        >
          All Stories
        </Link>
      </div>

      {/* Featured large post */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Link
          href={posts[0].href}
          className="group relative lg:col-span-6 block overflow-hidden"
        >
          <div className="relative aspect-[3/2] overflow-hidden">
            {posts[0].image ? (
              <Image
                src={posts[0].image}
                alt={posts[0].title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <PlaceholderImage tone={posts[0].tone} motif={posts[0].motif} aspect="3/2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
              <span className="text-[9px] uppercase tracking-[0.36em] opacity-80">
                {posts[0].tag}
              </span>
              <h3 className="mt-2 font-display text-2xl italic leading-snug sm:text-3xl">
                {posts[0].title}
              </h3>
              <span className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] opacity-75 group-hover:opacity-100">
                Read <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Two smaller posts stacked */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          {posts.slice(1).map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group flex gap-4 border border-border-soft bg-cream p-4 transition-colors hover:border-ink sm:gap-5"
            >
              <div className="relative h-[100px] w-[80px] shrink-0 overflow-hidden sm:h-[120px] sm:w-[96px]">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="96px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <PlaceholderImage tone={p.tone} motif={p.motif} aspect="4/5" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.32em] text-gold-dark">
                  {p.tag}
                </span>
                <h3 className="font-display text-lg italic leading-snug text-ink sm:text-xl">
                  {p.title}
                </h3>
                <p className="hidden text-[12px] leading-relaxed text-ink-soft sm:block line-clamp-2">
                  {p.excerpt}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-ink-soft group-hover:text-gold-dark">
                  Read <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
