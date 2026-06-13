"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

// Homepage announcement pop-up for the Virtual Try Room.
//
// SEO-SAFE PATTERN (see docs/try-it-on/virtual-try-on-seo.md §4.7):
//  - Triggers on SCROLL (past the hero, ≈70% viewport) OR a 5s delay — never
//    instantly on load, so it is NOT an "intrusive interstitial" (Google's
//    mobile penalty target).
//  - Shows once per page view, on EVERY homepage load/reload (no saved flag),
//    so a visitor who closes it by accident gets another chance next time.
//  - Fully dismissible: ✕ button, click-outside, and ESC key.
//  - Card (not full-screen) on mobile; content behind stays dimmed/visible.
//  - Client-only + initial state closed → renders nothing in the SSR HTML, so
//    Googlebot sees clean page content with no overlay. Zero CWV cost.

export function TryRoomPopup() {
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const reveal = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };

    const onScroll = () => {
      // Fire as soon as the user scrolls past the hero (≈ one viewport down).
      // Uses viewport height as a proxy for the full-height hero section, so it
      // appears early — but still only after the visitor has engaged/scrolled.
      if (window.scrollY > window.innerHeight * 0.7) reveal();
    };

    const timer = setTimeout(reveal, 5000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Virtual Try Room"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden border border-border-soft bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-ink transition-colors hover:bg-ink hover:text-ivory"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[16/10] w-full">
          <Image
            src="/try-on/popup.webp"
            alt="Virtual Try Room — upload your photo and see yourself in the outfit"
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
        </div>

        <div className="p-7 text-center sm:p-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">
            ✦ New — Virtual Try Room
          </span>
          <h2 className="mt-3 font-display text-2xl font-light italic leading-tight sm:text-3xl">
            Unsure how it&apos;ll look on you?
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
            Try it on — virtually. Pakistan&apos;s first AI virtual try-on:
            upload your photo and see yourself in the actual outfit. Free,
            private, instant.
          </p>
          <Link
            href="/virtual-try-room"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex h-12 w-full items-center justify-center bg-ink px-8 text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
          >
            Open the Virtual Try Room
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-ink"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
