import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { AnnouncementStrip } from "@/components/home/announcement-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { EditorialBlock } from "@/components/home/editorial-block";
import { TrendTiles } from "@/components/home/trend-tiles";
import { TrendingTabs, type TrendingProduct } from "@/components/home/trending-tabs";
import { TestimonialRow } from "@/components/home/testimonial-row";
import { JournalTeaser } from "@/components/home/journal-teaser";
import { getProducts } from "@/lib/actions/products";

export const metadata: Metadata = {
  title: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
  description: "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
  alternates: {
    canonical: "/",
  },
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
      <h1 className="sr-only">Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear</h1>
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
      <TestimonialRow />
      <JournalTeaser />
    </>
  );
}
