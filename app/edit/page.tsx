import { CollectionTemplate } from "@/components/collection/collection-template";
import { getProducts } from "@/lib/actions/products";
import type { Metadata } from "next";
import { FAQSchema } from "@/components/seo/faq-schema";

export const metadata: Metadata = {
  title: "The Edit — Curated Pakistani Fashion | Habiba Minhas",
  description: "Our stylist's curated selection of the best Pakistani fashion pieces — handpicked ladies suits, kids wear, baby products & accessories. Updated fortnightly with our team's favorite pieces.",
  alternates: {
    canonical: "/edit/",
  },
  keywords: "curated Pakistani fashion, stylist picks Pakistan, best ladies suits Pakistan, recommended Pakistani fashion, Habiba Minhas favorites",
};

export const dynamic = "force-dynamic";

export default async function EditPage() {
  const all = await getProducts({ status: "active" }).catch(() => []);

  // Stylist's pick: featured products first, then recent — capped at 24
  const featured = all.filter((p) => p.featured);
  const rest     = all.filter((p) => !p.featured);
  const items    = [...featured, ...rest].slice(0, 24).map((p) => ({
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    price:       p.price,
    category:    p.category,
    images:      p.images,
    compare_at:  p.compare_at,
    palette:     p.palette,
    badge:       p.badge,
    subcategory: p.subcategory,
    subtype:     p.subtype,
    stock:       p.stock,
  }));

  const faqs = [
    {
      question: "What is The Edit collection?",
      answer: "The Edit is our fortnightly curated selection of the absolute best pieces from across our entire collection. Our in-house stylists handpick items based on quality, versatility, current trends, and customer favorites. Think of it as our personal recommendations — the pieces our team actually wears and loves."
    },
    {
      question: "How often is The Edit updated?",
      answer: "We refresh The Edit every two weeks (fortnightly) to showcase new favorites, seasonal must-haves, and trending pieces. This collection is capped at 24 carefully selected items to keep it focused and highly curated. Check back regularly to see what's currently in our stylist's rotation."
    },
    {
      question: "Are items in The Edit limited edition?",
      answer: "Not necessarily. While some pieces may be limited stock, The Edit primarily focuses on highlighting exceptional products that are currently available. Items may rotate out as new favorites emerge, but they typically remain available in our main shop unless marked as sold out or limited edition on the product page."
    },
    {
      question: "Why should I shop The Edit instead of browsing all products?",
      answer: "The Edit saves you time by showcasing only the absolute best pieces our stylists recommend. If you're unsure what to choose or want guaranteed quality and style, start here. Every item in The Edit has been vetted by our team for superior craftsmanship, versatile styling, and timeless appeal. It's perfect for first-time shoppers or anyone seeking expert curation."
    },
    {
      question: "Can I request specific items to be added to The Edit?",
      answer: "While our stylists independently curate The Edit based on quality and trends, we absolutely value customer feedback! If there's a product you think deserves spotlight, contact us at info@habibaminhas.com with your suggestion. We review all recommendations when planning our next Edit refresh."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "The Edit" }]}
        eyebrow="Curated"
        title="The Edit."
        description="A fortnightly selection pulled together by our in-house stylists — the pieces we wear most and recommend without hesitation. This curated collection represents the absolute best of Habiba Minhas across ladies formal suits, kids festive wear, baby nursery products, and handcrafted accessories. Each piece has been personally vetted for exceptional quality, timeless design, and versatile styling. Whether you're shopping for a wedding, Eid celebration, or building your everyday wardrobe, The Edit showcases our most loved pieces. Updated every two weeks with fresh recommendations, trending styles, and seasonal favorites. Limited to just 24 carefully selected items for a focused, premium shopping experience."
        tone={["#efe3d0", "#a8804b", "#2a1f17"]}
        motif="floral"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
