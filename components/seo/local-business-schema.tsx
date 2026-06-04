export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Habiba Minhas",
    "image": "https://habibaminhas.com/logo/logo.png",
    "url": "https://habibaminhas.com",
    "telephone": "+92-312-0295812",
    "email": "info@habibaminhas.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Karachi",
      "addressLocality": "Karachi",
      "postalCode": "75533",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "24.8607",
      "longitude": "67.0011"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "Rs. 2,000 - Rs. 20,000",
    "paymentAccepted": "Cash, Bank Transfer",
    "currenciesAccepted": "PKR",
    "description": "Premium handcrafted Pakistani fashion brand specializing in ladies suits, kids festive wear, and baby products. Made in Karachi, Pakistan."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
