import { notFound } from "next/navigation";

type Params = { slug: string };

const legal: Record<string, { title: string; body: { h: string; p: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      {
        h: "Who we are",
        p: "Habiba Minhas Atelier (Pvt.) Ltd., registered in Karachi, Pakistan. This policy applies to habibaminhas.pk and our retail stores.",
      },
      {
        h: "What we collect",
        p: "Name, email, phone, shipping and billing address, order history, and anonymous analytics (Plausible, self-hosted). We never collect card numbers.",
      },
      {
        h: "How we use it",
        p: "To fulfil orders, process exchanges, answer your questions, and — with consent — to send The Atelier Letter.",
      },
      {
        h: "Your rights",
        p: "Access, correct, export, or delete your data at any time. Email wecare@habibaminhas.pk.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      {
        h: "Your account",
        p: "You're responsible for keeping your login safe. Let us know within 24 hours if you think something's been misused.",
      },
      {
        h: "Pricing & availability",
        p: "Prices include tax. If a price is clearly wrong, we reserve the right to cancel and refund in full.",
      },
      {
        h: "Returns & exchanges",
        p: "14 days from delivery; see the Returns page for details. Sale, fragrance, and cut fabric are final.",
      },
      {
        h: "Governing law",
        p: "These terms are governed by the laws of Pakistan.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(legal).map((slug) => ({ slug }));
}

// SEO-optimized metadata for legal pages
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = legal[slug];

  // Pakistan-optimized SEO for legal pages
  const seoMetadata: Record<string, { title: string; description: string; keywords: string }> = {
    privacy: {
      title: "Privacy Policy — Habiba Minhas Pakistan | Data Protection",
      description: "Privacy policy for Habiba Minhas Pakistan. How we collect, use & protect your personal data. GDPR-compliant privacy practices for Pakistani customers. Registered in Karachi, Pakistan.",
      keywords: "privacy policy Pakistan, data protection Pakistan, Habiba Minhas privacy, Pakistan privacy policy, customer data protection",
    },
    terms: {
      title: "Terms of Service — Habiba Minhas Pakistan | Terms & Conditions",
      description: "Terms and conditions for shopping at Habiba Minhas Pakistan. Your rights, our policies, and legal terms governing online purchases in Pakistan. Governed by laws of Pakistan.",
      keywords: "terms of service Pakistan, terms and conditions Pakistan, online shopping terms Pakistan, Habiba Minhas terms, Pakistan e-commerce terms",
    },
  };

  const seo = seoMetadata[slug] || {
    title: page?.title ?? "Legal",
    description: page?.body[0]?.p ?? "Legal information for Habiba Minhas Pakistan",
    keywords: "",
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/legal/${slug}/`,
    },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = legal[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-16 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Legal
      </span>
      <h1 className="mt-3 font-display text-5xl italic leading-tight">
        {page.title}
      </h1>
      <div className="mt-10 flex flex-col gap-8">
        {page.body.map((b) => (
          <section key={b.h}>
            <h2 className="font-display text-2xl italic">{b.h}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              {b.p}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
