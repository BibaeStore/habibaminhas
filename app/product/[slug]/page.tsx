import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Ruler,
  Package,
  RotateCcw,
  Truck,
  Star,
} from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard, type CardProduct } from "@/components/product/product-card";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;
type Params = { slug: string };

export async function generateStaticParams() {
  const products = await getProducts({ status: "active" }).catch(() => []);
  return products.map((p: Product) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  try {
    const p = await getProductBySlug(slug);
    return { title: p.seo_title ?? p.title };
  } catch {
    return { title: "Product" };
  }
}

const CATEGORY_LINKS: Record<string, { label: string; href: string }> = {
  "ladies-suits": { label: "Ladies", href: "/ladies" },
  "kids-formal": { label: "Kids", href: "/kids" },
  "baby-products": { label: "Baby Products", href: "/baby" },
  accessories: { label: "Accessories", href: "/accessories" },
};

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  let product: Product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const hasSale = product.compare_at && product.compare_at > product.price;
  const mainImage = product.images?.[0] ?? null;
  const subcategoryLabel =
    product.subcategory ?? product.subtype ?? product.category;
  const catLink = CATEGORY_LINKS[product.category];

  // Related products in same category
  const related = await getProducts({ category: product.category, status: "active" })
    .then((ps: Product[]) => ps.filter((p) => p.id !== product.id).slice(0, 4))
    .catch(() => [] as Product[]);

  // Determine if product uses sizes (ladies/kids suits typically do)
  const hasSizes = ["ladies-suits", "kids-formal"].includes(product.category);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-8">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {catLink ? (
          <Link href={catLink.href} className="hover:text-ink">{catLink.label}</Link>
        ) : (
          <Link href="/shop" className="hover:text-ink">Shop</Link>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">{subcategoryLabel}</span>
      </nav>

      <section className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images ?? []}
            title={product.title}
            palette={product.palette}
          />
        </div>

        {/* Info panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-[116px] lg:self-start">
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
            {subcategoryLabel}
            {product.sku ? ` · SKU ${product.sku.toUpperCase()}` : ""}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-ink">
              {formatPrice(product.price)}
            </span>
            {hasSale ? (
              <>
                <span className="text-[14px] text-muted line-through">
                  {formatPrice(product.compare_at!)}
                </span>
                <span className="text-[12px] uppercase tracking-[0.22em] text-sale">
                  Save {Math.round((1 - product.price / product.compare_at!) * 100)}%
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Inclusive of all taxes. Flat Rs. 200 delivery across Pakistan.
          </p>

          {/* Colour swatches */}
          {product.palette.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.26em]">Colour</span>
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
          )}

          {/* Size selector label */}
          {hasSizes && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.26em]">Size</span>
                <Link
                  href="/content/size-guide"
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-gold-dark-dark"
                >
                  <Ruler className="h-3 w-3" /> Size guide
                </Link>
              </div>
            </div>
          )}

          {/* Interactive add-to-cart (client component) */}
          <AddToCartSection
            id={product.id}
            slug={product.slug}
            title={product.title}
            image={mainImage}
            palette={product.palette}
            price={product.price}
            compare_at={product.compare_at}
            sku={product.sku}
            hasSizes={hasSizes}
          />

          <ul className="mt-10 grid grid-cols-2 gap-3 border-y border-border-soft py-6">
            {[
              { icon: Truck, label: "Flat Rs. 200 Delivery", sub: "Nationwide across Pakistan" },
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
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>
                Cut from a featherweight lawn and finished with hand-threaded
                embroidery at the neckline and cuff. Pair the dupatta loose, or
                tucked at the shoulder for a cleaner line.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl italic sm:text-4xl">
            You may also love
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p as CardProduct} index={i} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
