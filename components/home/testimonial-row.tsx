import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";

export function TestimonialRow() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">
            Worn & loved
          </span>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-light italic leading-tight text-ink sm:text-5xl">
            A kind word from the wearers.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col gap-5 border border-border-soft bg-ivory p-8"
            >
              <Quote className="h-5 w-5 text-gold-dark" />
              <blockquote className="font-display text-lg italic leading-snug text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold-light to-gold" />
                <div>
                  <div className="text-[13px] font-medium text-ink">{t.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                    {t.city}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
