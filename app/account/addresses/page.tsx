import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, Plus, Pencil, Trash2 } from "lucide-react";

export const metadata = { title: "My Addresses" };

const sidebar = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin, active: true },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

const addresses = [
  {
    id: 1,
    label: "Home",
    default: true,
    name: "Ayesha Khan",
    line1: "House 14, Street 7, DHA Phase 6",
    city: "Karachi",
    province: "Sindh",
    postal: "75500",
    phone: "+92 300 1234567",
  },
  {
    id: 2,
    label: "Office",
    default: false,
    name: "Ayesha Khan",
    line1: "Suite 302, Dolmen City Mall",
    city: "Karachi",
    province: "Sindh",
    postal: "74200",
    phone: "+92 300 1234567",
  },
];

export default function AddressesPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Saved addresses.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your delivery addresses for faster checkout.</p>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="relative border border-border-soft bg-ivory p-6">
                {a.default && (
                  <span className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.24em] text-gold-dark border border-gold/30 px-2 py-0.5">
                    Default
                  </span>
                )}
                <div className="text-[11px] uppercase tracking-[0.26em] text-muted">{a.label}</div>
                <div className="mt-3 text-[13px] leading-relaxed">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-ink-soft">{a.line1}</div>
                  <div className="text-ink-soft">{a.city}, {a.province} — {a.postal}</div>
                  <div className="mt-1 text-ink-soft">{a.phone}</div>
                </div>
                <div className="mt-5 flex items-center gap-4 border-t border-border-soft pt-4">
                  <button className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] text-ink-soft hover:text-ink">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {!a.default && (
                    <button className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] text-sale hover:text-ink">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                  {!a.default && (
                    <button className="ml-auto text-[12px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add new */}
            <button className="flex min-h-[180px] flex-col items-center justify-center gap-3 border border-dashed border-border-soft bg-ivory text-ink-soft hover:border-gold-dark hover:text-gold-dark transition-colors">
              <Plus className="h-6 w-6" />
              <span className="text-[12px] uppercase tracking-[0.26em]">Add new address</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
