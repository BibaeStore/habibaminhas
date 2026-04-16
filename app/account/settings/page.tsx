import Link from "next/link";
import { Package, MapPin, CreditCard, Heart, User, LogOut, Bell, Lock, Trash2 } from "lucide-react";

export const metadata = { title: "Account Settings" };

const sidebar = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Settings.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your profile, password, and communication preferences.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="flex flex-row gap-1 overflow-x-auto border border-border-soft bg-ivory p-1 lg:flex-col lg:overflow-visible">
            {sidebar.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 whitespace-nowrap px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-ink-soft transition-colors hover:bg-cream hover:text-ink"
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

          {/* Personal Info */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Personal information</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">First name</span>
                <input defaultValue="Ayesha" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Last name</span>
                <input defaultValue="Khan" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email address</span>
                <input type="email" defaultValue="ayesha@example.com" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Phone number</span>
                <input type="tel" defaultValue="+92 300 1234567" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
            </div>
            <button className="mt-6 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors">
              Save changes
            </button>
          </section>

          {/* Password */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Change password</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2 flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Current password</span>
                <input type="password" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">New password</span>
                <input type="password" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Confirm new password</span>
                <input type="password" className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
            </div>
            <button className="mt-6 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors">
              Update password
            </button>
          </section>

          {/* Notifications */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Notifications</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Order updates", sub: "Shipping, delivery, and return notifications", on: true },
                { label: "New arrivals", sub: "Be first to know when new collections drop", on: true },
                { label: "Exclusive offers", sub: "Flash sales, loyalty rewards, and special events", on: false },
                { label: "Journal & editorial", sub: "New posts from The Habiba Minhas Journal", on: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 border-b border-border-soft pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-[13px] font-medium">{n.label}</div>
                    <div className="text-[12px] text-ink-soft">{n.sub}</div>
                  </div>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${n.on ? "bg-ink" : "bg-border-soft"}`}
                    aria-label={n.label}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${n.on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Danger zone */}
          <section className="border border-sale/20 bg-ivory p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="h-4 w-4 text-sale" />
              <h2 className="font-display text-2xl italic text-sale">Delete account</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="mt-4 h-11 border border-sale px-8 text-[12px] uppercase tracking-[0.28em] text-sale hover:bg-sale hover:text-ivory transition-colors">
              Delete my account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
