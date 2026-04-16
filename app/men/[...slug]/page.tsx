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
  return { title: `Men · ${slug.map(labelize).join(" · ")}` };
}

export default async function MenCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;
  const items = products.filter((p) => p.category === "men");
  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Men", href: "/men" },
        { label: labelize(sub) },
        ...(collection ? [{ label: labelize(collection) }] : []),
      ]}
      eyebrow={`Men · ${labelize(sub)}`}
      title={collection ? labelize(collection) : labelize(sub)}
      description="Pressed at dawn, cut clean. The men's wardrobe for a summer that moves."
      tone={["#dcdccd", "#8c9b7e", "#3d4a36"]}
      motif="arch"
      products={items}
    />
  );
}
