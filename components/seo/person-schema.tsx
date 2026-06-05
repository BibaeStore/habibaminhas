export function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Habiba Minhas",
    "url": "https://habibaminhas.com/about/author/",
    "image": "https://habibaminhas.com/logo/logo.png", // TODO: Add actual founder photo when available
    "jobTitle": "Founder & Creative Director",
    "description": "Founder of Habiba Minhas, Pakistan's leading handcrafted fashion brand. Specializing in premium ladies suits, kids festive wear, and baby products made in Karachi.",
    "worksFor": {
      "@type": "Organization",
      "name": "Habiba Minhas",
      "url": "https://habibaminhas.com"
    },
    "sameAs": [
      "https://www.instagram.com/habibaminhas.official/",
      "https://www.facebook.com/profile.php?id=61573309750795",
      "https://www.youtube.com/@HabibaMinhas989",
      "https://www.tiktok.com/@habibaminhas._official",
      "https://x.com/HabibaMinhas_",
      "https://www.pinterest.com/habibaminhas_official/",
      "https://www.quora.com/profile/Habiba-Minhas-6",
      "https://www.reddit.com/user/HabibaMinhas_989/"
    ],
    "knowsAbout": [
      "Pakistani Fashion",
      "Handcrafted Clothing",
      "Silk Suits",
      "Traditional Wear",
      "Kids Festive Wear",
      "Baby Products",
      "Fashion Design",
      "Artisan Embroidery"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Karachi",
      "addressCountry": "PK"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
