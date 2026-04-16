import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Heart,
  ChevronRight,
  Ruler,
  Package,
  RotateCcw,
  Truck,
  Star,
  Share2,
} from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";

type Params = { slug: string };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  return { title: p?.title ?? "Product" };
}

const motifs = ["floral", "lattice", "ogee", "arch", "stripes"] as const;

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const hasSale = product.compareAt && product.compareAt > product.price;
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-8">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/women`} className="hover:text-ink">Women</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">{product.collection}</span>
      </nav>

      <section className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div className="sm:col-span-6">
              {product.image ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                <PlaceholderImage
                  tone={product.palette}
                  motif="floral"
                  aspect="4/5"
                  animate
                />
              )}
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="sm:col-span-3 lg:col-span-2 xl:col-span-3"
              >
                {product.image ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                    <Image
                      src={product.image}
                      alt={`${product.title} view ${i + 2}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover object-top"
                      style={{ objectPosition: `${["top", "center", "bottom", "top"][i]}` }}
                    />
                  </div>
                ) : (
                  <PlaceholderImage
                    tone={product.palette}
                    motif={motifs[i]}
                    aspect="3/4"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {product.badge ? (
              <Badge variant={product.badge === "Bestseller" ? "gold" : "default"}>
                {product.badge}
              </Badge>
            ) : null}
            {hasSale ? <Badge variant="sale">Sale</Badge> : null}
            <div className="ml-auto flex items-center gap-1 text-[11px] text-ink-soft">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < 4 ? "fill-gold-dark text-gold-dark" : "text-muted"}`}
                />
              ))}
              <span className="ml-1">4.8 · 214 reviews</span>
            </div>
          </div>
          <h1 className="mt-4 font-display text-4xl font-light italic leading-[1.05] sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-2 text-[12px] uppercase tracking-[0.26em] text-muted">
            {product.collection} · SKU {product.id.toUpperCase()}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-ink">
              {formatPrice(product.price)}
            </span>
            {hasSale ? (
              <>
                <span className="text-[14px] text-muted line-through">
                  {formatPrice(product.compareAt!)}
                </span>
                <span className="text-[12px] uppercase tracking-[0.22em] text-sale">
                  Save {Math.round((1 - product.price / product.compareAt!) * 100)}%
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Inclusive of all taxes. Free shipping in Pakistan over Rs. 3,500.
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.26em]">
                Colour
              </span>
              <span className="text-[12px] text-ink-soft">Dusty Rose</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.palette.map((c, i) => (
                <button
                  key={i}
                  aria-label={`Colour ${i + 1}`}
                  className={`h-9 w-9 rounded-full border ${i === 0 ? "border-ink ring-2 ring-ink/10 ring-offset-2 ring-offset-ivory" : "border-border-soft"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.26em]">
                Size
              </span>
              <Link
                href="/content/size-guide"
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-gold-dark-dark"
              >
                <Ruler className="h-3 w-3" /> Size guide
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {["XS", "S", "M", "L", "XL"].map((s, i) => (
                <button
                  key={s}
                  className={`h-11 border text-[12px] uppercase tracking-[0.22em] transition-colors ${
                    i === 1
                      ? "border-ink bg-ink text-ivory"
                      : "border-border-soft text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button className="inline-flex h-14 items-center justify-center gap-3 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark">
              Add to bag
            </button>
            <div className="flex gap-3">
              <button className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink text-[12px] uppercase tracking-[0.26em] hover:bg-ink hover:text-ivory">
                <Heart className="h-4 w-4" /> Wishlist
              </button>
              <button className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink/20 text-[12px] uppercase tracking-[0.26em] hover:border-ink">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 border-y border-border-soft py-6">
            {[
              { icon: Truck, label: "Free PK Shipping", sub: "Orders over Rs. 3,500" },
              { icon: Package, label: "Ships in 24h", sub: "From our Karachi studio" },
              { icon: RotateCcw, label: "14-day Returns", sub: "Hassle-free exchanges" },
              { icon: Ruler, label: "Finished by Hand", sub: "Small-batch construction" },
            ].map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon className="h-4 w-4 text-gold-dark" />
                <div>
                  <div className="text-[12px] uppercase tracking-[0.22em]">{label}</div>
                  <div className="text-[12px] text-ink-soft">{sub}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3 text-[13px] leading-relaxed text-ink-soft">
            <h3 className="font-display text-xl italic text-ink">Details</h3>
            <p>
              Cut from a featherweight lawn and finished with hand-threaded embroidery at the
              neckline and cuff. Pair the dupatta loose, or tucked at the shoulder for a cleaner line.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Shirt: 100% cotton lawn, 120 gsm</li>
              <li>Dupatta: silk-chiffon blend, 70 gsm</li>
              <li>Bottoms: cotton cambric, 140 gsm</li>
              <li>Made in Karachi, finished by hand</li>
              <li>Dry clean recommended</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="font-display text-3xl italic sm:text-4xl">You may also love</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {related.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
