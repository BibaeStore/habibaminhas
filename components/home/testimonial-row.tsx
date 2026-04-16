import Image from "next/image";
import { testimonials } from "@/lib/data";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`h-3 w-3 ${i < count ? "fill-gold-dark text-gold-dark" : "fill-border-soft text-border-soft"}`}
          aria-hidden
        >
          <path d="M6 0l1.5 4h4l-3.3 2.4 1.3 4L6 8 2.5 10.4l1.3-4L.5 4h4z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialRow() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">
            Worn &amp; loved
          </span>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-light italic leading-tight text-ink sm:text-5xl">
            A kind word from the wearers.
          </h2>
          {/* Aggregate rating */}
          <div className="mt-4 flex items-center gap-2">
            <Stars count={5} />
            <span className="text-[12px] text-ink-soft">
              5.0 · 2,400+ reviews
            </span>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col gap-5 border border-border-soft bg-ivory p-8 transition-shadow hover:shadow-soft"
            >
              {/* Stars */}
              <Stars count={t.rating} />

              {/* Quote */}
              <blockquote className="font-display text-lg italic leading-snug text-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Reviewer */}
              <figcaption className="mt-auto flex items-center gap-3 border-t border-border-soft pt-5">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-ink">{t.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                    {t.city}
                  </div>
                </div>
                {/* Verified badge */}
                <div className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-[0.22em] text-gold-dark">
                  <svg viewBox="0 0 12 12" className="h-3 w-3 fill-gold-dark" aria-hidden>
                    <path d="M6 0l1.2 2.4L10 2l-1.8 3L10 8l-3.2-.4L6 10l-.8-2.4L2 8l1.8-3L2 2l2.8.4z"/>
                  </svg>
                  Verified
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
