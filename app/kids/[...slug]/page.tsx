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
        canonical: `/kids/${subcategorySlug}/`,
      },
    };
  } catch {
    return {
      title: "Kids Collection",
      description: "Shop kids festive wear from Habiba Minhas",
    };
  }
}

export default async function KidsSubcategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const subcategorySlug = slug[0];

  let category;
  try {
    category = await getCategoryBySlug(subcategorySlug);
  } catch {
    notFound();
  }

  const items = await getProducts({
    category: "kids-formal",
    subcategory: subcategorySlug,
    status: "active"
  }).catch(() => []);

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Kids", href: "/kids/" },
        { label: category.name }
      ]}
      eyebrow="Kids Collection"
      title={category.name}
      description={category.seo_desc || `Shop ${category.name} from Habiba Minhas`}
      tone={["#f5e8c0", "#c8900c", "#5a3800"]}
      motif="ogee"
      image={category.image || "/HeroSection/kids-formal.webp"}
      products={items}
    />
  );
}
