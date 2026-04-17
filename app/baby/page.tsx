import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

export const metadata = { title: "Baby Products" };

export default async function BabyPage() {
  const items = await getProducts({ category: "baby-products", status: "active" }).catch(() => []);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Baby Products" }]}
      eyebrow="Baby & Nursery"
      title="Baby Products"
      description="Soft, padded nursery bedding sets, baby nests, swaddle wraps, and accessories — everything your little one needs, made with love in Pakistan."
      tone={["#f0e0f0", "#c090c0", "#401840"]}
      motif="stripes"
      image="/HeroSection/baby-bedding.webp"
      products={items}
    />
  );
}
