import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Men" };

export default function MenPage() {
  const items = products.filter((p) => p.category === "men");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Men" }]}
      eyebrow="Summer '26"
      title="Men"
      description="Kurtas pressed at dawn, shawls for cooler nights, and unstitched cloth for a hand-finished wardrobe."
      tone={["#dcdccd", "#8c9b7e", "#3d4a36"]}
      motif="arch"
      products={items}
    />
  );
}
