import { HeroCarousel } from "@/components/home/hero-carousel";
import { AnnouncementStrip } from "@/components/home/announcement-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { EditorialBlock } from "@/components/home/editorial-block";
import { TrendTiles } from "@/components/home/trend-tiles";
import { TrendingTabs } from "@/components/home/trending-tabs";
import { TestimonialRow } from "@/components/home/testimonial-row";
import { JournalTeaser } from "@/components/home/journal-teaser";

export default function HomePage() {
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
          { label: "Shop Ladies Suits", href: "/ladies/suits" },
          { label: "Formal & Party Wear", href: "/ladies/occasion/formal" },
          { label: "Gold Brocade Collection", href: "/ladies/suits/gold-brocade" },
        ]}
      />

      <EditorialBlock
        eyebrow="Kids Festive Wear"
        title="Little stars, big moments."
        body="Festive co-ord sets, embroidered gowns, and silk suits for girls — crafted for Eid, weddings, and every celebration worth dressing up for."
        tone={["#f5e8c0", "#c8900c", "#5a3800"]}
        motif="ogee"
        orientation="right"
        image="/editorial/kids-festive.webp"
        links={[
          { label: "Shop Girls Formal", href: "/kids/girls" },
          { label: "Festive Co-Ord Sets", href: "/kids/girls/co-ord" },
          { label: "Embroidered Gowns", href: "/kids/girls/gowns" },
        ]}
      />

      <EditorialBlock
        eyebrow="Baby & Nursery"
        title="Soft from the start."
        body="Deluxe padded crib bedding sets, baby nest pods, swaddle wraps, and nursing pillows — everything your nursery needs, made with love in Pakistan."
        tone={["#f0e0f0", "#c090c0", "#401840"]}
        motif="stripes"
        image="/editorial/baby-nursery.webp"
        links={[
          { label: "Shop Crib Bedding Sets", href: "/baby/bedding" },
          { label: "Baby Nests & Loungers", href: "/baby/nests" },
          { label: "Swaddles & Accessories", href: "/baby/swaddles" },
        ]}
      />

      <EditorialBlock
        eyebrow="Handcrafted Accessories"
        title="Finished by hand."
        body="3-piece handcrafted silk headband & floral clip sets — made with the same care as our fashion pieces, gifted with love."
        tone={["#eedbc4", "#b08040", "#3a2010"]}
        motif="lattice"
        orientation="right"
        image="/editorial/accessories.webp"
        links={[
          { label: "Shop Hair Accessories", href: "/accessories/hair" },
          { label: "Headband & Clip Sets", href: "/accessories/hair/sets" },
        ]}
      />

      <TrendTiles />
      <TrendingTabs />
      <TestimonialRow />
      <JournalTeaser />
    </>
  );
}
