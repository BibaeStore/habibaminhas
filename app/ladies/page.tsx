import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Ladies" };

export default async function LadiesPage() {
  const items = await getProducts({ category: "ladies-suits", status: "active" }).catch(() => []);
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
