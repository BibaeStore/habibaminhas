"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, X, Eye, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";

const motifs = ["lattice", "floral", "ogee", "stripes", "arch"] as const;

export interface CardProduct {
  id: string | number;
  slug: string;
  title: string;
  price: number;
  image?: string | null;
  compareAt?: number | null;
  collection?: string;
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
  const [quickOpen, setQuickOpen] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const toggle      = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.slug));
  const addItem     = useCartStore((s) => s.addItem);
  const openDrawer  = useCartStore((s) => s.openDrawer);

  const img       = product.image ?? product.images?.[0] ?? null;
  const compareAt = product.compareAt ?? product.compare_at ?? null;
  const collection = product.collection ?? product.subcategory ?? product.subtype ?? null;
  const hasSale   = compareAt && compareAt > product.price;
  const aspect    = compact ? "4/5" : "3/4";

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.slug);
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQuickOpen(true);
  }

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id:         String(product.id),
      slug:       product.slug,
      title:      product.title,
      image:      img,
      palette:    product.palette as string[],
      price:      product.price,
      compare_at: compareAt,
      size:       null,
      sku:        null,
    });
    setAddedToBag(true);
    openDrawer();
    setTimeout(() => setAddedToBag(false), 2000);
  }

  const imageContent = (
    <>
      {/* Top row: badges + wishlist heart */}
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className="flex flex-col items-start gap-1.5">
          {product.badge && (
            <Badge variant={product.badge === "Bestseller" ? "gold" : product.badge === "Limited" ? "default" : "new"}>
              {product.badge}
            </Badge>
          )}
          {hasSale && <Badge variant="sale">Sale</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={`rounded-full p-2 shadow-soft backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 ${
            isWishlisted
              ? "bg-ink text-ivory opacity-100"
              : "bg-ivory/90 text-ink opacity-0 hover:bg-ink hover:text-ivory"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Bottom row: Quick View + Add to Bag */}
      <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={handleQuickView}
          className="flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-ink backdrop-blur-sm transition-colors hover:bg-ink hover:text-ivory"
        >
          <Eye className="h-3 w-3" />
          Quick View
        </button>
        <button
          type="button"
          aria-label="Add to bag"
          onClick={handleAddToBag}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            addedToBag ? "bg-sage text-ivory" : "bg-ink text-ivory hover:bg-gold-dark"
          }`}
        >
          {addedToBag ? <ShoppingBag className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </>
  );

  return (
    <>
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
            <span className="text-[13px] font-medium text-ink">{formatPrice(product.price)}</span>
            {hasSale && (
              <span className="text-[12px] text-muted line-through">{formatPrice(compareAt!)}</span>
            )}
          </div>
        </div>
      </article>

      {/* ── Quick View modal ────────────────────────────────────────── */}
      {quickOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setQuickOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative z-10 flex w-full max-w-[820px] overflow-hidden bg-ivory shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setQuickOpen(false)}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/80 text-ink backdrop-blur-sm transition-colors hover:bg-ink hover:text-ivory"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Product image */}
            <div className="relative w-[45%] flex-none">
              {img ? (
                <Image
                  src={img}
                  alt={product.title}
                  fill
                  sizes="360px"
                  className="object-cover object-top"
                />
              ) : (
                <PlaceholderImage
                  tone={product.palette as [string, string, string]}
                  motif={motif}
                  aspect="3/4"
                  className="h-full"
                />
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-1 flex-col justify-between gap-6 p-8">
              <div className="flex flex-col gap-4">
                {/* Badge */}
                {(product.badge || hasSale) && (
                  <div className="flex gap-2">
                    {product.badge && (
                      <Badge variant={product.badge === "Bestseller" ? "gold" : product.badge === "Limited" ? "default" : "new"}>
                        {product.badge}
                      </Badge>
                    )}
                    {hasSale && <Badge variant="sale">Sale</Badge>}
                  </div>
                )}

                {/* Collection label */}
                {collection && (
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gold-dark">
                    {collection}
                  </p>
                )}

                {/* Title */}
                <h2 className="font-display text-2xl italic leading-tight text-ink sm:text-3xl">
                  {product.title}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-[18px] font-medium text-ink">{formatPrice(product.price)}</span>
                  {hasSale && (
                    <span className="text-[15px] text-muted line-through">{formatPrice(compareAt!)}</span>
                  )}
                </div>

                <p className="text-[12px] leading-relaxed text-ink-soft">
                  Handcrafted in Pakistan with premium fabrics and artisan embroidery.
                  Visit the product page to select size and customise your order.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className={`flex h-12 items-center justify-center gap-2 text-[12px] uppercase tracking-[0.28em] transition-colors ${
                    addedToBag
                      ? "bg-sage text-ivory"
                      : "bg-ink text-ivory hover:bg-gold-dark"
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {addedToBag ? "Added to bag!" : "Add to Bag"}
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => setQuickOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 border border-border-soft text-[12px] uppercase tracking-[0.28em] text-ink transition-colors hover:bg-cream"
                >
                  View Full Details
                </Link>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`flex h-10 items-center justify-center gap-2 text-[11px] uppercase tracking-[0.24em] transition-colors ${
                    isWishlisted
                      ? "text-ink font-medium"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                  {isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
