"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function PageLoader() {
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "gone">("in");

  useEffect(() => {
    // Show on every full page load (first visit, hard refresh, direct URL).
    // In Next.js App Router the layout does NOT remount on client-side
    // navigation, so this naturally never fires between page clicks.

    const t1 = setTimeout(() => setPhase("hold"), 1800);
    const t2 = setTimeout(() => setPhase("out"), 2400);
    const t3 = setTimeout(() => setPhase("gone"), 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ pointerEvents: phase === "out" ? "none" : "all" }}
    >
      {/* Left curtain panel */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-ivory"
        style={{
          transform: phase === "out" ? "translateX(-100%)" : "translateX(0)",
          transition: phase === "out"
            ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
        }}
      />
      {/* Right curtain panel */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-ivory"
        style={{
          transform: phase === "out" ? "translateX(100%)" : "translateX(0)",
          transition: phase === "out"
            ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
        }}
      />

      {/* Centre content — fades out with the curtains */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-5"
        style={{
          opacity: phase === "out" ? 0 : 1,
          transition: phase === "out" ? "opacity 0.3s ease" : "none",
        }}
      >
        {/* Icon */}
        <div
          style={{
            opacity: phase === "in" ? 0 : 1,
            transform: phase === "in" ? "scale(0.82)" : "scale(1)",
            transition: "opacity 0.8s cubic-bezier(0.2,0.6,0.2,1), transform 0.9s cubic-bezier(0.2,0.6,0.2,1)",
          }}
        >
          <Image
            src="/logo/habiba-minhas-icon-t.png"
            alt="Habiba Minhas"
            width={120}
            height={120}
            className="h-24 w-auto sm:h-28"
            priority
          />
        </div>

        {/* Brand name */}
        <div
          style={{
            opacity: phase === "in" ? 0 : 1,
            transform: phase === "in" ? "translateY(10px)" : "translateY(0)",
            transition: "opacity 0.8s 0.25s cubic-bezier(0.2,0.6,0.2,1), transform 0.8s 0.25s cubic-bezier(0.2,0.6,0.2,1)",
          }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-display text-2xl italic leading-none tracking-wide text-ink sm:text-3xl">
            Habiba Minhas
          </span>
          <span className="text-[9px] uppercase tracking-[0.5em] text-gold-dark">
            Atelier · Est. 2026
          </span>
        </div>

        {/* Animated underline bar */}
        <div className="relative h-px w-0 overflow-hidden bg-transparent">
          <div
            className="absolute inset-y-0 left-0 bg-gold"
            style={{
              width: phase === "in" ? "0%" : "100%",
              transition: phase === "in" ? "none" : "width 0.9s 0.5s cubic-bezier(0.2,0.6,0.2,1)",
            }}
          />
        </div>
        <div
          className="h-px bg-gold"
          style={{
            width: phase === "in" ? "0px" : "80px",
            transition: phase === "in"
              ? "none"
              : "width 0.9s 0.5s cubic-bezier(0.2,0.6,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
