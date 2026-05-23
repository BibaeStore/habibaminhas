export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Habiba Minhas",
    "url": "https://habibaminhas.com",
    "logo": "https://habibaminhas.com/logo/logo.png",
    "description": "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PK",
      "addressLocality": "Karachi"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-312-0295812",
      "contactType": "Customer Service",
      "areaServed": "Worldwide",
      "availableLanguage": ["English", "Urdu"]
    },
    "sameAs": [
      "https://www.facebook.com/habibaminhas.official",
      "https://www.instagram.com/habibaminhas.pk",
      "https://www.youtube.com/@habibaminhas",
      "https://www.tiktok.com/@habibaminhas.pk",
      "https://x.com/habibaminhas_pk",
      "https://www.pinterest.com/habibaminhas_pk",
      "https://www.quora.com/profile/Habiba-Minhas-Fashion",
      "https://www.reddit.com/user/habibaminhas_pk"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
