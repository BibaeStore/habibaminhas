import Image from "next/image";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, ArrowDownAZ } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { PlaceholderImage } from "@/components/common/placeholder-image";

type Crumb = { label: string; href?: string };
type Filter = { label: string; count: number };

export function CollectionTemplate({
  crumbs,
  eyebrow,
  title,
  description,
  tone = ["#efe3d0", "#a8804b", "#2a1f17"],
  motif = "floral",
  image,
  products,
  filters,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  description?: string;
  tone?: [string, string, string];
  motif?: "lattice" | "floral" | "ogee" | "stripes" | "arch";
  image?: string;
  products: Product[];
  filters?: { colour?: Filter[]; size?: Filter[]; piece?: Filter[]; price?: Filter[] };
}) {
  return (
    <>
      <section className="relative">
        {image ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <PlaceholderImage tone={tone} motif={motif} aspect="21/9" overlay animate />
        )}
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-6 pb-10 text-ivory sm:px-12 sm:pb-16">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-ivory/85">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {c.href ? (
                  <Link href={c.href} className="hover:text-ivory">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 ? (
                  <ChevronRight className="h-3 w-3 opacity-60" />
                ) : null}
              </span>
            ))}
          </nav>
          <div className="mt-4 max-w-3xl">
            <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
              {eyebrow}
            </span>
            <h1 className="mt-3 font-display text-5xl font-light italic leading-[0.98] sm:text-6xl md:text-7xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ivory/90">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8">
        <div className="sticky top-[64px] z-20 -mx-4 mb-10 border-y border-border-soft bg-ivory/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] hover:border-ink">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
              </button>
              {["Colour", "Size", "Piece", "Price"].map((f) => (
                <button
                  key={f}
                  className="hidden items-center gap-2 border border-ink/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-ink-soft hover:border-ink hover:text-ink md:inline-flex"
                >
                  {f} <ChevronRight className="h-3 w-3 rotate-90" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] uppercase tracking-[0.24em] text-muted sm:inline">
                {products.length} Pieces
              </span>
              <button className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] hover:border-ink">
                <ArrowDownAZ className="h-3.5 w-3.5" /> Featured
              </button>
            </div>
          </div>
        </div>

        <ProductGrid products={products} cols="4" />

        <div className="mt-16 flex items-center justify-center">
          <button className="border border-ink px-7 py-3 text-[12px] uppercase tracking-[0.28em] hover:bg-ink hover:text-ivory">
            Load more
          </button>
        </div>
      </section>
    </>
  );
}
