import Link from "next/link";
import { trendTiles } from "@/lib/data";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { SectionHeading } from "@/components/common/section-heading";

const motifs = ["floral", "ogee", "arch", "lattice"] as const;

export function TrendTiles() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <SectionHeading
        eyebrow="Trending"
        title="Four directions in one season."
        description="Colour stories we are following this summer, pulled together from the floor and the runway."
        align="center"
        className="mb-12"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trendTiles.map((t, i) => (
          <Link key={t.label} href={t.href} className="group relative block">
            <PlaceholderImage
              tone={t.tone}
              motif={motifs[i]}
              aspect="4/5"
              overlay
            >
              <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                <span className="text-[10px] uppercase tracking-[0.32em] opacity-85">
                  Trend {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-2xl italic leading-tight">
                  {t.label}
                </h3>
              </div>
            </PlaceholderImage>
          </Link>
        ))}
      </div>
    </section>
  );
}
