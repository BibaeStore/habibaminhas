import Link from "next/link";
import { ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";

export const metadata = { title: "My Addresses" };

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

      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Addresses</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Saved addresses.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your delivery addresses for faster checkout.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <AccountSidebar />
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
