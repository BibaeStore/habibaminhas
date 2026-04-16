import { Search, Filter, Download, Mail, Phone, ChevronRight } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers | Admin" };

const customers = [
  { id: "C-001", name: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", city: "Karachi", orders: 12, spent: 82600, joined: "Jan 2026", status: "VIP" },
  { id: "C-002", name: "Sara Ahmed", email: "sara@example.com", phone: "+92 312 9876543", city: "Lahore", orders: 7, spent: 41300, joined: "Feb 2026", status: "Regular" },
  { id: "C-003", name: "Nadia Mahmood", email: "nadia@example.com", phone: "+92 333 4567890", city: "Islamabad", orders: 5, spent: 28900, joined: "Feb 2026", status: "Regular" },
  { id: "C-004", name: "Fatima Raza", email: "fatima@example.com", phone: "+92 321 1122334", city: "Karachi", orders: 3, spent: 14200, joined: "Mar 2026", status: "New" },
  { id: "C-005", name: "Zara Qureshi", email: "zara@example.com", phone: "+92 300 9988776", city: "Rawalpindi", orders: 9, spent: 58400, joined: "Jan 2026", status: "VIP" },
  { id: "C-006", name: "Mariam Siddiqui", email: "mariam@example.com", phone: "+92 321 5544332", city: "Karachi", orders: 4, spent: 22100, joined: "Mar 2026", status: "Regular" },
  { id: "C-007", name: "Hina Baig", email: "hina@example.com", phone: "+92 333 7766554", city: "Faisalabad", orders: 2, spent: 10800, joined: "Apr 2026", status: "New" },
  { id: "C-008", name: "Sana Khan", email: "sana@example.com", phone: "+92 312 3344556", city: "Multan", orders: 6, spent: 35600, joined: "Feb 2026", status: "Regular" },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  VIP: { bg: "bg-gold/30", text: "text-gold-dark" },
  Regular: { bg: "bg-sage/15", text: "text-sage" },
  New: { bg: "bg-border-soft", text: "text-ink-soft" },
};

export default function AdminCustomersPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Customers" />
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            {[
              { label: "Total customers", value: "341" },
              { label: "VIP customers", value: "28" },
              { label: "New this month", value: "47" },
              { label: "Avg. lifetime value", value: "Rs. 24,200" },
            ].map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{s.label}</div>
                <div className="mt-1.5 font-display text-2xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search by name, email, phone…"
                className="h-9 w-72 border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
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
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Contact</th>
                    <th className="px-5 py-3 font-medium">City</th>
                    <th className="px-5 py-3 font-medium text-right">Orders</th>
                    <th className="px-5 py-3 font-medium text-right">Total spent</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Tier</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {customers.map((c) => {
                    const s = statusStyle[c.status];
                    return (
                      <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-4">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-cream font-display text-[13px] italic text-gold-dark">
                              {c.name[0]}
                            </div>
                            <div>
                              <div className="text-[12px] font-medium">{c.name}</div>
                              <div className="text-[11px] text-muted">{c.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                            <Mail className="h-3 w-3 text-muted" />
                            {c.email}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
                            <Phone className="h-3 w-3 text-muted" />
                            {c.phone}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{c.city}</td>
                        <td className="px-5 py-4 text-right text-[12px]">{c.orders}</td>
                        <td className="px-5 py-4 text-right text-[12px] font-medium">{formatPrice(c.spent)}</td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{c.joined}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            {c.status}
                          </span>
                        </td>
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
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">Showing 1–{customers.length} of 341 customers</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, "..."].map((p, i) => (
                  <button key={i} className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${p === 1 ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"}`}>
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
