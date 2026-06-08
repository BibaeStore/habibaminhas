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
        description="Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration. Our kids formal wear collection brings the same quality and attention to detail we apply to adult clothing, sized and designed specifically for children ages 2 through 12.

We understand that kids' formal wear in Pakistan serves important cultural purposes — from Eid prayers to wedding ceremonies, from family photo sessions to religious celebrations. Children need to look polished and feel comfortable through hours of festivities, and our designs deliver both. Each piece is constructed with extra room for movement, reinforced seams that withstand active play, and soft fabrics that won't irritate sensitive skin.

The construction differs from adult formal wear in important ways. We use lighter-weight fabrics appropriate for children — softer lawns, breathable cottons, and lightweight silks that don't overwhelm small frames. Embellishments are securely stitched and sized appropriately, avoiding heavy beadwork that adds uncomfortable weight or sharp elements that could scratch. All closures are simple enough for children to manage independently when age-appropriate, with elastic waists, easy buttons, and gentle zippers.

Sizing follows Pakistani standards by age and height ranges. We provide detailed measurements for each style because children grow at different rates — a tall 4-year-old might wear size 5-6, while a petite 7-year-old fits comfortably in 5-6. Our size guides include height ranges in centimeters to help parents choose accurately. Many customers size up slightly to extend the wear period as children grow quickly, especially in formal pieces that see occasional use.

Our kids collection covers the key celebrations and events in Pakistani family life: Eid-ul-Fitr and Eid-ul-Adha, wedding ceremonies (especially when children serve as flower girls or ring bearers), Shab-e-Barat, birthday parties, and family photo sessions. We design with versatility in mind — a well-made kids formal outfit can be worn across multiple occasions throughout the year.

The color palette reflects both tradition and contemporary trends. Classic whites and creams work for religious occasions, while jewel tones (emerald, ruby red, sapphire blue) suit festive celebrations. We offer gender-neutral options alongside traditional pink-for-girls and blue-for-boys, recognizing that modern Pakistani families appreciate choice in how they dress their children.

Quality matters especially in kids clothing because children are hard on garments. Our pieces are machine washable (detailed care instructions included), with colorfast dyes that survive repeated laundering. Seams are reinforced at stress points, and hems include allowance for letting down as children grow."
        tone={["#f5e8c0", "#c8900c", "#5a3800"]}
        motif="ogee"
        image="/HeroSection/kids-formal.webp"
        products={items}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
