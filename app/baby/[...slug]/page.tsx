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
        canonical: `/baby/${subcategorySlug}/`,
      },
    };
  } catch {
    return {
      title: "Baby Products",
      description: "Shop baby products from Habiba Minhas",
    };
  }
}

export default async function BabySubcategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const subcategorySlug = slug[0];

  let category;
  try {
    category = await getCategoryBySlug(subcategorySlug);
  } catch {
    notFound();
  }

  const items = await getProducts({
    category: "baby-products",
    subcategory: subcategorySlug,
    status: "active"
  }).catch(() => []);

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Baby Products", href: "/baby/" },
        { label: category.name }
      ]}
      eyebrow="Baby & Nursery"
      title={category.name}
      description={category.seo_desc || `Shop ${category.name} from Habiba Minhas`}
      tone={["#f0e0f0", "#c090c0", "#401840"]}
      motif="stripes"
      image={category.image || "/HeroSection/baby-bedding.webp"}
      products={items}
    />
  );
}
