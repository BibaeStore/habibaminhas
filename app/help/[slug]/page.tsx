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
      "We want you to love everything you receive. If something isn't quite right, here's how it works.",
    faqs: [
      { q: "How long do I have to return?", a: "14 days from the day your parcel is delivered. The piece must be unworn and in its original packaging." },
      { q: "Are returns free?", a: "Exchanges are free within Pakistan. For returns (refund to original payment), a flat Rs. 250 pickup fee is deducted from the refund." },
      { q: "What isn't eligible?", a: "Sale items, fragrance, unstitched fabric once cut, and anything marked final sale." },
      { q: "How long does a refund take?", a: "Cards: 5–7 business days after we receive the parcel. Wallets (JazzCash/Easypaisa): within 48 hours." },
    ],
  },
  shipping: {
    eyebrow: "Delivery",
    title: "Shipping, by zone.",
    intro: "Shipping times and fees, in plain numbers.",
    faqs: [
      { q: "Pakistan — standard", a: "1–3 business days, flat Rs. 250. Free on orders over Rs. 3,500." },
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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return { title: helpPages[slug]?.title ?? "Help" };
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
