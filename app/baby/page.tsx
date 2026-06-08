import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
import { FAQSchema } from "@/components/seo/faq-schema";

// SEO Focus Keyword: "baby products Pakistan" / "baby bedding Pakistan"
// Target: New mothers, expecting mothers shopping for nursery essentials in Pakistan
export const metadata: Metadata = {
  title: "Baby Products Pakistan | Nursery Bedding & Baby Essentials | Habiba Minhas",
  description: "Soft, padded baby bedding sets, baby nests, swaddle wraps & nursery accessories in Pakistan — everything your little one needs, made with love in Karachi. Shop baby products online Pakistan.",
  alternates: {
    canonical: "/baby/",
  },
  openGraph: {
    url: "https://habibaminhas.com/baby/",
  },
  keywords: "baby products Pakistan, baby bedding Pakistan, nursery products Pakistan, baby nest Pakistan, crib bedding Pakistan, baby essentials Pakistan, newborn products Karachi",
};

export default async function BabyPage() {
  const items = await getProducts({ category: "baby-products", status: "active" }).catch(() => []);

  const faqs = [
    {
      question: "Are your baby products safe for newborns?",
      answer: "Yes! All our baby products use baby-safe, hypoallergenic materials with no harmful chemicals. Each item is thoroughly tested for infant safety."
    },
    {
      question: "Can I wash baby bedding in a machine?",
      answer: "Most baby bedding sets are machine-washable on gentle cycle with mild detergent. Always check individual product care labels included with your order."
    },
    {
      question: "Will baby nests fit in standard cribs?",
      answer: "Yes! Our baby nests are designed to fit comfortably in standard Pakistani crib sizes. Dimensions are listed on each product page."
    },
    {
      question: "How long does delivery take for baby products?",
      answer: "Baby product orders ship within 24 hours and typically arrive within 3-5 business days nationwide. Karachi orders often arrive within 2 days."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Baby Products" }]}
        eyebrow="Baby & Nursery"
        title="Baby Products"
        description="Soft, padded nursery bedding sets, baby nests, swaddle wraps, and accessories — everything your little one needs, made with love in Pakistan. Our baby products collection provides essentials for your nursery, designed with both infant safety and Pakistani climate in mind.

Every product in our baby range is handcrafted in Karachi using materials specifically chosen for newborn safety and comfort. We work exclusively with baby-safe, hypoallergenic fabrics that won't irritate delicate newborn skin. All dyes are non-toxic and tested to ensure they're safe even if babies put fabric in their mouths. No harmful chemicals, no harsh treatments — just soft, gentle materials appropriate for the youngest family members.

Pakistani climate creates specific requirements for baby products. Our bedding strikes the right balance: breathable enough for hot Karachi summers when babies can overheat easily, yet cozy enough for cooler months in Lahore and Islamabad. The natural cotton fibers we use allow air circulation while wicking moisture away from skin, helping regulate baby's temperature during sleep. Multiple layers in bedding sets let parents adjust warmth as seasons change.

Safety standards guide every design decision. Our baby nests feature breathable construction that follows safe sleep guidelines, avoiding overly soft materials that pose risks. Cot bumpers use mesh rather than traditional padded designs that can create suffocation hazards. Swaddles are sized generously to allow healthy hip movement while keeping arms secure. All products are free from small parts, ribbons, or decorative elements that could become choking hazards.

The construction quality reflects our commitment to durability through countless wash cycles. New parents quickly learn that baby products need frequent laundering — spit-up, diaper leaks, and general baby messiness are inevitable. Our products are designed to withstand this reality. Fabrics are pre-shrunk before stitching so they maintain size after washing. Seams are double-stitched for strength. Colors remain vibrant through repeated washing thanks to high-quality, colorfast dyes.

We design with practical parenting in mind. Removable, washable covers make cleaning simple when accidents happen. Standard sizing ensures our products fit Pakistani cribs and changing tables without modification. Lightweight construction makes items easy to move from room to room as you go about your day with baby. Many products serve multiple purposes — swaddles double as nursing covers, stroller shades, and light blankets, maximizing value for budget-conscious families.

Our baby collection covers all the nursery essentials: complete bedding sets for cribs, portable baby nests for safe co-sleeping and travel, muslin swaddle wraps for better sleep, support pillows for supervised tummy time, practical diaper bags for outings, and coordinated storage solutions. Mix and match pieces to create a cohesive nursery aesthetic or choose complete sets designed to work together."
        tone={["#f0e0f0", "#c090c0", "#401840"]}
        motif="stripes"
        image="/HeroSection/baby-bedding.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
