import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";

// SEO Focus Keyword: "new Pakistani fashion" / "latest Pakistani clothes"
// Target: Fashion-forward customers looking for newest designs in Pakistan
export const metadata: Metadata = {
  title: "New Arrivals Pakistan | Latest Pakistani Fashion | Habiba Minhas",
  description: "Latest Pakistani fashion arrivals — new ladies suits, kids festive wear, baby products & accessories. Fresh designs from Karachi, Pakistan. Shop new arrivals online.",
  alternates: {
    canonical: "/new/",
  },
  keywords: "new Pakistani fashion, latest Pakistani clothes, new arrivals Pakistan, fresh designs Pakistan, latest suits Pakistan, new collection Habiba Minhas",
};

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
      image="/HeroSection/new-arrivals.webp"
      products={items}
    />
  );
}
