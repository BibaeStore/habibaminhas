import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "New Arrivals" };

export default function NewArrivalsPage() {
  const items = products.filter((p) => p.badge === "New In");
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
      eyebrow="Just In"
      title="New Arrivals"
      description="The latest additions to the Habiba Minhas collection — ladies suits, kids formalwear, baby products, and accessories."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image="/trending/pink-blossom.webp"
      products={items}
    />
  );
}
