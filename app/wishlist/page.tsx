"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductsBySlugs } from "@/lib/actions/products";
import type { CardProduct } from "@/components/product/product-card";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState<CardProduct[]>([]);

  const slugs = useWishlistStore((s) => s.slugs);
  const clear = useWishlistStore((s) => s.clear);
  const toggle = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    getProductsBySlugs(slugs)
      .then((rows) => {
        if (cancelled) return;
        const ordered = slugs
          .map((s) => rows.find((r) => r.slug === s))
          .filter((r): r is NonNullable<typeof r> => r !== undefined);
        setWishlisted(
          ordered.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.price,
            category: p.category,
            images: p.images,
            compare_at: p.compare_at,
            palette: p.palette,
            badge: p.badge,
            subcategory: p.subcategory,
            subtype: p.subtype,
          })),
        );
        const liveSlugs = new Set(rows.map((r) => r.slug));
        slugs.forEach((s) => {
          if (!liveSlugs.has(s)) toggle(s);
        });
      })
      .catch(() => {
        if (!cancelled) setWishlisted([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, slugs, toggle]);

  if (!mounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Saved for later
      </span>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl italic sm:text-5xl">Your Wishlist</h1>
        {wishlisted.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-sale"
          >
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-5 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
          <p className="text-[13px] text-ink-soft">Loading your saved pieces…</p>
        </div>
      ) : wishlisted.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
            <Heart className="h-8 w-8 text-muted" />
          </div>
          <div>
            <h2 className="font-display text-2xl italic">Nothing saved yet</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              Tap the heart on any product to save it here.
            </p>
          </div>
          <Link
            href="/ladies"
            className="group inline-flex h-12 items-center gap-2 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
          >
            Shop ladies
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13px] text-ink-soft">
            {wishlisted.length} item{wishlisted.length !== 1 ? "s" : ""} saved
          </p>
          <div className="mt-12">
            <ProductGrid products={wishlisted} cols="4" />
          </div>
        </>
      )}
    </div>
  );
}
