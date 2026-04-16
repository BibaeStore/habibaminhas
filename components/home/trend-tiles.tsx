import Link from "next/link";
import Image from "next/image";
import { trendTiles } from "@/lib/data";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { SectionHeading } from "@/components/common/section-heading";

export function TrendTiles() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <SectionHeading
        eyebrow="Trending Now"
        title="Four directions in one season."
        description="Colour stories we are following this summer, pulled together from the floor and the runway."
        align="center"
        className="mb-12"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trendTiles.map((t, i) => (
          <Link key={t.label} href={t.href} className="group relative block overflow-hidden">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              {t.image ? (
                <Image
                  src={t.image}
                  alt={t.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <PlaceholderImage
                  tone={t.tone}
                  motif="floral"
                  aspect="4/5"
                  overlay
                />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
              <span className="text-[10px] uppercase tracking-[0.32em] opacity-75">
                Trend {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-display text-2xl italic leading-tight drop-shadow-sm">
                {t.label}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
