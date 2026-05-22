import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

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
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Shop All" }]}
      eyebrow="Habiba Minhas"
      title="All Products"
      description="Ladies formal suits, kids festive wear, baby nursery products, and handcrafted accessories — the complete Habiba Minhas collection."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image="/banners/shop-banner.png"
      products={items}
    />
  );
}
