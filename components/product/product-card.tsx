import Link from "next/link";
import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";

const motifs = ["lattice", "floral", "ogee", "stripes", "arch"] as const;

// Accepts both the old lib/data Product shape and Supabase products
export interface CardProduct {
  id: string | number;
  slug: string;
  title: string;
  price: number;
  // old format
  image?: string | null;
  compareAt?: number | null;
  collection?: string;
  // supabase format
  images?: string[];
  compare_at?: number | null;
  subcategory?: string | null;
  subtype?: string | null;
  palette: string[];
  badge?: string | null;
}

export function ProductCard({
  product,
  index = 0,
  compact = false,
}: {
  product: CardProduct;
  index?: number;
  compact?: boolean;
}) {
  const motif = motifs[index % motifs.length];

  // Normalise field names (support both old and supabase formats)
  const img = product.image ?? product.images?.[0] ?? null;
  const compareAt = product.compareAt ?? product.compare_at ?? null;
  const collection = product.collection ?? product.subcategory ?? product.subtype ?? null;

  const hasSale = compareAt && compareAt > product.price;
  const aspect = compact ? "4/5" : "3/4";

  const imageContent = (
    <>
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className="flex flex-col items-start gap-1.5">
          {product.badge ? (
            <Badge
              variant={
                product.badge === "Bestseller"
                  ? "gold"
                  : product.badge === "Limited"
                    ? "default"
                    : "new"
              }
            >
              {product.badge}
            </Badge>
          ) : null}
          {hasSale ? <Badge variant="sale">Sale</Badge> : null}
        </div>
        <button
          type="button"
          aria-label="Add to wishlist"
          className="rounded-full bg-ivory/90 p-2 text-ink opacity-0 shadow-soft backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-ink backdrop-blur-sm">
          Quick View
        </span>
        <button
          type="button"
          aria-label="Add to bag"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <article className="group relative flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block">
        {img ? (
          <div
            className="relative w-full overflow-hidden bg-cream"
            style={{ aspectRatio: aspect.replace("/", " / ") }}
          >
            <Image
              src={img}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            {imageContent}
          </div>
        ) : (
          <PlaceholderImage
            tone={product.palette as [string, string, string]}
            motif={motif}
            aspect={aspect}
            className="bg-cream transition-opacity duration-500"
          >
            {imageContent}
          </PlaceholderImage>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-1 text-[13px] leading-snug text-ink hover:text-gold-dark"
        >
          {product.title}
        </Link>
        {collection && (
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {collection}
          </div>
        )}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[13px] font-medium text-ink">
            {formatPrice(product.price)}
          </span>
          {hasSale ? (
            <span className="text-[12px] text-muted line-through">
              {formatPrice(compareAt!)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
