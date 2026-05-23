interface ProductSchemaProps {
  product: {
    title: string;
    description: string | null;
    slug: string;
    category: string;
    images: string[];
    price: number;
    compare_at: number | null;
    sku: string | null;
    stock: number;
    badge: string | null;
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = "https://habibaminhas.com";
  const productUrl = `${baseUrl}/product/${product.category}/${product.slug}/`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    "url": productUrl,
    "sku": product.sku || product.slug,
    "brand": {
      "@type": "Brand",
      "name": "Habiba Minhas"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "PKR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Habiba Minhas"
      }
    }
  };

  // Add compare at price if available
  if (product.compare_at && product.compare_at > product.price) {
    schema.offers = {
      ...schema.offers,
      // @ts-ignore - adding additional property
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": product.price,
        "priceCurrency": "PKR"
      }
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
