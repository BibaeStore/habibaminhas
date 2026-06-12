"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";
import { SkeletonTableCard } from "./skeleton";
import { formatPrice } from "@/lib/utils";

interface ProductStub {
  id:       string;
  title:    string;
  slug:     string;
  stock:    number;
  category: string;
}

interface InventoryData {
  out_of_stock:   ProductStub[];
  low_stock:      ProductStub[];
  dead_count:     number;
  total_products: number;
  stock_value:    number;
}

const MAX_LIST = 6;

function StockList({
  items,
  showStock,
  stockLabel,
  emptyNode,
}: {
  items:      ProductStub[];
  showStock:  boolean;
  stockLabel: (s: number) => string;
  emptyNode?: React.ReactNode;
}) {
  if (items.length === 0) return <>{emptyNode}</>;
  const visible = items.slice(0, MAX_LIST);
  const extra   = items.length - MAX_LIST;

  return (
    <ul className="space-y-1">
      {visible.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-2 py-0.5">
          <span className="min-w-0 truncate text-[12px] text-[var(--admin-text)]">{p.title}</span>
          {showStock && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]">
              {stockLabel(p.stock)}
            </span>
          )}
        </li>
      ))}
      {extra > 0 && (
        <li>
          <Link
            href="/admin/products"
            className="text-[11px] text-[var(--admin-primary)] hover:underline"
          >
            + {extra} more →
          </Link>
        </li>
      )}
    </ul>
  );
}

export function InventoryPanel() {
  // Cached across navigation — revisits render instantly
  const { data, isPending: loading } = useQuery<InventoryData | null>({
    queryKey: ["analytics-inventory"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/inventory/");
      return res.ok ? res.json() : null;
    },
  });

  if (loading) return <SkeletonTableCard title="Inventory" rows={4} cols={3} />;

  if (!data) {
    return (
      <AdminCard>
        <h2 className="mb-4 text-[17px] font-semibold text-[var(--admin-text)]">Inventory</h2>
        <p className="text-[13px] text-[var(--admin-text-muted)]">Could not load inventory data.</p>
      </AdminCard>
    );
  }

  const { out_of_stock, low_stock, dead_count, total_products, stock_value } = data;
  const allClear = out_of_stock.length === 0 && low_stock.length === 0;

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">Inventory</h2>
        <Link
          href="/admin/products"
          className="text-[12px] font-medium text-[var(--admin-primary)] hover:underline"
        >
          Manage →
        </Link>
      </div>

      {/* Stat badges */}
      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-red-50 px-2 py-2.5">
          <div className="text-[22px] font-bold leading-none text-red-600">{out_of_stock.length}</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-red-400">Out of stock</div>
        </div>
        <div className="rounded-lg bg-amber-50 px-2 py-2.5">
          <div className="text-[22px] font-bold leading-none text-amber-600">{low_stock.length}</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-amber-400">Low stock</div>
        </div>
        <div className="rounded-lg bg-[var(--admin-surface-alt)] px-2 py-2.5">
          <div className="text-[22px] font-bold leading-none text-[var(--admin-text-muted)]">{dead_count}</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Never sold</div>
        </div>
      </div>

      {allClear ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-[13px] text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          All products are in stock — no action needed.
        </div>
      ) : (
        <div className="space-y-4">
          {out_of_stock.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                  Out of stock ({out_of_stock.length})
                </span>
              </div>
              <StockList
                items={out_of_stock}
                showStock={false}
                stockLabel={() => "0 left"}
              />
            </div>
          )}

          {low_stock.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                  Low stock ({low_stock.length})
                </span>
              </div>
              <StockList
                items={low_stock}
                showStock
                stockLabel={(s) => `${s} left`}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer: stock value + dead stock note */}
      <div className="mt-5 border-t border-[var(--admin-border)] pt-4 space-y-1">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[var(--admin-text-muted)]">Total stock value</span>
          <span className="font-semibold text-[var(--admin-text)]">{formatPrice(stock_value)}</span>
        </div>
        {dead_count > 0 && (
          <p className="text-[11px] text-[var(--admin-text-muted)]">
            {dead_count} of {total_products} products have never received an order.{" "}
            <Link href="/admin/products" className="text-[var(--admin-primary)] hover:underline">
              Review →
            </Link>
          </p>
        )}
      </div>
    </AdminCard>
  );
}
