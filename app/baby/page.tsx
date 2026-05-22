import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

// SEO Focus Keyword: "baby products Pakistan" / "baby bedding Pakistan"
// Target: New mothers, expecting mothers shopping for nursery essentials in Pakistan
export const metadata: Metadata = {
  title: "Baby Products Pakistan | Nursery Bedding & Baby Essentials | Habiba Minhas",
  description: "Soft, padded baby bedding sets, baby nests, swaddle wraps & nursery accessories in Pakistan — everything your little one needs, made with love in Karachi. Shop baby products online Pakistan.",
  alternates: {
    canonical: "/baby/",
  },
  keywords: "baby products Pakistan, baby bedding Pakistan, nursery products Pakistan, baby nest Pakistan, crib bedding Pakistan, baby essentials Pakistan, newborn products Karachi",
};

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
