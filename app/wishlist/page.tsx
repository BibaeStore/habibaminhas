import { products } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  const items = products.filter((_, i) => i % 3 === 0).slice(0, 8);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Saved for later
      </span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Your Wishlist</h1>
      <p className="mt-2 max-w-lg text-[13px] text-ink-soft">
        A little private bench. Move anything to your bag when you're ready.
      </p>
      <div className="mt-12">
        <ProductGrid products={items} cols="4" />
      </div>
    </div>
  );
}
