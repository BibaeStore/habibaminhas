import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export default function NotFound() {
  return (
    <div className="relative">
      <PlaceholderImage
        tone={["#efe3d0", "#a8804b", "#2a1f17"]}
        motif="arch"
        aspect="21/9"
        animate
        overlay
        className="min-h-[70vh]"
      />
      <div className="absolute inset-0 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-6 text-center text-ivory sm:px-12">
        <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
          Error 404
        </span>
        <h1 className="mt-4 font-display text-6xl font-light italic sm:text-8xl md:text-9xl">
          Not here.
        </h1>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ivory/85">
          The page you were looking for has either moved, sold out, or never existed. Slip back into the shop.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex h-12 items-center gap-2 bg-ivory px-7 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-gold hover:text-ivory"
          >
            Back home
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/ladies"
            className="inline-flex h-12 items-center gap-2 border border-ivory/50 px-7 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-ivory hover:text-ink"
          >
            Shop ladies
          </Link>
        </div>
      </div>
    </div>
  );
}
