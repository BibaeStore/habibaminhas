import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { FAQSchema } from "@/components/seo/faq-schema";

type Params = { slug: string };

const helpPages: Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    faqs: { q: string; a: string }[];
  }
> = {
  faq: {
    eyebrow: "Help",
    title: "Frequently asked questions.",
    intro:
      "Everything we're asked most often — ordering, shipping, returns, fabric care, and customer service.",
    faqs: [
      { q: "When will my order ship?", a: "In-stock items ship within 24 hours Monday-Saturday. Orders placed before 2pm ship same day. Weekend orders (Saturday after 2pm, Sunday) ship Monday morning. All Pakistan orders ship via TCS Post Ex courier with tracking. You'll receive email and SMS confirmation with tracking number as soon as your package is handed to courier. Made-to-order or custom stitched items take 2-3 weeks for production before shipping — estimated delivery date is shown at checkout for these items." },
      { q: "Do you ship internationally?", a: "Yes, we ship to 40+ countries worldwide via DHL Express. Delivery takes 5-8 business days to most destinations. Main regions: Middle East (UAE, Saudi, Qatar, Kuwait), Europe (UK, Germany, France, Italy, Spain), North America (USA, Canada), Australia, and Southeast Asia. International shipping cost calculated at checkout based on weight and destination. International customers are responsible for customs duties/import taxes charged by their country (these vary by country and we cannot predict exact amounts). All packages are marked accurately for customs — we cannot undervalue items." },
      { q: "How do returns and exchanges work?", a: "Returns (defective items only): Contact us within 7 days with photos and unboxing video. We arrange free TCS pickup across Pakistan. Exchanges (size/fit): Available within 14 days for unworn items with tags attached and unboxing video. Free exchange shipping within Pakistan. IMPORTANT REQUIREMENT: You must record an unboxing video when opening your package for the first time. All return and exchange claims require this video as proof of product condition upon arrival. Without the unboxing video, we cannot process your claim. This protects both customers and us from disputes. See our full Returns Policy for complete details and step-by-step instructions." },
      { q: "Why is an unboxing video required?", a: "The unboxing video is mandatory for all return and exchange claims because it provides clear proof of: (1) Package condition when you received it (shows if courier damaged it), (2) Items you actually received (proves correct/incorrect items were sent), (3) Product condition and defects upon arrival (documents manufacturing issues). This simple video (30-60 seconds on your phone) protects you as customer by proving your claim is legitimate, and protects us from fraudulent claims. Standard practice for Pakistani e-commerce. Start recording before opening the sealed package, show yourself opening it, and briefly show each item. Keep video for 14 days after delivery. Only share if filing a claim. No video = claim cannot be processed." },
      { q: "Are prices inclusive of tax?", a: "Yes, all prices displayed on habibaminhas.com are inclusive of GST (General Sales Tax) and any applicable Pakistan federal taxes. The price you see at checkout is the final price you pay — no hidden charges or surprise taxes added. What you pay: product price + shipping (Rs. 250 standard or Rs. 500 express within Pakistan). For international orders: shipping calculated at checkout. Your destination country may charge import duties or customs taxes upon delivery — these are customer responsibility and vary by country (we have no control over these fees and cannot predict amounts)." },
      { q: "Do you offer gift wrapping?", a: "Premium gift wrapping is automatically included FREE on all orders over Rs. 8,000. Your order arrives in a beautiful recycled kraft gift box tied with natural cotton string — perfect for Eid gifts, wedding gifts, or birthdays. For orders under Rs. 8,000, gift wrapping is available for Rs. 300 additional — select at checkout in Order Notes or contact us after ordering. All gift orders include: elegant box, tissue wrapping, cotton string tie, and no invoice inside (invoice emailed separately). Gift message cards are available free — write your message in Order Notes at checkout. Perfect for sending gifts directly to recipients anywhere in Pakistan." },
      { q: "How can I contact customer service?", a: "Best method: WhatsApp +92 312 0295812 (fastest response, 2-4 hours during business hours). Alternative: Email team@habibaminhas.com (response within 24 hours). Business hours: Monday-Saturday 10:00am-6:00pm Pakistan Time (PKT). Sunday: Closed (urgent messages answered Monday morning). For urgent order issues (tracking problems, delivery delays, defects), WhatsApp gets fastest response as our team monitors it during business hours. For detailed questions or sending photos/videos (returns/exchanges), email works best. No phone call support currently — all customer service via WhatsApp and email only." },
      { q: "Do you offer custom stitching or alterations?", a: "Custom stitching: Available for bulk orders of 5+ pieces minimum. Perfect for bridal parties (matching outfits for bride's sisters/friends), family Eid outfits (coordinated sets), or wedding events. Provide your measurements via email and we'll quote pricing and 3-4 week production timeline. Alterations on purchased items: We don't provide alteration services, but we recommend taking items to your local tailor for minor adjustments (hemming, taking in, letting out). Most Pakistani tailors charge Rs. 200-500 for basic alterations. Our customer service can advise which alterations are feasible for each product type. Size exchanges: If you ordered wrong size and item is unworn with tags attached, exchange is free within 14 days (requires unboxing video)." },
      { q: "What fabrics do you use?", a: "We source premium Pakistani and imported fabrics depending on product type: (1) Ladies suits: Lawn (110-130 GSM from Faisalabad mills), Silk georgette, Silk charmeuse, Jacquard (from Lahore family mills, three generations), Khaddar, Karandi for winter, Velvet for festive, (2) Kids formal: Lighter-weight lawns, soft cottons, breathable silks appropriate for children, (3) Baby products: 100% pure cotton, hypoallergenic, baby-safe with non-toxic dyes. All fabrics are pre-washed and pre-shrunk before stitching. We provide care instructions with each order. See our Fabric Glossary page for detailed descriptions of each fabric type including weight, care requirements, and best uses." },
      { q: "How do I care for my clothes?", a: "Care depends on fabric type: LAWN & COTTON SUITS: Machine washable cold water gentle cycle, hang dry in shade (not direct sun to prevent fading), iron medium heat while slightly damp. SILK & GEORGETTE: Dry clean recommended for heavily embroidered pieces. Lightly embellished silk can be hand-washed cold water with mild detergent, hang dry away from sun, iron low heat with cloth barrier. EMBROIDERED & BEADED ITEMS: Dry clean only — home washing can damage embellishments. BABY PRODUCTS: Machine wash warm gentle cycle, tumble dry low or hang dry, iron if needed. FIRST WASH: Always wash new items separately first time to test color fastness. Detailed care tags are sewn into each garment with specific instructions for that item's fabric and embellishments." },
      { q: "Do you have a physical store?", a: "We currently operate online-only from our Karachi studio where all products are handcrafted. We don't have a retail storefront for walk-in shopping. This online-first model allows us to offer better prices (no retail overhead) and serve customers across all of Pakistan equally. KARACHI CUSTOMERS: For special requests or to see samples, contact us on WhatsApp +92 312 0295812 to arrange a studio appointment (by appointment only Monday-Saturday, not walk-in). SHOPPING: Browse our full collection online 24/7, order from anywhere in Pakistan, and receive delivery via TCS Post Ex courier to your doorstep. This is more convenient than traveling to stores and offers the same quality guarantee with free exchanges/returns." },
      { q: "Can I cancel my order?", a: "Yes, orders can be cancelled if not yet shipped: (1) Contact us immediately via WhatsApp +92 312 0295812 or email with your order number, (2) If order hasn't shipped (within 24 hours of placing), we'll cancel and confirm via email/WhatsApp, (3) If paid via bank transfer, refund processed within 2-3 business days, (4) If COD order, simply cancelled with no charges. AFTER SHIPPING: Once order is shipped and TCS tracking number issued, cancellation is not possible. In this case you can: (1) Refuse delivery when courier arrives (package returns to us and order cancelled, any prepaid amount refunded minus actual shipping costs), or (2) Accept delivery and initiate exchange/return per our Returns Policy (requires unboxing video). Made-to-order/custom items cannot be cancelled once production begins (you'll be notified when production starts)." },
    ],
  },
  returns: {
    eyebrow: "Policy",
    title: "Exchanges & returns.",
    intro:
      "We want you to love everything you receive. If something isn't quite right, here's how exchanges and returns work in Pakistan.",
    faqs: [
      { q: "What is your return policy?", a: "We accept returns for defective or damaged products only. If you receive an item with manufacturing defects, stitching issues, color discrepancies, or shipping damage, contact us within 7 days of delivery. IMPORTANT: You must record an unboxing video when opening your package for the first time. Claims for defective or damaged items will ONLY be processed if accompanied by an unboxing video showing the issue. This protects both you and us by documenting the condition upon arrival. Returns for verified defective items are free — we'll arrange pickup at no cost to you across Pakistan via TCS Post Ex courier service." },
      { q: "What is your exchange policy?", a: "We accept exchanges for size, fit, or style preferences within 14 days of delivery. The item must be unworn, unwashed, and in its original packaging with all tags attached. IMPORTANT: Record an unboxing video when first opening your package. If you discover sizing or color issues upon unboxing, the video serves as proof that the item arrived in perfect condition and supports your exchange request. Exchange shipping is free within Pakistan (Karachi, Lahore, Islamabad, and all major cities) via TCS Post Ex courier." },
      { q: "Why do I need an unboxing video?", a: "The unboxing video requirement protects both customers and Habiba Minhas. For customers: it documents the exact condition of items upon arrival, proving if damage occurred during shipping or if the wrong item was sent. For us: it prevents fraudulent claims and ensures we only process legitimate defects or errors. Simply record a short video (even 30-60 seconds on your phone) showing the sealed package, opening it, and removing items. Keep the video until your return window closes (7 days for defects, 14 days for exchanges). This policy is standard practice for Pakistani e-commerce businesses." },
      { q: "How do I start a return or exchange?", a: "Contact us via WhatsApp at +92 312 0295812 or email team@habibaminhas.com within 7 days (defects) or 14 days (exchanges) of delivery. Provide: (1) Your order number, (2) Photos clearly showing the issue or item, (3) Your unboxing video (mandatory — upload to Google Drive, Dropbox, or send via WhatsApp). Our team will review within 24 hours and arrange free TCS Post Ex pickup across Pakistan. For exchanges, we'll send your replacement as soon as we receive and verify your return." },
      { q: "What items cannot be returned or exchanged?", a: "The following items are non-returnable and non-exchangeable: (1) Sale items marked 'Final Sale' at checkout, (2) Intimate wear and undergarments (hygiene reasons), (3) Unstitched fabric once opened from sealed packaging, (4) Custom or made-to-order pieces (unless defective — unboxing video required), (5) Items worn, washed, altered, or with tags removed, (6) Items returned without original packaging, (7) Items past the return window (7 days for defects, 14 days for exchanges). Gift purchases can be returned for store credit only within 30 days if unworn with tags attached and unboxing video provided." },
      { q: "How long does a refund or exchange take?", a: "Exchanges: Once we receive your return via TCS Post Ex (typically 2-3 days), we inspect and verify condition within 24 hours. Your replacement ships immediately via TCS Post Ex and arrives in 1-3 business days. Total timeline: 4-7 days from pickup to receiving replacement. Refunds (for defective items only): After receiving and verifying your return with unboxing video proof, refunds are processed within 24 hours. Original payment method receives refund in 5-7 business days for cards, 2-3 business days for JazzCash/Easypaisa wallets, or immediate store credit if you prefer." },
      { q: "What if I receive a defective item?", a: "We sincerely apologize if this happens. Immediately (same day if possible): (1) Record or locate your unboxing video showing the defect, (2) Take clear photos of the defect from multiple angles, (3) Contact us on WhatsApp +92 312 0295812 or email team@habibaminhas.com with your order number, photos, and unboxing video link. We'll review within 2-4 hours during business hours (Mon-Sat, 10am-6pm PKT) and arrange free TCS Post Ex pickup anywhere in Pakistan. You choose: full refund to original payment method OR replacement item shipped priority (1-2 days). If the defect was our error (manufacturing or quality control issue), we'll also include a discount code for your next order as an apology." },
      { q: "How do I record an unboxing video?", a: "Simple phone video is perfect: (1) Before opening, show the sealed package with shipping label visible (proves it's your order), (2) Open the package on camera while keeping items visible, (3) Remove each item and briefly show it (front, back, any details), (4) If you notice any issues, clearly show them on camera. Total video length: 30 seconds to 2 minutes is sufficient. Save the video on your phone for 14 days after delivery. Only upload/share if you need to file a claim. This takes minimal time but provides crucial protection for both parties in case issues arise." },
    ],
  },
  shipping: {
    eyebrow: "Delivery",
    title: "Shipping, by zone.",
    intro: "Shipping times and fees, in plain numbers. All Pakistan deliveries via TCS Post Ex courier service.",
    faqs: [
      { q: "Which courier service do you use?", a: "We partner with TCS Post Ex for all Pakistan deliveries. TCS Post Ex is one of Pakistan's most reliable courier networks with coverage across all major cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta) and over 400 smaller cities and towns nationwide. You'll receive TCS tracking numbers for all shipments, and TCS Post Ex offers customer support if you need delivery assistance. For international shipping, we use DHL Express for reliable worldwide delivery." },
      { q: "Pakistan — standard delivery", a: "Flat rate Rs. 250 to anywhere in Pakistan via TCS Post Ex. Delivery times: Karachi/Lahore/Islamabad 1-2 business days, other major cities 2-3 business days, smaller towns 3-4 business days. Orders placed before 2pm Monday-Friday ship same day. Weekend orders (Saturday after 2pm, Sunday) ship Monday morning. In-stock items leave our Karachi studio within 24 hours of order confirmation. During Eid, wedding season (Nov-Feb), or sales periods, add 1 extra day to delivery estimates due to high courier volume across Pakistan." },
      { q: "Pakistan — express same-day delivery", a: "Rs. 500 for same-day delivery in Karachi, Lahore, and Islamabad only (not available in other cities). Order before 2pm for same-day delivery. Your order is prepared, quality-checked, and handed to TCS Post Ex rider within 2-3 hours. Delivery typically completes by 7-9pm same day. Same-day service available Monday-Saturday only (not Sundays or public holidays). Express delivery is for in-stock items only — made-to-order or out-of-stock items ship standard timing." },
      { q: "Do you ship to all areas of Pakistan?", a: "We ship to all major cities and over 400 smaller towns served by TCS Post Ex network. This includes: all provincial capitals, divisional headquarters, tehsil headquarters, and most towns with TCS service centers. We also ship to Azad Jammu & Kashmir and Gilgit-Baltistan, though delivery times are 5-7 business days to these regions. We do NOT ship to PO Boxes — please provide a complete street address with landmarks. If you're unsure whether we deliver to your area, contact us on WhatsApp +92 312 0295812 with your city/town name and we'll confirm TCS Post Ex coverage within minutes." },
      { q: "International shipping — countries and rates", a: "We ship internationally to 40+ countries via DHL Express with delivery in 5-8 business days. Main regions covered: Middle East (UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain), Europe (UK, Germany, France, Italy, Spain), North America (USA, Canada), Australia, and Southeast Asia. Shipping cost calculated at checkout based on package weight and destination country. Typical rates: UAE/Saudi Rs. 2,500-4,000, UK/Europe Rs. 4,500-7,000, USA/Canada Rs. 5,000-8,000. International customers are responsible for any customs duties or import taxes charged by their country (we cannot predict these fees as they vary by country and product type). We mark packages accurately and cannot undervalue for customs purposes." },
      { q: "Order tracking — how it works", a: "As soon as your order is packed and handed to TCS Post Ex courier (or DHL for international), you receive: (1) Email with TCS/DHL tracking number and direct tracking link, (2) SMS to your provided mobile number with tracking details, (3) Tracking visible in your account under 'My Orders'. TCS tracking updates 2-3 times daily showing: order booked, in transit to destination city, out for delivery, delivered. You can also track directly on TCS Post Ex website or by calling TCS customer service 021-111-123-456. For international DHL shipments, track on DHL.com with your tracking number. If tracking doesn't update for 24+ hours, contact us and we'll check with courier immediately." },
      { q: "What if I'm not home for delivery?", a: "TCS Post Ex courier will attempt delivery during business hours (usually 10am-6pm). If you're not available: (1) TCS rider calls your provided phone number to coordinate, (2) If no answer, rider leaves a delivery attempt notice with contact number, (3) You can call TCS directly to reschedule or request delivery to alternate address (same city only), (4) TCS holds package at local service center for 5 days for customer pickup. If delivery fails after 3 attempts or package isn't picked up within 5 days, it returns to our Karachi studio and you'll be contacted to arrange re-delivery (additional shipping charges may apply for re-delivery). To avoid delays: ensure your phone number is correct at checkout and keep phone accessible during delivery window." },
      { q: "Packaging and presentation", a: "All orders are carefully packaged to arrive in perfect condition: (1) Items are tissue-wrapped and placed in our branded boxes or protective mailers depending on item type, (2) Fragile items (accessories, embellished pieces) receive extra padding and 'Handle with Care' stickers, (3) Orders over Rs. 8,000 are automatically gift-wrapped in premium kraft paper boxes tied with cotton string at no charge, (4) Invoice is included inside package (not visible from outside for privacy), (5) All packages are sealed with tamper-evident tape. IMPORTANT: Record an unboxing video when you receive your package — this is required for any returns or exchange claims (see our Returns Policy for details). We use eco-friendly packaging materials wherever possible including recycled boxes and biodegradable protective filling." },
    ],
  },
  payments: {
    eyebrow: "Checkout",
    title: "Ways to pay.",
    intro: "Cash on delivery currently available Pakistan-wide. Online payment options (cards, wallets) coming soon.",
    faqs: [
      { q: "What payment methods do you currently accept?", a: "Currently we accept Cash on Delivery (COD) only for all orders within Pakistan. We are in the process of integrating secure online payment options including credit/debit cards (Visa, Mastercard, American Express) and mobile wallets (JazzCash, Easypaisa) — these will be available soon. Our bank and payment gateway integration is in final stages and will launch in the coming weeks. We'll announce via email and social media once online payments are live. Until then, COD is the safe, convenient option available to all Pakistani customers." },
      { q: "Cash on Delivery (COD) — how it works", a: "Cash on Delivery is available on all orders up to Rs. 25,000 to any address in Pakistan served by TCS Post Ex courier. Here's the process: (1) Place your order and select 'Cash on Delivery' at checkout, (2) You'll receive a verification call from our team within 2-4 hours to confirm your order details and delivery address (this prevents fake orders and courier costs), (3) Once verified, your order is prepared and shipped via TCS Post Ex, (4) TCS courier delivers to your address and you pay the exact order amount in cash to the rider, (5) TCS courier provides you an official receipt for payment. COD verification calls are made Monday-Saturday 10am-6pm PKT. If we cannot reach you within 24 hours, the order is placed on hold and you'll receive an email/SMS to contact us." },
      { q: "Are there COD fees or limits?", a: "COD is available FREE (no extra charges) on all orders from Rs. 500 to Rs. 25,000. Minimum order for COD: Rs. 500 (to cover courier costs). Maximum order for COD: Rs. 25,000 (this protects both customers and couriers from carrying large cash amounts). For orders exceeding Rs. 25,000, you can either: (1) Split into multiple smaller orders, (2) Pay 50% advance via bank transfer and pay remaining 50% COD, or (3) Wait for our online payment gateway to launch (coming soon) and pay full amount by card. COD is available to all cities and towns in Pakistan served by TCS Post Ex courier network." },
      { q: "Online payments — when will they be available?", a: "We are currently integrating a PCI-DSS certified payment gateway to accept: (1) Credit/debit cards: Visa, Mastercard, American Express (Pakistani and international cards), (2) Mobile wallets: JazzCash and Easypaisa for instant payment, (3) Bank transfers: Direct integration with major Pakistani banks for secure account-to-account transfers. The technical integration and bank approvals are in final stages. We expect to launch online payments within 4-6 weeks. Once live, you'll see payment options at checkout and can choose COD or pay online. All online transactions will be 256-bit SSL encrypted and PCI-DSS compliant for maximum security. Existing customers will be notified via email when online payments go live." },
      { q: "Is Cash on Delivery safe?", a: "Yes, COD through TCS Post Ex is very safe for several reasons: (1) TCS couriers are trained professionals employed by a reputable Pakistani logistics company, (2) You pay only after receiving and inspecting your package — don't accept if package appears tampered or damaged, (3) TCS rider provides official receipt for your cash payment immediately, (4) You can record the package handover and cash payment for your records if desired, (5) Our verification call before dispatch ensures the order is genuine and prevents courier fraud. IMPORTANT: Only pay the exact order amount shown on your order confirmation email. If courier asks for a different amount, contact us immediately before paying. Never share card details or bank account info with courier riders — COD means cash payment only upon delivery." },
      { q: "Can I pay via bank transfer right now?", a: "Yes, we accept direct bank transfers for customers who prefer not to use COD or have orders exceeding Rs. 25,000. Contact us on WhatsApp +92 312 0295812 or email team@habibaminhas.com after placing your order, and we'll provide: (1) Our business bank account details (HBL, Allied, or MCB bank), (2) Your order reference number to include in transfer notes, (3) Payment confirmation instructions. Once we receive your bank transfer (usually same day or next business day for inter-bank transfers), your order ships immediately. Bank transfer is perfect for large orders, bulk purchases, or customers who prefer paying before delivery. Share your bank transfer receipt via WhatsApp or email for fastest order processing." },
      { q: "What about payment security?", a: "Your payment security is our priority: (1) For COD: We verify all orders before dispatch, TCS provides official receipts, and you inspect items before paying, (2) For bank transfers: We provide official business account details only via email or verified WhatsApp, never via SMS or unverified numbers, (3) For upcoming online payments: All transactions will be 256-bit SSL encrypted, processed by PCI-DSS certified gateway, and we will NEVER store your card details on our servers — only tokenized hashed references. SECURITY REMINDER: Habiba Minhas will never ask you to share card details via WhatsApp, email, or phone call. Never share OTPs or CVV codes. If anyone claiming to be from Habiba Minhas requests sensitive information, it's a scam — contact us immediately on our official WhatsApp +92 312 0295812." },
      { q: "Do you offer installment plans?", a: "Installment payment plans are not currently available but will be introduced along with our online payment gateway launch (coming in 4-6 weeks). Once live, we plan to offer: (1) 3-month interest-free installments for orders over Rs. 15,000, (2) 6-month installment plans for orders over Rs. 30,000, (3) Partnered with major Pakistani banks for direct EMI options at checkout. Until installment plans launch, customers can use their own bank's credit card EMI conversion facility after purchase if their bank offers that service. For bulk or wholesale orders exceeding Rs. 50,000, contact us to discuss custom payment arrangements including deposits and milestone payments." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(helpPages).map((slug) => ({ slug }));
}

// SEO-optimized metadata for each help page
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = helpPages[slug];

  // Pakistan-optimized SEO metadata for each help page
  const seoMetadata: Record<string, { title: string; description: string; keywords: string }> = {
    faq: {
      title: "FAQ Pakistan — Habiba Minhas Help Center | Shipping, Returns & Orders",
      description: "Frequently asked questions about Habiba Minhas Pakistan. Shipping within Pakistan, returns policy, order tracking, payment methods & fabric care. Get help shopping in Pakistan.",
      keywords: "Habiba Minhas FAQ Pakistan, Pakistani fashion FAQ, help center Pakistan, shipping questions Pakistan, returns FAQ Pakistan",
    },
    returns: {
      title: "Returns & Exchanges Pakistan — Habiba Minhas Return Policy",
      description: "Return and exchange policy for Habiba Minhas Pakistan. Returns for defective products, 14-day exchanges for size/fit. Free exchange shipping across Pakistan. Easy returns in Karachi, Lahore, Islamabad.",
      keywords: "return policy Pakistan, exchange policy Pakistan fashion, defective product returns Pakistan, free exchanges Pakistan, Habiba Minhas returns, Pakistan e-commerce returns",
    },
    shipping: {
      title: "Shipping Pakistan — Nationwide Delivery | Habiba Minhas Shipping Info",
      description: "Shipping across Pakistan — Rs. 250 flat rate nationwide. Delivery to Karachi, Lahore, Islamabad & all cities. Same-day express available. International shipping via DHL.",
      keywords: "shipping Pakistan, Pakistan delivery, nationwide shipping Pakistan, Rs 250 delivery, Karachi Lahore Islamabad delivery, international shipping Pakistan",
    },
    payments: {
      title: "Payment Methods Pakistan — Habiba Minhas | Cards, COD, JazzCash, Easypaisa",
      description: "Payment methods accepted in Pakistan — Visa, Mastercard, JazzCash, Easypaisa & Cash on Delivery (COD). Secure checkout for Pakistani customers. Safe & encrypted.",
      keywords: "payment methods Pakistan, COD Pakistan, JazzCash payment, Easypaisa payment, cash on delivery Pakistan, secure payment Pakistan",
    },
  };

  const seo = seoMetadata[slug] || {
    title: page?.title ?? "Help",
    description: page?.intro ?? "Get help with your Habiba Minhas order",
    keywords: "",
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/help/${slug}/`,
    },
  };
}

export default async function HelpPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = helpPages[slug];
  if (!page) notFound();

  // Convert FAQ format from { q, a } to { question, answer } for schema
  const faqsForSchema = page.faqs.map(f => ({
    question: f.q,
    answer: f.a
  }));

  return (
    <>
      <FAQSchema faqs={faqsForSchema} />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-8">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
          {page.eyebrow}
        </span>
        <h1 className="mt-3 font-display text-5xl italic leading-tight sm:text-6xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          {page.intro}
        </p>
        <ul className="mt-12 flex flex-col border-y border-border-soft">
          {page.faqs.map((f, i) => (
            <li key={i} className="border-b border-border-soft last:border-0">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between py-5 text-[14px] font-medium text-ink">
                  {f.q}
                  <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
                </summary>
                <p className="pb-5 pr-8 text-[14px] leading-relaxed text-ink-soft">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
