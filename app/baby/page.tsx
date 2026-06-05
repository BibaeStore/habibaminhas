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
        description="Soft, padded nursery bedding sets, baby nests, swaddle wraps, and accessories — everything your little one needs, made with love in Pakistan."
        tone={["#f0e0f0", "#c090c0", "#401840"]}
        motif="stripes"
        image="/HeroSection/baby-bedding.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
