"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import type { CardProduct } from "@/components/product/product-card";

const PRODUCTS_PER_PAGE = 9;

export function PaginatedProducts({ products }: { products: CardProduct[] }) {
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;
  const remainingCount = products.length - displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE);
  };

  return (
    <>
      <ProductGrid products={displayedProducts} cols="4" />

      {hasMore && (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <button
            onClick={loadMore}
            className="border border-ink px-7 py-3 text-[12px] uppercase tracking-[0.28em] transition-colors hover:bg-ink hover:text-ivory"
          >
            Load More
          </button>
          <p className="text-[11px] uppercase tracking-[0.24em] text-ink-soft">
            Showing {displayedProducts.length} of {products.length} • {remainingCount} more
          </p>
        </div>
      )}
    </>
  );
}
