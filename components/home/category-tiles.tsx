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

// Static fallbacks for all categories — ensures they always show even if DB isn't populated yet
const STATIC_FALLBACKS = [
  {
    id: "ladies-suits-static",
    name: "Ladies Suits",
    slug: "ladies-suits",
    image: "/HeroSection/ladies-suits.webp",
    color: "#f2e0d8",
  },
  {
    id: "kids-formal-static",
    name: "Kids Formal",
    slug: "kids-formal",
    image: "/HeroSection/kids-formal.webp",
    color: "#f5e8c0",
  },
  {
    id: "baby-bedding-static",
    name: "Baby Bedding",
    slug: "baby-bedding",
    image: "/HeroSection/baby-bedding.webp",
    color: "#f0e0f0",
  },
  {
    id: "baby-nests-static",
    name: "Baby Nests",
    slug: "baby-nests",
    image: "/HeroSection/baby-bedding.webp",
    color: "#e8e0f0",
  },
  {
    id: "accessories-static",
    name: "Accessories",
    slug: "accessories",
    image: "/HeroSection/accessories.webp",
    color: "#eedbc4",
  },
  {
    id: "new-arrivals-static",
    name: "New Arrival",
    slug: "new-arrivals",
    image: "/HeroSection/new-arrivals.webp",
    color: "#f0ece4",
  },
];

export async function CategoryTiles() {
  const allTiles = await getFeaturedCategories().catch(() => []);

  // Start with static fallbacks
  let tiles = [...STATIC_FALLBACKS];

  // Merge with DB data — DB data takes precedence if slug matches
  for (const dbTile of allTiles) {
    if (ALLOWED_SLUGS.includes(dbTile.slug)) {
      const existingIdx = tiles.findIndex((t) => t.slug === dbTile.slug);
      if (existingIdx >= 0) {
        tiles[existingIdx] = dbTile as typeof tiles[0];
      } else {
        tiles.push(dbTile as typeof tiles[0]);
      }
    }
  }

  // Sort by the defined order
  tiles = tiles
    .filter((t) => ALLOWED_SLUGS.includes(t.slug))
    .sort((a, b) => ALLOWED_SLUGS.indexOf(a.slug) - ALLOWED_SLUGS.indexOf(b.slug));

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
