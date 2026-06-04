interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
}: CollectionPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `https://habibaminhas.com${url}`,
    "numberOfItems": numberOfItems,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Habiba Minhas",
      "url": "https://habibaminhas.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
