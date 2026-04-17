"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";

interface Hit {
  id: string;
  slug: string;
  title: string;
  price: number;
  image?: string | null;
  palette: [string, string, string];
  category: string;
}

const SUGGESTIONS = ["Ladies Suits", "Kids Formal", "Baby Bedding", "Baby Nests", "Accessories", "New Arrivals"];

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setHits([]);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
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
      const filtered = (data as Hit[])
        .filter((p) =>
          p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower)
        )
        .slice(0, 6);
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
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 w-full bg-ivory shadow-2xl">
        <div className="mx-auto w-full max-w-[860px] px-4 sm:px-8">
          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-border-soft py-5">
            <Search className="h-5 w-5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search suits, bedding, accessories…"
              className="flex-1 bg-transparent font-display text-2xl italic text-ink outline-none placeholder:text-muted/60 sm:text-3xl"
            />
            {loading && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border-soft border-t-ink" />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 p-1 text-muted hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Results / suggestions */}
          <div className="max-h-[60vh] overflow-y-auto py-6">
            {query.trim() && hits.length > 0 ? (
              <>
                <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-muted">
                  {hits.length} result{hits.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </p>
                <ul className="flex flex-col divide-y divide-border-soft">
                  {hits.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-4 py-3 hover:bg-cream px-2 -mx-2 transition-colors"
                      >
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-cream">
                          {p.image ? (
                            <Image src={p.image} alt={p.title} fill sizes="40px" className="object-cover object-top" />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[13px] font-medium text-ink">{p.title}</div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{p.category}</div>
                        </div>
                        <div className="shrink-0 text-[13px] font-medium text-ink">{formatPrice(p.price)}</div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {query.trim() && (
                  <button
                    onClick={handleSubmit as never}
                    className="mt-5 flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-gold-dark hover:text-ink transition-colors"
                  >
                    View all results for &ldquo;{query}&rdquo;
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            ) : query.trim() && !loading ? (
              <p className="text-[14px] text-ink-soft">
                No results for &ldquo;{query}&rdquo; — try a different term.
              </p>
            ) : (
              <>
                <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-muted">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleChange(s)}
                      className="border border-border-soft bg-cream px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
