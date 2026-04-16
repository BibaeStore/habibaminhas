import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { getOrderByNumber } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import type { Tables, Json } from "@/lib/supabase/types";

type OrderItem = Tables<"order_items">;

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: `Order Confirmed — ${id}` };
}

function parseAddress(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return null;
  const a = address as Record<string, string>;
  return {
    street: a.street ?? "",
    apartment: a.apartment ?? "",
    city: a.city ?? "",
    province: a.province ?? "",
    postalCode: a.postalCode ?? "",
  };
}

export default async function OrderConfirmationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  let order: Awaited<ReturnType<typeof getOrderByNumber>>;
  try {
    order = await getOrderByNumber(id);
  } catch {
    notFound();
  }

  const addr = parseAddress(order.address);
  const items = (order.order_items ?? []) as OrderItem[];
  const firstName = order.customer_name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* Confirmation header */}
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-sage" />
            <div>
              <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Order confirmed</span>
              <h1 className="mt-2 font-display text-4xl italic leading-tight sm:text-5xl">
                Thank you, {firstName}.
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Your order <strong className="font-medium text-ink">{order.order_number}</strong> has been placed.
                {order.customer_email && (
                  <> We&apos;ll send a confirmation to <strong className="text-ink">{order.customer_email}</strong> and a WhatsApp update once it&apos;s dispatched.</>
                )}
              </p>
            </div>
          </div>

          {/* What happens next */}
          <section className="mt-12 border border-border-soft bg-ivory p-6">
            <h2 className="font-display text-2xl italic">What happens next</h2>
            <ol className="mt-5 flex flex-col gap-0">
              {[
                { icon: CheckCircle2, label: "Order received", sub: "Your order is confirmed and sent to our team.", done: true },
                { icon: Package, label: "Packed with care", sub: "Each piece is inspected, pressed, and wrapped in tissue.", done: false },
                { icon: Truck, label: `Dispatched via ${order.courier ?? "TCS"}`, sub: "Tracking details sent to your WhatsApp within 24 hours.", done: false },
                { icon: CheckCircle2, label: "Delivered to your door", sub: "Standard: 3–5 business days · Express: 1–2 business days.", done: false },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                      step.done ? "border-sage bg-sage text-ivory" : "border-border-soft bg-cream text-muted"
                    }`}>
                      <step.icon className="h-3.5 w-3.5" />
                    </div>
                    {i < 3 && <div className="w-px bg-border-soft my-1" style={{ minHeight: 28 }} />}
                  </div>
                  <div className="pb-5">
                    <div className="text-[13px] font-medium">{step.label}</div>
                    <div className="text-[12px] text-ink-soft">{step.sub}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Returns reminder */}
          <div className="mt-6 flex items-start gap-3 border border-border-soft bg-cream p-4 text-[12px] text-ink-soft">
            <RotateCcw className="mt-0.5 h-4 w-4 text-gold-dark shrink-0" />
            <span>
              Changed your mind? You have <strong className="text-ink">14 days</strong> from delivery to return any item in its original condition.{" "}
              <Link href="/help/returns" className="text-gold-dark hover:text-ink">Learn about returns →</Link>
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ladies"
              className="inline-flex h-12 items-center gap-2 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors group"
            >
              Continue shopping
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 border border-border-soft px-8 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-cream transition-colors"
            >
              Contact support
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 border border-border-soft bg-cream p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic">Order summary</h2>
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{order.order_number}</span>
            </div>

            <ul className="mt-5 flex flex-col gap-4 border-b border-border-soft pb-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative w-14 flex-none aspect-[3/4] bg-ivory overflow-hidden">
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_title} fill sizes="56px" className="object-cover object-top" />
                    ) : (
                      <div className="h-full w-full bg-cream" />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2 text-[13px]">
                    <div>
                      <div className="font-medium leading-snug">{item.product_title}</div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
                      </div>
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(item.total_price)}</div>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-4 flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>
                  {order.shipping === 0 ? (
                    <span className="text-gold-dark">Complimentary</span>
                  ) : (
                    formatPrice(order.shipping)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Gift wrap</dt>
                <dd>Free</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-4 text-[15px] font-medium">
              <span>Total paid</span>
              <span className="font-display text-2xl">{formatPrice(order.total)}</span>
            </div>

            {/* Delivery details */}
            {addr && (
              <div className="mt-5 border-t border-border-soft pt-5 text-[12px]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Delivers to</div>
                <div className="mt-2 text-ink-soft leading-relaxed">
                  {order.customer_name}<br />
                  {addr.street}
                  {addr.apartment ? `, ${addr.apartment}` : ""}<br />
                  {addr.city}{addr.province ? `, ${addr.province}` : ""}
                  {addr.postalCode ? ` — ${addr.postalCode}` : ""}
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-muted uppercase tracking-[0.22em]">Payment</span>
                  <span className="text-ink-soft capitalize">{order.payment_method.replace("cod", "Cash on Delivery")}</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
