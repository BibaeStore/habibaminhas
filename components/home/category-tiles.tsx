import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { getFeaturedCategories } from "@/lib/actions/categories";

// Exact slugs to show, in display order. Anything not in this list is hidden.
const ALLOWED_SLUGS = [
  "ladies-suits",
  "kids-formal",
  "baby-bedding",
  "baby-nests",
  "accessories",
  "new-arrivals",
];

const SLUG_TO_HREF: Record<string, string> = {
  "ladies-suits": "/ladies",
  "kids-formal":  "/kids",
  "baby-bedding": "/baby",
  "baby-nests":   "/baby",
  "accessories":  "/accessories",
  "new-arrivals": "/new",
};

// Static fallback for New Arrivals in case it isn't in the DB yet
const NEW_ARRIVALS_FALLBACK = {
  id: "new-arrivals-static",
  name: "New Arrivals",
  slug: "new-arrivals",
  image: "/categories/new-arrivals.webp",
  color: "#dde0f0",
};

export async function CategoryTiles() {
  const allTiles = await getFeaturedCategories().catch(() => []);

  // Keep only the allowed slugs, sort by the defined order
  let tiles = allTiles
    .filter((t) => ALLOWED_SLUGS.includes(t.slug))
    .sort((a, b) => ALLOWED_SLUGS.indexOf(a.slug) - ALLOWED_SLUGS.indexOf(b.slug));

  // If New Arrivals isn't in the DB, append the static fallback so it always shows
  if (!tiles.some((t) => t.slug === "new-arrivals")) {
    tiles = [...tiles, NEW_ARRIVALS_FALLBACK as typeof tiles[0]];
  }

  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find your perfect collection."
          description="From elegant ladies suits to premium baby essentials — curated with love in Pakistan."
        />
        <Link
          href="/ladies"
          className="link-underline text-[12px] uppercase tracking-[0.28em] text-ink"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {tiles.map((t) => {
          const href = SLUG_TO_HREF[t.slug] ?? `/${t.slug}`;
          return (
            <Link key={t.id} href={href} className="group relative block overflow-hidden">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {t.image ? (
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                    style={{ background: `linear-gradient(160deg, ${t.color ?? "#f0ece4"} 0%, ${darken(t.color ?? "#f0ece4")} 100%)` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-ivory">
                <span className="font-display text-xl italic leading-tight sm:text-2xl drop-shadow-sm">
                  {t.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] opacity-85 transition-transform group-hover:translate-x-0.5">
                  Shop
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
