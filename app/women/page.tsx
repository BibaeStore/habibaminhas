import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Women" };

export default function WomenPage() {
  const items = products.filter((p) =>
    ["unstitched", "ready-to-wear", "west"].includes(p.category),
  );
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Women" }]}
      eyebrow="Summer '26"
      title="Women"
      description="Unstitched, ready-to-wear, and west — the full bench, in one place."
      tone={["#efe3d0", "#d4b483", "#7a5b35"]}
      motif="floral"
      products={items}
    />
  );
}
