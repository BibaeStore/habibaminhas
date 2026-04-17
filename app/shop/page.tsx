import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Shop All" };

export default async function ShopPage() {
  const items = await getProducts({ status: "active" }).catch(() => []);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Shop All" }]}
      eyebrow="Habiba Minhas"
      title="All Products"
      description="Ladies formal suits, kids festive wear, baby nursery products, and handcrafted accessories — the complete Habiba Minhas collection."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      products={items}
    />
  );
}
