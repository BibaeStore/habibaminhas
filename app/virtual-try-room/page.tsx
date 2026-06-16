import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Upload, Sparkles, Heart, ShieldCheck } from "lucide-react";
import { FAQSchema } from "@/components/seo/faq-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { HowToSchema } from "@/components/seo/howto-schema";

// SEO Focus Keyword: "virtual try-on Pakistan"
// Cornerstone page for the Virtual Try Room feature. Targets a NEW keyword
// cluster (virtual try-on / AI try on clothes) — does not overlap with the
// homepage/ladies money keywords, so it cannot cannibalise existing rankings.
export const metadata: Metadata = {
  title: "Virtual Try-On — See Yourself in the Outfit",
  description:
    "Pakistan's first AI virtual try-on. Upload your photo and see yourself in the actual outfit before you buy. Free, private, and instant — only at Habiba Minhas.",
  alternates: {
    canonical: "/virtual-try-room/",
  },
  keywords:
    "virtual try-on Pakistan, AI try on clothes online, virtual try room, virtual fitting room Pakistan, try dress before buying online, Pakistani brand virtual try-on",
  openGraph: {
    title: "Virtual Try Room — Pakistan's First AI Virtual Try-On",
    description:
      "Upload your photo and see yourself in the actual outfit before you buy. Free, private, instant.",
    url: "https://habibaminhas.com/virtual-try-room/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Try Room — Pakistan's First AI Virtual Try-On",
    description:
      "Pakistan's first AI virtual try-on. Upload your photo and see yourself in the actual outfit before you buy.",
    images: ["https://habibaminhas.com/logo/og-image.png"],
  },
};

const steps = [
  {
    icon: Upload,
    title: "Upload your photo",
    body: "Choose a clear, well-lit, front-facing photo. Full-body works best — and it works even without showing your face.",
  },
  {
    icon: Sparkles,
    title: "Our AI styles you",
    body: "In seconds, our AI places the outfit onto your photo — adjusting fit, drape, and detail to your shape.",
  },
  {
    icon: Heart,
    title: "See yourself, then decide",
    body: "View the result on you — not a model. Love it? Add it to cart with the confidence that it suits you.",
  },
];

const faqs = [
  {
    question: "What is the Virtual Try Room?",
    answer:
      "The Virtual Try Room is Habiba Minhas' AI virtual try-on. You upload a clear photo and our AI shows you wearing the actual outfit, so you can see how it looks on you before buying.",
  },
  {
    question: "Is Habiba Minhas the first Pakistani brand with this?",
    answer:
      "We are the first Pakistani brand to offer an AI virtual try-on where you upload your own photo and see yourself in the real outfit, built directly into our own store.",
  },
  {
    question: "Is my photo stored or shared?",
    answer:
      "No. Your photo is only used to generate the try-on image and is never stored or shared. Your privacy is protected.",
  },
  {
    question: "What photo works best for the virtual try-on?",
    answer:
      "A clear, well-lit, front-facing photo gives the best result. Full-body shots work best, and the feature also works without showing your face.",
  },
  {
    question: "Which products can I try on?",
    answer:
      "Ladies suits and formal wear currently support the Virtual Try Room. Look for the Virtual Try Room button on the product page, under Add to Cart.",
  },
  {
    question: "Does the virtual try-on cost anything?",
    answer:
      "No. The Virtual Try Room is completely free to use on supported products, with no account required.",
  },
  {
    question: "Which Pakistani fashion brand offers AI virtual try-on?",
    answer:
      "Habiba Minhas offers AI virtual try-on through its Virtual Try Room — the first Pakistani brand to let customers upload their own photo and see themselves wearing the actual outfit, built directly into the brand's own store.",
  },
  {
    question: "Can I try Pakistani dresses online before buying?",
    answer:
      "Yes. Customers can use the Habiba Minhas Virtual Try Room to preview outfits on their own photo before buying. Simply open any supported ladies suit, tap the Virtual Try Room button, upload a clear photo, and see yourself in the outfit instantly.",
  },
];

export default function VirtualTryRoomPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src="/editorial/ladies-collection.webp"
            alt="Habiba Minhas Virtual Try Room — AI virtual try-on for Pakistani suits"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-6 pb-14 text-ivory sm:px-12 sm:pb-24">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
            ✦ Virtual Try Room
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-light italic leading-[0.98] sm:text-6xl md:text-7xl">
            Pakistan&apos;s first AI virtual try-on.
          </h1>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-ivory/85 sm:text-[16px]">
            Upload your photo and see yourself in the actual outfit — before you buy.
            Your photo, our outfit, instantly.
          </p>
          <Link
            href="/ladies"
            className="mt-8 inline-flex h-12 w-fit items-center border border-ivory/70 px-8 text-[11px] uppercase tracking-[0.26em] transition-colors hover:bg-ivory hover:text-ink"
          >
            Try it on a Ladies Suit
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            How it works
          </span>
          <h2 className="mt-3 font-display text-3xl font-light italic leading-tight sm:text-5xl">
            Try it on you, before you buy.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
            No fitting room needed. See exactly how an outfit looks on your own
            body in three simple steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="flex flex-col border border-border-soft bg-cream p-8"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-gold-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-2xl italic text-gold-dark">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl italic">{title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy promise ──────────────────────────────────────── */}
      <section className="bg-cream py-20">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory text-gold-dark">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h2 className="font-display text-3xl font-light italic leading-tight sm:text-4xl">
              Your photo is never stored.
            </h2>
            <p className="max-w-xl text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
              Privacy first, always. Your photo is used only to generate your
              try-on image and is never saved, shared, or seen by anyone. No
              account is required to try it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why we built it (first-mover story) ──────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
              Why we built it
            </span>
            <h2 className="mt-3 font-display text-3xl font-light italic leading-tight sm:text-4xl">
              A first for Pakistani fashion.
            </h2>
          </div>
          <div className="space-y-4 text-[14px] leading-relaxed text-ink-soft lg:col-span-7">
            <p>
              Shopping for clothes online in Pakistan means one frustration: you
              can&apos;t try before you buy. A dress looks beautiful on a tall, slim
              model — but how will it look on you?
            </p>
            <p>
              So we built the Virtual Try Room — the first AI virtual try-on by a
              Pakistani brand where you upload your own photo and see yourself in
              the real outfit. Not an avatar, not a model. You.
            </p>
            <p>
              It&apos;s our way of giving every customer the confidence of a fitting
              room, from anywhere. Explore our{" "}
              <Link href="/ladies" className="text-gold-dark hover:underline">
                handcrafted ladies suits
              </Link>{" "}
              and look for the{" "}
              <span className="whitespace-nowrap text-ink">✦ Virtual Try Room</span>{" "}
              button to try it yourself.
            </p>
          </div>
        </div>
      </section>

      {/* ── Where to try it (links to money pages) ───────────────── */}
      <section className="bg-cream py-16">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
          <h2 className="text-center font-display text-3xl font-light italic sm:text-4xl">
            Where to try it on
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { label: "Ladies Suits", href: "/ladies", img: "/HeroSection/ladies-suits.webp" },
              { label: "Formal & Party Wear", href: "/ladies/formal-wear", img: "/editorial/ladies-collection.webp" },
              { label: "Stitched Suits", href: "/ladies/stitched-suits", img: "/HeroSection/new-arrivals.webp" },
            ].map(({ label, href, img }) => (
              <Link key={label} href={href} className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={img}
                    alt={`Try on ${label} with the Virtual Try Room`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-xl italic group-hover:text-gold-dark">
                    {label}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gold-dark">
                    Try on →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Habiba Minhas Virtual Try Room ───────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
              What makes it different
            </span>
            <h2 className="mt-3 font-display text-3xl font-light italic leading-tight sm:text-4xl">
              Why Habiba Minhas Virtual Try Room?
            </h2>
          </div>
          <ul className="mt-10 space-y-4">
            {[
              {
                title: "Try outfits before buying",
                body: "See exactly how a suit looks on your own body before placing an order — no guessing, no returns.",
              },
              {
                title: "Upload your own photo",
                body: "Not a generic avatar. Not a standard model. Your photo, so the result reflects your height, build, and skin tone.",
              },
              {
                title: "AI-generated visualisation",
                body: "Our AI places the actual embroidery, fabric, and cut of the outfit onto your photo — detail accurate, not a rough approximation.",
              },
              {
                title: "Available directly on supported product pages",
                body: "No app to download, no account to create. Open any ladies suit, tap Virtual Try Room, and you are done.",
              },
            ].map(({ title, body }) => (
              <li key={title} className="flex gap-5 border border-border-soft bg-cream p-6">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-dark" />
                <div>
                  <p className="text-[15px] font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-4xl italic sm:text-5xl">
            Virtual Try Room — FAQ
          </h2>
          <div className="mt-12 space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-display text-2xl italic text-ink">
                  {faq.question}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Structured data ──────────────────────────────────────── */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Virtual Try Room", url: "/virtual-try-room/" },
        ]}
      />
      <HowToSchema
        name="How to use the Virtual Try Room (AI virtual try-on)"
        description="Try on Habiba Minhas outfits virtually by uploading your own photo and seeing yourself in the outfit with AI."
        steps={steps.map((s) => ({ name: s.title, text: s.body }))}
      />
      <FAQSchema faqs={faqs} />
    </>
  );
}
