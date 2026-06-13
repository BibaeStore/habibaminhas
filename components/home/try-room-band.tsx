import Image from "next/image";
import Link from "next/link";

// Self-contained homepage feature band for the Virtual Try Room.
// SEO note: this is a feature highlight, not a keyword target. The homepage
// <title>/<h1> stay focused on "Pakistani fashion online" — this band only
// uses an <h2> and links out to the /virtual-try-room/ cornerstone page, so it
// adds engagement + an internal link without competing for any keyword.
export function TryRoomBand() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="grid grid-cols-1 overflow-hidden border border-border-soft bg-cream lg:grid-cols-2">
        {/* Copy */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            ✦ New — Virtual Try Room
          </span>
          <h2 className="mt-3 font-display text-3xl font-light italic leading-tight sm:text-4xl md:text-5xl">
            Try it on you, before you buy.
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
            Pakistan&apos;s first AI virtual try-on. Upload your photo and see
            yourself in the actual outfit — instantly, privately, and free. Your
            photo is never stored.
          </p>
          <Link
            href="/virtual-try-room"
            className="mt-8 inline-flex h-12 w-fit items-center border border-ink px-8 text-[11px] uppercase tracking-[0.26em] transition-colors hover:bg-ink hover:text-ivory"
          >
            Explore the Virtual Try Room
          </Link>
        </div>

        {/* Image */}
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <Image
            src="/HeroSection/ladies-suits.webp"
            alt="Virtual Try Room — see yourself in Habiba Minhas suits with AI"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}
