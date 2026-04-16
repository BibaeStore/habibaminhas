"use client";

import { useState, useMemo } from "react";
import {
  Search, Download, X, Truck, CreditCard, Package,
  ChevronLeft, ChevronRight, MapPin, Phone, Mail,
  ClipboardList, MessageSquare,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatPrice } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Order = {
  id: string; tracking: string; customer: string; email: string;
  phone: string; city: string; address: string;
  items: { name: string; qty: number; size: string; price: number }[];
  total: number; status: string; paymentMethod: string; paymentStatus: string;
  date: string; adminNote: string;
};

const orders: Order[] = [
  {
    id: "HM-20260416", tracking: "TCS-4821763", customer: "Ayesha Khan",
    email: "ayesha@example.com", phone: "+92 300 1234567",
    city: "Karachi", address: "House 14, Block B, Gulshan-e-Iqbal, Karachi",
    items: [
      { name: "Rosewood Elegance 3-Piece Formal Suit", qty: 1, size: "M", price: 6000 },
      { name: "Sunset Bloom Girls Festive Co-Ord Set", qty: 1, size: "6Y", price: 6000 },
      { name: "Midnight Onyx Silk Headband Set", qty: 1, size: "OS", price: 500 },
    ],
    total: 12890, status: "Processing", paymentMethod: "COD", paymentStatus: "Pending",
    date: "16 Apr 2026, 2:14 PM", adminNote: "",
  },
  {
    id: "HM-20260415", tracking: "TCS-4821610", customer: "Sara Ahmed",
    email: "sara@example.com", phone: "+92 312 9876543",
    city: "Lahore", address: "Flat 3B, DHA Phase 5, Lahore",
    items: [
      { name: "Indigo Radiance 3-Piece Stitched Silk Suit with Gold Brocade Trim", qty: 1, size: "L", price: 5000 },
    ],
    total: 5490, status: "Dispatched", paymentMethod: "JazzCash", paymentStatus: "Verified",
    date: "15 Apr 2026, 11:32 AM", adminNote: "Customer requested express delivery.",
  },
  {
    id: "HM-20260415B", tracking: "TCS-4821589", customer: "Nadia Mahmood",
    email: "nadia@example.com", phone: "+92 333 4567890",
    city: "Islamabad", address: "Street 22, F-7/2, Islamabad",
    items: [
      { name: "Pastel Dream Deluxe 10-Piece Plush Bumper Set", qty: 1, size: "OS", price: 9000 },
      { name: "Sandstone Gingham 5-Piece Crib Bedding Set", qty: 1, size: "OS", price: 6900 },
    ],
    total: 8240, status: "Delivered", paymentMethod: "COD", paymentStatus: "Collected",
    date: "15 Apr 2026, 9:05 AM", adminNote: "",
  },
  {
    id: "HM-20260414", tracking: "TCS-4821401", customer: "Fatima Raza",
    email: "fatima@example.com", phone: "+92 321 1122334",
    city: "Karachi", address: "Plot 88, Sector 11-C, North Karachi",
    items: [
      { name: "Sweet Hearts Padded Baby Nest & Lounger Pod", qty: 1, size: "OS", price: 5500 },
    ],
    total: 3200, status: "Delivered", paymentMethod: "Easypaisa", paymentStatus: "Verified",
    date: "14 Apr 2026, 4:48 PM", adminNote: "",
  },
  {
    id: "HM-20260413", tracking: "TCS-4821299", customer: "Zara Qureshi",
    email: "zara@example.com", phone: "+92 300 9988776",
    city: "Rawalpindi", address: "House 7, Satellite Town, Rawalpindi",
    items: [
      { name: "Rosewood Elegance 3-Piece Formal Suit", qty: 1, size: "XS", price: 6000 },
      { name: "Royal Amethyst Kids Two-Tone Embroidered Gown", qty: 1, size: "8Y", price: 3000 },
      { name: "Coral Stripe 6-Piece Nursery Bedding Set", qty: 1, size: "OS", price: 8500 },
      { name: "Midnight Onyx Silk Headband Set", qty: 2, size: "OS", price: 500 },
    ],
    total: 18600, status: "Processing", paymentMethod: "COD", paymentStatus: "Pending",
    date: "13 Apr 2026, 1:22 PM", adminNote: "",
  },
  {
    id: "HM-20260412", tracking: "TCS-4821188", customer: "Mariam Siddiqui",
    email: "mariam@example.com", phone: "+92 321 5544332",
    city: "Karachi", address: "Apartment 12, Clifton Block 4, Karachi",
    items: [
      { name: "Pearl Radiance 3-Piece Stitched Silk Suit with Mirror-Work", qty: 1, size: "M", price: 5000 },
      { name: "Golden Amber 3-Piece Stitched Silk Suit", qty: 1, size: "S", price: 5000 },
    ],
    total: 9800, status: "Delivered", paymentMethod: "Visa •8821", paymentStatus: "Verified",
    date: "12 Apr 2026, 10:15 AM", adminNote: "VIP customer — priority handling.",
  },
  {
    id: "HM-20260411", tracking: "TCS-4821066", customer: "Hina Baig",
    email: "hina@example.com", phone: "+92 333 7766554",
    city: "Faisalabad", address: "Mohallah Islampur, Faisalabad",
    items: [
      { name: "Bronze Mocha 3-Piece Stitched Silk Suit with Sequin Artistry", qty: 1, size: "L", price: 5000 },
    ],
    total: 6000, status: "Cancelled", paymentMethod: "COD", paymentStatus: "N/A",
    date: "11 Apr 2026, 3:30 PM", adminNote: "Customer cancelled before dispatch.",
  },
  {
    id: "HM-20260410", tracking: "TCS-4820944", customer: "Sana Khan",
    email: "sana@example.com", phone: "+92 312 3344556",
    city: "Multan", address: "Street 5, Cantt, Multan",
    items: [
      { name: "Indigo Radiance 3-Piece Stitched Silk Suit", qty: 1, size: "XL", price: 5000 },
      { name: "Dino-Roar Circular Baby Nest & Lounger Pod", qty: 1, size: "OS", price: 6000 },
      { name: "Butterfly Meadow 4-Piece Baby Nest & Pillow Set", qty: 1, size: "OS", price: 5500 },
    ],
    total: 15200, status: "Delivered", paymentMethod: "JazzCash", paymentStatus: "Verified",
    date: "10 Apr 2026, 12:00 PM", adminNote: "",
  },
];

const STATUS_TABS = ["All", "Pending", "Processing", "Dispatched", "Delivered", "Cancelled"];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:    { bg: "bg-cream",    text: "text-ink-soft",  dot: "#a0a0a0" },
  Processing: { bg: "bg-gold/20",  text: "text-gold-dark", dot: "#a8804b" },
  Dispatched: { bg: "bg-blue-50",  text: "text-blue-600",  dot: "#2563eb" },
  Delivered:  { bg: "bg-sage/15",  text: "text-sage",      dot: "#8c9b7e" },
  Cancelled:  { bg: "bg-sale/10",  text: "text-sale",      dot: "#9c3b2f" },
};

const paymentStatusStyle: Record<string, { bg: string; text: string }> = {
  Pending:    { bg: "bg-gold/15",   text: "text-gold-dark" },
  Verified:   { bg: "bg-sage/15",   text: "text-sage" },
  Collected:  { bg: "bg-sage/15",   text: "text-sage" },
  Rejected:   { bg: "bg-sale/10",   text: "text-sale" },
  "N/A":      { bg: "bg-cream",     text: "text-muted" },
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab]   = useState("All");
  const [search,    setSearch]      = useState("");
  const [selected,  setSelected]    = useState<Order | null>(null);
  const [page,      setPage]        = useState(1);

  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== "All" && o.status !== activeTab) return false;
      if (search && !o.id.toLowerCase().includes(search.toLowerCase()) &&
          !o.customer.toLowerCase().includes(search.toLowerCase()) &&
          !o.tracking.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabCount = (t: string) =>
    t === "All" ? orders.length : orders.filter((o) => o.status === t).length;

  return (
    <AdminShell title="Orders">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Page header */}
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
              <button
                key={t}
                onClick={() => { setActiveTab(t); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  activeTab === t ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                {t}
                <span className={`text-[10px] ${activeTab === t ? "text-ivory/60" : "text-muted"}`}>
                  {tabCount(t)}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search order ID, tracking #, customer…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full sm:w-80 border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink"
              />
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
                  {paginated.map((o) => {
                    const s  = statusStyle[o.status]        ?? statusStyle.Pending;
                    const ps = paymentStatusStyle[o.paymentStatus] ?? paymentStatusStyle["N/A"];
                    return (
                      <tr key={o.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[12px] font-medium text-ink">{o.id}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted">{o.tracking}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[12px] font-medium">{o.customer}</div>
                          <div className="text-[11px] text-muted">{o.city}</div>
                        </td>
                        <td className="px-4 py-4 text-[12px] text-ink-soft">{o.date}</td>
                        <td className="px-4 py-4 text-center text-[12px] text-ink-soft">{o.items.length}</td>
                        <td className="px-4 py-4">
                          <span className="border border-border-soft bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${ps.bg} ${ps.text}`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-[12px] font-medium">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelected(o)}
                            className="text-[11px] uppercase tracking-[0.18em] text-gold-dark transition-colors hover:text-ink whitespace-nowrap"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center text-[12px] text-muted">
                        No orders match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft transition-colors hover:bg-cream disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${
                      n === safePage ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft transition-colors hover:bg-cream disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Order Detail Panel */}
      {selected && (
        <OrderDetailPanel order={selected} onClose={() => setSelected(null)} />
      )}
    </AdminShell>
  );
}

// ─── Order Detail Slide-in Panel ──────────────────────────────────────────────

function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const [note, setNote] = useState(order.adminNote);
  const s  = statusStyle[order.status]              ?? statusStyle.Pending;
  const ps = paymentStatusStyle[order.paymentStatus] ?? paymentStatusStyle["N/A"];
  const subtotal  = order.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shipping  = 200;
  const grandTotal = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ink/40" onClick={onClose} />

      {/* Panel */}
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col bg-ivory shadow-2xl md:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl italic">{order.id}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                {order.status}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{order.tracking}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Customer */}
          <section>
            <div className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted">Customer</div>
            <div className="border border-border-soft bg-cream p-4 space-y-2">
              <div className="text-[13px] font-medium">{order.customer}</div>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Mail className="h-3.5 w-3.5 text-muted" /> {order.email}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Phone className="h-3.5 w-3.5 text-muted" /> {order.phone}
              </div>
              <div className="flex items-start gap-2 text-[12px] text-ink-soft">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted mt-0.5" />
                <span>{order.address}</span>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <div className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted">Payment</div>
            <div className="border border-border-soft bg-cream p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted" />
                  <span className="text-[12px] font-medium">{order.paymentMethod}</span>
                </div>
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${ps.bg} ${ps.text}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </section>

          {/* Order items */}
          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <Package className="h-3.5 w-3.5" /> Items ({order.items.length})
            </div>
            <ul className="divide-y divide-border-soft border border-border-soft bg-cream">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-2 text-[12px] font-medium leading-snug">{item.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      Size: {item.size} · Qty: {item.qty}
                    </div>
                  </div>
                  <div className="shrink-0 text-[12px] font-medium">{formatPrice(item.price * item.qty)}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Summary */}
          <section className="border border-border-soft bg-ink p-4 text-ivory space-y-2">
            <div className="flex justify-between text-[12px] text-ivory/60">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-ivory/60">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-ivory/10 pt-2 flex justify-between">
              <span className="text-[12px] uppercase tracking-[0.22em]">Grand Total</span>
              <span className="font-display text-xl italic">{formatPrice(grandTotal)}</span>
            </div>
          </section>

          {/* Status history */}
          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <ClipboardList className="h-3.5 w-3.5" /> Status history
            </div>
            <ul className="space-y-2">
              {[
                { status: order.status, time: order.date, note: "Current status" },
                { status: "Order placed", time: order.date, note: "Customer placed the order" },
              ].map((h, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-2.5 w-2.5 rounded-full border-2 ${i === 0 ? "border-gold-dark bg-gold-dark" : "border-border-soft bg-cream"}`} />
                    {i < 1 && <div className="w-px flex-1 bg-border-soft" />}
                  </div>
                  <div className="pb-3">
                    <div className="text-[12px] font-medium">{h.status}</div>
                    <div className="text-[11px] text-muted">{h.time} · {h.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Admin notes */}
          <section>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted">
              <MessageSquare className="h-3.5 w-3.5" /> Admin notes
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note about this order…"
              className="w-full resize-none border border-border-soft bg-cream px-3 py-2.5 text-[12px] outline-none focus:border-ink"
            />
            <button className="mt-2 h-9 bg-ink px-5 text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-gold-dark">
              Save note
            </button>
          </section>
        </div>

        {/* Action footer */}
        <div className="border-t border-border-soft px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {order.status === "Processing" && (
              <button className="h-10 border border-ink bg-ivory px-3 text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-ivory">
                Dispatch
              </button>
            )}
            {order.status === "Dispatched" && (
              <button className="h-10 border border-sage bg-sage/10 px-3 text-[10px] uppercase tracking-[0.18em] text-sage transition-colors hover:bg-sage hover:text-ivory">
                Mark Delivered
              </button>
            )}
            {(order.status === "Pending" || order.status === "Processing") && (
              <button className="h-10 border border-sale/30 bg-sale/5 px-3 text-[10px] uppercase tracking-[0.18em] text-sale transition-colors hover:bg-sale hover:text-ivory">
                Cancel
              </button>
            )}
            <button className="h-10 bg-ink px-3 text-[10px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-dark col-span-1">
              Edit order
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
