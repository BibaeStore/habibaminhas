import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, ChevronRight } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { ProductImage } from "@/components/common/product-image";
import { getMyOrders } from "@/lib/actions/orders";
import { getCustomerSession } from "@/lib/actions/customer-auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { text: string; dot: string; bg: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  processing: { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b", bg: "bg-gold/20" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e", bg: "bg-sage/10" },
  cancelled:  { text: "text-sale",      dot: "#9c3b2f", bg: "bg-sale/10" },
};

export default async function OrdersPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?redirect=/account/orders");

  const orders = await getMyOrders();
  const inTransit = orders.filter((o) =>
    ["pending", "processing", "dispatched"].includes(o.status),
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Orders</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Order history.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        {orders.length} order{orders.length !== 1 ? "s" : ""}
        {inTransit > 0 ? ` · ${inTransit} in transit` : ""}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9">
          {orders.length === 0 ? (
            <div className="border border-border-soft bg-cream px-6 py-14 text-center">
              <p className="text-[13px] text-ink-soft">No orders found for <strong>{session.email}</strong>.</p>
              <Link href="/ladies" className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-gold-dark hover:text-ink">
                Browse collections →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {orders.map((order) => {
                const items = (order.order_items ?? []) as {
                  product_title: string; product_image: string | null;
                  size: string | null; quantity: number; unit_price: number;
                }[];
                const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;

                return (
                  <div key={order.id} className="overflow-hidden border border-border-soft bg-ivory">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-cream px-5 py-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Order</div>
                          <Link
                            href={`/account/orders/${order.order_number}`}
                            className="mt-0.5 block text-[13px] font-semibold text-ink transition-colors hover:text-gold-dark"
                          >
                            {order.order_number}
                          </Link>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Date</div>
                          <div className="mt-0.5 text-[13px] text-ink-soft">
                            {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Total</div>
                          <div className="mt-0.5 text-[13px] font-semibold">{formatPrice(order.total)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Status</div>
                          <div className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {order.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/account/orders/${order.order_number}`}
                          className="inline-flex items-center gap-1.5 border border-border-soft px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-parchment"
                        >
                          View order
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/order/${order.order_number}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 border border-border-soft px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-parchment"
                        >
                          <Download className="h-3 w-3" />
                          Invoice
                        </Link>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      {items.length > 0 && (
                        <div className="mb-4 flex gap-2">
                          {items.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative h-16 w-12 flex-none overflow-hidden bg-parchment">
                              <ProductImage
                                src={item.product_image}
                                alt={item.product_title}
                                sizes="48px"
                              />
                            </div>
                          ))}
                          {items.length > 4 && (
                            <div className="flex h-16 w-12 flex-none items-center justify-center bg-cream text-[11px] text-muted">
                              +{items.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      <ul className="flex flex-col divide-y divide-border-soft">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-center justify-between py-3 text-[13px]">
                            <div>
                              <div className="font-medium">{item.product_title}</div>
                              {(item.size || item.quantity > 0) && (
                                <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && ` · `}
                                  Qty: {item.quantity}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 pl-4 font-medium">{formatPrice(item.unit_price * item.quantity)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
