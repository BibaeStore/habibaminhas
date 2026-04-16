"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Download, X, Truck, CreditCard, Package,
  ChevronLeft, ChevronRight, MapPin, Phone, Mail,
  ClipboardList, MessageSquare,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getOrders, updateOrderStatus, updateOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

const STATUS_TABS = ["All", "Pending", "Processing", "Dispatched", "Delivered", "Cancelled"];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: "bg-cream",    text: "text-ink-soft",  dot: "#a0a0a0" },
  processing: { bg: "bg-gold/20",  text: "text-gold-dark", dot: "#a8804b" },
  dispatched: { bg: "bg-blue-50",  text: "text-blue-600",  dot: "#2563eb" },
  delivered:  { bg: "bg-sage/15",  text: "text-sage",      dot: "#8c9b7e" },
  cancelled:  { bg: "bg-sale/10",  text: "text-sale",      dot: "#9c3b2f" },
};

const paymentStatusStyle: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "bg-gold/15",  text: "text-gold-dark" },
  verified:  { bg: "bg-sage/15",  text: "text-sage" },
  collected: { bg: "bg-sage/15",  text: "text-sage" },
  rejected:  { bg: "bg-sale/10",  text: "text-sale" },
  "n/a":     { bg: "bg-cream",    text: "text-muted" },
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

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    loadOrders();
    setSelected((prev) => prev ? { ...prev, status } : null);
  };

  return (
    <AdminShell title="Orders">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Orders</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Manage & track orders</p>
            </div>
            <button className="flex h-11 items-center gap-2 border border-border-soft bg-ivory px-5 text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:bg-cream">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          {/* Status tabs */}
          <div className="mb-4 flex flex-wrap gap-1 border-b border-border-soft pb-4">
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => { setActiveTab(t); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  activeTab === t ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}>
                {t}
                <span className={`text-[10px] ${activeTab === t ? "text-ivory/60" : "text-muted"}`}>{tabCount(t)}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input type="search" placeholder="Search order #, tracking, customer…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink sm:w-80" />
            </div>
            <span className="text-[12px] text-muted">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                    </th>
                    <th className="px-4 py-3 font-medium">Order / Tracking</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-center">Items</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Pay. Status</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center text-[12px] text-muted">Loading orders…</td>
                    </tr>
                  ) : paginated.map((o) => {
                    const s  = statusStyle[o.status]                    ?? statusStyle.pending;
                    const ps = paymentStatusStyle[o.payment_status.toLowerCase()] ?? paymentStatusStyle["n/a"];
                    const date = new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <tr key={o.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[12px] font-medium text-ink">{o.order_number}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted">{o.tracking_number ?? "No tracking"}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[12px] font-medium">{o.customer_name}</div>
                          <div className="text-[11px] text-muted">{getCity(o.address)}</div>
                        </td>
                        <td className="px-4 py-4 text-[12px] text-ink-soft">{date}</td>
                        <td className="px-4 py-4 text-center text-[12px] text-ink-soft">{o.order_items?.length ?? 0}</td>
                        <td className="px-4 py-4">
                          <span className="border border-border-soft bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                            {o.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${ps.bg} ${ps.text}`}>
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-[12px] font-medium">{formatPrice(o.total)}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => setSelected(o)}
                            className="text-[11px] uppercase tracking-[0.18em] text-gold-dark transition-colors hover:text-ink whitespace-nowrap">
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && paginated.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center text-[12px] text-muted">No orders match the current filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft transition-colors hover:bg-cream disabled:opacity-30">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${n === safePage ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft transition-colors hover:bg-cream disabled:opacity-30">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {selected && (
        <OrderDetailPanel
          order={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
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
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [note,    setNote]    = useState(order.admin_note ?? "");
  const [saving,  setSaving]  = useState(false);
  const s  = statusStyle[order.status]                         ?? statusStyle.pending;
  const ps = paymentStatusStyle[order.payment_status.toLowerCase()] ?? paymentStatusStyle["n/a"];

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
      <div className="fixed inset-0 z-40 bg-ink/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col bg-ivory shadow-2xl md:max-w-lg">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl italic">{order.order_number}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                {order.status}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{order.tracking_number ?? "No tracking"}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <section>
            <div className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted">Customer</div>
            <div className="border border-border-soft bg-cream p-4 space-y-2">
              <div className="text-[13px] font-medium">{order.customer_name}</div>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Mail className="h-3.5 w-3.5 text-muted" /> {order.customer_email}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Phone className="h-3.5 w-3.5 text-muted" /> {order.customer_phone}
              </div>
              <div className="flex items-start gap-2 text-[12px] text-ink-soft">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted mt-0.5" />
                <span>{getAddr(order.address)}</span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted">Payment</div>
            <div className="border border-border-soft bg-cream p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted" />
                  <span className="text-[12px] font-medium">{order.payment_method}</span>
                </div>
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${ps.bg} ${ps.text}`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <Package className="h-3.5 w-3.5" /> Items ({order.order_items?.length ?? 0})
            </div>
            <ul className="divide-y divide-border-soft border border-border-soft bg-cream">
              {(order.order_items ?? []).map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-2 text-[12px] font-medium leading-snug">{item.product_title}</div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {item.size ? `Size: ${item.size} · ` : ""}Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="shrink-0 text-[12px] font-medium">{formatPrice(item.total_price)}</div>
                </li>
              ))}
              {(!order.order_items || order.order_items.length === 0) && (
                <li className="px-4 py-3 text-[12px] text-muted">No items recorded.</li>
              )}
            </ul>
          </section>

          <section className="border border-border-soft bg-ink p-4 text-ivory space-y-2">
            <div className="flex justify-between text-[12px] text-ivory/60">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-ivory/60">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="border-t border-ivory/10 pt-2 flex justify-between">
              <span className="text-[12px] uppercase tracking-[0.22em]">Grand Total</span>
              <span className="font-display text-xl italic">{formatPrice(order.total)}</span>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <ClipboardList className="h-3.5 w-3.5" /> Order info
            </div>
            <div className="border border-border-soft bg-cream p-3 text-[12px] text-ink-soft">
              Placed: {date}
              {order.courier && <div className="mt-1">Courier: {order.courier}</div>}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <MessageSquare className="h-3.5 w-3.5" /> Admin notes
            </div>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note about this order…"
              className="w-full resize-none border border-border-soft bg-cream px-3 py-2.5 text-[12px] outline-none focus:border-ink" />
            <button onClick={saveNote} disabled={saving}
              className="mt-2 h-9 bg-ink px-5 text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60">
              {saving ? "Saving…" : "Save note"}
            </button>
          </section>
        </div>

        <div className="border-t border-border-soft px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {order.status === "pending" && (
              <button onClick={() => onStatusUpdate(order.id, "processing")}
                className="h-10 border border-blue-400 bg-blue-50 px-3 text-[10px] uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-400 hover:text-ivory">
                Process
              </button>
            )}
            {order.status === "processing" && (
              <button onClick={() => onStatusUpdate(order.id, "dispatched")}
                className="h-10 border border-ink bg-ivory px-3 text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-ivory">
                Dispatch
              </button>
            )}
            {order.status === "dispatched" && (
              <button onClick={() => onStatusUpdate(order.id, "delivered")}
                className="h-10 border border-sage bg-sage/10 px-3 text-[10px] uppercase tracking-[0.18em] text-sage transition-colors hover:bg-sage hover:text-ivory">
                Mark Delivered
              </button>
            )}
            {(order.status === "pending" || order.status === "processing") && (
              <button onClick={() => onStatusUpdate(order.id, "cancelled")}
                className="h-10 border border-sale/30 bg-sale/5 px-3 text-[10px] uppercase tracking-[0.18em] text-sale transition-colors hover:bg-sale hover:text-ivory">
                Cancel
              </button>
            )}
            <button className="col-span-1 h-10 bg-ink px-3 text-[10px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-dark">
              Print
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
