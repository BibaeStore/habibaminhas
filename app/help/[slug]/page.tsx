import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

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
      "Everything we're asked most often — ordering, shipping, returns, and fabric.",
    faqs: [
      { q: "When will my order ship?", a: "In-stock orders leave the studio within 24 hours, Monday to Saturday. You'll receive a tracking email as soon as the parcel is collected." },
      { q: "Do you ship internationally?", a: "Yes — to 42 countries. International orders are dispatched via DHL Express and usually arrive in 5–8 working days." },
      { q: "How do exchanges work?", a: "You have 14 days from delivery to start an exchange. Submit a request from your account, ship the piece back, and we'll send the replacement at no cost within Pakistan." },
      { q: "Are prices inclusive of tax?", a: "Yes. All prices on the site are inclusive of GST. International orders may incur duties depending on destination." },
      { q: "Do you offer gift wrapping?", a: "We wrap every order over Rs. 8,000 in a recycled kraft gift box tied with cotton string, at no charge." },
    ],
  },
  returns: {
    eyebrow: "Policy",
    title: "Exchanges & returns.",
    intro:
      "We want you to love everything you receive. If something isn't quite right, here's how exchanges and returns work in Pakistan.",
    faqs: [
      { q: "What is your return policy?", a: "We accept returns for defective or damaged products only. If you receive an item with manufacturing defects, stitching issues, color discrepancies, or shipping damage, contact us within 7 days of delivery. Returns for defective items are free — we'll arrange pickup at no cost to you across Pakistan." },
      { q: "What is your exchange policy?", a: "We accept exchanges for size, fit, or style preferences within 14 days of delivery. The item must be unworn, unwashed, and in its original packaging with all tags attached. Exchange shipping is free within Pakistan (Karachi, Lahore, Islamabad, and all major cities)." },
      { q: "How do I start a return or exchange?", a: "Log into your account at habibaminhas.com, go to 'My Orders', select the item, and submit a return/exchange request. For defective items, upload photos showing the defect. Our team will review and respond within 24 hours with pickup details or next steps." },
      { q: "What items cannot be returned or exchanged?", a: "Sale items marked 'Final Sale', fragrance products, unstitched fabric once cut to size, and intimate wear cannot be returned or exchanged for hygiene reasons. Custom or made-to-order pieces are also non-returnable unless defective." },
      { q: "How long does a refund or exchange take?", a: "Exchanges: Replacement ships within 2-3 business days after we receive your return. Refunds (for defective items): Cards take 5-7 business days, JazzCash/Easypaisa wallets within 48 hours after inspection." },
      { q: "What if I receive a defective item?", a: "We're sorry if this happens. Contact us immediately at team@habibaminhas.com or WhatsApp +92 312 0295812 with your order number and photos of the defect. We'll arrange free pickup across Pakistan and issue a full refund or replacement, whichever you prefer." },
    ],
  },
  shipping: {
    eyebrow: "Delivery",
    title: "Shipping, by zone.",
    intro: "Shipping times and fees, in plain numbers.",
    faqs: [
      { q: "Pakistan — standard", a: "1–3 business days, flat Rs. 250 nationwide." },
      { q: "Pakistan — express", a: "Same day in Karachi, Lahore, Islamabad. Rs. 500. Order before 2pm." },
      { q: "International", a: "5–8 business days via DHL. Rates calculated at checkout by weight." },
      { q: "Order tracking", a: "A tracking link is emailed as soon as your parcel leaves the studio, and available in your account." },
    ],
  },
  payments: {
    eyebrow: "Checkout",
    title: "Ways to pay.",
    intro: "Every major card, wallet, and cash on delivery within Pakistan.",
    faqs: [
      { q: "Cards", a: "Visa, Mastercard, and American Express. All transactions are encrypted and processed by our PCI-DSS certified gateway." },
      { q: "Wallets", a: "JazzCash and Easypaisa, supported directly at checkout." },
      { q: "Cash on delivery", a: "Available on orders up to Rs. 25,000 within Pakistan. A verification call is made before dispatch." },
      { q: "Is my data safe?", a: "We never store card details on our servers. Payments are tokenised by our gateway and only hashed references are kept." },
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
  return (
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
  );
}
