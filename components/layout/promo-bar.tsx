import { promoMessages } from "@/lib/data";

export function PromoBar() {
  const loop = [...promoMessages, ...promoMessages];
  return (
    <div className="relative bg-ink text-ivory">
      <div className="overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2.5 text-[11px] uppercase tracking-[0.28em]">
          {loop.map((msg, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-3">
              <span className="inline-block h-1 w-1 rounded-full bg-gold" />
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}