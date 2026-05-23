import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Ruler,
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
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { SizeGuideButton } from "@/components/product/size-guide-button";
import type { Tables } from "@/lib/supabase/types";
import { ProductSchema } from "@/components/seo/product-schema";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

type Product = Tables<"products">;
type Params = { category: string; slug: string };

export async function generateStaticParams() {
  const products = await getProducts({ status: "active" }).catch(() => []);
  return products.map((p: Product) => ({
    category: p.category,
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  try {
    const p = await getProductBySlug(slug);
    return {
      title: p.seo_title ?? p.title,
      description: p.seo_description ?? `${p.title} — Handcrafted in Pakistan. Flat Rs. 250 delivery nationwide.`,
      alternates: {
        canonical: `/product/${category}/${slug}/`,
      },
    };
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
  const { category, slug } = await params;

  let product: Product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  // Verify category matches (SEO safety)
  if (product.category !== category) {
    notFound();
  }

  // Handle out of stock products - DON'T show 404
  const isOutOfStock = product.status === "inactive" || product.stock === 0;

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
          <Link href="/ladies" className="hover:text-ink">Shop</Link>
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

        {/* Info panel — pb-24 on mobile reserves space above the sticky Add to Bag bar */}
        <div className="pb-24 lg:col-span-5 lg:pb-0 lg:sticky lg:top-[116px] lg:self-start">
          {/* Out of Stock Banner */}
          {isOutOfStock && (
            <div className="mb-4 rounded-md border-2 border-ink/20 bg-cream p-4 text-center">
              <h3 className="font-display text-xl italic text-ink">Currently Unavailable</h3>
              <p className="mt-2 text-[13px] text-ink-soft">
                This item is currently out of stock. Check back soon or explore similar products below.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {product.badge ? (
              <Badge variant={product.badge === "Bestseller" ? "gold" : "default"}>
                {product.badge}
              </Badge>
            ) : null}
            {hasSale && !isOutOfStock ? <Badge variant="sale">Sale</Badge> : null}
            {isOutOfStock ? (
              <Badge variant="default" className="bg-muted text-ink-soft">
                Out of Stock
              </Badge>
            ) : null}
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
          <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-muted">
            SKU: {product.sku?.toUpperCase() || "N/A"}
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

          {/* Size selector label */}
          {hasSizes && !isOutOfStock && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.26em]">Size</span>
                <SizeGuideButton sizeGuideUrl={product.size_guide} />
              </div>
            </div>
          )}

          {/* Interactive add-to-cart (client component) - hide if out of stock */}
          {!isOutOfStock && (
            <AddToCartSection
              id={product.id}
              slug={product.slug}
              category={product.category}
              title={product.title}
              image={mainImage}
              palette={product.palette}
              price={product.price}
              compare_at={product.compare_at}
              sku={product.sku}
              hasSizes={hasSizes}
              sizesStock={product.sizes_stock as Record<string, number> | null}
            />
          )}

          {/* Notify when back in stock */}
          {isOutOfStock && (
            <div className="mt-8">
              <button className="w-full border border-ink bg-ink px-6 py-4 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ink/90">
                Notify me when available
              </button>
              <p className="mt-2 text-center text-[11px] text-muted">
                We'll email you when this item is back in stock
              </p>
            </div>
          )}

          {/* Details & Description Tabs */}
          <ProductDetailsTabs
            description={product.description}
            shortDescription={product.short_description}
          />

          {/* Feature Cards - moved below tabs */}
          <ul className="mt-8 grid grid-cols-1 gap-4 border-y border-border-soft py-6 sm:grid-cols-3">
            {[
              { icon: Truck,      label: "Flat Rs. 250", sub: "Nationwide delivery" },
              { icon: RotateCcw, label: "14-day Returns", sub: "Easy exchanges" },
              { icon: Ruler,     label: "Finished by Hand", sub: "Artisan crafted" },
            ].map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gold-dark" />
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.22em]">{label}</div>
                  <div className="text-[11px] text-ink-soft">{sub}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24 pb-16">
          <h2 className="font-display text-3xl italic sm:text-4xl">
            You May Also Like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p as CardProduct} index={i} compact />
            ))}
          </div>
        </section>
      )}

      {/* Schema Markup for SEO */}
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: catLink?.label || "Shop", url: catLink?.href || "/ladies" },
          { name: product.title, url: `/product/${category}/${slug}/` }
        ]}
      />
    </div>
  );
}
