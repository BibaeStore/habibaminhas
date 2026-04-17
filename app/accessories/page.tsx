import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Accessories" };

export default async function AccessoriesPage() {
  const items = await getProducts({ category: "accessories", status: "active" }).catch(() => []);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Accessories" }]}
      eyebrow="Handcrafted Accessories"
      title="Silk Hair Accessories"
      description="3-piece handcrafted silk headband & floral clip sets — made by hand, finished with care, gifted with love."
      tone={["#eedbc4", "#b08040", "#3a2010"]}
      motif="lattice"
      image="/editorial/accessories.webp"
      products={items}
    />
  );
}
