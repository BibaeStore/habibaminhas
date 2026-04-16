"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";

const categories = ["All", "Ladies", "Kids", "Baby", "Accessories"];
const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("relevance");

  const results = useMemo(() => {
    let filtered = products.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCat =
        category === "All" || p.category.toLowerCase().includes(category.toLowerCase());
      return matchesQuery && matchesCat;
    });

    if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

    return filtered;
  }, [query, category, sort]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for suits, bedding, accessories…"
          autoFocus
          className="h-16 w-full border border-border-soft bg-ivory pl-12 pr-12 font-display text-xl italic outline-none placeholder:text-muted focus:border-ink"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 text-[12px] uppercase tracking-[0.22em] transition-colors ${
                category === c
                  ? "bg-ink text-ivory"
                  : "border border-border-soft bg-ivory text-ink-soft hover:bg-cream hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 border border-border-soft bg-ivory px-3 text-[12px] uppercase tracking-[0.18em] text-ink-soft outline-none focus:border-ink"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="mt-6 border-b border-border-soft pb-4">
        {query ? (
          <p className="text-[13px] text-ink-soft">
            {results.length === 0
              ? `No results for "${query}"`
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
        ) : (
          <p className="text-[13px] text-ink-soft">
            Showing {results.length} product{results.length !== 1 ? "s" : ""}
            {category !== "All" ? ` in ${category}` : ""}
          </p>
        )}
      </div>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center text-center">
          <Search className="h-10 w-10 text-muted" />
          <h2 className="mt-4 font-display text-3xl italic">Nothing found.</h2>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-soft">
            Try a different search — or browse our collections below.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["Ladies", "Kids", "Baby", "Accessories"].map((c) => (
              <button
                key={c}
                onClick={() => { setQuery(""); setCategory(c); }}
                className="h-11 border border-border-soft px-6 text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:bg-ink hover:text-ivory transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
