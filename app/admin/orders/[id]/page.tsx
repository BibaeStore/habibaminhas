"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
  RotateCcw, Phone, Mail, MapPin, CreditCard, FileText,
  MessageSquare, Printer, ExternalLink, Copy, Check,
  ChevronRight, AlertTriangle, User,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import { getOrderById, updateOrderStatus, updateOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pending",    label: "Order Placed",  icon: Clock },
  { key: "processing", label: "Processing",    icon: RotateCcw },
  { key: "dispatched", label: "Dispatched",    icon: Truck },
  { key: "delivered",  label: "Delivered",     icon: CheckCircle2 },
];

const STATUS_TONE: Record<string, StatusTone> = {
  pending:    "warning",
  processing: "primary",
  dispatched: "primary",
  delivered:  "success",
  cancelled:  "danger",
};

const PAYMENT_TONE: Record<string, StatusTone> = {
  pending:   "warning",
  verified:  "success",
  collected: "success",
  paid:      "success",
  rejected:  "danger",
  "n/a":     "neutral",
};

const STATUS_NEXT: Record<string, { label: string; next: string }> = {
  pending:    { label: "Mark as Processing",  next: "processing" },
  processing: { label: "Mark as Dispatched",  next: "dispatched" },
  dispatched: { label: "Mark as Delivered",   next: "delivered" },
};

// ── Address helpers ───────────────────────────────────────────────────────────
function parseAddress(raw: Order["address"]) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const a = raw as Record<string, string>;
  return {
    name:       a.name       ?? "",
    street:     a.street     ?? "",
    apartment:  a.apartment  ?? "",
    city:       a.city       ?? "",
    province:   a.province   ?? "",
    postalCode: a.postalCode ?? "",
    country:    a.country    ?? "Pakistan",
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-primary)]"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [order,         setOrder]         = useState<Order | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [note,          setNote]          = useState("");
  const [trackingNum,   setTrackingNum]   = useState("");
  const [courierName,   setCourierName]   = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [copied,        setCopied]        = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getOrderById(id) as Order;
      setOrder(data);
      setNote(data.admin_note ?? "");
      setTrackingNum(data.tracking_number ?? "");
      setCourierName(data.courier ?? "");
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusAdvance = async () => {
    if (!order) return;
    const cfg = STATUS_NEXT[order.status];
    if (!cfg) return;
    setSaving(true);
    await updateOrderStatus(order.id, cfg.next);
    await load();
    setSaving(false);
  };

  const handleSaveDetails = async () => {
    if (!order) return;
    setSaving(true);
    await updateOrder(order.id, {
      admin_note:      note      || null,
      tracking_number: trackingNum.trim() || null,
      courier:         courierName.trim() || null,
    });
    await load();
    setSaving(false);
  };

  const handleCancel = async () => {
    if (!order) return;
    await updateOrderStatus(order.id, "cancelled");
    setConfirmCancel(false);
    await load();
  };

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminShell>
        <div className="flex flex-1 items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--admin-primary)] border-t-transparent" />
        </div>
      </AdminShell>
    );
  }

  if (notFound || !order) {
    return (
      <AdminShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
          <AlertTriangle className="h-10 w-10 text-[var(--admin-text-muted)]" />
          <p className="text-[17px] font-medium text-[var(--admin-text)]">Order not found</p>
          <AdminButton variant="outline" onClick={() => router.push("/admin/orders")}>
            ← Back to orders
          </AdminButton>
        </div>
      </AdminShell>
    );
  }

  const addr    = parseAddress(order.address);
  const date    = new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
  const time    = new Date(order.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  const items   = order.order_items ?? [];
  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? -1 : STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center justify-between border-b px-4 md:px-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--admin-text-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--admin-text-muted)" }}>
              <Link href="/admin/orders" className="hover:text-[var(--admin-primary)]">Orders</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span style={{ color: "var(--admin-text)", fontWeight: 600 }}>{order.order_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/order/${order.order_number}`}
              target="_blank"
              className="hidden items-center gap-1.5 text-[13px] transition-colors sm:flex"
              style={{ color: "var(--admin-text-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--admin-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--admin-text-soft)")}
            >
              Customer view <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => window.print()}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--admin-text-soft)" }}
              title="Print"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Printer className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">

          {/* ── Order header ────────────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-bold" style={{ color: "var(--admin-text)" }}>
                  {order.order_number}
                </h1>
                <StatusPill tone={STATUS_TONE[order.status] ?? "neutral"}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusPill>
              </div>
              <p className="mt-1 text-[14px]" style={{ color: "var(--admin-text-muted)" }}>
                Placed on {date} at {time}
              </p>
            </div>

            {/* Primary action */}
            {!isCancelled && STATUS_NEXT[order.status] && (
              <AdminButton
                variant="primary"
                onClick={handleStatusAdvance}
                loading={saving}
                leadingIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                {STATUS_NEXT[order.status].label}
              </AdminButton>
            )}
          </div>

          {/* ── Status stepper ──────────────────────────────────────────────── */}
          {!isCancelled ? (
            <AdminCard className="mb-6">
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  const Icon   = step.icon;
                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full transition-all"
                          style={{
                            background: done ? "var(--admin-primary)" : active ? "var(--admin-text)" : "var(--admin-surface-alt)",
                            color: done || active ? "#fff" : "var(--admin-text-muted)",
                            border: `2px solid ${done || active ? "transparent" : "var(--admin-border)"}`,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className="hidden text-center text-[11px] uppercase tracking-wide sm:block"
                          style={{
                            color:      active ? "var(--admin-text)" : done ? "var(--admin-primary)" : "var(--admin-text-muted)",
                            fontWeight: active ? 700 : 500,
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className="mx-2 h-0.5 flex-1 rounded-full transition-all sm:mx-3"
                          style={{ background: done ? "var(--admin-primary)" : "var(--admin-border)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="mb-6">
              <div className="flex items-center gap-3" style={{ color: "var(--admin-danger)" }}>
                <XCircle className="h-6 w-6 shrink-0" />
                <div>
                  <div className="text-[15px] font-semibold">Order Cancelled</div>
                  <div className="text-[13px]" style={{ color: "var(--admin-text-muted)" }}>
                    This order has been cancelled and no further updates can be made.
                  </div>
                </div>
              </div>
            </AdminCard>
          )}

          {/* ── Main grid ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* ── Left column (2/3 width) ─────────────────────────────────── */}
            <div className="flex flex-col gap-5 lg:col-span-2">

              {/* Products */}
              <AdminCard padded={false}>
                <div
                  className="flex items-center justify-between border-b px-5 py-4"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                    <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                      Items ordered
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                    style={{ background: "var(--admin-surface-alt)", color: "var(--admin-text-soft)" }}
                  >
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <ul className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
                  {items.map((item, i) => (
                    <li key={item.id ?? i} className="flex items-start gap-4 px-5 py-4">
                      {/* Product image */}
                      <div
                        className="relative h-20 w-14 shrink-0 overflow-hidden rounded"
                        style={{ background: "var(--admin-surface-alt)" }}
                      >
                        {item.product_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6" style={{ color: "var(--admin-text-muted)" }} />
                          </div>
                        )}
                      </div>

                      {/* Item info */}
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div
                          className="text-[15px] font-semibold leading-snug"
                          style={{ color: "var(--admin-text)" }}
                        >
                          {item.product_title}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {item.size && (
                            <span className="text-[13px]" style={{ color: "var(--admin-text-soft)" }}>
                              Size: <span style={{ fontWeight: 600 }}>{item.size}</span>
                            </span>
                          )}
                          {item.sku && (
                            <span className="font-mono text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[13px]" style={{ color: "var(--admin-text-soft)" }}>
                          <span>Qty: <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{item.quantity}</span></span>
                          <span style={{ color: "var(--admin-border)" }}>|</span>
                          <span>Unit: {formatPrice(item.unit_price)}</span>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="shrink-0 text-right">
                        <div className="text-[16px] font-bold" style={{ color: "var(--admin-text)" }}>
                          {formatPrice(item.total_price)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
                            × {item.quantity}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Totals */}
                <div
                  className="border-t px-5 py-4"
                  style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-alt)" }}
                >
                  <div className="flex flex-col gap-2 text-[14px]">
                    <div className="flex justify-between" style={{ color: "var(--admin-text-soft)" }}>
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: "var(--admin-text-soft)" }}>
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Shipping
                      </span>
                      <span>{formatPrice(order.shipping)}</span>
                    </div>
                    <div
                      className="flex items-baseline justify-between border-t pt-3"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <span className="text-[15px] font-bold" style={{ color: "var(--admin-text)" }}>
                        Grand Total
                      </span>
                      <span className="text-[22px] font-bold" style={{ color: "var(--admin-primary)" }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </AdminCard>

              {/* Shipping & tracking */}
              <AdminCard>
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Shipping & Tracking
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-semibold"
                      style={{ color: "var(--admin-text)" }}
                    >
                      Courier / Carrier
                    </label>
                    <input
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. TCS, Leopards, M&P"
                      className="h-11 w-full px-3 text-[14px] outline-none transition-colors"
                      style={{
                        border:       "1px solid var(--admin-border)",
                        borderRadius: "var(--admin-radius)",
                        background:   "var(--admin-surface)",
                        color:        "var(--admin-text)",
                      }}
                      onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--admin-primary)")}
                      onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--admin-border)")}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-semibold"
                      style={{ color: "var(--admin-text)" }}
                    >
                      Tracking Number
                    </label>
                    <input
                      value={trackingNum}
                      onChange={(e) => setTrackingNum(e.target.value)}
                      placeholder="e.g. 1234567890"
                      className="h-11 w-full px-3 font-mono text-[14px] outline-none transition-colors"
                      style={{
                        border:       "1px solid var(--admin-border)",
                        borderRadius: "var(--admin-radius)",
                        background:   "var(--admin-surface)",
                        color:        "var(--admin-text)",
                      }}
                      onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--admin-primary)")}
                      onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--admin-border)")}
                    />
                  </div>
                </div>

                {/* Admin note */}
                <div className="mt-4">
                  <label
                    className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold"
                    style={{ color: "var(--admin-text)" }}
                  >
                    <MessageSquare className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                    Internal Note
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a private note about this order (not visible to the customer)…"
                    className="w-full resize-none px-3 py-2.5 text-[14px] outline-none transition-colors"
                    style={{
                      border:       "1px solid var(--admin-border)",
                      borderRadius: "var(--admin-radius)",
                      background:   "var(--admin-surface)",
                      color:        "var(--admin-text)",
                    }}
                    onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--admin-primary)")}
                    onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--admin-border)")}
                  />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <AdminButton
                    variant="primary"
                    onClick={handleSaveDetails}
                    loading={saving}
                    leadingIcon={<Check className="h-4 w-4" />}
                  >
                    Save Changes
                  </AdminButton>
                  {saving && (
                    <span className="text-[13px]" style={{ color: "var(--admin-text-muted)" }}>Saving…</span>
                  )}
                </div>
              </AdminCard>

              {/* Danger zone */}
              {!isCancelled && (order.status === "pending" || order.status === "processing") && (
                <AdminCard>
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: "var(--admin-danger)" }} />
                    <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-danger)" }}>
                      Danger Zone
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[14px]" style={{ color: "var(--admin-text-soft)" }}>
                      Cancelling will mark this order as cancelled. This cannot be undone.
                    </p>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmCancel(true)}
                      leadingIcon={<XCircle className="h-4 w-4" />}
                    >
                      Cancel Order
                    </AdminButton>
                  </div>
                </AdminCard>
              )}
            </div>

            {/* ── Right column (1/3 width) ────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Customer */}
              <AdminCard>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Customer
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
                    style={{ background: "var(--admin-primary)" }}
                  >
                    {order.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold" style={{ color: "var(--admin-text)" }}>
                      {order.customer_name}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--admin-text-muted)" }}>Customer</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--admin-text-muted)" }} />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Email</div>
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="break-all text-[14px] transition-colors hover:text-[var(--admin-primary)]"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {order.customer_email}
                      </a>
                      <CopyButton text={order.customer_email} />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--admin-text-muted)" }} />
                    <div>
                      <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Phone</div>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-[14px] transition-colors hover:text-[var(--admin-primary)]"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {order.customer_phone}
                      </a>
                      <CopyButton text={order.customer_phone} />
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${order.customer_phone?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors"
                    style={{
                      background: "#25d36620",
                      color:      "#25d366",
                      border:     "1px solid #25d36640",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp customer
                  </a>
                </div>
              </AdminCard>

              {/* Shipping address */}
              <AdminCard>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Shipping Address
                  </span>
                </div>
                {addr ? (
                  <address className="not-italic text-[14px] leading-relaxed" style={{ color: "var(--admin-text-soft)" }}>
                    <div className="font-semibold" style={{ color: "var(--admin-text)" }}>{order.customer_name}</div>
                    {addr.street && <div>{addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}</div>}
                    <div>
                      {[addr.city, addr.province, addr.postalCode].filter(Boolean).join(", ")}
                    </div>
                    <div>{addr.country}</div>
                  </address>
                ) : (
                  <p className="text-[14px]" style={{ color: "var(--admin-text-muted)" }}>No address recorded.</p>
                )}
              </AdminCard>

              {/* Payment */}
              <AdminCard>
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Payment
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Method</div>
                      <div className="text-[15px] font-semibold" style={{ color: "var(--admin-text)" }}>
                        {order.payment_method}
                      </div>
                    </div>
                    <StatusPill tone={PAYMENT_TONE[order.payment_status?.toLowerCase()] ?? "neutral"}>
                      {order.payment_status}
                    </StatusPill>
                  </div>
                  <div
                    className="rounded-[var(--admin-radius)] p-3 text-[13px]"
                    style={{ background: "var(--admin-surface-alt)" }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: "var(--admin-text-muted)" }}>Amount paid</span>
                      <span className="font-bold" style={{ color: "var(--admin-primary)" }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </AdminCard>

              {/* Order info */}
              <AdminCard>
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: "var(--admin-text-muted)" }} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Order Info
                  </span>
                </div>
                <dl className="flex flex-col gap-2.5 text-[14px]">
                  {[
                    { label: "Order #",      value: order.order_number },
                    { label: "Date",         value: `${date}, ${time}` },
                    { label: "Courier",      value: order.courier || "—" },
                    { label: "Tracking #",   value: order.tracking_number || "—", mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <dt style={{ color: "var(--admin-text-muted)", flexShrink: 0 }}>{label}</dt>
                      <dd
                        className={`text-right break-all ${mono ? "font-mono" : "font-medium"}`}
                        style={{ color: "var(--admin-text)" }}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </AdminCard>

            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirm */}
      <ConfirmModal
        open={confirmCancel}
        title={`Cancel order ${order.order_number}?`}
        description="This will mark the order as cancelled. This action cannot be undone and the customer will not be automatically notified."
        confirmLabel="Yes, cancel order"
        destructive
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
      />
    </AdminShell>
  );
}
