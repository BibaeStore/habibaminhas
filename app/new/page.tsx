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

// SEO Focus Keyword: "new Pakistani fashion" / "latest Pakistani clothes"
// Target: Fashion-forward customers looking for newest designs in Pakistan
export const metadata: Metadata = {
  title: "New Arrivals Pakistan | Latest Pakistani Fashion | Habiba Minhas",
  description: "Latest Pakistani fashion arrivals — new ladies suits, kids festive wear, baby products & accessories. Fresh designs from Karachi, Pakistan. Shop new arrivals online.",
  alternates: {
    canonical: "/new/",
  },
  keywords: "new Pakistani fashion, latest Pakistani clothes, new arrivals Pakistan, fresh designs Pakistan, latest suits Pakistan, new collection Habiba Minhas",
};

export default async function NewArrivalsPage() {
  const items = await getProducts({ status: "active", featured: true }).catch(() => []);

  const faqs = [
    {
      question: "How often do you add new arrivals?",
      answer: "We add new designs and products regularly throughout the year, with major collections released seasonally for Eid, wedding season, and festive occasions. Our newest pieces are always featured in this section first, so check back often to discover fresh designs."
    },
    {
      question: "Are new arrivals available in all sizes?",
      answer: "Most new arrivals are available in our full size range when first launched. Popular sizes may sell out quickly, so we recommend ordering early. You can sign up for restock notifications on any product page if your size is temporarily unavailable."
    },
    {
      question: "Do new arrivals ship immediately?",
      answer: "Yes! All new arrivals featured in this collection are in stock and ready to ship. Orders placed before 2 PM ship the same day (Monday-Saturday). You'll receive tracking information within 24 hours of placing your order."
    },
    {
      question: "Can I return or exchange new arrival items?",
      answer: "Absolutely! New arrivals follow our standard return and exchange policy. You have 14 days from delivery to exchange items for size or fit preferences. Items must be unworn with original tags attached. Exchange shipping is free within Pakistan."
    },
    {
      question: "How can I be notified about new arrivals first?",
      answer: "Follow us on Instagram @habibaminhas.official for instant updates, or subscribe to our newsletter to receive emails when new collections launch. Newsletter subscribers often get early access and exclusive first-look previews of upcoming designs."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
        eyebrow="Just In"
        title="New Arrivals"
        description="The latest additions to the Habiba Minhas collection — premium ladies suits with fresh embroidery designs, kids formalwear for upcoming celebrations, new baby nursery essentials, and handcrafted accessories. Each piece represents our commitment to quality Pakistani craftsmanship and contemporary design. Be the first to shop our newest releases, featuring seasonal fabrics, trending colors, and limited-edition pieces you won't find anywhere else."
        tone={["#f2e0d8", "#c97a86", "#5a2030"]}
        motif="floral"
        image="/HeroSection/new-arrivals.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
