import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

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
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Sale" }]}
      eyebrow="End of Season"
      title="Special Offers"
      description="Special offers across ladies suits, kids formalwear, baby products, and accessories."
      tone={["#ead7d1", "#c07a68", "#5a2a22"]}
      motif="stripes"
      products={items}
    />
  );
}
