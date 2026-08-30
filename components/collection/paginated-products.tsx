"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import type { CardProduct } from "@/components/product/product-card";
import { trackViewCategory } from "@/lib/analytics";

const PRODUCTS_PER_PAGE = 9;

export function PaginatedProducts({
  products,
  category,
}: {
  products: CardProduct[];
  /** Collection name, for the Meta ViewCategory event. Omitted where there is no category. */
  category?: string;
}) {
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);

  /* ViewCategory - once per collection view. This component backs every collection page and
     nothing else, so it is the one place the event belongs; putting it on the pages instead
     would mean twelve copies that drift apart. */
  useEffect(() => {
    if (!category) return;
    trackViewCategory(
      category,
      products.slice(0, PRODUCTS_PER_PAGE).map((p) => ({
        id: String(p.id), title: p.title, price: p.price, category: p.category,
      })),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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
