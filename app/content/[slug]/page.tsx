import Image from "next/image";
import { notFound } from "next/navigation";

type Params = { slug: string };

const pages: Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: { heading: string; body: string }[];
    tone: [string, string, string];
    motif: "floral" | "lattice" | "ogee" | "arch" | "stripes";
  }
> = {
  "fabric-glossary": {
    eyebrow: "Reference",
    title: "Pakistani Fabric Guide — Complete Glossary",
    intro:
      "Understanding Pakistani fabrics helps you choose the perfect outfit for every season and occasion. From lightweight summer lawns to luxurious silk georgettes, each fabric has unique properties, care requirements, and ideal uses. This comprehensive guide covers the essential fabrics used in Pakistani formal wear and everyday clothing.",
    tone: ["#efe3d0", "#a8804b", "#2a1f17"],
    motif: "lattice",
    sections: [
      {
        heading: "Lawn",
        body:
          "Featherweight pure cotton, 110–130 GSM (grams per square meter). Pakistan's most beloved summer fabric. Falls gently against the skin, wears exceptionally cool even in 40°C heat, and takes both print and embroidery beautifully without weighing down the drape. Our lawn comes from Faisalabad mills known for fine thread counts and tight weaves. Perfect for May through September wear. Machine washable in cold water. Softens beautifully with each wash while maintaining its structure. Best for: casual summer suits, everyday wear, Eid collections, and outdoor events.",
      },
      {
        heading: "Cambric",
        body:
          "Closely-woven cotton, 140–160 GSM. Slightly crisper and more structured than lawn with a tighter weave that resists wrinkling. Holds a press well and works beautifully for structured shirts and formal bottoms. More formal than lawn but still breathable enough for Pakistani summers. Originated in Cambrai, France, now produced locally in Karachi and Faisalabad mills. The tighter weave makes it more durable than lawn. Best for: office wear, structured formal suits, fitted trousers, and professional settings.",
      },
      {
        heading: "Silk Georgette",
        body:
          "A flat-weave silk with a distinctive crepey hand, 60–80 GSM. Weightless and breathable — paradoxically the only fabric that performs better in Pakistan's humid climate. The crepe texture allows air circulation while the silk fibers wick moisture. Drapes beautifully for flowing dupattas and elegant silhouettes. Premium grade imported from Chinese mills. Slightly sheer, often requires lining for formal wear. The matte finish contrasts beautifully with shinier silk charmeuse. Best for: formal dupattas, evening gowns, summer wedding wear, and layered formal pieces.",
      },
      {
        heading: "Silk (Charmeuse)",
        body:
          "Smooth, lustrous silk with a satin weave, 80–120 GSM. The classic choice for Pakistani formal wear — rich drape, beautiful sheen, and luxurious hand feel. Takes embroidery exceptionally well with the fabric supporting heavy threadwork without puckering. Our silk comes from trusted suppliers who work with Kashmiri and Chinese mills. The natural protein fibers breathe better than synthetic alternatives. Available in raw silk (matte) and charmeuse (shiny). Best for: 3-piece formal suits, bridal wear, heavily embroidered pieces, and special occasions.",
      },
      {
        heading: "Jacquard",
        body:
          "Woven patterns built into the fabric structure, no printing involved. Ranges from delicate self-stripes to heavy brocades with metallic gold or silver threads. We source our jacquards from a family-run mill outside Lahore that's been weaving for three generations. The raised patterns add texture and visual interest without additional embroidery. Heavier jacquards (200+ GSM) work for winter formal wear; lighter versions (120–150 GSM) suit transitional seasons. Best for: formal winter suits, structured pieces, and occasions where fabric texture creates the visual impact.",
      },
      {
        heading: "Khaddar",
        body:
          "Hand-loomed cotton with intentionally uneven texture, 180–220 GSM. Traditional Pakistani fabric experiencing a modern revival. The irregular weave creates natural air pockets that work cooler than the weight suggests. Each piece is slightly different due to the handloom process — this variation is part of the charm. Softens dramatically with washing, developing a lived-in comfort. Usually undyed or naturally dyed in earthy tones. Best for: winter casual suits, traditional wear, October through February, and customers who appreciate artisan textiles.",
      },
      {
        heading: "Chiffon",
        body:
          "Sheer, lightweight fabric with slight shimmer, 30–50 GSM. Made from silk, polyester, or blends. Traditionally used for dupattas due to the beautiful way it drapes and catches light. Pure silk chiffon is delicate and requires careful handling; polyester chiffon is more durable and washable. The transparency means it's always layered or used as an overlay. Works beautifully for dupattas on formal 3-piece suits. Best for: formal dupattas, overlays on structured pieces, and creating flowing, ethereal looks.",
      },
      {
        heading: "Voile",
        body:
          "Crisp, semi-sheer cotton fabric, 80–100 GSM. Lighter than cambric, more structured than lawn. The open weave creates excellent breathability while maintaining opacity. Often used for summer formal wear when lawn feels too casual but silk is too heavy. Takes embroidery well, especially delicate threadwork and shadow embroidery. Best for: summer formal suits, transitional season wear, and pieces where you want structure with breathability.",
      },
      {
        heading: "Karandi",
        body:
          "Medium-weight wool or wool-blend fabric, 200–250 GSM. The go-to choice for Pakistani winter formal wear. Warm without being bulky, structured enough for tailored pieces, and takes embroidery beautifully. The matte finish provides an elegant backdrop for gold threadwork. Dry clean only to maintain the wool's structure and prevent shrinkage. Best for: winter weddings, December through February wear, structured winter suits, and formal winter events.",
      },
      {
        heading: "Velvet",
        body:
          "Plush fabric with raised pile, 250–350 GSM. The ultimate luxury for Pakistani winter formal wear. Rich texture, deep color saturation, and the way it catches light make it perfect for evening events. Cotton velvet is more breathable; silk velvet is more luxurious. The pile direction affects color (always check against the nap). Heavy, so reserve for winter months only. Best for: bridal wear, winter evening events, statement pieces, and high-end formal occasions.",
      },
    ],
  },
  "size-guide": {
    eyebrow: "Help",
    title: "Pakistani Clothing Size Guide — Find Your Perfect Fit",
    intro:
      "Finding the right size for Pakistani clothing can be confusing if you're used to Western sizing. Our comprehensive guide covers ready-to-wear suits, kids wear, and how to measure yourself at home. Every silhouette is cut twice — once for the hanger, once for the body. These are the exact measurements our Karachi tailors work from when creating each piece.",
    tone: ["#d7dbe4", "#6f7c8f", "#1a1612"],
    motif: "ogee",
    sections: [
      {
        heading: "Ladies Ready-to-Wear Suits",
        body:
          "Pakistani ready-to-wear sizing follows a different system than Western standard sizes. Our sizes: XS fits UK 6 (bust 32-34 inches, waist 26-28 inches, hip 36-38 inches) · S fits UK 8-10 (bust 34-36 inches, waist 28-30 inches, hip 38-40 inches) · M fits UK 12 (bust 36-38 inches, waist 30-32 inches, hip 40-42 inches) · L fits UK 14 (bust 38-40 inches, waist 32-34 inches, hip 42-44 inches) · XL fits UK 16 (bust 40-42 inches, waist 34-36 inches, hip 44-46 inches). All our kameez (shirts) run long by design — expect a standard 112cm length from shoulder to hem. This traditional proportion flatters most heights and can be hemmed shorter if needed. Shalwar and trousers are tailored to complement the kameez length. When between sizes, we recommend sizing up for Pakistani formal wear as suits tend to run fitted, and slight extra room is more comfortable than a tight fit.",
      },
      {
        heading: "How to Measure Yourself",
        body:
          "Accurate measurements ensure the best fit. Use a soft measuring tape and wear only undergarments for accuracy. Bust: Measure around the fullest part of your bust, keeping the tape parallel to the floor and comfortably snug but not tight. Waist: Find your natural waistline (the narrowest part of your torso, usually just above your belly button) and measure around, allowing the tape to sit comfortably without pulling. Hip: Measure around the fullest part of your hips and buttocks, approximately 8-9 inches below your natural waist. Keep the tape parallel to the floor. Shoulder width: Measure from one shoulder point to the other across your back. Sleeve length: Measure from your shoulder point down to your wrist bone with your arm slightly bent. For kameez length, measure from the top of your shoulder down to where you want the hem to fall — traditionally knee-length or just below. Have someone help you for the most accurate measurements, especially for back measurements and sleeve length.",
      },
      {
        heading: "Kids Sizing by Age and Height",
        body:
          "Children's sizing is based primarily on height, with age as a general guide. 2-3 years typically fits height 90-100cm · 3-4 years fits 100-110cm · 5-6 years fits 110-120cm · 7-8 years fits 120-132cm · 9-10 years fits 130-145cm · 11-12 years fits 145-155cm. Always measure your child's height and check our specific size charts on product pages rather than relying solely on age, as children grow at different rates. When ordering for events several months away, consider your child's growth rate — Pakistani kids wear typically has slight extra room that can accommodate growth. If between sizes, size up for kids as they grow quickly and clothes can be hemmed if too long initially. For height measurement, have your child stand against a wall without shoes, mark the top of their head, then measure from floor to mark.",
      },
      {
        heading: "Fit Troubleshooting",
        body:
          "Common fit issues and solutions: If the bust is too tight but everything else fits, consider sizing up as Pakistani suits often run fitted in the bust area. If the kameez is too long, any local tailor can hem it to your preferred length — we intentionally make them longer to accommodate different heights. If shoulders are too wide, try a smaller size, but note that Pakistani formal wear traditionally has slightly wider shoulders than Western clothing. If sleeves are too short, some designs allow letting out the hem, or consult us about custom options for future orders. If the overall fit feels tight, Pakistani formal wear is meant to be more fitted than Western casual wear, but you should still be able to move, sit, and eat comfortably. For the best fit on special pieces, consider having a local tailor make minor adjustments after receiving your order — small tweaks can perfect the fit.",
      },
      {
        heading: "Size Conversion Chart",
        body:
          "Pakistani XS = UK 6 = US 2 = EU 34. Pakistani S = UK 8-10 = US 4-6 = EU 36-38. Pakistani M = UK 12 = US 8 = EU 40. Pakistani L = UK 14 = US 10 = EU 42. Pakistani XL = UK 16 = US 12 = EU 44. Note that Pakistani sizing tends to run slightly smaller than Western sizing due to different cutting standards and the fitted aesthetic preferred in Pakistani formal wear. When comparing to Western brands, Pakistani formal suits are generally one size smaller than equivalent casual Western wear. This is intentional — the fitted silhouette is traditional and flattering when properly sized. Always check bust, waist, and hip measurements rather than assuming your usual Western size will translate directly.",
      },
      {
        heading: "Alterations and Custom Sizing",
        body:
          "Most ready-to-wear pieces can be altered by any skilled tailor. Common alterations include: Hemming (shortening kameez or trouser length) — very straightforward and inexpensive. Taking in at the waist or sides — possible if there's seam allowance. Adjusting sleeve length — can usually be shortened, sometimes lengthened if fabric allows. Shoulder adjustments — more complex but possible for significant fit issues. For customers who need custom sizing beyond our standard range, we offer custom tailoring for bulk orders of 5+ pieces. Contact us with your measurements and we can provide a quote. For one-off custom pieces, we recommend purchasing our closest standard size and having a local tailor make adjustments, which is often faster and more economical than ordering fully custom from Pakistan. Turnaround for custom orders is 3-4 weeks plus shipping time.",
      },
    ],
  },
  "denim-fit-guide": {
    eyebrow: "West",
    title: "Denim Fit Guide — Find Your Perfect Jeans Without a Fitting Room",
    intro:
      "Finding the right jeans fit online can feel like guesswork, but understanding how different cuts are designed to fall on the body makes all the difference. Our denim collection is cut on four distinct blocks — straight, slim-straight, wide-leg, and relaxed — each engineered for a specific silhouette and styling approach. This guide breaks down exactly how each fit sits on the body, which body types each flatters, and how to choose between them.",
    tone: ["#d7dbe4", "#6f7c8f", "#2a3244"],
    motif: "stripes",
    sections: [
      {
        heading: "Straight Fit",
        body:
          "Our straight fit sits at the natural waist with a clean, comfortable thigh that provides room without excess fabric. The leg drops parallel from knee to hem, creating a timeless column silhouette that never goes out of style. This is our most forgiving cut, working beautifully across different body types and heights. The straight leg visually balances proportions — if you have wider hips, the parallel leg creates a streamlined line. If you're petite, the consistent width from knee to ankle doesn't overwhelm your frame. The mid-rise waist (approximately 26cm from crotch to waistband) sits comfortably at your natural waistline without gaping or digging in. Works with: ankle boots, loafers, sneakers. The hem should graze the top of your shoe with a slight break. Best for: all-day wear, professional casual settings, transitional styling from day to evening. Leg opening: 36-38cm depending on size.",
      },
      {
        heading: "Slim Straight Fit",
        body:
          "Shares the same natural waist position as our straight fit, but the leg subtly tapers from knee to ankle — approximately half an inch (1.3cm) of taper creating a refined, modern silhouette. This is our most ordered fit because it strikes the perfect balance between classic and contemporary. The thigh sits close but not tight, with enough room for comfortable movement and sitting. From the knee down, the gentle taper creates a clean line that looks intentional without feeling restrictive. This fit is particularly flattering if you want to emphasize footwear — the slightly narrower ankle opening (34-36cm) draws the eye down to boots, loafers, or statement sneakers. The taper prevents bunching at the ankle while maintaining the comfort of a straight-leg through the hip and thigh. Works with: Chelsea boots, pointed-toe flats, sleek sneakers. The hem should sit just above your shoe with minimal break. Best for: those who want modern polish without skinny-jean tightness, creating a streamlined leg line, showing off footwear.",
      },
      {
        heading: "Wide Leg Fit",
        body:
          "A fashion-forward high-rise fit (approximately 29-30cm from crotch to waistband) with a roomy thigh and dramatically wide leg opening (42-46cm) that breaks at the shoe. This is the statement jean in our collection — bold, architectural, and incredibly chic when styled correctly. The high rise sits above your natural waist, creating length in the legs and a defined waistline that's incredibly flattering. The generous thigh room provides comfort and a relaxed aesthetic, while the wide leg creates beautiful movement and flow as you walk. This fit is best hemmed to hit at the ankle bone or just past it — too long and you'll trip, too short and the proportions feel off. The key to pulling off wide-leg jeans is balance: pair them with fitted or tucked tops to maintain a defined waist and prevent overwhelming your frame. Works with: platform sneakers, heeled boots (the height balances the width), chunky loafers. Best for: making a style statement, petite frames who want leg length (the high rise and wide leg create vertical lines), those who love vintage 70s-inspired silhouettes, comfortable all-day wear with style impact.",
      },
      {
        heading: "Relaxed Fit",
        body:
          "Mid-rise (27-28cm) with a generous, comfortable thigh and a straight leg that opens to an 18.5cm leg opening — this is the perfect balance between structured and laid-back. The fit sits comfortably at your natural waist without the high rise of our wide-leg, making it versatile for different torso lengths. The relaxed thigh provides plenty of room for movement, sitting, and casual comfort without looking sloppy or oversized. Unlike true baggy jeans, our relaxed fit maintains structure through the leg rather than pooling at the ankle. The 18.5cm leg opening is wide enough to accommodate boots underneath but streamlined enough to work with sneakers and heels without bunching. This fit particularly shines for those with athletic builds or anyone who finds slim fits uncomfortable in the thigh. The slightly lower rise (compared to wide-leg) makes it easier to style for everyday wear — you don't need to commit to tucked tops or high-waisted styling. Works with: chunky sneakers, combat boots, heeled mules, Chelsea boots. Best for: off-duty style, weekend wear, comfort without sacrificing polish, those who want room through the leg without full wide-leg drama.",
      },
      {
        heading: "How to Choose Your Fit",
        body:
          "Consider your body type and styling preferences. If you have an hourglass or pear shape, straight and slim-straight fits balance proportions beautifully. If you're petite, high-rise wide-leg creates leg length while straight fits offer versatility. If you have an athletic or rectangular build, relaxed and wide-leg add shape and interest. For styling versatility, slim-straight works in the most contexts from professional to casual. For making a fashion statement, wide-leg is your choice. For maximum comfort, relaxed fit provides room without looking oversized. For timeless classic style, straight fit never fails. Also consider your existing wardrobe: fitted tops pair beautifully with wide-leg and relaxed fits, while oversized or longer tops work better with straight and slim-straight to maintain proportion. Your footwear matters too — if you love ankle boots and loafers, slim-straight showcases them perfectly. If you prefer sneakers and platform shoes, wide-leg and relaxed create a balanced silhouette.",
      },
      {
        heading: "Sizing and Hem Length",
        body:
          "All our jeans ship with a 3cm hem allowance for easy tailoring to your exact height. Order your usual size and take them to any tailor for hemming — this costs approximately Rs. 200-300 in Pakistan. For inseam length, our standard is 32 inches (81cm), which works for heights 5'4\" to 5'8\". Petite customers (under 5'4\") will need hemming; taller customers (over 5'8\") should check specific product inseams as some styles run longer. The right hem length depends on the fit: straight and slim-straight should graze the top of your shoe with a slight break; wide-leg should hit at or just past your ankle bone (too long and you'll trip); relaxed fit should break slightly on your shoe without pooling. If you're between sizes, size up for wide-leg and relaxed fits as you want room through the leg. For straight and slim-straight, stick to your true size for the intended silhouette. Jeans stretch approximately half a size with wear, so if waistband feels snug initially, it will relax after a few wears. Quality denim from Pakistan mills holds its shape better than fast-fashion alternatives.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = pages[slug];

  const metadata: Record<string, { title: string; description: string; keywords: string }> = {
    "fabric-glossary": {
      title: "Pakistani Fabric Guide | Complete Glossary | Habiba Minhas",
      description: "Complete guide to Pakistani fabrics — lawn, silk, georgette, khaddar & more. Learn fabric types, GSM weights, care tips & best uses for formal wear.",
      keywords: "Pakistani fabrics, lawn fabric Pakistan, silk georgette, khaddar, jacquard fabric, Pakistani textile guide",
    },
    "size-guide": {
      title: "Pakistani Clothing Size Guide | Find Your Perfect Fit | Habiba Minhas",
      description: "Complete Pakistani size guide with measurements for ladies suits & kids wear. Learn how to measure yourself, size conversions & fit troubleshooting.",
      keywords: "Pakistani size guide, ladies suit size chart Pakistan, how to measure for Pakistani suits, size conversion Pakistan",
    },
    "denim-fit-guide": {
      title: "Denim Fit Guide | Find Your Perfect Jeans | Habiba Minhas",
      description: "Complete denim fit guide covering straight, slim-straight, wide-leg & relaxed fits. Learn which jean fit flatters your body type.",
      keywords: "denim fit guide, straight fit jeans, wide leg jeans, how to choose jeans fit",
    },
  };

  return {
    title: page?.title ?? "Content",
    description: metadata[slug]?.description,
    keywords: metadata[slug]?.keywords,
    alternates: {
      canonical: `/content/${slug}/`,
    },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <div className="relative mb-12">
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image src="/editorial/ladies-collection.webp" alt={page.title} fill priority sizes="100vw" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-ivory sm:p-12">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-light">
            {page.eyebrow}
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-light italic leading-tight sm:text-6xl">
            {page.title}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <p className="text-[16px] leading-relaxed text-ink-soft">{page.intro}</p>
        <div className="mt-10 flex flex-col gap-8">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-3xl italic text-ink">
                {s.heading}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
