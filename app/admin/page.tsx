import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package,
  AlertTriangle, ChevronRight, ArrowUpRight,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard | Admin" };

const stats = [
  { label: "Revenue (Apr)", value: "Rs. 4,82,600", change: "+18.4%", up: true, sub: "vs last month" },
  { label: "Orders", value: "94", change: "+12.2%", up: true, sub: "this month" },
  { label: "Avg. order value", value: "Rs. 5,134", change: "+5.1%", up: true, sub: "vs last month" },
  { label: "Customers", value: "341", change: "+9.3%", up: true, sub: "total registered" },
];

const recentOrders = [
  { id: "HM-20260416", customer: "Ayesha Khan", city: "Karachi", items: 3, total: 12890, status: "Processing", time: "2 min ago" },
  { id: "HM-20260415", customer: "Sara Ahmed", city: "Lahore", items: 1, total: 5490, status: "Dispatched", time: "1 hr ago" },
  { id: "HM-20260415", customer: "Nadia Mahmood", city: "Islamabad", items: 2, total: 8240, status: "Delivered", time: "3 hr ago" },
  { id: "HM-20260414", customer: "Fatima Raza", city: "Karachi", items: 1, total: 3200, status: "Delivered", time: "Yesterday" },
  { id: "HM-20260413", customer: "Zara Qureshi", city: "Rawalpindi", items: 4, total: 18600, status: "Processing", time: "Yesterday" },
];

const lowStock = products.slice(0, 4).map((p, i) => ({ ...p, stock: [2, 1, 3, 0][i] }));

const topProducts = products.slice(0, 5).map((p, i) => ({
  ...p,
  sold: [48, 39, 31, 27, 22][i],
  revenue: [p.price * 48, p.price * 39, p.price * 31, p.price * 27, p.price * 22][i],
}));

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Processing: { bg: "bg-gold/30", text: "text-gold-dark", dot: "#a8804b" },
  Dispatched: { bg: "bg-blue-50", text: "text-blue-700", dot: "#2563eb" },
  Delivered: { bg: "bg-sage/20", text: "text-sage", dot: "#8c9b7e" },
  Cancelled: { bg: "bg-sale/10", text: "text-sale", dot: "#9c3b2f" },
};

export default function AdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Dashboard" />
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{s.label}</div>
                <div className="mt-2 font-display text-2xl italic text-ink">{s.value}</div>
                <div className={`mt-2 flex items-center gap-1 text-[12px] ${s.up ? "text-sage" : "text-sale"}`}>
                  {s.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  <span>{s.change}</span>
                  <span className="text-muted">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Recent orders */}
            <section className="lg:col-span-8 border border-border-soft bg-ivory">
              <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
                <h2 className="font-display text-xl italic">Recent orders</h2>
                <Link href="/admin/orders" className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Order</th>
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 font-medium">Items</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {recentOrders.map((o, i) => {
                      const s = statusStyle[o.status];
                      return (
                        <tr key={i} className="hover:bg-cream/50 transition-colors">
                          <td className="px-5 py-3.5 text-[12px] font-medium text-ink">{o.id}</td>
                          <td className="px-5 py-3.5">
                            <div className="text-[12px] font-medium">{o.customer}</div>
                            <div className="text-[11px] text-muted">{o.city} · {o.time}</div>
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-ink-soft">{o.items}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-[12px] font-medium">{formatPrice(o.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Low stock alert */}
              <section className="border border-border-soft bg-ivory">
                <div className="flex items-center gap-2 border-b border-border-soft px-5 py-4">
                  <AlertTriangle className="h-4 w-4 text-gold-dark" />
                  <h2 className="font-display text-xl italic">Low stock</h2>
                </div>
                <ul className="divide-y divide-border-soft">
                  {lowStock.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-cream">
                        {p.image ? (
                          <Image src={p.image} alt={p.title} fill sizes="32px" className="object-cover object-top" />
                        ) : (
                          <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-[12px] font-medium">{p.title.split("—")[0].trim()}</div>
                        <div className={`text-[11px] ${p.stock === 0 ? "text-sale font-medium" : "text-gold-dark"}`}>
                          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border-soft px-5 py-3">
                  <Link href="/admin/products" className="text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                    Manage inventory →
                  </Link>
                </div>
              </section>

              {/* Quick actions */}
              <section className="border border-border-soft bg-ivory p-5">
                <h2 className="font-display text-xl italic mb-4">Quick actions</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Add new product", href: "/admin/products/new" },
                    { label: "Process pending orders", href: "/admin/orders?status=processing" },
                    { label: "View customer messages", href: "/admin/customers" },
                    { label: "Update shipping rates", href: "/admin/settings" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="flex items-center justify-between border border-border-soft px-4 py-2.5 text-[12px] text-ink-soft hover:bg-cream hover:text-ink transition-colors"
                    >
                      {a.label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Top products */}
          <section className="mt-6 border border-border-soft bg-ivory">
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <h2 className="font-display text-xl italic">Top selling products</h2>
              <Link href="/admin/products" className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium text-right">Units sold</th>
                    <th className="px-5 py-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {topProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-cream">
                            {p.image ? (
                              <Image src={p.image} alt={p.title} fill sizes="32px" className="object-cover object-top" />
                            ) : (
                              <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                            )}
                          </div>
                          <span className="text-[12px] font-medium line-clamp-1">{p.title.split("—")[0].trim()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-ink-soft">{p.category}</td>
                      <td className="px-5 py-3.5 text-right text-[12px]">{p.sold}</td>
                      <td className="px-5 py-3.5 text-right text-[12px] font-medium">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
