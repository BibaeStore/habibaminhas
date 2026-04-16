import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "The Edit" };

export default function EditPage() {
  const items = products.filter((_, i) => i % 2 === 0);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "The Edit" }]}
      eyebrow="Curated"
      title="The Edit."
      description="A fortnightly selection pulled together by our stylists — the pieces we wear most."
      tone={["#efe3d0", "#a8804b", "#2a1f17"]}
      motif="floral"
      products={items}
    />
  );
}
