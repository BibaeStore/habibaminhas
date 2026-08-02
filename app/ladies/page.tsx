import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
import { SubcategoryLinks } from "@/components/collection/subcategory-links";
import { FAQSchema } from "@/components/seo/faq-schema";

/*
 * ISR safety net for stock accuracy.
 *
 * This page is statically prerendered, so without a revalidate window its HTML — and
 * the in-stock / out-of-stock badge on every card in it — is frozen at build time and
 * served unchanged until the next deploy.
 *
 * `revalidateStorefront()` in lib/revalidate-storefront.ts pushes changes immediately
 * on admin edits and on order placement; this is the backstop for any stock path that
 * is added later and forgets to call it. Five minutes is short enough that the storefront
 * is never meaningfully wrong and long enough that the page stays static for crawlers,
 * so Core Web Vitals are unaffected.
 */
export const revalidate = 300;

// SEO Focus Keyword: "Pakistani ladies suits" / "ladies formal wear Pakistan"
// Target: Pakistani women shopping for formal suits, wedding outfits, Eid wear
export const metadata: Metadata = {
  title: "Ladies Formal Suits Pakistan | Pakistani Women's Fashion | Habiba Minhas",
  description: "Handcrafted Pakistani ladies suits — 3-piece silk formal wear adorned with gold brocade, mirror-work & artisan embroidery. Made in Karachi for the modern Pakistani woman. Shop Eid & wedding suits online.",
  alternates: {
    canonical: "/ladies/",
  },
  openGraph: {
    url: "https://habibaminhas.com/ladies/",
  },
  keywords: "Pakistani ladies suits, ladies formal wear Pakistan, women suits Pakistan, Pakistani wedding outfits, Eid suits for women, silk suits Pakistan, 3 piece suits Pakistan",
};

export default async function LadiesPage() {
  const items = await getProducts({ category: "ladies-suits", status: "active" }).catch(() => []);

  const faqs = [
    {
      question: "What sizes are available for ladies suits?",
      answer: "Our ladies suits come in standard Pakistani sizes with detailed size charts on each product page. Many styles also offer stitching services for a perfect fit."
    },
    {
      question: "Are the suits stitched or unstitched?",
      answer: "Most of our ladies suits are ready-to-wear (stitched). Check individual product pages for stitching status and customization options."
    },
    {
      question: "How do I care for silk and embroidered suits?",
      answer: "We recommend dry cleaning for heavily embroidered pieces. Light silk suits can be hand-washed in cold water. Detailed care instructions come with each order."
    },
    {
      question: "Can I wear these for weddings and formal events?",
      answer: "Absolutely! Our ladies suits are designed for Pakistani weddings, Eid celebrations, and formal occasions. Each piece features premium fabrics and artisan embroidery."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Ladies" }]}
        eyebrow="Ladies Collection"
        title="Ladies Formal Suits"
        description="Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — made for the modern Pakistani woman. Each piece in our ladies collection represents the finest traditions of Pakistani formal wear, reimagined for contemporary life. We design suits that honor cultural heritage while embracing modern silhouettes and wearability.

Our ladies suits are handcrafted in our Karachi studio by skilled artisans who bring decades of experience in traditional Pakistani embroidery techniques. Every kameez, shalwar, and dupatta is constructed with attention to detail that mass production cannot replicate — from the precision of mirror-work placement to the hand-finishing of seams and hems.

We source premium fabrics specifically for the Pakistani climate and occasion culture. Summer collections feature breathable lawn and silk georgette that remain comfortable through Karachi heat and formal events. Winter offerings include rich velvets, karandi, and heavier silks appropriate for cooler months and evening celebrations. Each fabric is selected not just for beauty but for how it drapes, moves, and photographs — because we know our customers need to look stunning in person and in wedding photos.

The embroidery work sets our suits apart. We employ artisans skilled in traditional techniques: intricate threadwork, delicate mirror embellishments (shisha), gold and silver brocade appliqué, and hand-beading. These techniques have been passed down through generations of craftspeople in Karachi and Lahore. When you purchase a Habiba Minhas suit, you're supporting these artisans and helping preserve Pakistan's textile heritage.

Our collection includes ready-to-wear stitched suits as well as unstitched fabric sets for those who prefer custom tailoring. Stitched suits follow standard Pakistani sizing with detailed measurements provided for each style. We also offer limited custom stitching services for bulk orders or special occasions — perfect for bridal parties, Eid gifts for extended family, or coordinated outfits for wedding events.

Occasions covered in our ladies collection span the full spectrum of Pakistani formal life: wedding guest attire, Eid celebrations, Shab-e-Barat, engagement ceremonies, mendhi outfits, formal dinners, and festive gatherings. We design with versatility in mind — many pieces transition beautifully from daytime events to evening celebrations with a simple jewelry change."
        tone={["#f2e0d8", "#c97a86", "#5a2030"]}
        motif="floral"
        image="/HeroSection/ladies-suits.webp"
        products={items}
      />
      <SubcategoryLinks parentSlug="ladies-suits" basePath="/ladies/" />
      <FAQSchema faqs={faqs} />
    </>
  );
}
