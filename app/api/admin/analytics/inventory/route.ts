import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/require-admin";

const LOW_STOCK_THRESHOLD = 5;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  // All products + all-time sold product IDs in parallel
  const [{ data: products, error: prodErr }, { data: soldItems, error: soldErr }] =
    await Promise.all([
      admin.from("products").select("id, title, slug, stock, price, category, status"),
      admin.from("order_items").select("product_id"),
    ]);

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });
  if (soldErr) return NextResponse.json({ error: soldErr.message }, { status: 500 });

  const soldIds = new Set(
    (soldItems ?? []).map((i) => i.product_id as string).filter(Boolean),
  );

  type Product = { id: string; title: string; slug: string; stock: number; price: number; category: string; status: string };
  const all = (products ?? []) as Product[];

  const outOfStock = all.filter((p) => p.stock === 0);
  const lowStock   = all.filter((p) => p.stock >= 1 && p.stock <= LOW_STOCK_THRESHOLD);
  const deadStock  = all.filter((p) => !soldIds.has(p.id));
  const stockValue = all.reduce((s, p) => s + p.price * p.stock, 0);

  const slim = (arr: Product[]) =>
    arr.map(({ id, title, slug, stock, category }) => ({ id, title, slug, stock, category }));

  return NextResponse.json({
    out_of_stock: slim(outOfStock),
    low_stock:    slim(lowStock),
    dead_stock:   slim(deadStock),
    dead_count:   deadStock.length,
    total_products: all.length,
    stock_value:  stockValue,
  });
}
