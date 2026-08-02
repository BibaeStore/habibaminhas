import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
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

// SEO Focus Keyword: "Pakistani fashion sale" / "sale Pakistan clothes"
// Target: Price-conscious shoppers looking for discounts on Pakistani fashion
export const metadata: Metadata = {
  title: "Sale Pakistan | Discounted Pakistani Fashion | Habiba Minhas Offers",
  description: "Special offers on Pakistani fashion — discounted ladies suits, kids wear, baby products & accessories. Limited time sale across Pakistan. Handcrafted pieces on sale. Shop discounts online.",
  alternates: {
    canonical: "/offers/",
  },
  keywords: "Pakistani fashion sale, sale Pakistan clothes, discounted suits Pakistan, offers Pakistan fashion, Habiba Minhas sale, cheap Pakistani clothes, fashion discounts Pakistan",
};

export default async function OffersPage() {
  const items = await getProducts({ status: "active", onSale: true }).catch(() => []);

  const faqs = [
    {
      question: "Are sale items final sale or can they be returned?",
      answer: "Most sale items can be exchanged for size or fit within 14 days, following our standard exchange policy. Items must be unworn with original tags attached. However, items specifically marked as 'Final Sale' cannot be returned or exchanged (except for defects). Check individual product pages for specific sale terms."
    },
    {
      question: "How much can I save on sale items?",
      answer: "Sale discounts vary by product and season. Most items feature savings of 20-50% off regular prices. The original price and sale price are clearly displayed on each product page, so you can see exactly how much you're saving."
    },
    {
      question: "Do sale items have the same quality as regular-priced items?",
      answer: "Absolutely! Sale items maintain the exact same quality standards as our regular-priced products. Items go on sale due to seasonal changes, overstock, or to make room for new collections — never because of quality issues. Every piece still features handcrafted embroidery and premium fabrics."
    },
    {
      question: "How long will sale prices last?",
      answer: "Sale durations vary by promotion. Some sales run for specific seasons (like end-of-Eid sales), while others last until stock runs out. Popular sizes and styles sell out quickly during sales, so we recommend ordering early to secure your favorites at discounted prices."
    },
    {
      question: "Do sale items ship as quickly as regular items?",
      answer: "Yes! Sale items ship with the same fast shipping as all our products. Orders placed before 2 PM ship the same day (Monday-Saturday), with nationwide delivery in 3-5 business days at our flat Rs. 250 rate."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Sale" }]}
        eyebrow="End of Season"
        title="Special Offers"
        description="Discover exceptional value on premium Pakistani fashion with our special offers collection. Shop discounted ladies formal suits with handcrafted embroidery, kids festive wear perfect for celebrations, baby nursery essentials, and handcrafted accessories — all at reduced prices without compromising on quality. These limited-time offers feature the same artisan craftsmanship and premium materials you expect from Habiba Minhas, now more accessible than ever. Popular sizes sell out fast during our sales, so shop early to secure your favorites."
        tone={["#ead7d1", "#c07a68", "#5a2a22"]}
        motif="stripes"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
