import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
import { SubcategoryLinks } from "@/components/collection/subcategory-links";
import { FAQSchema } from "@/components/seo/faq-schema";

// SEO Focus Keyword: "Pakistani hair accessories" / "handcrafted accessories Pakistan"
// Target: Women and mothers shopping for hair accessories, gifts in Pakistan
export const metadata: Metadata = {
  title: "Pakistani Hair Accessories | Handcrafted Silk Headbands | Habiba Minhas",
  description: "3-piece handcrafted silk headband & floral clip sets made in Pakistan — handmade hair accessories for women & girls, finished with care. Shop Pakistani accessories online.",
  alternates: {
    canonical: "/accessories/",
  },
  openGraph: {
    url: "https://habibaminhas.com/accessories/",
  },
  keywords: "Pakistani hair accessories, handcrafted accessories Pakistan, silk headbands Pakistan, hair clips Pakistan, Pakistani women accessories, girls hair accessories",
};

export default async function AccessoriesPage() {
  const items = await getProducts({ category: "accessories", status: "active" }).catch(() => []);

  const faqs = [
    {
      question: "What age are hair accessories suitable for?",
      answer: "Our hair accessories are designed for ages 3+ through adults. Each set is crafted with care and safe for children when used under supervision."
    },
    {
      question: "Are headbands and clips safe for children's hair?",
      answer: "Yes! We use gentle materials that won't pull or damage hair. Clips have smooth edges and headbands are silk-wrapped for comfort."
    },
    {
      question: "How do I clean silk hair accessories?",
      answer: "Gently spot-clean with a damp cloth. Avoid submerging silk pieces in water. For flower clips, wipe petals carefully with a soft cloth."
    },
    {
      question: "Can I order accessories as gifts?",
      answer: "Absolutely! Our 3-piece sets come beautifully packaged and make perfect gifts for birthdays, Eid, or any celebration."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Accessories" }]}
        eyebrow="Handcrafted Accessories"
        title="Silk Hair Accessories"
        description="3-piece handcrafted silk headband & floral clip sets — made by hand, finished with care, gifted with love. Our accessories collection showcases traditional Pakistani artisan techniques applied to beautiful, functional pieces for babies and young girls.

Every accessory is handcrafted in our Karachi studio by skilled artisans who bring years of experience in traditional embellishment techniques. What makes these pieces truly special is the time and attention invested in each one. Silk flowers are shaped petal by petal, bows are hand-tied and stitched with precision, and each piece is inspected to ensure embellishments are secure and safe for children. This level of handwork creates accessories that are not only beautiful but also durable enough to withstand active wear.

We design accessories specifically for babies and young children, which requires different considerations than adult pieces. The clips use gentle grips lined with ribbon or fabric to protect fine baby hair from catching and pulling. Elastic bands are calibrated for just enough tension to stay in place without creating pressure points or leaving marks on sensitive scalps. All embellishments are securely stitched — never glued — so they won't detach if pulled by curious hands. We avoid small beads or decorative elements that could come loose and become choking hazards.

The materials reflect our commitment to safety and quality. We use soft silk for formal pieces and breathable cotton for everyday wear, both with baby-safe, colorfast dyes that won't bleed or transfer. The elastic maintains its stretch through multiple washes, and fabric components hold their shape and color through regular use. Everything is designed to survive the reality of children's wear — being dropped in toy boxes, tossed in laundry, and handled by small hands.

Our accessories coordinate beautifully with our kids formal wear collections, allowing parents to create complete outfits for special occasions. Many designs are created to match specific dress collections, perfect for Eid celebrations, wedding events, birthday parties, and family photos. We also offer everyday accessories in neutral colors and simpler designs that work with any outfit for school, playdates, or casual family outings.

The collection includes options for different ages and stages. Tiny newborn accessories feature ultra-gentle clips and soft bands suitable for the finest baby hair. Toddler and young girl pieces have slightly more structure to stay secure during active play. Sets include coordinating pieces — multiple items in complementary designs — allowing you to create different looks or share among sisters.

These handcrafted accessories make thoughtful gifts for new mothers, Eid gifts for nieces, birthday presents, or party favors for celebrations. We offer beautiful gift packaging options for special occasions. Supporting our handcrafted collection means supporting Pakistani artisans — many are women working from home, earning income while caring for their own families and helping preserve traditional craft skills."
        tone={["#eedbc4", "#b08040", "#3a2010"]}
        motif="lattice"
        image="/HeroSection/accessories.webp"
        products={items}
      />
      <SubcategoryLinks parentSlug="accessories" basePath="/accessories/" />
      <FAQSchema faqs={faqs} />
    </>
  );
}
