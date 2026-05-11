import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { ProductImage } from "@/components/common/product-image";
import { getMyOrders } from "@/lib/actions/orders";
import { getCustomerSession } from "@/lib/actions/customer-auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { text: string; dot: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b" },
  processing: { text: "text-gold-dark", dot: "#a8804b" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e" },
  cancelled:  { text: "text-sale",      dot: "#9c3b2f" },
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?redirect=/account");

  const orders = await getMyOrders();
  const recentOrders = orders.slice(0, 3);
  const inTransit = orders.filter((o) =>
    ["pending", "processing", "dispatched"].includes(o.status),
  ).length;
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const displayName = session.name ?? orders[0]?.customer_name ?? session.email.split("@")[0];
  const firstName = displayName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Welcome, {firstName}.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        Signed in as {session.email}
        {orders.length > 0 ? ` · ${orders.length} order${orders.length !== 1 ? "s" : ""}` : ""}
        {inTransit > 0 ? `, ${inTransit} in transit` : ""}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-10">

          <div className="grid grid-cols-3 gap-4">
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Orders</div>
              <div className="mt-2 font-display text-3xl italic">{orders.length}</div>
            </div>
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">In transit</div>
              <div className="mt-2 font-display text-3xl italic">{inTransit}</div>
            </div>
            <div className="border border-border-soft bg-cream p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Total spent</div>
              <div className="mt-2 font-display text-2xl italic">{formatPrice(totalSpent)}</div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl italic sm:text-3xl">Recent orders</h2>
              <Link href="/account/orders" className="text-[11px] uppercase tracking-[0.24em] text-gold-dark transition-colors hover:text-ink">
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="border border-border-soft bg-cream px-6 py-10 text-center">
                <p className="text-[13px] text-ink-soft">No orders yet.</p>
                <Link href="/ladies" className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-gold-dark hover:text-ink">
                  Shop now →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden border border-border-soft">
                {recentOrders.map((order, idx) => {
                  const items = (order.order_items ?? []) as {
                    product_title: string; product_image: string | null;
                    size: string | null; quantity: number;
                  }[];
                  const firstImg = items[0]?.product_image ?? null;
                  const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;

                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.order_number}`}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream/60 ${idx > 0 ? "border-t border-border-soft" : ""}`}
                    >
                      <div className="relative h-14 w-10 flex-none overflow-hidden bg-parchment">
                        <ProductImage src={firstImg} alt={items[0]?.product_title ?? "Product"} sizes="40px" />
                      </div>
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-1">
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{order.order_number}</div>
                          <div className="text-[12px] text-ink-soft">
                            {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                            {items.length > 0 && ` · ${items.length} item${items.length !== 1 ? "s" : ""}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {order.status}
                          </span>
                          <span className="text-[13px] font-semibold text-ink">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/account/addresses"
              className="flex items-center justify-between border border-border-soft bg-ivory px-5 py-4 transition-colors hover:bg-cream"
            >
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink">Delivery addresses</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">Manage your saved addresses</div>
              </div>
              <span className="text-gold-dark">→</span>
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center justify-between border border-border-soft bg-ivory px-5 py-4 transition-colors hover:bg-cream"
            >
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink">Account settings</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">Profile, password, notifications</div>
              </div>
              <span className="text-gold-dark">→</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
