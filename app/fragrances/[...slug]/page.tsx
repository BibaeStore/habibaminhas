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
  return { title: `Fragrances · ${slug.map(labelize).join(" · ")}` };
}

export default async function FragranceCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const items = products.filter((p) => p.category === "fragrance");
  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Fragrances", href: "/fragrances" },
        ...slug.map((s) => ({ label: labelize(s) })),
      ]}
      eyebrow="Fragrance Library"
      title={slug.map(labelize).join(" · ")}
      description="Small-batch perfumes, composed in the studio and decanted by hand."
      tone={["#d7dbe4", "#6f7c8f", "#1a1612"]}
      motif="ogee"
      products={items}
    />
  );
}
