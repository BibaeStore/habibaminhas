import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/wishlist/",
          "/order/",
        ],
      },
    ],
    sitemap: "https://habibaminhas.com/sitemap.xml",
  };
}
