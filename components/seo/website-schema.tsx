export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Habiba Minhas",
    "url": "https://habibaminhas.com",
    "description": "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://habibaminhas.com/search/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
