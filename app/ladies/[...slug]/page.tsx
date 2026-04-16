import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

type Params = { slug: string[] };

const labelize = (s: string) =>
  s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return { title: `Ladies · ${slug.map(labelize).join(" · ")}` };
}

export default async function LadiesCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;

  const items = products.filter((p) => p.category === "ladies-suits");

  const subLabel = labelize(sub);
  const collectionLabel = collection ? labelize(collection) : null;

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Ladies", href: "/ladies" },
        { label: subLabel, href: `/ladies/${sub}` },
        ...(collectionLabel ? [{ label: collectionLabel }] : []),
      ]}
      eyebrow={`Ladies · ${subLabel}`}
      title={collectionLabel ?? subLabel}
      description="Handcrafted 3-piece stitched silk suits with gold brocade, mirror-work, and artisan embroidery — for every occasion."
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image="/editorial/ladies-collection.webp"
      products={items}
    />
  );
}
