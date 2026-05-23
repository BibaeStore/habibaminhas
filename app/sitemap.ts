import { MetadataRoute } from "next";
import { getProducts } from "@/lib/actions/products";
import { createClient } from "@/lib/supabase/server";

// Revalidate sitemap every hour to include new blog posts
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://habibaminhas.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/new/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/offers/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ladies/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kids/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/baby/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/accessories/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/journal/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic journal posts from database
  let journalRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: journalPosts } = await supabase
      .from("journal_posts")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // Hardcoded editorial posts (not in database)
    const editorialSlugs = [
      { slug: "dupatta-five-ways", date: "2026-04-12T09:00:00+05:00" },
      { slug: "linen-notes", date: "2026-04-04T09:00:00+05:00" },
      { slug: "layering-oud", date: "2026-03-29T09:00:00+05:00" },
      { slug: "summer-wardrobe-edit", date: "2026-03-18T09:00:00+05:00" },
      { slug: "behind-the-sukoon", date: "2026-03-09T09:00:00+05:00" },
    ];

    // Combine database posts and editorial posts
    const allJournalPosts = [
      ...(journalPosts || []),
      ...editorialSlugs.map(item => ({
        slug: item.slug,
        published_at: item.date,
        updated_at: item.date
      }))
    ];

    journalRoutes = allJournalPosts.map((post) => ({
      url: `${baseUrl}/journal/${post.slug}/`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at || new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching journal posts for sitemap:", error);
  }

  // Help pages
  const helpSlugs = ["faq", "returns", "shipping", "payments"];
  const helpRoutes: MetadataRoute.Sitemap = helpSlugs.map((slug) => ({
    url: `${baseUrl}/help/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Legal pages
  const legalSlugs = ["privacy", "terms"];
  const legalRoutes: MetadataRoute.Sitemap = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  // Content pages
  const contentSlugs = ["fabric-glossary", "size-guide", "denim-fit-guide"];
  const contentRoutes: MetadataRoute.Sitemap = contentSlugs.map((slug) => ({
    url: `${baseUrl}/content/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic product routes from database
  let productRoutes: MetadataRoute.Sitemap = [];
  let subcategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ status: "active" });
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.category}/${product.slug}/`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Extract unique subcategories
    const subcategoryMap = new Map<string, string>();
    products.forEach((product) => {
      if (product.subcategory && Array.isArray(product.subcategory)) {
        product.subcategory.forEach((sub: string) => {
          const key = `${product.category}/${sub}`;
          subcategoryMap.set(key, product.category);
        });
      }
    });

    // Generate subcategory routes
    subcategoryRoutes = Array.from(subcategoryMap.entries()).map(([key, category]) => {
      const subcategory = key.split('/')[1];
      return {
        url: `${baseUrl}/${category === 'ladies-suits' ? 'ladies' : category === 'kids-formal' ? 'kids' : category === 'baby-products' ? 'baby' : category}/${subcategory}/`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      };
    });
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  // Combine all routes
  return [
    ...staticRoutes,
    ...journalRoutes,
    ...helpRoutes,
    ...legalRoutes,
    ...contentRoutes,
    ...subcategoryRoutes,
    ...productRoutes,
  ];
}
