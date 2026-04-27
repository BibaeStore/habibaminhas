"use client";

import Link from "next/link";
import { ChevronRight, Bell, Lock, Trash2, User } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Settings</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Settings.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your profile, password, and communication preferences.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-8">

          {/* Personal info */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Personal information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "First name",    type: "text",     value: "" },
                { label: "Last name",     type: "text",     value: "" },
                { label: "Email address", type: "email",    value: "" },
                { label: "Phone number",  type: "tel",      value: "" },
              ].map((f) => (
                <label key={f.label} className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">{f.label}</span>
                  <input
                    type={f.type}
                    defaultValue={f.value}
                    className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
            >
              Save changes
            </button>
          </section>

          {/* Password */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Change password</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Current password</span>
                <input type="password" className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">New password</span>
                <input type="password" className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Confirm password</span>
                <input type="password" className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory" />
              </label>
            </div>
            <button
              type="button"
              className="mt-6 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
            >
              Update password
            </button>
          </section>

          {/* Notifications */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Notifications</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Order updates",     sub: "Shipping, delivery, and return notifications",        on: true  },
                { label: "New arrivals",       sub: "Be first to know when new collections drop",          on: true  },
                { label: "Exclusive offers",   sub: "Flash sales, loyalty rewards, and special events",    on: false },
                { label: "Journal",            sub: "New posts from The Habiba Minhas Journal",            on: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 border-b border-border-soft pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-[13px] font-medium">{n.label}</div>
                    <div className="text-[12px] text-ink-soft">{n.sub}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={n.label}
                    className={`relative h-6 w-11 rounded-full transition-colors ${n.on ? "bg-ink" : "bg-border-soft"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${n.on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Danger zone */}
          <section className="border border-sale/20 bg-ivory p-6">
            <div className="mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-sale" />
              <h2 className="font-display text-2xl italic text-sale">Delete account</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="mt-4 h-11 border border-sale px-8 text-[12px] uppercase tracking-[0.28em] text-sale transition-colors hover:bg-sale hover:text-ivory"
            >
              Delete my account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
