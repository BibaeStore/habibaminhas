import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { AnnouncementStrip } from "@/components/home/announcement-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { EditorialBlock } from "@/components/home/editorial-block";
import { TrendTiles } from "@/components/home/trend-tiles";
import { TrendingTabs, type TrendingProduct } from "@/components/home/trending-tabs";
import { TestimonialRow } from "@/components/home/testimonial-row";
import { JournalTeaser } from "@/components/home/journal-teaser";
import { FAQSchema } from "@/components/seo/faq-schema";
import { getProducts } from "@/lib/actions/products";

// SEO Focus Keyword: "Pakistani fashion online"
// Target: Pakistani women looking to buy fashion online in Pakistan
export const metadata: Metadata = {
  title: "Habiba Minhas — Pakistani Fashion Online | Ladies, Kids & Baby Products Pakistan",
  description: "Shop premium Pakistani fashion online — handcrafted ladies suits, kids festive wear & baby products. Made in Karachi, Pakistan. Nationwide delivery Rs. 250.",
  alternates: {
    canonical: "/",
  },
  keywords: "Pakistani fashion online, buy Pakistani clothes online, Pakistani designer wear, ladies suits Pakistan, kids wear Pakistan, baby products Pakistan, Karachi fashion",
};

export default async function HomePage() {
  const allProducts = await getProducts({ status: "active" }).catch(() => []);
  const trendingProducts: TrendingProduct[] = (allProducts ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    images: p.images,
    compare_at: p.compare_at,
    palette: p.palette,
    badge: p.badge,
    subcategory: p.subcategory,
    subtype: p.subtype,
    category: p.category,
  }));
  return (
    <>
      <HeroCarousel />
      <AnnouncementStrip />
      <CategoryTiles />

      <EditorialBlock
        eyebrow="Ladies Collection"
        title="Crafted for her."
        body="3-piece stitched silk suits adorned with gold brocade, antique mirror-work, and artisan embroidery. Handcrafted in Pakistan for the modern woman."
        tone={["#f2e0d8", "#c97a86", "#5a2030"]}
        motif="floral"
        image="/editorial/ladies-collection.webp"
        links={[
          { label: "Shop Ladies Suits", href: "/ladies" },
          { label: "Formal & Party Wear", href: "/ladies/formal-wear" },
          { label: "Stitched Suits", href: "/ladies/stitched-suits" },
        ]}
      />

      <EditorialBlock
        eyebrow="Kids Festive Wear"
        title="Little stars, big moments."
        body="Festive co-ord sets, embroidered gowns, and silk suits for girls — crafted for Eid, weddings, and every celebration worth dressing up for."
        tone={["#f5e8c0", "#c8900c", "#5a3800"]}
        motif="ogee"
        orientation="right"
        image="/HeroSection/kids-formal.webp"
        imagePosition="right"
        links={[
          { label: "Shop Girls Formal", href: "/kids" },
          { label: "Festive Wear", href: "/kids" },
          { label: "Kids Suits", href: "/kids" },
        ]}
      />

      <EditorialBlock
        eyebrow="Baby & Nursery"
        title="Soft from the start."
        body="Deluxe padded crib bedding sets, baby nest pods, swaddle wraps, and nursing pillows — everything your nursery needs, made with love in Pakistan."
        tone={["#f0e0f0", "#c090c0", "#401840"]}
        motif="stripes"
        image="/HeroSection/baby-bedding.webp"
        links={[
          { label: "Shop Baby Products", href: "/baby" },
          { label: "Bedding Sets", href: "/baby/baby-bedding-set" },
          { label: "Baby Nests", href: "/baby/baby-nest" },
        ]}
      />

      <EditorialBlock
        eyebrow="Handcrafted Accessories"
        title="Finished by hand."
        body="3-piece handcrafted silk headband & floral clip sets — made with the same care as our fashion pieces, gifted with love."
        tone={["#eedbc4", "#b08040", "#3a2010"]}
        motif="lattice"
        orientation="right"
        image="/HeroSection/accessories.webp"
        links={[
          { label: "Shop Accessories", href: "/accessories" },
          { label: "Hair Clips", href: "/accessories/hair-clips" },
          { label: "Hair Bands", href: "/accessories/hair-bands" },
        ]}
      />

      <TrendTiles />
      <TrendingTabs products={trendingProducts} />

      {/* Meet the Founder Section */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream border border-border-soft flex items-center justify-center">
              {/* Placeholder until actual photo is added */}
              <div className="text-center">
                <div className="font-display text-8xl text-gold-dark">HM</div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted mt-4">Founder</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center lg:col-span-7">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
              Meet the Founder
            </span>
            <h2 className="mt-3 font-display text-4xl italic leading-tight sm:text-5xl">
              Crafted with passion, delivered with care.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
              Founded by Habiba Minhas, our brand brings together traditional Pakistani
              craftsmanship and contemporary design. Every piece is thoughtfully created
              in our Karachi studio, working directly with skilled artisans who have
              perfected their craft over generations.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              From premium silk suits with gold brocade to luxurious baby bedding sets,
              we're committed to quality, authenticity, and the timeless elegance of
              handcrafted fashion.
            </p>
            <Link
              href="/about/author"
              className="mt-8 inline-flex h-12 w-fit items-center border border-ink px-8 text-[11px] uppercase tracking-[0.26em] hover:bg-ink hover:text-ivory transition-colors"
            >
              Read More About Habiba
            </Link>
          </div>
        </div>
      </section>

      <TestimonialRow />
      <JournalTeaser />

      {/* FAQ Section */}
      <section className="bg-cream py-20">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-4xl italic sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-12 space-y-8">
              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  Do you deliver nationwide in Pakistan?
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  Yes! We deliver to all cities across Pakistan with flat Rs. 250 shipping.
                  Most orders arrive within 3-5 business days. Karachi orders often arrive within 2 days.
                </p>
              </div>

              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  Are your products handcrafted or machine-made?
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  All our ladies suits and kids formalwear feature handcrafted embroidery and
                  artisan finishes. We work directly with skilled embroiderers in Karachi who
                  have perfected traditional techniques. Baby products are professionally
                  manufactured with premium materials.
                </p>
              </div>

              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  What is your return policy?
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  We offer a 14-day return and exchange policy. Items must be unworn with
                  original tags attached. We want you to love your purchase!
                </p>
              </div>

              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  How do I contact customer support?
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  Reach us on WhatsApp at +92 312 0295812, email info@habibaminhas.com, or
                  use our contact form. We respond within 24 hours, Monday through Friday.
                </p>
              </div>

              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  Do you offer international shipping?
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  Currently we focus on serving customers within Pakistan. For international
                  orders, please contact us directly and we'll do our best to accommodate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <FAQSchema
        faqs={[
          {
            question: "Do you deliver nationwide in Pakistan?",
            answer: "Yes! We deliver to all cities across Pakistan with flat Rs. 250 shipping. Most orders arrive within 3-5 business days."
          },
          {
            question: "Are your products handcrafted or machine-made?",
            answer: "All our ladies suits and kids formalwear feature handcrafted embroidery and artisan finishes. We work directly with skilled embroiderers in Karachi."
          },
          {
            question: "What is your return policy?",
            answer: "We offer a 14-day return and exchange policy. Items must be unworn with original tags attached."
          },
          {
            question: "How do I contact customer support?",
            answer: "Reach us on WhatsApp at +92 312 0295812, email info@habibaminhas.com, or use our contact form. We respond within 24 hours."
          },
          {
            question: "Do you offer international shipping?",
            answer: "Currently we focus on serving customers within Pakistan. For international orders, please contact us directly."
          }
        ]}
      />
    </>
  );
}
