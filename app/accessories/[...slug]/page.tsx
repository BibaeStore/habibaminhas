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
        canonical: `/accessories/${subcategorySlug}/`,
      },
    };
  } catch {
    return {
      title: "Accessories",
      description: "Shop handcrafted accessories from Habiba Minhas",
    };
  }
}

export default async function AccessoriesSubcategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const subcategorySlug = slug[0];

  let category;
  try {
    category = await getCategoryBySlug(subcategorySlug);
  } catch {
    notFound();
  }

  const items = await getProducts({
    category: "accessories",
    subcategory: subcategorySlug,
    status: "active"
  }).catch(() => []);

  return (
    <CollectionTemplate
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Accessories", href: "/accessories/" },
        { label: category.name }
      ]}
      eyebrow="Handcrafted Accessories"
      title={category.name}
      description={category.seo_desc || `Shop ${category.name} from Habiba Minhas`}
      tone={["#eedbc4", "#b08040", "#3a2010"]}
      motif="lattice"
      image={category.image || "/HeroSection/accessories.webp"}
      products={items}
    />
  );
}
