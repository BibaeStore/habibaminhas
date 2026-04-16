import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import { CollectionTemplate } from "@/components/collection/collection-template";

type Params = { slug: string[] };

const toneBySub: Record<string, [string, string, string]> = {
  unstitched: ["#f2e6c9", "#d4b483", "#6b4a20"],
  "ready-to-wear": ["#ead7d1", "#c9917e", "#5a2a22"],
  west: ["#d7dbe4", "#6f7c8f", "#2a3244"],
  modest: ["#ece4d4", "#8a8179", "#1a1612"],
  accessories: ["#efe3d0", "#a8804b", "#2a1f17"],
};

const labelize = (s: string) =>
  s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return { title: slug.map(labelize).join(" · ") };
}

export default async function WomenCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();
  const [sub, collection] = slug;

  let items = products.filter((p) =>
    ["unstitched", "ready-to-wear", "west"].includes(p.category),
  );
  if (sub === "unstitched") items = products.filter((p) => p.category === "unstitched");
  else if (sub === "ready-to-wear")
    items = products.filter((p) => p.category === "ready-to-wear");
  else if (sub === "west") items = products.filter((p) => p.category === "west");
  else if (sub === "modest")
    items = products.filter((p) => p.category === "ready-to-wear").slice(0, 4);
  else if (sub === "accessories") items = products.slice(0, 4);

  const tone = toneBySub[sub] ?? toneBySub.unstitched;

  const subLabel = labelize(sub);
  const collectionLabel = collection ? labelize(collection) : null;

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Women", href: "/women" },
        { label: subLabel, href: `/women/${sub}` },
        ...(collectionLabel ? [{ label: collectionLabel }] : []),
      ]}
      eyebrow={`Women · ${subLabel}`}
      title={collectionLabel ?? subLabel}
      description={
        sub === "unstitched"
          ? "Hand-picked fabric, offered in one, two, and three-piece cuts."
          : sub === "ready-to-wear"
            ? "Silhouettes, finished. Dupattas folded. Outfits, ready to wear."
            : sub === "west"
              ? "A capsule written in three neutrals — poplin, cupro, and linen."
              : sub === "modest"
                ? "Abayas cut from light crepe, hijabs in featherweight chiffon."
                : "Bags, belts, and scarves to finish the look."
      }
      tone={tone}
      motif={sub === "west" ? "stripes" : sub === "modest" ? "arch" : "floral"}
      products={items}
    />
  );
}
