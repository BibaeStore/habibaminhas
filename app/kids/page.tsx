import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

// SEO Focus Keyword: "kids festive wear Pakistan" / "Pakistani kids formal dress"
// Target: Mothers shopping for kids Eid outfits, wedding wear, festive clothing
export const metadata: Metadata = {
  title: "Kids Festive Wear Pakistan | Girls Formal Dresses | Habiba Minhas",
  description: "Festive co-ord sets, embroidered gowns & silk suits for girls in Pakistan — handcrafted for Eid, weddings & celebrations. Made in Karachi. Shop Pakistani kids formal wear online.",
  alternates: {
    canonical: "/kids/",
  },
  keywords: "kids festive wear Pakistan, Pakistani kids formal dress, girls Eid dress Pakistan, kids wedding outfits Pakistan, embroidered girls suits, children formal wear Pakistan",
};

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
      image="/HeroSection/kids-formal.webp"
      products={items}
    />
  );
}
