import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Ladies" };

export default function LadiesPage() {
  const items = products.filter((p) => p.category === "ladies-suits");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Ladies" }]}
      eyebrow="Ladies Collection"
      title="Ladies Formal Suits"
      description="Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — made for the modern Pakistani woman."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image="/editorial/ladies-collection.webp"
      products={items}
    />
  );
}
