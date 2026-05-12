import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderByNumber } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import { PrintButton } from "./_print-button";
import type { Tables, Json } from "@/lib/supabase/types";

type OrderItem = Tables<"order_items">;
type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: `Invoice — ${id}` };
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
    country:    a.country    ?? "Pakistan",
  };
}

const PAYMENT_LABEL: Record<string, string> = {
  cod:       "Cash on Delivery",
  card:      "Debit / Credit Card",
  jazzcash:  "JazzCash",
  easypaisa: "Easypaisa",
};

export default async function InvoicePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  let order: Awaited<ReturnType<typeof getOrderByNumber>>;
  try {
    order = await getOrderByNumber(id);
  } catch {
    notFound();
  }

  const addr  = parseAddress(order.address);
  const items = (order.order_items ?? []) as OrderItem[];

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const paymentLabel = PAYMENT_LABEL[order.payment_method] ?? order.payment_method;

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-10 print:bg-white print:p-0">

      {/* ── Toolbar (hidden when printing) ───────────────────────── */}
      <div className="mx-auto mb-6 flex max-w-[794px] items-center justify-between print:hidden">
        <a
          href={`/order/${order.order_number}`}
          className="text-[11px] uppercase tracking-[0.24em] text-[#3d3731] hover:text-[#1a1612]"
        >
          ← Back to order
        </a>
        <PrintButton />
      </div>

      {/* ── Invoice document ─────────────────────────────────────── */}
      <div
        className="mx-auto max-w-[794px] bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08)] print:shadow-none"
        style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
      >

        {/* Header band */}
        <div className="border-b-4 border-[#b89464] px-12 py-8 print:px-10 print:py-7">
          <div className="flex items-start justify-between gap-6">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <Image
                src="/logo/habiba-minhas-logo-t.png"
                alt="Habiba Minhas"
                width={180}
                height={60}
                className="h-14 w-auto object-contain object-left"
                priority
              />
              <div className="text-[11px] leading-relaxed text-[#8a8179]">
                Karachi, Pakistan<br />
                info@habibaminhas.com<br />
                WhatsApp: +92 312 0295812
              </div>
            </div>

            {/* Invoice meta */}
            <div className="text-right">
              <div
                className="text-[32px] font-light uppercase tracking-[0.18em] text-[#1a1612]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
              >
                Invoice
              </div>
              <div className="mt-3 flex flex-col gap-1 text-[12px]">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[#8a8179] uppercase tracking-[0.18em] text-[10px]">Invoice No</span>
                  <span className="font-semibold text-[#1a1612]">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[#8a8179] uppercase tracking-[0.18em] text-[10px]">Date</span>
                  <span className="text-[#1a1612]">{invoiceDate}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[#8a8179] uppercase tracking-[0.18em] text-[10px]">Payment</span>
                  <span className="text-[#1a1612]">{paymentLabel}</span>
                </div>
                {order.courier && (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-[#8a8179] uppercase tracking-[0.18em] text-[10px]">Courier</span>
                    <span className="text-[#1a1612]">{order.courier}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 border-b border-[#e5ddd0] px-12 py-7 print:px-10">
          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b89464]">
              Bill To
            </div>
            <div className="flex flex-col gap-0.5 text-[13px] leading-relaxed text-[#1a1612]">
              <div className="text-[15px] font-semibold">{order.customer_name}</div>
              {addr && (
                <>
                  <div>{addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}</div>
                  <div>
                    {addr.city}
                    {addr.province ? `, ${addr.province}` : ""}
                    {addr.postalCode ? ` — ${addr.postalCode}` : ""}
                  </div>
                  <div>{addr.country}</div>
                </>
              )}
              {order.customer_phone && (
                <div className="mt-1 text-[#3d3731]">{order.customer_phone}</div>
              )}
              {order.customer_email && (
                <div className="text-[#3d3731]">{order.customer_email}</div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b89464]">
              From
            </div>
            <div className="flex flex-col gap-0.5 text-[13px] leading-relaxed text-[#1a1612]">
              <div className="text-[15px] font-semibold">Habiba Minhas</div>
              <div>Karachi, Pakistan</div>
              <div className="mt-1 text-[#3d3731]">info@habibaminhas.com</div>
              <div className="text-[#3d3731]">+92 312 0295812</div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="px-12 py-7 print:px-10">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b89464]">
            Order Items
          </div>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b-2 border-[#1a1612]">
                <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">#</th>
                <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">Product</th>
                <th className="pb-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">Size</th>
                <th className="pb-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">Qty</th>
                <th className="pb-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">Unit Price</th>
                <th className="pb-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8179]">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-[#e5ddd0]">
                  <td className="py-3.5 pr-4 text-[#8a8179]">{i + 1}</td>
                  <td className="py-3.5 pr-4">
                    <div className="font-medium text-[#1a1612]">{item.product_title}</div>
                    {item.sku && (
                      <div className="text-[11px] text-[#8a8179]">SKU: {item.sku}</div>
                    )}
                  </td>
                  <td className="py-3.5 text-center text-[#3d3731]">
                    {item.size ?? "—"}
                  </td>
                  <td className="py-3.5 text-center font-medium text-[#1a1612]">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right text-[#3d3731]">
                    {formatPrice(item.unit_price)}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-[#1a1612]">
                    {formatPrice(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-[#e5ddd0] px-12 pb-8 pt-5 print:px-10">
          <div className="ml-auto max-w-[280px]">
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#8a8179]">Subtotal</span>
                <span className="text-[#1a1612]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8179]">Shipping</span>
                <span className="text-[#1a1612]">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t-2 border-[#1a1612] pt-3">
                <span className="text-[14px] font-bold uppercase tracking-[0.14em] text-[#1a1612]">Total Paid</span>
                <span
                  className="text-[20px] font-semibold text-[#1a1612]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-[#b89464] bg-[#faf7f1] px-12 py-6 print:px-10">
          <div className="flex items-center justify-between gap-4 text-[11px] text-[#8a8179]">
            <p className="leading-relaxed">
              Thank you for shopping with <strong className="text-[#1a1612]">Habiba Minhas</strong>.
              {" "}Returns accepted within 14 days of delivery in original condition.
            </p>
            <div className="shrink-0 text-right">
              <div className="font-medium text-[#1a1612]">www.habibaminhas.com</div>
              <div>WhatsApp: +92 312 0295812</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom spacing for screen view */}
      <div className="h-10 print:hidden" />
    </div>
  );
}
