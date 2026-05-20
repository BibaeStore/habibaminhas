"use client";

import { useState } from "react";
import { Minus, Plus, Heart, Share2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import Image from "next/image";

const SIZES = ["XS", "S", "M", "L", "XL"];

interface Props {
  id: string;
  slug: string;
  category: string;
  title: string;
  image: string | null;
  palette: string[];
  price: number;
  compare_at: number | null;
  sku: string | null;
  hasSizes: boolean;
  sizesStock?: Record<string, number> | null;
}

export function AddToCartSection({
  id, slug, category, title, image, palette, price, compare_at, sku, hasSizes, sizesStock,
}: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(hasSizes ? null : "onesize");
  const [mobileQty, setMobileQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem    = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const toggle     = useWishlistStore((s) => s.toggle);
  const isWished   = useWishlistStore((s) => s.has(slug));

  const canAdd = !hasSizes || !!selectedSize;

  function handleAdd() {
    if (!canAdd) return;
    addItem({ id, slug, category, title, image, palette, price, compare_at, size: hasSizes ? selectedSize : null, sku });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openDrawer();
  }

  function handleShare() {
    const url = `${window.location.origin}/product/${category}/${slug}`;
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out ${title} at Habiba Minhas`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Product link copied to clipboard!");
    }
  }

  function handleWhatsApp() {
    const url = `${window.location.origin}/product/${category}/${slug}`;
    const message = `Hi, I'm interested in:\n\n${title}\nSKU: ${sku || "N/A"}\n${url}`;
    const whatsappUrl = `https://wa.me/923120295812?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  function isSizeInStock(size: string): boolean {
    if (!sizesStock) return false; // If no stock data, disable all sizes
    return (sizesStock[size] ?? 0) > 0;
  }

  return (
    <>
      {/* Size selector — shown on both mobile and desktop */}
      {hasSizes && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {SIZES.map((s) => {
            const inStock = isSizeInStock(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => inStock && setSelectedSize(s)}
                disabled={!inStock}
                className={`h-11 border text-[12px] uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                  selectedSize === s
                    ? "border-ink bg-ink text-ivory"
                    : inStock
                      ? "border-border-soft text-ink hover:border-ink"
                      : "border-border-soft text-muted"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Desktop Add-to-bag (hidden on mobile) ──────────────── */}
      <div className="mt-8 hidden flex-col gap-3 lg:flex">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={`inline-flex h-14 w-full items-center justify-center text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            added ? "bg-sage" : "bg-ink hover:bg-gold-dark"
          }`}
        >
          {added ? "Added to bag ✓" : canAdd ? "Add to bag" : "Select a size"}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toggle(slug)}
            className={`flex h-12 flex-1 items-center justify-center gap-2 border text-[12px] uppercase tracking-[0.26em] transition-colors ${
              isWished ? "border-ink bg-ink text-ivory" : "border-ink text-ink hover:bg-ink hover:text-ivory"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
            {isWished ? "Saved" : "Wishlist"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink/20 text-[12px] uppercase tracking-[0.26em] transition-colors hover:border-ink"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex h-12 items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] text-[12px] uppercase tracking-[0.26em] text-white transition-colors hover:bg-[#20BA5A]"
        >
          <Image src="/icons/whatsapp.svg" alt="" width={16} height={16} className="h-4 w-4" />
          Inquire on WhatsApp
        </button>
      </div>

      {/* ── Mobile sticky bottom bar ────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-[45] border-t border-border-soft bg-ivory px-4 py-3 shadow-[0_-4px_24px_rgba(26,22,18,0.1)] lg:hidden">
        {hasSizes && !selectedSize && (
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-sale">
            Please select a size above
          </p>
        )}
        <div className="flex items-center gap-2">
          {/* Qty stepper */}
          <div className="flex h-12 shrink-0 items-center border border-border-soft">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => setMobileQty((q) => Math.max(1, q - 1))}
              className="flex h-full w-10 items-center justify-center text-ink transition-colors hover:bg-cream"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-[13px] font-medium tabular-nums text-ink">
              {mobileQty}
            </span>
            <button
              type="button"
              aria-label="Increase"
              onClick={() => setMobileQty((q) => q + 1)}
              className="flex h-full w-10 items-center justify-center text-ink transition-colors hover:bg-cream"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add to Bag */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`flex h-12 flex-1 items-center justify-center text-[11px] font-bold uppercase tracking-[0.3em] text-ivory transition-colors disabled:opacity-40 ${
              added ? "bg-sage" : "bg-ink hover:bg-gold-dark"
            }`}
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>

          {/* Wishlist heart */}
          <button
            type="button"
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggle(slug)}
            className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
              isWished ? "border-ink bg-ink text-ivory" : "border-border-soft text-ink hover:border-ink"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </>
  );
}
