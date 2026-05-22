import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

// SEO Focus Keyword: "Pakistani ladies suits" / "ladies formal wear Pakistan"
// Target: Pakistani women shopping for formal suits, wedding outfits, Eid wear
export const metadata: Metadata = {
  title: "Ladies Formal Suits Pakistan | Pakistani Women's Fashion | Habiba Minhas",
  description: "Handcrafted Pakistani ladies suits — 3-piece silk formal wear adorned with gold brocade, mirror-work & artisan embroidery. Made in Karachi for the modern Pakistani woman. Shop Eid & wedding suits online.",
  alternates: {
    canonical: "/ladies/",
  },
  keywords: "Pakistani ladies suits, ladies formal wear Pakistan, women suits Pakistan, Pakistani wedding outfits, Eid suits for women, silk suits Pakistan, 3 piece suits Pakistan",
};

export default async function LadiesPage() {
  const items = await getProducts({ category: "ladies-suits", status: "active" }).catch(() => []);
  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "Ladies" }]}
      eyebrow="Ladies Collection"
      title="Ladies Formal Suits"
      description="Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — made for the modern Pakistani woman."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image="/HeroSection/ladies-suits.webp"
      products={items}
    />
  );
}
