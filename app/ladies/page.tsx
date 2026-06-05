import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
import { FAQSchema } from "@/components/seo/faq-schema";

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
        description="Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — made for the modern Pakistani woman."
        tone={["#f2e0d8", "#c97a86", "#5a2030"]}
        motif="floral"
        image="/HeroSection/ladies-suits.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
