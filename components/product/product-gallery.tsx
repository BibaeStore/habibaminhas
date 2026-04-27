"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { cn } from "@/lib/utils";

const MOTIFS = ["floral", "lattice", "ogee", "arch"] as const;
// Object positions used when the same image fills multiple thumbnail slots
const THUMB_POSITIONS = ["top", "center", "bottom", "top"] as const;

interface Props {
  images: string[];
  title: string;
  palette: string[];
}

export function ProductGallery({ images, title, palette }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active image — fall back to first image if a slot has none
  const activeImage = images[activeIndex] ?? images[0] ?? null;

  /* ── Zoom: direct DOM manipulation avoids re-render on every mousemove ── */
  const getInner = () =>
    containerRef.current?.querySelector<HTMLElement>("[data-zoom-inner]") ?? null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const inner = getInner();
    if (!inner || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    inner.style.transformOrigin = `${x}% ${y}%`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    const inner = getInner();
    if (!inner) return;
    inner.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
    inner.style.transform = "scale(2.2)";
  }, []);

  const handleMouseLeave = useCallback(() => {
    const inner = getInner();
    if (!inner) return;
    inner.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
    inner.style.transform = "scale(1)";
  }, []);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    // Reset zoom when switching image
    const inner = getInner();
    if (inner) {
      inner.style.transition = "none";
      inner.style.transform = "scale(1)";
      inner.style.transformOrigin = "50% 50%";
    }
  };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Main image with zoom ── */}
      <div
        ref={containerRef}
        className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-cream select-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {activeImage ? (
          /* data-zoom-inner is the target for direct DOM scale transforms */
          <div
            data-zoom-inner
            className="absolute inset-0 will-change-transform"
            style={{ transformOrigin: "50% 50%" }}
          >
            <Image
              key={activeImage}
              src={activeImage}
              alt={title}
              fill
              priority
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-top pointer-events-none"
            />
          </div>
        ) : (
          <PlaceholderImage
            tone={palette as [string, string, string]}
            motif="floral"
            aspect="4/5"
            animate
          />
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => {
          // Use distinct images when available; otherwise reuse first image with different crop
          const img = images[i] ?? images[0] ?? null;
          const isActive = i === activeIndex;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleThumbnailClick(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "group relative aspect-[3/4] w-full overflow-hidden bg-cream transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                isActive
                  ? "ring-[1.5px] ring-ink ring-offset-[3px] ring-offset-ivory"
                  : "opacity-55 hover:opacity-100",
              )}
            >
              {img ? (
                <Image
                  src={img}
                  alt={`${title} — view ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 25vw, 15vw"
                  className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: THUMB_POSITIONS[i] }}
                />
              ) : (
                <PlaceholderImage
                  tone={palette as [string, string, string]}
                  motif={MOTIFS[i]}
                  aspect="3/4"
                />
              )}

              {/* Active indicator bar at bottom */}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[2px] bg-ink transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
