import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "New Arrivals" };

export default async function NewArrivalsPage() {
  const items = await getProducts({ status: "active", featured: true }).catch(() => []);
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
