interface ArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  heroImage: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  keywords?: string;
}

export function ArticleSchema({
  title,
  description,
  slug,
  heroImage,
  publishedAt,
  updatedAt,
  author = "Habiba Minhas",
  keywords
}: ArticleSchemaProps) {
  const baseUrl = "https://habibaminhas.com";
  const articleUrl = `${baseUrl}/journal/${slug}/`;
  const imageUrl = heroImage.startsWith('http') ? heroImage : `${baseUrl}${heroImage}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "url": articleUrl,
    "datePublished": publishedAt,
    "dateModified": updatedAt || publishedAt,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Habiba Minhas",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    }
  };

  // Add keywords if provided
  if (keywords) {
    // @ts-ignore - adding optional property
    schema.keywords = keywords;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
