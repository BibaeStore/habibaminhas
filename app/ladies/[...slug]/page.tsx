import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/actions/products";
import { getCategoryBySlug } from "@/lib/actions/categories";
import { CollectionTemplate } from "@/components/collection/collection-template";

type Params = { slug: string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const subcategorySlug = slug[0];

  try {
    const category = await getCategoryBySlug(subcategorySlug);
    return {
      title: category.seo_title || category.name,
      description: category.seo_desc || `Shop ${category.name} from Habiba Minhas`,
      alternates: {
        canonical: `/ladies/${subcategorySlug}/`,
      },
    };
  } catch {
    return {
      title: "Ladies Collection",
      description: "Shop ladies formal suits from Habiba Minhas",
    };
  }
}

export default async function LadiesSubcategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const subcategorySlug = slug[0];

  let category;
  try {
    category = await getCategoryBySlug(subcategorySlug);
  } catch {
    notFound();
  }

  const items = await getProducts({
    category: "ladies-suits",
    subcategory: subcategorySlug,
    status: "active"
  }).catch(() => []);

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Ladies", href: "/ladies/" },
        { label: category.name }
      ]}
      eyebrow="Ladies Collection"
      title={category.name}
      description={category.seo_desc || `Shop ${category.name} from Habiba Minhas`}
      tone={["#f2e0d8", "#c97a86", "#5a2030"]}
      motif="floral"
      image={category.image || "/HeroSection/ladies-suits.webp"}
      products={items}
    />
  );
}
