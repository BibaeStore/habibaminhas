import { MetadataRoute } from "next";
import { getProducts } from "@/lib/actions/products";

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

  // Journal posts
  const journalSlugs = [
    "dupatta-five-ways",
    "linen-notes",
    "layering-oud",
    "summer-wardrobe-edit",
    "behind-the-sukoon",
  ];
  const journalRoutes: MetadataRoute.Sitemap = journalSlugs.map((slug) => ({
    url: `${baseUrl}/journal/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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
  try {
    const products = await getProducts({ status: "active" });
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.category}/${product.slug}/`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
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
    ...productRoutes,
  ];
}
