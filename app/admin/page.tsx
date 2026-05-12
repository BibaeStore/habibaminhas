import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Users,
  Settings as SettingsIcon,
  Package,
  AlertTriangle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { getProducts } from "@/lib/actions/products";
import { getOrderStats, getOrders } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;
type Order = Tables<"orders">;

export const metadata = { title: "Dashboard | Admin" };

function TodayStat({
  label,
  value,
  caption,
  valueClass = "",
}: {
  label: string;
  value: string;
  caption: string;
  valueClass?: string;
}) {
  return (
    <div className="px-6 py-5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
        {label}
      </div>
      <div className={`mt-2 text-[34px] font-bold leading-none tabular-nums text-[var(--admin-text)] ${valueClass}`}>
        {value}
      </div>
      <div className="mt-2 text-[13px] text-[var(--admin-text-muted)]">
        {caption}
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-[120px] flex-col justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)]"
    >
      <div className="text-[var(--admin-text-soft)] group-hover:text-[var(--admin-primary)]">
        {icon}
      </div>
      <div>
        <div className="text-[16px] font-semibold text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
          {label}
        </div>
        <div className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
          {hint}
        </div>
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [orderStats, customerStats, allProducts, allOrders] = await Promise.all([
    getOrderStats().catch(() => null),
    getCustomerStats().catch(() => null),
    getProducts().catch(() => [] as Product[]),
    getOrders().catch(() => [] as Order[]),
  ]);

  const hasNoData =
    !orderStats && !customerStats && allProducts.length === 0;

  if (hasNoData) {
    return (
      <AdminShell>
        <div className="flex-1 overflow-y-auto p-6">
          <AdminCard>
            <EmptyState
              title="Welcome to your store"
              description="Your store is ready. Add your first product to get started."
            />
            <div className="mt-2 flex justify-center">
              <Link href="/admin/products">
                <AdminButton variant="primary">Add product</AdminButton>
              </Link>
            </div>
          </AdminCard>
        </div>
      </AdminShell>
    );
  }

  const pendingShip =
    (orderStats?.byStatus.pending ?? 0) +
    (orderStats?.byStatus.processing ?? 0);

  const pendingOrders = (allOrders as Order[])
    .filter((o) => o.status === "pending" || o.status === "processing")
    .slice(0, 5);

  const lowStock = allProducts
    .filter((p: Product) => p.stock <= 5)
    .sort((a: Product, b: Product) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* 1. Today panel */}
        <AdminCard padded={false} className="overflow-hidden">
          <div className="h-1 w-full bg-[var(--admin-primary)]" />
          <div className="grid grid-cols-1 divide-y divide-[var(--admin-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <TodayStat
              label="New orders today"
              value={String(orderStats?.todayCount ?? 0)}
              caption="today"
            />
            <TodayStat
              label="Revenue today"
              value={formatPrice(orderStats?.todayRevenue ?? 0)}
              caption="today"
            />
            <TodayStat
              label="Pending to ship"
              value={String(pendingShip)}
              caption={pendingShip > 0 ? "waiting" : "all caught up"}
              valueClass={
                pendingShip > 0 ? "text-[var(--admin-warning)]" : ""
              }
            />
          </div>
        </AdminCard>

        {/* 2. Action tiles */}
        <section className="mt-6">
          <h2 className="mb-3 text-[18px] font-semibold text-[var(--admin-text)]">
            What do you want to do?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              icon={<ShoppingBag className="h-7 w-7" />}
              label="View orders"
              hint={`${pendingShip} pending`}
              href="/admin/orders"
            />
            <Tile
              icon={<Plus className="h-7 w-7" />}
              label="Add product"
              hint={`${allProducts.length} items`}
              href="/admin/products"
            />
            <Tile
              icon={<Users className="h-7 w-7" />}
              label="Customers"
              hint={`${customerStats?.total ?? 0} total`}
              href="/admin/customers"
            />
            <Tile
              icon={<SettingsIcon className="h-7 w-7" />}
              label="Settings"
              hint="Store, shipping, payment"
              href="/admin/settings"
            />
          </div>
        </section>

        {/* 3. Needs your attention */}
        <section className="mt-6">
          <AdminCard padded={false}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[var(--admin-text)]">
                  Orders waiting
                </h3>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-[var(--admin-primary)] hover:underline"
                >
                  View all →
                </Link>
              </div>
              {pendingOrders.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--admin-text-muted)]">
                  No pending orders. All caught up.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--admin-border)]">
                  {pendingOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--admin-text)]">
                          #{o.order_number}
                        </div>
                        <div className="truncate text-[13px] text-[var(--admin-text-soft)]">
                          {o.customer_name} · {formatPrice(o.total)}
                        </div>
                      </div>
                      <Link href="/admin/orders">
                        <AdminButton variant="outline" size="sm">
                          Process →
                        </AdminButton>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-px bg-[var(--admin-border)]" />

            <div className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--admin-warning)]" />
                <h3 className="text-[18px] font-semibold text-[var(--admin-text)]">
                  Low stock
                </h3>
              </div>
              {lowStock.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--admin-text-muted)]">
                  All products well stocked.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--admin-border)]">
                  {lowStock.map((p: Product) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 py-3 first:pt-0"
                    >
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-5 w-5 text-[var(--admin-text-muted)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-medium text-[var(--admin-text)]">
                          {p.title}
                        </div>
                        <div
                          className={`text-[13px] font-semibold ${
                            p.stock === 0
                              ? "text-[var(--admin-danger)]"
                              : "text-[var(--admin-warning)]"
                          }`}
                        >
                          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                        </div>
                      </div>
                      <Link href="/admin/products">
                        <AdminButton variant="outline" size="sm">
                          Edit
                        </AdminButton>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminCard>
        </section>
      </div>
    </AdminShell>
  );
}
