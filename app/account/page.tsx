import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export const metadata = { title: "Account" };

const recentOrders = [
  {
    id: "HM-20260412",
    date: "12 Apr 2026",
    status: "Delivered",
    total: 12890,
    items: 3,
  },
  {
    id: "HM-20260328",
    date: "28 Mar 2026",
    status: "In transit",
    total: 5490,
    items: 1,
  },
  {
    id: "HM-20260302",
    date: "02 Mar 2026",
    status: "Delivered",
    total: 8240,
    items: 2,
  },
];

const sidebar = [
  { label: "Overview", href: "/account", icon: User, active: true },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

export default function AccountPage() {
  const saved = products.slice(2, 6);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Your account
      </span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">
        Good morning, Ayesha.
      </h1>
      <p className="mt-2 text-[13px] text-ink-soft">
        Two orders in flight, three pieces on your wishlist.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="flex flex-row gap-1 overflow-x-auto border border-border-soft bg-ivory p-1 lg:flex-col lg:overflow-visible">
            {sidebar.map(({ label, href, icon: Icon, active }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 whitespace-nowrap px-4 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors ${
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button className="mt-auto flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-sale hover:bg-cream">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-9">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Orders", value: "12" },
              { label: "In transit", value: "2" },
              { label: "Wishlist", value: "5" },
              { label: "Points", value: "1,240" },
            ].map((s) => (
              <div key={s.label} className="border border-border-soft bg-cream p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  {s.label}
                </div>
                <div className="mt-2 font-display text-3xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl italic sm:text-3xl">Recent orders</h2>
              <Link href="/account/orders" className="text-[12px] uppercase tracking-[0.24em] text-gold-dark">
                View all
              </Link>
            </div>
            <div className="mt-4 overflow-hidden border border-border-soft">
              <table className="w-full text-left">
                <thead className="bg-cream text-[11px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Items</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft text-[13px]">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/60">
                      <td className="px-4 py-4 font-medium">{o.id}</td>
                      <td className="px-4 py-4 text-ink-soft">{o.date}</td>
                      <td className="px-4 py-4 text-ink-soft">{o.items}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] ${
                            o.status === "Delivered" ? "text-sage" : "text-gold-dark"
                          }`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background:
                                o.status === "Delivered" ? "#8c9b7e" : "#a8804b",
                            }}
                          />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl italic sm:text-3xl">On your wishlist</h2>
              <Link href="/wishlist" className="text-[12px] uppercase tracking-[0.24em] text-gold-dark">
                View all
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {saved.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="block">
                  <PlaceholderImage tone={p.palette} motif="floral" aspect="3/4" />
                  <div className="mt-3 line-clamp-1 text-[12px]">{p.title}</div>
                  <div className="text-[12px] text-ink-soft">{formatPrice(p.price)}</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
