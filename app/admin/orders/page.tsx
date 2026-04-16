import Link from "next/link";
import { ChevronRight, Download, Filter, Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders | Admin" };

const orders = [
  { id: "HM-20260416", customer: "Ayesha Khan", phone: "+92 300 1234567", city: "Karachi", items: 3, total: 12890, status: "Processing", payment: "Visa •4242", date: "16 Apr 2026, 2:14 PM" },
  { id: "HM-20260415", customer: "Sara Ahmed", phone: "+92 312 9876543", city: "Lahore", items: 1, total: 5490, status: "Dispatched", payment: "JazzCash", date: "15 Apr 2026, 11:32 AM" },
  { id: "HM-20260415", customer: "Nadia Mahmood", phone: "+92 333 4567890", city: "Islamabad", items: 2, total: 8240, status: "Delivered", payment: "COD", date: "15 Apr 2026, 9:05 AM" },
  { id: "HM-20260414", customer: "Fatima Raza", phone: "+92 321 1122334", city: "Karachi", items: 1, total: 3200, status: "Delivered", payment: "Easypaisa", date: "14 Apr 2026, 4:48 PM" },
  { id: "HM-20260413", customer: "Zara Qureshi", phone: "+92 300 9988776", city: "Rawalpindi", items: 4, total: 18600, status: "Processing", payment: "COD", date: "13 Apr 2026, 1:22 PM" },
  { id: "HM-20260412", customer: "Mariam Siddiqui", phone: "+92 321 5544332", city: "Karachi", items: 2, total: 9800, status: "Delivered", payment: "Visa •8821", date: "12 Apr 2026, 10:15 AM" },
  { id: "HM-20260411", customer: "Hina Baig", phone: "+92 333 7766554", city: "Faisalabad", items: 1, total: 6000, status: "Cancelled", payment: "COD", date: "11 Apr 2026, 3:30 PM" },
  { id: "HM-20260410", customer: "Sana Khan", phone: "+92 312 3344556", city: "Multan", items: 3, total: 15200, status: "Delivered", payment: "JazzCash", date: "10 Apr 2026, 12:00 PM" },
];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Processing: { bg: "bg-gold/20", text: "text-gold-dark", dot: "#a8804b" },
  Dispatched: { bg: "bg-blue-50", text: "text-blue-600", dot: "#2563eb" },
  Delivered: { bg: "bg-sage/15", text: "text-sage", dot: "#8c9b7e" },
  Cancelled: { bg: "bg-sale/10", text: "text-sale", dot: "#9c3b2f" },
};

const tabCounts = {
  All: orders.length,
  Processing: orders.filter(o => o.status === "Processing").length,
  Dispatched: orders.filter(o => o.status === "Dispatched").length,
  Delivered: orders.filter(o => o.status === "Delivered").length,
  Cancelled: orders.filter(o => o.status === "Cancelled").length,
};

export default function AdminOrdersPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Orders" />
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Status tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border-soft pb-4">
            {Object.entries(tabCounts).map(([label, count]) => (
              <button
                key={label}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  label === "All"
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                {label}
                <span className={`ml-2 text-[10px] ${label === "All" ? "text-ivory/60" : "text-muted"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search order ID or customer…"
                className="h-9 w-72 border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                    </th>
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {orders.map((o, i) => {
                    const s = statusStyle[o.status];
                    return (
                      <tr key={i} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-4">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-5 py-4 text-[12px] font-medium text-ink">{o.id}</td>
                        <td className="px-5 py-4">
                          <div className="text-[12px] font-medium">{o.customer}</div>
                          <div className="text-[11px] text-muted">{o.city} · {o.phone}</div>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{o.date}</td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{o.items}</td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{o.payment}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-[12px] font-medium">{formatPrice(o.total)}</td>
                        <td className="px-5 py-4">
                          <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-gold-dark hover:text-ink transition-colors whitespace-nowrap">
                            View <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">Showing 1–{orders.length} of {orders.length} orders</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${
                      p === 1 ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
