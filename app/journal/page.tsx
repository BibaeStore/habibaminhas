import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { createClient } from "@/lib/supabase/server";

// SEO Focus Keyword: "Pakistani fashion blog"
// Target: Fashion-conscious Pakistanis seeking style guides and cultural insights
export const metadata: Metadata = {
  title: "Fashion Journal Pakistan — Habiba Minhas Blog | Style & Fabric Notes",
  description: "Pakistani fashion blog by Habiba Minhas. Style guides, fabric notes, Eid outfit ideas & cultural insights from Karachi. Weekly posts on Pakistani fashion, traditional wear & modern styling.",
  alternates: {
    canonical: "/journal/",
  },
  keywords: "Pakistani fashion blog, fashion blog Pakistan, style guide Pakistan, Pakistani fashion tips, Eid outfit ideas, fabric notes Pakistan, Karachi fashion blog",
};

// Editorial posts (hardcoded original content)
const editorialPosts = [
  {
    slug: "dupatta-five-ways",
    title: "How to style a dupatta in five ways",
    excerpt: "From loose-draped to tuck-and-pin — an illustrated guide from the studio.",
    tag: "Style Notes",
    date: "12 Apr 2026",
    image: "/editorial/ladies-collection.webp",
    published_at: "2026-04-12T09:00:00+05:00",
  },
  {
    slug: "linen-notes",
    title: "The linen we love, and why it bruises beautifully",
    excerpt: "A brief history of flax, and why we picked Belgian over Egyptian this season.",
    tag: "Fabric",
    date: "04 Apr 2026",
    image: "/trending/sage-bloom.webp",
    published_at: "2026-04-04T09:00:00+05:00",
  },
  {
    slug: "layering-oud",
    title: "A perfumer's guide to layering oud",
    excerpt: "Base, middle, top — and what to wear underneath on a humid afternoon.",
    tag: "Fragrance",
    date: "29 Mar 2026",
    image: "/trending/emerald-embroidery.webp",
    published_at: "2026-03-29T09:00:00+05:00",
  },
  {
    slug: "summer-wardrobe-edit",
    title: "Seven pieces that travel all summer",
    excerpt: "A capsule our stylist packed for two weeks in Istanbul — in one carry-on.",
    tag: "Travel",
    date: "18 Mar 2026",
    image: "/trending/floral-lawn.webp",
    published_at: "2026-03-18T09:00:00+05:00",
  },
  {
    slug: "behind-the-sukoon",
    title: "Behind Sukoon — photographs from the studio",
    excerpt: "Four days in Clifton, a spool of silk, and the quiet before a collection goes live.",
    tag: "The Studio",
    date: "09 Mar 2026",
    image: "/editorial/accessories.webp",
    published_at: "2026-03-09T09:00:00+05:00",
  },
];

export default async function JournalPage() {
  // Fetch a featured product for the sidebar
  const products = await getProducts({ status: "active", limit: 1 }).catch(() => []);
  const featuredProduct = products?.[0];

  // Fetch all published blog posts from database
  const supabase = await createClient();
  const { data: dbPosts } = await supabase
    .from("journal_posts")
    .select("slug, title, excerpt, category_tag, hero_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Format database posts to match editorial format
  const formattedDbPosts = (dbPosts || []).map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    tag: post.category_tag,
    date: new Date(post.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    image: post.hero_image || "/editorial/ladies-collection.webp",
    published_at: post.published_at,
  }));

  // Combine editorial and database posts, sort by published_at
  const allPosts = [...editorialPosts, ...formattedDbPosts].sort((a, b) => {
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
          The Journal
        </span>
        <h1 className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-4xl md:text-[44px]">
          Field notes, fabric notes, and the occasional recipe.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[15px]">
          We publish once a week. Everything is written in-house — no algorithms, no sponsored posts.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        {/* Left Column: All Blog Posts */}
        <div className="flex flex-col gap-16">
          {allPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group block"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                  {post.tag}
                  <span className="h-px w-8 bg-gold/40" />
                  <span className="text-ink-soft">{post.date}</span>
                </div>
                <h2 className="mt-3 font-display text-4xl italic leading-tight transition-colors group-hover:text-gold-dark sm:text-5xl">
                  {post.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-8">
            {/* Featured Collection CTA */}
            {featuredProduct && (
              <div className="overflow-hidden border border-border-soft bg-ivory">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 380px"
                    className="object-cover object-top transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                    New Arrivals
                  </div>
                  <h3 className="mt-2 font-display text-2xl italic leading-tight">
                    Fresh from the studio.
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    Handcrafted ladies suits, kids festive wear & baby essentials.
                  </p>
                  <Link
                    href="/new/"
                    className="mt-4 inline-flex h-11 w-full items-center justify-center bg-ink text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Shop Links */}
            <div className="border border-border-soft bg-cream p-6">
              <h3 className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                Quick Shop
              </h3>
              <nav className="mt-4 flex flex-col gap-3">
                <Link
                  href="/ladies/"
                  className="flex items-center justify-between text-[14px] transition-colors hover:text-gold-dark"
                >
                  <span>Ladies Formal Suits</span>
                  <span className="text-gold-dark">→</span>
                </Link>
                <Link
                  href="/kids/"
                  className="flex items-center justify-between text-[14px] transition-colors hover:text-gold-dark"
                >
                  <span>Kids Festive Wear</span>
                  <span className="text-gold-dark">→</span>
                </Link>
                <Link
                  href="/baby/"
                  className="flex items-center justify-between text-[14px] transition-colors hover:text-gold-dark"
                >
                  <span>Baby Bedding Sets</span>
                  <span className="text-gold-dark">→</span>
                </Link>
                <Link
                  href="/accessories/"
                  className="flex items-center justify-between text-[14px] transition-colors hover:text-gold-dark"
                >
                  <span>Accessories</span>
                  <span className="text-gold-dark">→</span>
                </Link>
              </nav>
            </div>

            {/* Popular Topics */}
            <div className="border border-border-soft bg-ivory p-6">
              <h3 className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                Popular Topics
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Style Notes", "Fabric Guides", "Travel", "The Studio", "Fragrance"].map((topic) => (
                  <span
                    key={topic}
                    className="border border-border-soft bg-cream px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-ink transition-colors hover:border-gold-dark hover:text-gold-dark"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="border border-border-soft bg-cream p-6">
              <h3 className="font-display text-xl italic leading-tight">
                Need styling advice?
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                Our team is here to help with fabric questions, size guidance, and styling tips.
              </p>
              <a
                href="https://wa.me/923120295812"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center border border-ink text-[11px] uppercase tracking-[0.26em] transition-colors hover:bg-ink hover:text-ivory"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
