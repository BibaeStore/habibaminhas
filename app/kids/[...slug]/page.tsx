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
  return { title: `Kids · ${slug.map(labelize).join(" · ")}` };
}

export default async function KidsCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;

  const items = products.filter((p) => p.category === "kids-formal");

  const subLabel = labelize(sub);
  const collectionLabel = collection ? labelize(collection) : null;

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Kids", href: "/kids" },
        { label: subLabel, href: `/kids/${sub}` },
        ...(collectionLabel ? [{ label: collectionLabel }] : []),
      ]}
      eyebrow={`Kids · ${subLabel}`}
      title={collectionLabel ?? subLabel}
      description="Festive gowns, co-ord sets, and silk suits for girls — tailored for every celebration that deserves to be dressed well."
      tone={["#f5e8c0", "#c8900c", "#5a3800"]}
      motif="ogee"
      image="/products/royal-amethyst-gown.webp"
      products={items}
    />
  );
}
