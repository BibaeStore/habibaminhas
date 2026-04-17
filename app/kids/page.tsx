import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Kids" };

export default async function KidsPage() {
  const items = await getProducts({ category: "kids-formal", status: "active" }).catch(() => []);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Kids" }]}
      eyebrow="Kids Collection"
      title="Kids Festive Wear"
      description="Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration."
      tone={["#f5e8c0", "#c8900c", "#5a3800"]}
      motif="ogee"
      image="/products/royal-amethyst-gown.webp"
      products={items}
    />
  );
}
