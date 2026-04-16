import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, Plus, Trash2, ShieldCheck } from "lucide-react";

export const metadata = { title: "Payment Methods" };

const sidebar = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard, active: true },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

const methods = [
  { id: 1, type: "Visa", last4: "4242", expiry: "09/28", default: true },
  { id: 2, type: "Mastercard", last4: "8821", expiry: "03/27", default: false },
];

const wallets = [
  { label: "JazzCash", connected: true, number: "0312 0295812" },
  { label: "Easypaisa", connected: false, number: "" },
];

export default function PaymentsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Payment methods.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your saved cards and digital wallets.</p>

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

        <div className="lg:col-span-9 flex flex-col gap-8">
          {/* Cards */}
          <section>
            <h2 className="font-display text-2xl italic">Saved cards</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {methods.map((m) => (
                <div key={m.id} className="relative border border-border-soft bg-ivory p-5">
                  {m.default && (
                    <span className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.24em] text-gold-dark border border-gold/30 px-2 py-0.5">
                      Default
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 items-center justify-center border border-border-soft bg-cream text-[11px] uppercase tracking-[0.18em] text-muted">
                      {m.type}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">•••• •••• •••• {m.last4}</div>
                      <div className="text-[12px] text-ink-soft">Expires {m.expiry}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 border-t border-border-soft pt-4">
                    {!m.default && (
                      <button className="text-[12px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">
                        Set as default
                      </button>
                    )}
                    <button className="ml-auto flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] text-sale hover:text-ink">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button className="flex min-h-[120px] flex-col items-center justify-center gap-2 border border-dashed border-border-soft bg-ivory text-ink-soft hover:border-gold-dark hover:text-gold-dark transition-colors">
                <Plus className="h-5 w-5" />
                <span className="text-[12px] uppercase tracking-[0.26em]">Add card</span>
              </button>
            </div>
          </section>

          {/* Wallets */}
          <section>
            <h2 className="font-display text-2xl italic">Digital wallets</h2>
            <div className="mt-4 flex flex-col gap-3">
              {wallets.map((w) => (
                <div key={w.label} className="flex items-center justify-between border border-border-soft bg-ivory p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-14 items-center justify-center border border-border-soft bg-cream text-[11px] font-medium text-ink-soft">
                      {w.label}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{w.label}</div>
                      {w.connected
                        ? <div className="text-[12px] text-ink-soft">{w.number}</div>
                        : <div className="text-[12px] text-muted">Not connected</div>
                      }
                    </div>
                  </div>
                  {w.connected ? (
                    <button className="text-[12px] uppercase tracking-[0.22em] text-sale hover:text-ink">Disconnect</button>
                  ) : (
                    <button className="text-[12px] uppercase tracking-[0.22em] text-gold-dark hover:text-ink">Connect</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Cash on Delivery */}
          <section className="flex items-start gap-4 border border-border-soft bg-cream p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-gold-dark shrink-0" />
            <div>
              <div className="text-[13px] font-medium">Cash on Delivery available</div>
              <div className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                Pay when your order arrives at your door. Available for all orders across Pakistan. Select at checkout.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
