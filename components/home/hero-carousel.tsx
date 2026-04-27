"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { heroSlides } from "@/lib/data";
import { cn } from "@/lib/utils";

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((p) => (p + 1) % count), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const go = (delta: number) => setActive((p) => (p + delta + count) % count);

  return (
    <section
      className="relative overflow-hidden w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[78vh] min-h-[560px] w-full sm:h-[86vh]">

        {/* Slide images — all mounted, opacity-based cross-fade */}
        {heroSlides.map((slide, i) => (
          <div
            key={slide.image}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-in-out",
              i === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* Left-side gradient for text legibility */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.45) 38%, rgba(10,8,6,0.08) 65%, transparent 80%)",
          }}
        />

        {/* Bottom vignette */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,8,6,0.35) 0%, transparent 30%)",
          }}
        />

        {/* Slide copy */}
        <div className="absolute inset-0 z-20 mx-auto flex w-full max-w-[1440px] items-center px-6 sm:px-14">
          <div
            key={active}
            className="max-w-xl text-ivory animate-fade-up"
          >
            <span className="text-[11px] uppercase tracking-[0.42em] text-gold-light">
              {heroSlides[active].eyebrow}
            </span>
            <h1 className="mt-4 font-display text-5xl font-light italic leading-[0.95] sm:text-7xl md:text-[84px]">
              {heroSlides[active].title}
            </h1>
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-ivory/90 sm:text-[15px]">
              {heroSlides[active].body}
            </p>
            <div className="mt-8">
              <Link
                href={heroSlides[active].cta.href}
                className="group inline-flex h-12 items-center gap-2 bg-ivory px-8 text-[12px] uppercase tracking-[0.28em] text-ink transition-colors hover:bg-gold"
              >
                {heroSlides[active].cta.label}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between sm:bottom-10 sm:left-14 sm:right-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/40 text-ivory backdrop-blur-sm transition-colors hover:bg-ivory hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/40 text-ivory backdrop-blur-sm transition-colors hover:bg-ivory hover:text-ink"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-ivory/85">
            <span>
              {String(active + 1).padStart(2, "0")}
              <span className="mx-2 text-ivory/40">/</span>
              {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-[2px] transition-all duration-500",
                    active === i ? "w-12 bg-ivory" : "w-6 bg-ivory/35 hover:bg-ivory/60",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
