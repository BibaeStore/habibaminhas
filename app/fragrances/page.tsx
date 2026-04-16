import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Fragrances" };

export default function FragrancesPage() {
  const items = products.filter((p) => p.category === "fragrance");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Fragrances" }]}
      eyebrow="The Fragrance Library"
      title="Notes, bottled."
      description="Floral, fruity, oriental, woody — a house of scents, composed in small batches."
      tone={["#d7dbe4", "#6f7c8f", "#1a1612"]}
      motif="ogee"
      products={items}
    />
  );
}
