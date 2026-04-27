import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AnnouncementStrip() {
  return (
    <section className="relative border-y border-border-soft bg-ivory">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-6 py-6 text-center sm:flex-row sm:justify-between sm:gap-8 sm:px-12">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] uppercase tracking-[0.3em] text-ink-soft sm:justify-start">
          <span className="flex items-center gap-3">
            <span className="font-display text-2xl italic leading-none text-ink sm:text-3xl">
              5,000+
            </span>
            <span>Happy Customers</span>
          </span>
          <span className="hidden h-4 w-px bg-border-soft sm:inline-block" />
          <span className="flex items-center gap-3">
            <span className="font-display text-2xl italic leading-none text-ink sm:text-3xl">
              Rs. 250
            </span>
            <span>Flat Nationwide Delivery</span>
          </span>
          <span className="hidden h-4 w-px bg-border-soft sm:inline-block" />
          <span className="text-gold-dark">14-Day Easy Returns</span>
        </div>
        <Link
          href="/ladies"
          className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.28em] text-ink hover:text-gold-dark"
        >
          Shop now
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
