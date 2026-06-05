import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { CollectionTemplate } from "@/components/collection/collection-template";
import { FAQSchema } from "@/components/seo/faq-schema";

// SEO Focus Keyword: "kids festive wear Pakistan" / "Pakistani kids formal dress"
// Target: Mothers shopping for kids Eid outfits, wedding wear, festive clothing
export const metadata: Metadata = {
  title: "Kids Festive Wear Pakistan | Girls Formal Dresses | Habiba Minhas",
  description: "Festive co-ord sets, embroidered gowns & silk suits for girls in Pakistan — handcrafted for Eid, weddings & celebrations. Made in Karachi. Shop Pakistani kids formal wear online.",
  alternates: {
    canonical: "/kids/",
  },
  openGraph: {
    url: "https://habibaminhas.com/kids/",
  },
  keywords: "kids festive wear Pakistan, Pakistani kids formal dress, girls Eid dress Pakistan, kids wedding outfits Pakistan, embroidered girls suits, children formal wear Pakistan",
};

export default async function KidsPage() {
  const items = await getProducts({ category: "kids-formal", status: "active" }).catch(() => []);

  const faqs = [
    {
      question: "What age range do your kids clothes fit?",
      answer: "Our kids festive wear is designed for ages 2-12 years. Each product page includes detailed size measurements to help you find the perfect fit."
    },
    {
      question: "Are kids outfits comfortable for all-day wear?",
      answer: "Yes! We use breathable fabrics and comfortable cuts designed for active children. Embroidery is carefully placed to avoid irritation."
    },
    {
      question: "Can I wash kids formal wear at home?",
      answer: "Most pieces can be hand-washed in cold water. For heavily embroidered items, we recommend dry cleaning. Care instructions are included with each order."
    },
    {
      question: "Do you offer matching sets for siblings?",
      answer: "While we don't currently offer pre-made sibling sets, many of our designs coordinate beautifully. Contact us for suggestions on matching outfits."
    }
  ];

  return (
    <>
      <CollectionTemplate
        crumbs={[{ label: "Home", href: "/" }, { label: "Kids" }]}
        eyebrow="Kids Collection"
        title="Kids Festive Wear"
        description="Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration."
        tone={["#f5e8c0", "#c8900c", "#5a3800"]}
        motif="ogee"
        image="/HeroSection/kids-formal.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
