import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Accessories" };

export default function AccessoriesPage() {
  const items = products.filter((p) => p.category === "accessories");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Accessories" }]}
      eyebrow="Handcrafted Accessories"
      title="Silk Hair Accessories"
      description="3-piece handcrafted silk headband & floral clip sets — made by hand, finished with care, gifted with love."
      tone={["#eedbc4", "#b08040", "#3a2010"]}
      motif="lattice"
      products={items}
    />
  );
}
