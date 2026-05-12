import { CollectionTemplate } from "@/components/collection/collection-template";
import { getProducts } from "@/lib/actions/products";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "The Edit — Habiba Minhas" };

export const dynamic = "force-dynamic";

export default async function EditPage() {
  const all = await getProducts({ status: "active" }).catch(() => []);

  // Stylist's pick: featured products first, then recent — capped at 24
  const featured = all.filter((p) => p.featured);
  const rest     = all.filter((p) => !p.featured);
  const items    = [...featured, ...rest].slice(0, 24).map((p) => ({
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    price:       p.price,
    images:      p.images,
    compare_at:  p.compare_at,
    palette:     p.palette,
    badge:       p.badge,
    subcategory: p.subcategory,
    subtype:     p.subtype,
  }));

  return (
    <CollectionTemplate
      crumbs={[{ label: "Home", href: "/" }, { label: "The Edit" }]}
      eyebrow="Curated"
      title="The Edit."
      description="A fortnightly selection pulled together by our stylists — the pieces we wear most."
      tone={["#efe3d0", "#a8804b", "#2a1f17"]}
      motif="floral"
      products={items}
    />
  );
}
