import { ProductCard } from "./product-card";
import type { CardProduct } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  cols = "4",
  className,
}: {
  products: CardProduct[];
  cols?: "2" | "3" | "4";
  className?: string;
}) {
  const gridClass =
    cols === "2"
      ? "grid-cols-2 md:grid-cols-2"
      : cols === "3"
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return (
    <div className={cn("grid gap-x-4 gap-y-10 sm:gap-x-6", gridClass, className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
