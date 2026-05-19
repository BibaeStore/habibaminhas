"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import { ProductCard, type CardProduct } from "@/components/product/product-card";

/* ─── Constants ──────────────────────────────────────────────────── */

const RECENT_KEY = "hm_recent_searches";
const MAX_RECENT = 8;

const TRENDING_SEARCHES = [
  "Ladies Suits", "Silk Suits", "Embroidered Suits", "Kids Formal",
  "Baby Bedding", "Eid Collection", "Accessories", "Formal Gowns",
  "Baby Nests", "Sharara Sets",
];

const CATEGORY_FILTERS = ["All", "Ladies", "Kids", "Baby", "Accessories"];
const CATEGORY_MAP: Record<string, string> = {
  Ladies:      "ladies-suits",
  Kids:        "kids-formal",
  Baby:        "baby-products",
  Accessories: "accessories",
};

const CATEGORY_TILES = [
  { label: "Ladies Suits", sub: "Stitched & Unstitched", href: "/ladies",      color: "#f2e0d8" },
  { label: "Kids Formal",  sub: "Festive Wear",           href: "/kids",        color: "#f5e8c0" },
  { label: "Baby Bedding", sub: "Crib Sets & Nests",      href: "/baby",        color: "#d4e8d0" },
  { label: "Accessories",  sub: "Hair & Gift Sets",        href: "/accessories", color: "#eedbc4" },
  { label: "New Arrivals", sub: "Just Dropped",            href: "/new",         color: "#dde0f0" },
];

const SORT_OPTIONS = [
  { label: "Relevance",         value: "relevance"  },
  { label: "Price: Low → High", value: "price-asc"  },
  { label: "Price: High → Low", value: "price-desc" },
];

/* ─── Recent-searches hook ───────────────────────────────────────── */

function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const add = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecent((prev) => {
      const next = [
        term.trim(),
        ...prev.filter((s) => s.toLowerCase() !== term.trim().toLowerCase()),
      ].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((term: string) => {
    setRecent((prev) => {
      const next = prev.filter((s) => s !== term);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }, []);

  return { recent, add, remove, clear };
}

/* ─── Types ──────────────────────────────────────────────────────── */

type ExtProduct = CardProduct & { category?: string };

/* ─── Main component ─────────────────────────────────────────────── */

function SearchContent() {
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { recent, add, remove, clear } = useRecentSearches();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query,    setQuery]    = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [sort,     setSort]     = useState("relevance");
  const [products, setProducts] = useState<ExtProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [focused,  setFocused]  = useState(false);

  /* Auto-focus on mount */
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  /* Sync initial query from URL */
  useEffect(() => {
    const q = params.get("q");
    if (q) setQuery(q);
  }, [params]);

  /* Load full product list */
  const loadProducts = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const catFilter = cat !== "All" ? CATEGORY_MAP[cat] : undefined;
      const data = await getProducts({ status: "active", category: catFilter });
      setProducts(data as ExtProduct[]);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(category); }, [category, loadProducts]);

  const handleChange = (val: string) => {
    setQuery(val);
    // Silently update URL
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        if (val.trim()) url.searchParams.set("q", val.trim());
        else url.searchParams.delete("q");
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      add(query.trim());
      inputRef.current?.blur();
    }
  };

  const pickTerm = (term: string) => {
    setQuery(term);
    add(term);
    inputRef.current?.focus();
  };

  /* Filter + sort */
  const results = products
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.subcategory ?? []).some((sub) => sub.toLowerCase().includes(q)) ||
        (p.badge       ?? "").toLowerCase().includes(q) ||
        (p.category    ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-ivory">

      {/* ━━ Search bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="border-b border-border-soft bg-ivory">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8 lg:py-10">
          <div
            className={`flex items-center gap-3 border-b-2 pb-3 transition-colors duration-200 ${
              focused ? "border-ink" : "border-border-soft"
            }`}
          >
            <Search
              className={`h-6 w-6 shrink-0 transition-colors duration-200 ${
                focused ? "text-ink" : "text-muted"
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search suits, bedding, accessories…"
              className="flex-1 bg-transparent font-display text-2xl italic text-ink outline-none placeholder:text-muted/40 sm:text-3xl lg:text-4xl"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label="Clear search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ━━ Page body ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8">

        {/* ── Empty state ── */}
        {!hasQuery && category === "All" && (
          <div className="mb-12 space-y-10">

            {/* Recent searches */}
            {recent.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[11px] uppercase tracking-[0.32em] text-muted">
                      Recent searches
                    </span>
                  </div>
                  <button
                    onClick={clear}
                    className="text-[11px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-ink"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <div key={term} className="flex">
                      <button
                        onClick={() => pickTerm(term)}
                        className="flex items-center gap-2 border border-border-soft bg-cream py-2 pl-3 pr-2.5 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                      >
                        <Clock className="h-3 w-3 shrink-0 text-muted" />
                        {term}
                      </button>
                      <button
                        onClick={() => remove(term)}
                        aria-label={`Remove ${term}`}
                        className="flex items-center border border-l-0 border-border-soft bg-cream px-2 text-muted transition-colors hover:border-ink hover:text-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-muted" />
                <span className="text-[11px] uppercase tracking-[0.32em] text-muted">
                  Trending now
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((t) => (
                  <button
                    key={t}
                    onClick={() => pickTerm(t)}
                    className="border border-border-soft bg-ivory px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-all hover:border-ink hover:bg-cream hover:text-ink"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {/* Category tiles */}
            <section>
              <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-muted">
                Shop by category
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {CATEGORY_TILES.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="group flex h-28 flex-col justify-between p-5 transition-opacity hover:opacity-75"
                    style={{ backgroundColor: c.color }}
                  >
                    <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-ink">
                      {c.label}
                    </span>
                    <div className="flex items-end justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-ink/60">
                        {c.sub}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-ink opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── Filters bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted" />
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors ${
                  category === c
                    ? "bg-ink text-ivory"
                    : "border border-border-soft text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 appearance-none border border-border-soft bg-ivory pl-3 pr-8 text-[11px] uppercase tracking-[0.2em] text-ink-soft outline-none transition-colors focus:border-ink"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </div>

        {/* ── Result count ── */}
        <div className="py-4">
          {loading ? (
            <p className="text-[12px] uppercase tracking-[0.22em] text-muted">Loading…</p>
          ) : hasQuery ? (
            <p className="text-[12px] uppercase tracking-[0.22em] text-muted">
              {results.length === 0
                ? `No results for "${query}"`
                : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
          ) : (
            <p className="text-[12px] uppercase tracking-[0.22em] text-muted">
              {results.length} product{results.length !== 1 ? "s" : ""}
              {category !== "All" ? ` · ${category}` : ""}
            </p>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] animate-pulse bg-cream" />
                <div className="h-3 w-2/3 animate-pulse bg-cream" />
                <div className="h-3 w-1/2 animate-pulse bg-cream" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : hasQuery ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <Search className="h-7 w-7 text-muted" />
            </div>
            <h2 className="mt-6 font-display text-3xl italic text-ink">Nothing found.</h2>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
              We couldn&apos;t find anything for &ldquo;{query}&rdquo;. Try a different
              term or browse a collection.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {TRENDING_SEARCHES.slice(0, 6).map((t) => (
                <button
                  key={t}
                  onClick={() => pickTerm(t)}
                  className="border border-border-soft px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {CATEGORY_FILTERS.slice(1).map((c) => (
                <button
                  key={c}
                  onClick={() => { setQuery(""); setCategory(c); }}
                  className="h-10 border border-border-soft px-6 text-[11px] uppercase tracking-[0.26em] text-ink-soft transition-colors hover:bg-ink hover:text-ivory"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
