import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/common/section-heading";

// SEO Focus Keyword: "Pakistani fashion brand"
// Target: Users researching Habiba Minhas brand story and authenticity
export const metadata: Metadata = {
  title: "About Us — Habiba Minhas | Pakistani Fashion Brand Since 2026",
  description: "Discover Habiba Minhas, Pakistan's leading handcrafted fashion brand. Premium ladies suits, kids wear & baby products made in Karachi, Pakistan. Serving 5,000+ happy customers across Pakistan.",
  alternates: {
    canonical: "/about/",
  },
  keywords: "Pakistani fashion brand, Habiba Minhas Pakistan, Karachi fashion brand, handcrafted fashion Pakistan, made in Pakistan clothing, Pakistani designer brand",
};

const values = [
  {
    title: "Quality First",
    body: "Every piece goes through meticulous material selection — we prioritise durability, comfort, and finish before anything ships to your door.",
  },
  {
    title: "Customer Centric",
    body: "From the moment you browse to the day your order arrives, we're here. Reach us on WhatsApp, email, or phone — we respond within 24 hours.",
  },
  {
    title: "Authentic Design",
    body: "We create styles that merge contemporary 2026 trends with timeless Pakistani elegance — drawing inspiration from the vibrant culture of Rawalpindi.",
  },
  {
    title: "Handcrafted with Love",
    body: "Ladies suits, kids formalwear, baby nursery sets, and accessories — every item is made by hand in Pakistan, with care that shows.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative">
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src="/editorial/ladies-collection.webp"
            alt="Habiba Minhas — Our Story"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
        </div>
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-6 pb-16 text-ivory sm:px-12 sm:pb-24">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
            Our Story
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-light italic leading-[0.95] sm:text-6xl md:text-8xl">
            Elegance, redefined.
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="The Brand" title="Crafting elegance for the modern family since 2026." />
          </div>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-soft lg:col-span-7">
            <p>
              Habiba Minhas began with a simple belief: that premium quality
              fashion and baby products should be accessible to every family
              in Pakistan. What started as a small brand vision has grown
              into a destination serving over 5,000 happy customers across
              the country.
            </p>
            <p>
              We specialise in handcrafted ladies formal suits — 3-piece silk
              ensembles adorned with gold brocade, mirror-work, and artisan
              embroidery — alongside festive kids formalwear, luxurious baby
              nursery sets, and handcrafted silk accessories.
            </p>
            <p>
              Every product is made in Pakistan, shipped nationwide with flat
              Rs. 250 delivery, and backed by our 14-day return policy. We
              believe in making things properly, and standing behind them.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="border border-border-soft bg-cream p-8"
            >
              <h3 className="font-display text-2xl italic">{v.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/editorial/kids-festive.webp"
                alt="Habiba Minhas craftsmanship"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="col-span-12 flex flex-col gap-4 md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/editorial/baby-nursery.webp"
                alt="Habiba Minhas modest wear"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/editorial/accessories.webp"
                alt="Habiba Minhas accessories"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto w-full max-w-[1440px] px-4 text-center sm:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { stat: "5,000+", label: "Happy Customers" },
              { stat: "100+", label: "Premium Products" },
              { stat: "Rs. 250", label: "Flat Nationwide Delivery" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="font-display text-5xl italic text-gold-dark">{stat}</div>
                <div className="mt-2 text-[12px] uppercase tracking-[0.28em] text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-16 max-w-2xl font-display text-3xl font-light italic leading-tight sm:text-5xl">
            "Pakistan's leading brand for premium handcrafted fashion — made with love, delivered with care."
          </p>
          <p className="mt-6 text-[12px] uppercase tracking-[0.28em] text-ink-soft">
            Habiba Minhas — Karachi, Pakistan
          </p>
        </div>
      </section>
    </>
  );
}
