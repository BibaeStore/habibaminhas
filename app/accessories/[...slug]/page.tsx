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
  return { title: `Accessories · ${slug.map(labelize).join(" · ")}` };
}

export default async function AccessoriesCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;

  const items = products.filter((p) => {
    if (p.category !== "accessories") return false;
    if (p.subcategory !== sub) return false;
    if (collection) return p.subtype === collection;
    return true;
  });

  const subLabel = labelize(sub);
  const collectionLabel = collection ? labelize(collection) : null;

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Accessories", href: "/accessories" },
        { label: subLabel, href: `/accessories/${sub}` },
        ...(collectionLabel ? [{ label: collectionLabel }] : []),
      ]}
      eyebrow={`Accessories · ${subLabel}`}
      title={collectionLabel ?? subLabel}
      description="Handcrafted silk headbands, floral hair clips, and 3-piece sets — made for girls of all ages."
      tone={["#eedbc4", "#b08040", "#3a2010"]}
      motif="lattice"
      image="/editorial/accessories.webp"
      products={items}
    />
  );
}
