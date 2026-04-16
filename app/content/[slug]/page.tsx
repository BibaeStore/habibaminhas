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
    title: "A short glossary of our fabrics.",
    intro:
      "From lawn to khaddar, every cloth we carry has a weight, a drape, and a season. Here's the cheat-sheet we give our team, rewritten for you.",
    tone: ["#efe3d0", "#a8804b", "#2a1f17"],
    motif: "lattice",
    sections: [
      {
        heading: "Lawn",
        body:
          "Featherweight cotton, 110–130 gsm. Falls gently, wears cool, and takes print and embroidery beautifully. Our summer staple.",
      },
      {
        heading: "Cambric",
        body:
          "Closely-woven cotton, 140–160 gsm. Slightly crisper than lawn — holds a press and works for structured shirts and bottoms.",
      },
      {
        heading: "Silk Georgette",
        body:
          "A flat-weave silk with a crepey hand, 60–80 gsm. Weightless, breathable, and the only fabric that gets better in humidity.",
      },
      {
        heading: "Jacquard",
        body:
          "Woven patterns, no print. Anything from delicate self-stripes to heavy brocades — we buy ours from a mill outside Lahore.",
      },
      {
        heading: "Khaddar",
        body:
          "Hand-loomed cotton, uneven by design. Works cooler than it looks, and softens with every wash.",
      },
    ],
  },
  "size-guide": {
    eyebrow: "Help",
    title: "The Habiba Minhas size guide.",
    intro:
      "Every silhouette is cut twice — once for the hanger, once for the body. These are the measurements our tailors work from.",
    tone: ["#d7dbe4", "#6f7c8f", "#1a1612"],
    motif: "ogee",
    sections: [
      {
        heading: "Ready to Wear",
        body:
          "XS (fits UK6) · S (UK8–10) · M (UK12) · L (UK14) · XL (UK16). All kalidars run long — expect a 112cm shirt length.",
      },
      {
        heading: "West",
        body:
          "EU sizing across dresses and trousers. Jeans ship with a 3cm allowance for tailoring at the hem.",
      },
      {
        heading: "Men's Stitched",
        body:
          "Chest sizes: 38, 40, 42, 44, 46 inches. Kurtas sit at mid-thigh; shalwars are two inches wider than ready-to-wear mills.",
      },
    ],
  },
  "denim-fit-guide": {
    eyebrow: "West",
    title: "Finding the denim fit, without a fitting room.",
    intro:
      "Our jeans are cut on four blocks — straight, slim-straight, wide-leg, and relaxed. Here's how each one falls.",
    tone: ["#d7dbe4", "#6f7c8f", "#2a3244"],
    motif: "stripes",
    sections: [
      {
        heading: "Straight",
        body:
          "Waist sits at the natural waist. Thigh is clean; leg drops parallel from the knee. Our most forgiving cut.",
      },
      {
        heading: "Slim Straight",
        body:
          "Same waist; the leg tapers half an inch from knee to ankle. Our most ordered fit.",
      },
      {
        heading: "Wide Leg",
        body:
          "High-rise, roomy thigh, leg breaks at the shoe. Best hemmed to the ankle or just past.",
      },
      {
        heading: "Relaxed",
        body:
          "Mid-rise, generous thigh, 18.5cm leg opening. Works with sneakers and with heels.",
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
  return { title: page?.title ?? "Content" };
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
