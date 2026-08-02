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

// SEO Focus Keyword: "shop Pakistani fashion online"
// Target: Users browsing complete product catalog in Pakistan
export const metadata: Metadata = {
  title: "Shop All Pakistani Fashion Online | Habiba Minhas Pakistan",
  description: "Shop Pakistani fashion online — complete collection of handcrafted ladies suits, kids festive wear, baby products & accessories. Made in Karachi, Pakistan. Nationwide delivery Rs. 250.",
  alternates: {
    canonical: "/shop/",
  },
  keywords: "shop Pakistani fashion online, buy Pakistani clothes, Pakistani fashion store, online shopping Pakistan, Habiba Minhas shop, Pakistan clothes online",
};

export default async function ShopPage() {
  const items = await getProducts({ status: "active" }).catch(() => []);

  const faqs = [
    {
      question: "What types of products do you sell?",
      answer: "We offer a complete range of handcrafted Pakistani fashion including premium ladies formal suits (3-piece silk suits with embroidery), kids festive wear (co-ord sets, gowns, and formal dresses), baby nursery products (bedding sets, nests, swaddles), and handcrafted accessories (silk headbands and hair clips). Every product is either made in Pakistan or personally curated by our founder."
    },
    {
      question: "How do I find products by category?",
      answer: "Our collection is organized into four main categories: Ladies (formal suits and traditional wear), Kids (festive and formal wear for ages 2-12), Baby Products (nursery essentials and bedding), and Accessories (handcrafted hair accessories). You can browse each category from the main navigation menu or use filters on this page to narrow your search."
    },
    {
      question: "Are all products available for immediate purchase?",
      answer: "Most products in our shop are ready to ship immediately. Product availability is shown on each product page. In-stock items ship within 24 hours. If an item is out of stock, you can sign up for restock notifications on the product page, and we'll email you when it's available again."
    },
    {
      question: "Do you ship all products nationwide in Pakistan?",
      answer: "Yes! Every product in our shop ships nationwide across Pakistan for a flat rate of Rs. 250. We deliver to Karachi, Lahore, Islamabad, and all cities throughout Pakistan. Most orders arrive within 3-5 business days. Express same-day delivery is available in major cities."
    },
    {
      question: "How often do you add new products?",
      answer: "We add new designs and products regularly throughout the year, with seasonal collections released for Eid, wedding season, and festive occasions. Follow us on Instagram @habibaminhas.official or subscribe to our newsletter to be the first to know about new arrivals and limited edition pieces."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop All" }]}
        eyebrow="Habiba Minhas"
        title="All Products"
        description="Ladies formal suits, kids festive wear, baby nursery products, and handcrafted accessories — the complete Habiba Minhas collection. Every piece is crafted with care in Pakistan and delivered nationwide. Browse our full range of premium handcrafted fashion and nursery essentials, from silk embroidered suits perfect for Pakistani weddings to luxurious baby bedding sets. Shop with confidence knowing each product meets our exacting quality standards."
        tone={["#f2e0d8", "#c97a86", "#5a2030"]}
        motif="floral"
        image="/banners/shop-banner.png"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
