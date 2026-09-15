"use client";

import { useEffect, useMemo, useState } from "react";
import { Percent, TrendingDown, AlertTriangle } from "lucide-react";
import { AdminButton } from "./button";
import { formatPrice } from "@/lib/utils";
import {
  MIN_DISCOUNT_PERCENT,
  MAX_DISCOUNT_PERCENT,
  previewDiscount,
  isDiscounted,
  discountPercentOf,
} from "@/lib/discount";

/** The only columns this modal needs - keeps it usable from any product list. */
export interface DiscountTarget {
  id: string;
  title: string;
  price: number;
  compare_at: number | null;
}

/** One-tap percentages, covering the usual campaign ladder. */
const QUICK_PERCENTS = [10, 15, 20, 25, 30, 40, 50];

/**
 * Mount this conditionally (`{showDiscountModal && <DiscountModal .../>}`) rather than
 * passing an `open` prop.
 *
 * Unmounting is what discards the percentage, the spinner and any error from the previous
 * run, so reopening always starts clean. An `open` prop would have kept the component
 * mounted and required an effect to reset that state on each open — which React now
 * (correctly) flags as a cascading render.
 */
export function DiscountModal({
  products,
  onClose,
  onApply,
}: {
  products: DiscountTarget[];
  onClose: () => void;
  onApply: (percent: number) => Promise<{ updated: number; error: string | null }>;
}) {
  const [percent, setPercent] = useState("20");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const parsed = parseInt(percent, 10);
  const valid =
    Number.isInteger(parsed) &&
    parsed >= MIN_DISCOUNT_PERCENT &&
    parsed <= MAX_DISCOUNT_PERCENT;

  // Computed with the same `previewDiscount` the server action uses, so the figures below
  // are the figures that will be written - not an approximation of them.
  const rows = useMemo(() => {
    if (!valid) return [];
    return products.map((p) => ({ product: p, ...previewDiscount(p, parsed) }));
  }, [products, parsed, valid]);

  const totalSaved = rows.reduce((sum, r) => sum + r.saved, 0);

  // Items already on sale are repriced from their ORIGINAL price, not their current one.
  // That is the right behaviour but a surprising one, so it is stated rather than implied.
  const alreadyOnSale = products.filter(isDiscounted);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Set discount"
    >
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-lg">
        <div className="border-b border-[var(--admin-border)] px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--admin-text)]">
            <TrendingDown className="h-5 w-5 text-[var(--admin-primary)]" />
            Set discount on {products.length} product{products.length > 1 ? "s" : ""}
          </h2>
          <p className="mt-1 text-[15px] text-[var(--admin-text-soft)]">
            The current price becomes the struck-through &ldquo;was&rdquo; price. Only the
            products you selected are affected.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">
              Discount percentage
            </span>
            <div className="relative w-40">
              <input
                type="number"
                autoFocus
                min={MIN_DISCOUNT_PERCENT}
                max={MAX_DISCOUNT_PERCENT}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-3 pr-9 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
              <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            </div>
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PERCENTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setPercent(String(q))}
                className={`h-8 rounded-[var(--admin-radius)] border px-3 text-sm font-medium transition-colors ${
                  parsed === q
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                    : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {q}%
              </button>
            ))}
          </div>

          {!valid && (
            <div className="mt-3 text-sm text-[var(--admin-danger)]">
              Enter a whole number between {MIN_DISCOUNT_PERCENT} and {MAX_DISCOUNT_PERCENT}.
            </div>
          )}

          {alreadyOnSale.length > 0 && valid && (
            <div className="mt-4 flex gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-3 text-sm text-[var(--admin-text-soft)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-danger)]" />
              <span>
                {alreadyOnSale.length} of these {alreadyOnSale.length > 1 ? "are" : "is"}{" "}
                already discounted. {alreadyOnSale.length > 1 ? "They" : "It"} will be
                recalculated from the original price, so discounts never stack.
              </span>
            </div>
          )}

          {valid && rows.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-[14px] font-semibold text-[var(--admin-text)]">
                Preview
              </div>
              <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 text-right font-medium">Was</th>
                      <th className="px-3 py-2 text-right font-medium">Now</th>
                      <th className="px-3 py-2 text-right font-medium">Saving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ product, original, next, saved }) => (
                      <tr key={product.id} className="border-t border-[var(--admin-border)]">
                        <td className="max-w-[240px] truncate px-3 py-2 text-[var(--admin-text)]">
                          {product.title}
                          {isDiscounted(product) && (
                            <span className="ml-2 text-xs text-[var(--admin-text-muted)]">
                              (currently {discountPercentOf(product)}% off)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--admin-text-muted)] line-through">
                          {formatPrice(original)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-[var(--admin-text)]">
                          {formatPrice(next)}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--admin-primary)]">
                          {formatPrice(saved)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-sm text-[var(--admin-text-soft)]">
                Total discount given across this selection:{" "}
                <span className="font-semibold text-[var(--admin-text)]">
                  {formatPrice(totalSaved)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] p-3 text-sm text-[var(--admin-danger)]">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4">
          <AdminButton variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            loading={saving}
            disabled={!valid || rows.length === 0}
            onClick={async () => {
              if (!valid) return;
              setSaving(true);
              setError("");
              const result = await onApply(parsed);
              setSaving(false);
              if (result.error) {
                setError(result.error);
                return;
              }
              onClose();
            }}
          >
            {saving ? "Applying..." : `Apply ${valid ? parsed : ""}% discount`}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
