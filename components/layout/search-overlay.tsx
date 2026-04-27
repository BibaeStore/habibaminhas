"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, TrendingUp, ArrowUpRight } from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";

interface Hit {
  id: string;
  slug: string;
  title: string;
  price: number;
  image?: string | null;
  images?: string[] | null;
  palette: string[];
  category: string;
}

const SUGGESTIONS = [
  "Ladies Suits",
  "Kids Formal",
  "Baby Bedding",
  "Silk Suits",
  "Embroidered Suits",
  "Eid Collection",
  "Accessories",
  "Baby Nests",
];

const QUICK_LINKS = [
  { label: "Ladies", sub: "Stitched & Unstitched", href: "/ladies" },
  { label: "Kids", sub: "Festive Wear", href: "/kids" },
  { label: "Baby Products", sub: "Bedding & Nests", href: "/baby" },
  { label: "Accessories", sub: "Hair & Gift Sets", href: "/accessories" },
  { label: "New Arrivals", sub: "Latest Drops", href: "/new" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mount animation
  useEffect(() => {
    if (open) {
      setMounted(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setMounted(false);
      setQuery("");
      setHits([]);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setHits([]); return; }
    setLoading(true);
    try {
      const data = await getProducts({ status: "active" });
      const lower = q.toLowerCase();
      const filtered = (data as unknown as Hit[])
        .filter((p) =>
          p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower)
        )
        .slice(0, 8);
      setHits(filtered);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Smart single button: clear query if has text, else close overlay
  const handleDismiss = () => {
    if (query.trim()) {
      handleChange("");
      inputRef.current?.focus();
    } else {
      onClose();
    }
  };

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    /*
     * True full-viewport cover — no partial panel, no backdrop gap.
     * overflow-y-auto on the root so the page scrolls naturally (no nested scrollbars).
     * type="text" on the input kills the browser-native clear button.
     */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ivory"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(-6px)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
    >
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="flex-none border-b border-border-soft bg-ivory">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-screen-xl items-center gap-4 px-6 py-5 sm:px-10"
        >
          {loading ? (
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-[1.5px] border-border-soft border-t-ink" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-muted" />
          )}

          {/* type="text" — no browser-native clear button */}
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search suits, bedding, accessories…"
            className="flex-1 bg-transparent font-display text-2xl italic text-ink outline-none placeholder:text-muted/50 sm:text-3xl"
          />

          {/* ONE smart button — clears query or closes overlay */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={hasQuery ? "Clear search" : "Close search"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* ── Scrollable content ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-screen-xl px-6 py-8 sm:px-10">

          {hasQuery ? (
            /* ── Results ── */
            <div>
              {/* Count label */}
              <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-muted">
                {loading
                  ? "Searching…"
                  : hits.length > 0
                    ? `${hits.length} result${hits.length !== 1 ? "s" : ""} for "${query}"`
                    : `No results for "${query}"`}
              </p>

              {hits.length > 0 && (
                <>
                  {/* Results list — 2 columns on ≥ md */}
                  <div className="grid grid-cols-1 gap-px bg-border-soft md:grid-cols-2">
                    {hits.map((p) => {
                      const img = p.image ?? p.images?.[0] ?? null;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-5 bg-ivory px-4 py-4 transition-colors hover:bg-cream"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream">
                            {img ? (
                              <Image
                                src={img}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-cover object-top"
                              />
                            ) : (
                              <div
                                className="h-full w-full"
                                style={{
                                  background: `linear-gradient(160deg, ${p.palette[0] ?? "#f0ece4"}, ${p.palette[1] ?? "#c0b89a"})`,
                                }}
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
                              {p.title}
                            </p>
                            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted">
                              {p.category}
                            </p>
                          </div>

                          <span className="shrink-0 text-[13px] font-medium text-ink">
                            {formatPrice(p.price)}
                          </span>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      );
                    })}
                  </div>

                  {/* View all link */}
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleSubmit as never}
                      className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.26em] text-ink transition-colors hover:text-gold-dark"
                    >
                      <span className="border-b border-current pb-px">
                        View all results for &ldquo;{query}&rdquo;
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </>
              )}

              {/* No results → show suggestions */}
              {!loading && hits.length === 0 && (
                <div className="mt-2 space-y-8">
                  <div>
                    <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-muted">
                      Try searching for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleChange(s)}
                          className="border border-border-soft px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Always show quick browse below results */}
              {!loading && hits.length > 0 && (
                <div className="mt-10 border-t border-border-soft pt-8">
                  <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-muted">
                    Browse collections
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange(s)}
                        className="border border-border-soft px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
              {/* Left column */}
              <div className="space-y-10">
                {/* Trending searches */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[11px] uppercase tracking-[0.3em] text-muted">
                      Popular searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange(s)}
                        className="border border-border-soft bg-cream px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-all hover:border-ink hover:bg-ivory hover:text-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick category links */}
                <div>
                  <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-muted">
                    Shop by category
                  </p>
                  <div className="divide-y divide-border-soft">
                    {QUICK_LINKS.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={onClose}
                        className="group flex items-center justify-between py-4 transition-colors hover:text-gold-dark"
                      >
                        <div>
                          <span className="block text-[15px] font-medium text-ink group-hover:text-gold-dark">
                            {c.label}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                            {c.sub}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column — decorative brand panel */}
              <div className="hidden lg:block">
                <div className="sticky top-8 rounded-sm bg-cream p-8">
                  <p className="text-[10px] uppercase tracking-[0.36em] text-muted">
                    Habiba Minhas
                  </p>
                  <h3 className="mt-3 font-display text-2xl italic leading-snug text-ink">
                    Handcrafted with love in Pakistan
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                    Explore our curated collections of ladies suits, kids festive wear,
                    baby bedding, and handcrafted accessories.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {[
                      { label: "Free delivery on orders Rs. 5,000+", icon: "→" },
                      { label: "14-day easy returns", icon: "→" },
                      { label: "Cash on delivery nationwide", icon: "→" },
                    ].map((item) => (
                      <p key={item.label} className="flex items-center gap-2 text-[12px] text-ink-soft">
                        <span className="text-gold-dark">{item.icon}</span>
                        {item.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
