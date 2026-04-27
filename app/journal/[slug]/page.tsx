import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

type Params = { slug: string };

const posts: Record<string, {
  title: string; tag: string; date: string; author: string;
  image: string; excerpt: string;
  body: { type: "p" | "h2" | "h3" | "pull"; text: string }[];
  related: string[];
}> = {
  "dupatta-five-ways": {
    title: "How to style a dupatta in five ways",
    tag: "Style Notes",
    date: "12 Apr 2026",
    author: "Habiba Minhas",
    image: "/editorial/ladies-collection.webp",
    excerpt: "From loose-draped to tuck-and-pin — an illustrated guide from the studio.",
    body: [
      { type: "p", text: "The dupatta is perhaps the most underestimated piece in South Asian dressing. It can transform a simple two-piece into a formal statement, add dimension to a plain kurta, or simply finish a look with the lightness only a fine fabric can bring." },
      { type: "h2", text: "1. The classic drape" },
      { type: "p", text: "Throw it over one shoulder and let it fall naturally. This works best with a heavier fabric — a silk or jacquard dupatta stays put with minimal adjustment. For lightweight lawn, a single pin at the shoulder keeps it from sliding." },
      { type: "h2", text: "2. The double drape" },
      { type: "p", text: "Loop it around your neck so both ends hang in front. A favourite for formal events — it frames the neckline and adds vertical length. Best with embroidered dupattas where you want the work visible from the front." },
      { type: "pull", text: "\"The dupatta is the punctuation mark of the outfit — it tells you whether the sentence ends with a period or an exclamation.\"" },
      { type: "h2", text: "3. The one-side tuck" },
      { type: "p", text: "Tuck one end into the waistband at the hip, let the rest fall across the front and drape over the opposite shoulder. Works beautifully for weddings — it keeps the dupatta in place during hours of standing and greeting." },
      { type: "h2", text: "4. The cape style" },
      { type: "p", text: "Pin both ends to the shoulders and let the dupatta hang across the back like a cape. A modern take that works with contemporary silhouettes and palazzo trousers. Best in lightweight chiffon or georgette." },
      { type: "h2", text: "5. The wrapped waist" },
      { type: "p", text: "Wrap it around your waist twice and let the ends fall to one side. Unusual, but striking — particularly with a long shirt. The dupatta becomes a belt and a statement piece at once." },
      { type: "h3", text: "A note on fabric" },
      { type: "p", text: "Heavier fabrics like silk and jacquard hold their shape in classic drapes. Lighter fabrics like chiffon and organza work best when pinned or tucked. Lawn is the most versatile — it does everything, just keep a few discreet pins on hand." },
    ],
    related: ["linen-notes", "summer-wardrobe-edit"],
  },
  "linen-notes": {
    title: "The linen we love, and why it bruises beautifully",
    tag: "Fabric",
    date: "04 Apr 2026",
    author: "Studio Team",
    image: "/trending/sage-bloom.webp",
    excerpt: "A brief history of flax, and why we picked Belgian over Egyptian this season.",
    body: [
      { type: "p", text: "Linen is one of the oldest textiles in human history — traces of it have been found in Egyptian tombs and Mesopotamian ruins. It's made from flax, a plant that thrives in cool climates and well-drained soil, and it has a particular quality that synthetic fibres have never been able to replicate: it gets better with age." },
      { type: "h2", text: "Belgian vs Egyptian" },
      { type: "p", text: "The debate between Belgian and Egyptian linen comes down to fibre length and processing. Belgian flax is grown in the Lys river valley — the unique combination of climate and water produces a fibre with exceptional softness and lustre. Egyptian linen, while also excellent, tends toward a crispier hand." },
      { type: "pull", text: "\"Linen doesn't wrinkle — it bruises. And every crease is evidence of a life being lived in it.\"" },
      { type: "h2", text: "Why we chose Belgian this season" },
      { type: "p", text: "We tested seven linen samples over six months before settling on our current supplier outside Ghent. The deciding factor wasn't weight or thread count — it was how the fabric moved. Our Belgian linen drapes rather than falls. It suggests the body beneath rather than mapping it." },
      { type: "h2", text: "Caring for linen" },
      { type: "p", text: "Cold wash, gentle cycle, line dry. Never wring it — lay it flat when wet and let gravity do the rest. Iron on medium heat with a light spray of water, or simply don't iron it at all. The creases are part of the character." },
    ],
    related: ["dupatta-five-ways", "behind-the-sukoon"],
  },
  "layering-oud": {
    title: "A perfumer's guide to layering oud",
    tag: "Fragrance",
    date: "29 Mar 2026",
    author: "Nadia K.",
    image: "/trending/emerald-embroidery.webp",
    excerpt: "Base, middle, top — and what to wear underneath on a humid afternoon.",
    body: [
      { type: "p", text: "Oud — agarwood, oud al-hindi, liquid gold — is one of the most complex materials in perfumery. A single drop can contain hundreds of molecular compounds, which is why it behaves differently on different skins and in different climates." },
      { type: "h2", text: "Understanding the pyramid" },
      { type: "p", text: "Every fragrance has three layers: top notes (what you smell first, gone within 30 minutes), middle or heart notes (the character of the scent, lasting 2–4 hours), and base notes (the foundation, lasting all day). Oud almost always lives in the base." },
      { type: "pull", text: "\"On a humid afternoon in Karachi, oud opens up rather than closes down. The warmth is a catalyst, not a competitor.\"" },
      { type: "h2", text: "Layering on skin" },
      { type: "p", text: "Apply a neutral or lightly scented body lotion first — this extends the life of any fragrance by giving it something to cling to. Then apply your oud-based scent to pulse points: wrists, inside of elbows, behind the ears, and at the base of the throat." },
      { type: "h2", text: "Layering on fabric" },
      { type: "p", text: "Oud stains. Never spray directly onto silk or delicate embroidery. Instead, spray your dupatta at arm's length, let it dry for 30 seconds, then drape it. The fabric carries scent for hours without the concentration that damages fibres." },
      { type: "h3", text: "Our current recommendation" },
      { type: "p", text: "For a Karachi summer: a light rose or citrus top note over an oud and musk base. The fresh top note cuts through humidity; the oud anchors the whole composition so it lasts through an evening out." },
    ],
    related: ["dupatta-five-ways", "summer-wardrobe-edit"],
  },
  "summer-wardrobe-edit": {
    title: "Seven pieces that travel all summer",
    tag: "Travel",
    date: "18 Mar 2026",
    author: "Studio Team",
    image: "/trending/floral-lawn.webp",
    excerpt: "A capsule our stylist packed for two weeks in Istanbul — in one carry-on.",
    body: [
      { type: "p", text: "The best travel wardrobe is one you don't think about. Every piece works with every other piece, nothing needs dry cleaning, and the whole thing fits in a carry-on. Our studio stylist spent two weeks in Istanbul last summer with exactly seven pieces — and came back with zero outfit regrets." },
      { type: "h2", text: "The seven pieces" },
      { type: "p", text: "Two lawn suits (one floral, one solid), one silk dupatta that doubles as a wrap, a pair of wide-leg trousers, one embroidered kurta for evenings, one lightweight cotton shirt, and a pair of flat sandals that don't need breaking in." },
      { type: "pull", text: "\"The luxury isn't in how much you bring. It's in choosing so well that everything earns its weight.\"" },
      { type: "h2", text: "The packing method" },
      { type: "p", text: "Fold kurtas lengthwise, then roll. This prevents creasing better than flat folding, and allows you to slot them into corners of a bag rather than stacking. Pack shoes sole-to-sole in a cloth bag at the bottom." },
      { type: "h2", text: "What we'd add for Pakistan" },
      { type: "p", text: "For a trip within Pakistan — Lahore to Gilgit, or Karachi to Islamabad — swap one of the lawn suits for a khaddar or cambric piece. The temperature variation is dramatic; khaddar handles both heat and cool evenings without looking out of place." },
    ],
    related: ["dupatta-five-ways", "linen-notes"],
  },
  "behind-the-sukoon": {
    title: "Behind Sukoon — photographs from the studio",
    tag: "The Studio",
    date: "09 Mar 2026",
    author: "Habiba Minhas",
    image: "/editorial/accessories.webp",
    excerpt: "Four days in Clifton, a spool of silk, and the quiet before a collection goes live.",
    body: [
      { type: "p", text: "Sukoon means tranquillity in Urdu — a stillness that isn't empty, but full. We named the collection before a single piece was cut, and then spent four months trying to earn the name." },
      { type: "h2", text: "The starting point" },
      { type: "p", text: "It began with a spool of silk we found at a mill outside Lahore. The colour was undecided — it sat between grey and sage depending on the light, and we spent two days by different windows before we agreed on what it was." },
      { type: "pull", text: "\"We named the collection before a single piece was cut, and then spent four months trying to earn the name.\"" },
      { type: "h2", text: "The silhouettes" },
      { type: "p", text: "Sukoon is built around three silhouettes: a long straight kurta with a side slit, a wide-leg trouser cut from the same fabric as the top, and a reversible vest that works as an outerwear piece or a layering piece depending on the season." },
      { type: "h2", text: "The embroidery" },
      { type: "p", text: "We commissioned the embroidery from a workshop in Karachi's old city — twelve women who have been doing this work for two generations. The pattern is abstract: loose geometric forms that suggest flowers without depicting them." },
      { type: "h3", text: "A note on process" },
      { type: "p", text: "Every piece in Sukoon took longer than expected. The silk was difficult to cut cleanly. The embroidery took twice as long as quoted. The photography was delayed twice by weather. We're glad for all of it — the difficulty is in the fabric." },
    ],
    related: ["linen-notes", "dupatta-five-ways"],
  },
};

const allPosts = Object.entries(posts).map(([slug, post]) => ({ slug, ...post }));

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = posts[slug];
  return { title: post?.title ?? "Journal" };
}

export default async function JournalPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const relatedPosts = post.related
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter(Boolean) as typeof allPosts;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/journal" className="hover:text-ink">Journal</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft line-clamp-1 max-w-[200px]">{post.title}</span>
      </nav>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Article */}
        <article className="lg:col-span-8">
          {/* Hero image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-top"
            />
          </div>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
            {post.tag}
            <span className="h-px w-8 bg-gold/40" />
            <span className="text-ink-soft">{post.date}</span>
            <span className="h-px w-8 bg-gold/40" />
            <span className="text-ink-soft">{post.author}</span>
          </div>

          <h1 className="mt-4 font-display text-4xl italic leading-tight sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft border-l-2 border-gold/40 pl-5">
            {post.excerpt}
          </p>

          {/* Body */}
          <div className="mt-10 flex flex-col gap-5">
            {post.body.map((block, i) => {
              if (block.type === "h2") return (
                <h2 key={i} className="font-display text-3xl italic text-ink mt-4">{block.text}</h2>
              );
              if (block.type === "h3") return (
                <h3 key={i} className="font-display text-2xl italic text-ink mt-2">{block.text}</h3>
              );
              if (block.type === "pull") return (
                <blockquote key={i} className="my-4 border-l-4 border-gold-dark pl-6 font-display text-2xl italic leading-relaxed text-ink-soft">
                  {block.text}
                </blockquote>
              );
              return (
                <p key={i} className="text-[15px] leading-[1.8] text-ink-soft">{block.text}</p>
              );
            })}
          </div>

          {/* Back link */}
          <div className="mt-14 border-t border-border-soft pt-8">
            <Link href="/journal" className="flex items-center gap-2 text-[12px] uppercase tracking-[0.26em] text-ink-soft hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to journal
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-[116px] flex flex-col gap-8">
            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">Read next</div>
                <div className="mt-4 flex flex-col gap-6">
                  {relatedPosts.map((p) => (
                    <Link key={p.slug} href={`/journal/${p.slug}`} className="group block">
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-3">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-gold-dark">{p.tag}</div>
                        <h3 className="mt-1.5 font-display text-xl italic leading-snug group-hover:text-gold-dark">
                          {p.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">The Journal</div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                Written in-house from Karachi. Field notes, fabric notes, and the occasional recipe. Published weekly — no algorithms, no sponsored posts.
              </p>
              <Link
                href="/journal"
                className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-ink hover:text-gold-dark"
              >
                All posts →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
