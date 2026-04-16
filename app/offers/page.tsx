import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Sale" };

export default function OffersPage() {
  const items = products.map((p) =>
    p.compareAt
      ? p
      : { ...p, compareAt: Math.round((p.price * 1.4) / 10) * 10 },
  );
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
