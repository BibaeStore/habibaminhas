import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Kids" };

export default function KidsPage() {
  const items = products.filter((p) => p.category === "kids-formal");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Kids" }]}
      eyebrow="Kids Collection"
      title="Kids Festive Wear"
      description="Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration."
      tone={["#f5e8c0", "#c8900c", "#5a3800"]}
      motif="ogee"
      products={items}
    />
  );
}
