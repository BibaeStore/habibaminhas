import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryTiles } from "@/lib/data";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { SectionHeading } from "@/components/common/section-heading";

const motifs = ["lattice", "ogee", "floral", "arch", "stripes", "lattice"] as const;

export function CategoryTiles() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <SectionHeading
          eyebrow="Shop by Mood"
          title="Six ways into the season."
          description="A curated sweep of the new summer mood — from fluorescence to modest dress."
        />
        <Link
          href="/edit"
          className="link-underline text-[12px] uppercase tracking-[0.28em] text-ink"
        >
          View The Edit
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {categoryTiles.map((t, i) => (
          <Link key={t.label} href={t.href} className="group relative block">
            <PlaceholderImage
              tone={t.tone}
              motif={motifs[i]}
              aspect="3/4"
              overlay
            >
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-ivory">
                <span className="font-display text-xl italic leading-tight sm:text-2xl">
                  {t.label}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] opacity-85 transition-transform group-hover:translate-x-0.5">
                  Shop
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </PlaceholderImage>
          </Link>
        ))}
      </div>
    </section>
  );
}
