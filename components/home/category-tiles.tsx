import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { categoryTiles } from "@/lib/data";
import { SectionHeading } from "@/components/common/section-heading";

export function CategoryTiles() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find your perfect collection."
          description="From elegant ladies suits to premium baby essentials — curated with love in Pakistan."
        />
        <Link
          href="/shop"
          className="link-underline text-[12px] uppercase tracking-[0.28em] text-ink"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {categoryTiles.map((t) => (
          <Link key={t.label} href={t.href} className="group relative block overflow-hidden">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-ivory">
              <span className="font-display text-xl italic leading-tight sm:text-2xl drop-shadow-sm">
                {t.label}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] opacity-85 transition-transform group-hover:translate-x-0.5">
                Shop
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
