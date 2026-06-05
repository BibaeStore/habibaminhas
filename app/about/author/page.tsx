import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Habiba Minhas — Founder & Creative Director",
  description: "Meet Habiba Minhas, founder of Pakistan's leading handcrafted fashion brand. Specializing in premium ladies suits, kids festive wear, and baby products made in Karachi.",
  alternates: {
    canonical: "/about/author/",
  },
  keywords: "Habiba Minhas, Pakistani fashion designer, Karachi fashion, handcrafted clothing Pakistan",
};

export default function AuthorPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream border border-border-soft flex items-center justify-center">
            {/* Placeholder until actual photo is added */}
            <div className="text-center">
              <div className="font-display text-8xl text-gold-dark mb-4">HM</div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Founder Photo Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            The Founder
          </span>
          <h1 className="mt-3 font-display text-5xl italic leading-tight sm:text-6xl">
            Habiba Minhas
          </h1>
          <p className="mt-2 text-[14px] uppercase tracking-[0.24em] text-muted">
            Founder & Creative Director
          </p>

          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Habiba Minhas is the founder and creative director of Habiba Minhas,
              Pakistan's leading brand for handcrafted ladies suits, kids festive wear,
              and premium baby products. Based in Karachi, she has built a brand that
              serves over 5,000 customers across Pakistan.
            </p>

            <p>
              With a deep passion for preserving traditional Pakistani craftsmanship
              while embracing contemporary design, Habiba works directly with artisan
              embroiderers, skilled tailors, and fabric specialists to create pieces
              that honor heritage while meeting modern expectations.
            </p>

            <h2 className="mt-8 font-display text-3xl italic text-ink">Expertise & Experience</h2>

            <p>
              Habiba specializes in:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Premium Pakistani fashion design and curation</li>
              <li>Traditional embroidery techniques and artisan craftsmanship</li>
              <li>Silk fabric selection and quality assessment</li>
              <li>Kids formalwear design for Pakistani celebrations</li>
              <li>Baby nursery product design and safety standards</li>
              <li>Fashion styling for Pakistani weddings and formal events</li>
            </ul>

            <h2 className="mt-8 font-display text-3xl italic text-ink">The Vision</h2>

            <p>
              Starting with a simple belief that premium quality fashion and baby
              products should be accessible to every family in Pakistan, Habiba
              founded the brand in 2024. What began as a vision has grown into a
              destination trusted by thousands.
            </p>

            <p>
              Every product at Habiba Minhas is either handcrafted in Pakistan or
              personally curated by Habiba to meet exacting quality standards. From
              3-piece silk suits with gold brocade to luxurious baby bedding sets,
              each piece reflects her commitment to quality and authenticity.
            </p>

            <h2 className="mt-8 font-display text-3xl italic text-ink">Recognition</h2>

            <p>
              Habiba Minhas (the brand) has served over 5,000 happy customers
              nationwide and is recognized as one of Pakistan's trusted sources for
              handcrafted fashion and baby products.
            </p>

            <div className="mt-12 border-t border-border-soft pt-8">
              <h3 className="font-display text-2xl italic mb-4">Connect</h3>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/habibaminhas.official/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Instagram
                </a>
                <a href="https://www.facebook.com/profile.php?id=61573309750795" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Facebook
                </a>
                <a href="https://www.pinterest.com/habibaminhas_official/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Link href="/journal" className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink transition-colors">
          ← Read the Journal
        </Link>
      </div>
    </div>
  );
}
