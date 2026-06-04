interface AggregateRatingSchemaProps {
  ratingValue: number;
  reviewCount: number;
  productName: string;
  productUrl: string;
}

export function AggregateRatingSchema({
  ratingValue,
  reviewCount,
  productName,
  productUrl,
}: AggregateRatingSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": ratingValue.toString(),
    "reviewCount": reviewCount.toString(),
    "bestRating": "5",
    "worstRating": "1",
    "itemReviewed": {
      "@type": "Product",
      "name": productName,
      "url": productUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
