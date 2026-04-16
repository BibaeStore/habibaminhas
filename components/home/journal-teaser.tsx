import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { SectionHeading } from "@/components/common/section-heading";

const posts = [
  {
    title: "How to style a dupatta in five ways",
    tag: "Style Notes",
    href: "/journal/dupatta-five-ways",
    tone: ["#efe3d0", "#a8804b", "#2a1f17"] as [string, string, string],
    motif: "arch" as const,
  },
  {
    title: "The linen we love, and why it bruises beautifully",
    tag: "Fabric",
    href: "/journal/linen-notes",
    tone: ["#dcdccd", "#8c9b7e", "#3d4a36"] as [string, string, string],
    motif: "lattice" as const,
  },
  {
    title: "A perfumer's guide to layering oud",
    tag: "Fragrance",
    href: "/journal/layering-oud",
    tone: ["#d7dbe4", "#6f7c8f", "#2a3244"] as [string, string, string],
    motif: "ogee" as const,
  },
];

export function JournalTeaser() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-10">
        <SectionHeading
          eyebrow="The Journal"
          title="Reading for a slow Sunday."
        />
        <Link
          href="/journal"
          className="link-underline text-[12px] uppercase tracking-[0.28em] text-ink"
        >
          All Stories
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.title} href={p.href} className="group block">
            <PlaceholderImage
              tone={p.tone}
              motif={p.motif}
              aspect="4/5"
              animate
            />
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.32em] text-gold-dark">
                {p.tag}
              </span>
              <h3 className="font-display text-xl italic leading-snug text-ink sm:text-2xl">
                {p.title}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.28em] text-ink-soft group-hover:text-gold-dark">
                Read <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
