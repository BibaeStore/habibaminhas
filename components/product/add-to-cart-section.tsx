"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const SIZES = ["XS", "S", "M", "L", "XL"];

interface Props {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  palette: string[];
  price: number;
  compare_at: number | null;
  sku: string | null;
  hasSizes: boolean;
}

export function AddToCartSection({
  id,
  slug,
  title,
  image,
  palette,
  price,
  compare_at,
  sku,
  hasSizes,
}: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSizes ? null : "onesize"
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function handleAdd() {
    if (hasSizes && !selectedSize) return;
    addItem({ id, slug, title, image, palette, price, compare_at, size: hasSizes ? selectedSize : null, sku });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8">
      {hasSizes && (
        <div className="mt-0 grid grid-cols-5 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(s)}
              className={`h-11 border text-[12px] uppercase tracking-[0.22em] transition-colors ${
                selectedSize === s
                  ? "border-ink bg-ink text-ivory"
                  : "border-border-soft text-ink hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={handleAdd}
          disabled={hasSizes && !selectedSize}
          className={`inline-flex h-14 w-full items-center justify-center gap-3 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            added ? "bg-sage" : "bg-ink hover:bg-gold-dark"
          }`}
        >
          {added ? "Added to bag ✓" : hasSizes && !selectedSize ? "Select a size" : "Add to bag"}
        </button>
        <div className="flex gap-3">
          <button className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink text-[12px] uppercase tracking-[0.26em] hover:bg-ink hover:text-ivory transition-colors">
            <Heart className="h-4 w-4" /> Wishlist
          </button>
          <button className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink/20 text-[12px] uppercase tracking-[0.26em] hover:border-ink transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
