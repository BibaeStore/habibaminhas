"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products, type Product } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/common/section-heading";
import { cn } from "@/lib/utils";

const tabs: Array<{ key: Product["category"] | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "ladies-suits", label: "Ladies" },
  { key: "kids-formal", label: "Kids" },
  { key: "baby-products", label: "Baby" },
  { key: "accessories", label: "Accessories" },
];

export function TrendingTabs() {
  const [active, setActive] = useState<string>("all");
  const items =
    active === "all"
      ? products.filter((p) => p.badge === "New In" || p.badge === "Bestseller").slice(0, 6)
      : products.filter((p) => p.category === active).slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <SectionHeading
            eyebrow="Most-loved this week"
            title="Trending now."
            description="Our most popular pieces — handcrafted and ready to ship."
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-1 border border-border-soft bg-ivory p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={cn(
                  "px-4 py-2 text-[11px] uppercase tracking-[0.26em] transition-colors sm:px-5 sm:py-2.5",
                  active === t.key
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-6">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} compact />
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 border border-ink px-6 py-3 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-ink hover:text-ivory"
          >
            View all products
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
