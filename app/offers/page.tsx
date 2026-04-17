import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Sale" };

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
