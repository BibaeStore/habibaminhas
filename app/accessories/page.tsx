import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

// SEO Focus Keyword: "Pakistani hair accessories" / "handcrafted accessories Pakistan"
// Target: Women and mothers shopping for hair accessories, gifts in Pakistan
export const metadata: Metadata = {
  title: "Pakistani Hair Accessories | Handcrafted Silk Headbands | Habiba Minhas",
  description: "3-piece handcrafted silk headband & floral clip sets made in Pakistan — handmade hair accessories for women & girls, finished with care. Shop Pakistani accessories online.",
  alternates: {
    canonical: "/accessories/",
  },
  keywords: "Pakistani hair accessories, handcrafted accessories Pakistan, silk headbands Pakistan, hair clips Pakistan, Pakistani women accessories, girls hair accessories",
};

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
      image="/HeroSection/accessories.webp"
      products={items}
    />
  );
}
