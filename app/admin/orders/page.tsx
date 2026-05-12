"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Download, X, Truck, CreditCard, Package,
  ChevronLeft, ChevronRight, MapPin, Phone, Mail,
  ClipboardList, MessageSquare,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import { getOrders, updateOrderStatus, updateOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

const STATUS_TABS = ["All", "Pending", "Processing", "Dispatched", "Delivered", "Cancelled"];

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
  rejected:  "danger",
  "n/a":     "neutral",
};

function getAddr(address: Order["address"]): string {
  if (!address) return "—";
  if (typeof address === "string") return address;
  if (typeof address === "object" && !Array.isArray(address)) {
    const a = address as Record<string, string>;
    return [a.street, a.city, a.province].filter(Boolean).join(", ") || JSON.stringify(address);
  }
  return String(address);
}

function getCity(address: Order["address"]): string {
  if (!address || typeof address !== "object" || Array.isArray(address)) return "—";
  const a = address as Record<string, string>;
  return a.city ?? "—";
}

function exportOrdersCSV(orders: Order[]) {
  const headers = ["Order #", "Date", "Customer", "Phone", "City", "Items", "Payment", "Status", "Total (Rs.)"];
  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleDateString("en-PK"),
    o.customer_name,
    o.customer_phone,
    getCity(o.address),
    (o.order_items ?? []).length,
    o.payment_method,
    o.status,
    o.total,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Order | null>(null);
  const [page,      setPage]      = useState(1);

  const PAGE_SIZE = 10;

  const loadOrders = () => {
    setLoading(true);
    getOrders().then((data) => { setOrders(data as Order[]); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== "All" && o.status !== activeTab.toLowerCase()) return false;
      if (search &&
          !o.order_number.toLowerCase().includes(search.toLowerCase()) &&
          !o.customer_name.toLowerCase().includes(search.toLowerCase()) &&
          !(o.tracking_number ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [orders, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabCount = (t: string) =>
    t === "All" ? orders.length : orders.filter((o) => o.status === t.toLowerCase()).length;

  const pendingCount = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    loadOrders();
    setSelected((prev) => prev ? { ...prev, status } : null);
  };

  return (
    <AdminShell title="Orders">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Orders"
          subtitle={`${orders.length} total, ${pendingCount} pending`}
          actions={
            <AdminButton
              variant="outline"
              leadingIcon={<Download className="h-4 w-4" />}
              onClick={() => exportOrdersCSV(filtered)}
            >
              Export CSV
            </AdminButton>
          }
        />

        {/* Status tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => {
            const active = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setPage(1); }}
                className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--admin-primary)] text-white"
                    : "bg-[var(--admin-surface)] text-[var(--admin-text-soft)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {t}
                <span className={`ml-1.5 text-xs ${active ? "opacity-70" : "text-[var(--admin-text-muted)]"}`}>
                  {tabCount(t)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="search"
              placeholder="Search order #, tracking, customer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)] sm:w-96"
            />
          </div>
          <span className="text-sm text-[var(--admin-text-muted)]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <AdminCard padded={false} className="mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    <input type="checkbox" className="h-5 w-5 accent-[var(--admin-primary)]" />
                  </th>
                  <th className="px-5 py-4 font-semibold">Order / Tracking</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold text-center">Items</th>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Pay. Status</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-5" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-28" /><div className="skeleton mt-2 h-4 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-32" /><div className="skeleton mt-2 h-4 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                      <td className="px-5 py-5 text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                      <td className="px-5 py-5 text-right"><div className="skeleton ml-auto h-5 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-16" /></td>
                    </tr>
                  ))
                ) : paginated.map((o) => {
                  const date = new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <tr key={o.id} className="h-14 transition-colors hover:bg-[var(--admin-surface-alt)]">
                      <td className="px-5 py-5">
                        <input type="checkbox" className="h-5 w-5 accent-[var(--admin-primary)]" />
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm font-medium text-[var(--admin-text)]">{o.order_number}</div>
                        <div className="mt-0.5 font-mono text-xs text-[var(--admin-text-muted)]">{o.tracking_number ?? "No tracking"}</div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm font-medium text-[var(--admin-text)]">{o.customer_name}</div>
                        <div className="text-xs text-[var(--admin-text-muted)]">{getCity(o.address)}</div>
                      </td>
                      <td className="px-5 py-5 text-sm text-[var(--admin-text-soft)]">{date}</td>
                      <td className="px-5 py-5 text-center text-sm text-[var(--admin-text-soft)]">{o.order_items?.length ?? 0}</td>
                      <td className="px-5 py-5">
                        <span className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-2.5 py-1 text-xs font-medium text-[var(--admin-text-soft)]">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <StatusPill tone={PAYMENT_TONE[o.payment_status.toLowerCase()] ?? "neutral"}>
                          {o.payment_status}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-5">
                        <StatusPill tone={STATUS_TONE[o.status] ?? "neutral"}>
                          {o.status}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-5 text-right text-sm font-medium text-[var(--admin-text)]">{formatPrice(o.total)}</td>
                      <td className="px-5 py-5">
                        <AdminButton variant="outline" size="sm" onClick={() => setSelected(o)}>
                          Update →
                        </AdminButton>
                      </td>
                    </tr>
                  );
                })}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-14 text-center text-sm text-[var(--admin-text-muted)]">
                      No orders match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3">
            <span className="text-sm text-[var(--admin-text-muted)]">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
            </span>
            <div className="flex items-center gap-1">
              <AdminButton
                variant="outline"
                size="sm"
                leadingIcon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Prev
              </AdminButton>
              <span className="px-3 text-sm text-[var(--admin-text-soft)]">
                Page {safePage} of {totalPages}
              </span>
              <AdminButton
                variant="outline"
                size="sm"
                trailingIcon={<ChevronRight className="h-4 w-4" />}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      </div>

      {selected && (
        <OrderDetailPanel
          order={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          loadOrders={loadOrders}
        />
      )}
    </AdminShell>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
  onStatusUpdate,
  loadOrders,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  loadOrders: () => void;
}) {
  const [note,          setNote]          = useState(order.admin_note ?? "");
  const [saving,        setSaving]        = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const saveNote = async () => {
    setSaving(true);
    await updateOrder(order.id, { admin_note: note });
    setSaving(false);
  };

  const date = new Date(order.created_at).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="flex-1 bg-black/40" onClick={onClose} />
        <div className="flex w-full max-w-2xl flex-col bg-[var(--admin-surface)] shadow-xl">

          {/* Header */}
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--admin-text)]">{order.order_number}</h2>
              <StatusPill tone={STATUS_TONE[order.status] ?? "neutral"}>
                {order.status}
              </StatusPill>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            <AdminCard as="section">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Customer</div>
              <div className="space-y-2">
                <div className="text-base font-medium text-[var(--admin-text)]">{order.customer_name}</div>
                <div className="flex items-center gap-2 text-sm text-[var(--admin-text-soft)]">
                  <Mail className="h-4 w-4 text-[var(--admin-text-muted)]" /> {order.customer_email}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--admin-text-soft)]">
                  <Phone className="h-4 w-4 text-[var(--admin-text-muted)]" /> {order.customer_phone}
                </div>
                <div className="flex items-start gap-2 text-sm text-[var(--admin-text-soft)]">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] mt-0.5" />
                  <span>{getAddr(order.address)}</span>
                </div>
              </div>
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Payment</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm font-medium text-[var(--admin-text)]">{order.payment_method}</span>
                </div>
                <StatusPill tone={PAYMENT_TONE[order.payment_status.toLowerCase()] ?? "neutral"}>
                  {order.payment_status}
                </StatusPill>
              </div>
            </AdminCard>

            <AdminCard padded={false} as="section">
              <div className="px-5 pt-4 pb-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)] flex items-center gap-2">
                <Package className="h-4 w-4" /> Items ({order.order_items?.length ?? 0})
              </div>
              <ul className="divide-y divide-[var(--admin-border)]">
                {(order.order_items ?? []).map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="line-clamp-2 text-sm font-medium text-[var(--admin-text)] leading-snug">{item.product_title}</div>
                      <div className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                        {item.size ? `Size: ${item.size} · ` : ""}Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-medium text-[var(--admin-text)]">{formatPrice(item.total_price)}</div>
                  </li>
                ))}
                {(!order.order_items || order.order_items.length === 0) && (
                  <li className="px-5 py-3 text-sm text-[var(--admin-text-muted)]">No items recorded.</li>
                )}
              </ul>
            </AdminCard>

            <AdminCard as="section" className="bg-[var(--admin-text)]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-white uppercase tracking-wide">Grand Total</span>
                  <span className="text-2xl font-semibold text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <ClipboardList className="h-4 w-4" /> Order info
              </div>
              <div className="text-sm text-[var(--admin-text-soft)]">
                Placed: {date}
                {order.courier && <div className="mt-1">Courier: {order.courier}</div>}
              </div>
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <MessageSquare className="h-4 w-4" /> Admin notes
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an internal note about this order…"
                className="w-full resize-none rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 py-2.5 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
              <div className="mt-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={saveNote}
                  loading={saving}
                >
                  {saving ? "Saving…" : "Save note"}
                </AdminButton>
              </div>
            </AdminCard>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--admin-border)] px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {order.status === "pending" && (
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "processing")}
                >
                  Process
                </AdminButton>
              )}
              {order.status === "processing" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "dispatched")}
                >
                  Mark as shipped
                </AdminButton>
              )}
              {order.status === "dispatched" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "delivered")}
                >
                  Mark Delivered
                </AdminButton>
              )}
              {(order.status === "pending" || order.status === "processing") && (
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel order
                </AdminButton>
              )}
              <AdminButton variant="outline" size="sm" onClick={() => window.print()}>
                Print
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Cancel this order?"
        description="The order will be marked as cancelled. This cannot be undone."
        confirmLabel="Yes, cancel order"
        destructive
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          await updateOrderStatus(order.id, "cancelled");
          setConfirmCancel(false);
          onClose();
          loadOrders();
        }}
      />
    </>
  );
}
