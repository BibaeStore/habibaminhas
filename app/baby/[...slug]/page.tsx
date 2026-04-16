import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

type Params = { slug: string[] };

const toneBySub: Record<string, [string, string, string]> = {
  bedding: ["#f0e0f0", "#c090c0", "#401840"],
  nests: ["#f0e0f0", "#c090c0", "#401840"],
  swaddles: ["#d4e8d0", "#507848", "#182810"],
  nursing: ["#f5e8c0", "#c8900c", "#5a3800"],
  carrier: ["#d4e8d0", "#507848", "#182810"],
  "diaper-bags": ["#eedbc4", "#b08040", "#3a2010"],
  mattress: ["#f0e0f0", "#c090c0", "#401840"],
  gifts: ["#f2e0d8", "#c97a86", "#5a2030"],
};

const labelize = (s: string) =>
  s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return { title: `Baby · ${slug.map(labelize).join(" · ")}` };
}

export default async function BabyCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;

  const items = products.filter((p) => p.category === "baby-products");
  const tone = toneBySub[sub] ?? toneBySub.bedding;

  const subLabel = labelize(sub);
  const collectionLabel = collection ? labelize(collection) : null;

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Baby Products", href: "/baby" },
        { label: subLabel, href: `/baby/${sub}` },
        ...(collectionLabel ? [{ label: collectionLabel }] : []),
      ]}
      eyebrow={`Baby · ${subLabel}`}
      title={collectionLabel ?? subLabel}
      description="Premium padded nursery bedding, baby nests, swaddles, and accessories — made with love and softness in mind."
      tone={tone}
      motif="stripes"
      products={items}
    />
  );
}
