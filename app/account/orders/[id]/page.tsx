import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, MapPin, CreditCard, CheckCircle2, Clock, Package, Truck, RotateCcw, Download } from "lucide-react";
import { getMyOrderByNumber } from "@/lib/actions/orders";
import { getCustomerSession } from "@/lib/actions/customer-auth";
import { ProductImage } from "@/components/common/product-image";
import { formatPrice } from "@/lib/utils";
import type { Tables, Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type OrderItem = Tables<"order_items">;
type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: `Order ${id} — Habiba Minhas` };
}

function parseAddress(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return null;
  const a = address as Record<string, string>;
  return {
    street:     a.street     ?? "",
    apartment:  a.apartment  ?? "",
    city:       a.city       ?? "",
    province:   a.province   ?? "",
    postalCode: a.postalCode ?? "",
  };
}

const STATUS_STYLE: Record<string, { text: string; dot: string }> = {
  pending:    { text: "text-gold-dark", dot: "#a8804b" },
  processing: { text: "text-gold-dark", dot: "#a8804b" },
  dispatched: { text: "text-gold-dark", dot: "#a8804b" },
  delivered:  { text: "text-sage",      dot: "#8c9b7e" },
  cancelled:  { text: "text-sale",      dot: "#9c3b2f" },
};

const PAYMENT_LABEL: Record<string, string> = {
  cod:       "Cash on Delivery",
  card:      "Debit / Credit Card",
  jazzcash:  "JazzCash",
  easypaisa: "Easypaisa",
};

function buildTimeline(status: string, courier: string | null) {
  const s = status.toLowerCase();
  return [
    { label: "Order received",                              done: true,                                           },
    { label: "Payment confirmed",                           done: true,                                           },
    { label: `Packed & dispatched via ${courier ?? "TCS"}`, done: ["dispatched", "delivered"].includes(s),       },
    { label: "Out for delivery",                            done: s === "delivered",                              },
    { label: "Delivered",                                   done: s === "delivered",                              },
  ];
}

export default async function OrderDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  const session = await getCustomerSession();
  if (!session) redirect(`/account/login?redirect=/account/orders/${id}`);

  const order = await getMyOrderByNumber(id);
  if (!order) notFound();

  const items    = (order.order_items ?? []) as OrderItem[];
  const addr     = parseAddress(order.address);
  const s        = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;
  const timeline = buildTimeline(order.status, order.courier);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  const orderDate = new Date(order.created_at).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account/orders" className="transition-colors hover:text-ink">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">{order.order_number}</span>
      </nav>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Order details</span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">{order.order_number}</h1>
          <p className="mt-1 text-[13px] text-ink-soft">Placed on {orderDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] ${s.text}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
            {order.status}
          </span>
          <Link
            href={`/order/${order.order_number}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-2 border border-border-soft bg-ivory px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-cream"
          >
            <Download className="h-3.5 w-3.5" />
            Invoice
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Shipment tracking timeline */}
          {!isCancelled && (
            <section className="border border-border-soft bg-ivory p-6">
              <h2 className="font-display text-2xl italic">Shipment tracking</h2>
              {order.tracking_number && (
                <p className="mt-1 text-[12px] uppercase tracking-[0.22em] text-muted">
                  {order.courier ?? "TCS Courier"} ·{" "}
                  <span className="text-ink-soft">{order.tracking_number}</span>
                </p>
              )}
              <ol className="mt-6 flex flex-col gap-0">
                {timeline.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                        step.done
                          ? "border-sage bg-sage text-ivory"
                          : i === timeline.findIndex((t) => !t.done)
                          ? "border-gold-dark bg-cream"
                          : "border-border-soft bg-cream text-muted"
                      }`}>
                        {step.done
                          ? <CheckCircle2 className="h-4 w-4" />
                          : i === timeline.findIndex((t) => !t.done)
                          ? <Clock className="h-3.5 w-3.5 text-gold-dark" />
                          : <span className="h-1.5 w-1.5 rounded-full bg-border-soft" />
                        }
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-px flex-1 my-1 ${step.done ? "bg-sage/40" : "bg-border-soft"}`} style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className="pb-5">
                      <div className={`text-[13px] font-medium ${step.done ? "text-ink" : "text-muted"}`}>
                        {step.label}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Items ordered */}
          <section className="overflow-hidden border border-border-soft bg-ivory">
            <div className="border-b border-border-soft px-5 py-4">
              <h2 className="font-display text-2xl italic">Items ordered</h2>
            </div>
            <ul className="divide-y divide-border-soft px-5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-4 py-5">
                  {/* Product image */}
                  <div className="relative h-20 w-14 flex-none overflow-hidden bg-parchment">
                    <ProductImage
                      src={item.product_image}
                      alt={item.product_title}
                      sizes="56px"
                    />
                  </div>
                  {/* Details */}
                  <div className="flex flex-1 items-start justify-between gap-4 text-[13px]">
                    <div>
                      <div className="font-semibold leading-snug text-ink">{item.product_title}</div>
                      {item.sku && (
                        <div className="mt-0.5 text-[11px] text-muted">SKU: {item.sku}</div>
                      )}
                      <div className="mt-1 text-[12px] text-ink-soft">
                        {item.size && item.size !== "onesize" && `Size: ${item.size} · `}
                        Qty: {item.quantity}
                      </div>
                      <div className="mt-0.5 text-[12px] text-muted">
                        {formatPrice(item.unit_price)} each
                      </div>
                    </div>
                    <div className="shrink-0 font-semibold text-ink">
                      {formatPrice(item.total_price)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-5">

          {/* Order summary */}
          <div className="border border-border-soft bg-cream p-5">
            <h3 className="font-display text-xl italic">Order summary</h3>
            <dl className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>
                  {formatPrice(order.shipping)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-4">
              <span className="text-[14px] font-semibold">Total paid</span>
              <span className="font-display text-2xl">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          {addr && (
            <div className="border border-border-soft bg-ivory p-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                Delivery address
              </div>
              <div className="mt-3 text-[13px] leading-relaxed">
                <div className="font-semibold text-ink">{order.customer_name}</div>
                <div className="mt-0.5 text-ink-soft">
                  {addr.street}
                  {addr.apartment ? `, ${addr.apartment}` : ""}
                </div>
                <div className="text-ink-soft">
                  {addr.city}{addr.province ? `, ${addr.province}` : ""}
                  {addr.postalCode ? ` — ${addr.postalCode}` : ""}
                </div>
                {order.customer_phone && (
                  <div className="mt-1 text-ink-soft">{order.customer_phone}</div>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="border border-border-soft bg-ivory p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
              <CreditCard className="h-3.5 w-3.5 text-gold-dark" />
              Payment
            </div>
            <div className="mt-3 text-[13px] text-ink-soft">
              {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isDelivered && (
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-2 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.24em] text-ink transition-colors hover:bg-cream"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Request return
              </button>
            )}
            <Link
              href="/contact"
              className="flex h-11 w-full items-center justify-center gap-2 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.24em] text-ink transition-colors hover:bg-cream"
            >
              <Package className="h-3.5 w-3.5" /> Need help?
            </Link>
            <Link
              href={`/order/${order.order_number}/invoice`}
              target="_blank"
              className="flex h-11 w-full items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark"
            >
              <Download className="h-3.5 w-3.5" /> Download invoice
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
