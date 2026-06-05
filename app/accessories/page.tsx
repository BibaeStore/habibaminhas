import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
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
        description="3-piece handcrafted silk headband & floral clip sets — made by hand, finished with care, gifted with love."
        tone={["#eedbc4", "#b08040", "#3a2010"]}
        motif="lattice"
        image="/HeroSection/accessories.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
