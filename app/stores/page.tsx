import Image from "next/image";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";

export const metadata = { title: "Contact & Studio" };

export default function StoresPage() {
  return (
    <>
      <section className="relative">
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image src="/editorial/ladies-collection.webp" alt="Habiba Minhas Studio" fill priority sizes="100vw" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-6 pb-12 text-ivory sm:px-12 sm:pb-16">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
            Find us
          </span>
          <h1 className="mt-3 font-display text-5xl font-light italic leading-[0.95] sm:text-6xl md:text-7xl">
            Our studio.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ivory/90">
            Based in Karachi, Pakistan — handcrafting premium fashion and baby products for families across the country.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
        <SectionHeading
          eyebrow="Karachi Studio"
          title="Handcrafted in Pakistan, delivered nationwide."
          description="We're an online-first boutique. Order from anywhere in Pakistan and receive your items within 3–5 business days with flat Rs. 200 delivery."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="group overflow-hidden border border-border-soft bg-ivory">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/editorial/kids-festive.webp" alt="Habiba Minhas Studio" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                Karachi
              </div>
              <h3 className="mt-1 font-display text-2xl italic">Habiba Minhas Studio</h3>
              <ul className="mt-4 flex flex-col gap-2 text-[13px] text-ink-soft">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Karachi, Pakistan — 75533
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Mon–Fri · 9a — 6p PKT
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark transition-colors">+92 312 0295812</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> <a href="mailto:info@habibaminhas.com" className="hover:text-gold-dark transition-colors">info@habibaminhas.com</a>
                </li>
              </ul>
            </div>
          </article>

          <article className="group overflow-hidden border border-border-soft bg-ivory">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/trending/floral-lawn.webp" alt="Nationwide Delivery" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                Nationwide
              </div>
              <h3 className="mt-1 font-display text-2xl italic">Flat Rs. 200 Delivery</h3>
              <ul className="mt-4 flex flex-col gap-2 text-[13px] text-ink-soft">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Standard: 3–5 business days
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Express: 1–2 business days
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Delivery to all cities in Pakistan
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Flat Rs. 200 delivery nationwide
                </li>
              </ul>
            </div>
          </article>

          <article className="group overflow-hidden border border-border-soft bg-ivory">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/trending/pink-blossom.webp" alt="14-Day Returns" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                Policy
              </div>
              <h3 className="mt-1 font-display text-2xl italic">14-Day Returns</h3>
              <ul className="mt-4 flex flex-col gap-2 text-[13px] text-ink-soft">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> 14-day return window
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> WhatsApp: <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark transition-colors">+92 312 0295812</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Items must be in original condition
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-gold-dark" /> Processing time: 1–2 business days
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Shop Online"
                title="Order from anywhere in Pakistan."
              />
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-soft">
                Browse our full catalogue online and order from the comfort of
                your home. We accept Cash on Delivery, JazzCash, Easypaisa,
                and all major cards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { label: "Cash on Delivery", abbr: "COD" },
                { label: "JazzCash", abbr: "JazzCash" },
                { label: "Easypaisa", abbr: "Easypaisa" },
                { label: "Debit / Credit Card", abbr: "Card" },
              ].map(({ label, abbr }) => (
                <div
                  key={abbr}
                  className="border border-border-soft bg-ivory p-5"
                >
                  <div className="font-display text-lg italic text-gold-dark">{abbr}</div>
                  <div className="mt-1 text-[12px] text-ink-soft">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
