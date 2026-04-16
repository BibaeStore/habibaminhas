"use client";

import { useState, useEffect } from "react";
import {
  Store, Truck, CreditCard, Bell, Shield, Globe,
  Check, Eye, EyeOff, Upload, Save,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSettings, updateSettings } from "@/lib/actions/settings";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "store" | "shipping" | "payment" | "notifications" | "security" | "seo";

const SECTIONS: { id: Section; icon: typeof Store; label: string }[] = [
  { id: "store",         icon: Store,      label: "Store information" },
  { id: "shipping",      icon: Truck,      label: "Shipping & delivery" },
  { id: "payment",       icon: CreditCard, label: "Payment methods" },
  { id: "notifications", icon: Bell,       label: "Notifications" },
  { id: "security",      icon: Shield,     label: "Security" },
  { id: "seo",           icon: Globe,      label: "SEO & metadata" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function SaveBar({ label = "Save changes", onSave }: { label?: string; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <button
      onClick={handle}
      className={`mt-5 flex h-11 items-center gap-2 px-8 text-[12px] uppercase tracking-[0.26em] transition-all ${
        saved ? "bg-sage text-ivory" : "bg-ink text-ivory hover:bg-gold-dark"
      }`}
    >
      {saved ? <><Check className="h-3.5 w-3.5" /> Saved!</> : <><Save className="h-3.5 w-3.5" /> {label}</>}
    </button>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between border border-border-soft bg-cream p-4">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {sub && <div className="text-[12px] text-ink-soft mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 transition-colors ${checked ? "bg-ink" : "bg-border-soft"}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-1 h-4 w-4 bg-ivory transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [active, setActive] = useState<Section>("store");

  // ── Store info state ──
  const [store, setStore] = useState({
    name: "Habiba Minhas", email: "info@habibaminhas.com",
    phone: "+92 312 0295812", city: "Karachi, Pakistan",
    desc: "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan.",
    currency: "PKR", timezone: "Asia/Karachi",
  });

  // ── Load from Supabase on mount ──
  useEffect(() => {
    getSettings().then((s) => {
      setStore({
        name: s.store_name,
        email: s.store_email,
        phone: s.store_phone,
        city: s.store_city,
        desc: s.description ?? "",
        currency: s.currency,
        timezone: s.timezone,
      });
      const sr = s.shipping_rates as Record<string, unknown> | null;
      if (sr) {
        setShipping({
          standard: String(sr.standard ?? "200"),
          express: String(sr.express ?? "500"),
          freeThreshold: String(sr.freeThreshold ?? "3500"),
          carrier: String(sr.carrier ?? "TCS"),
          estimatedStd: String(sr.estimatedStd ?? "3–5"),
          estimatedExp: String(sr.estimatedExp ?? "1–2"),
          codEnabled: Boolean(sr.codEnabled ?? true),
        });
      }
      const pm = s.payment_methods as Record<string, unknown> | null;
      if (pm) {
        setPayment((p) => ({
          ...p,
          cod: Boolean(pm.cod ?? true),
          jazzcash: Boolean(pm.jazzcash ?? true),
          easypaisa: Boolean(pm.easypaisa ?? true),
          bankTransfer: Boolean(pm.bankTransfer ?? false),
          bankName: String(pm.bankName ?? p.bankName),
          accountTitle: String(pm.accountTitle ?? p.accountTitle),
          accountNo: String(pm.accountNo ?? p.accountNo),
          iban: String(pm.iban ?? p.iban),
        }));
      }
      const ns = s.notification_settings as Record<string, unknown> | null;
      if (ns) {
        setNotif({
          newOrder: Boolean(ns.newOrder ?? true),
          orderShipped: Boolean(ns.orderShipped ?? true),
          orderDelivered: Boolean(ns.orderDelivered ?? false),
          lowStock: Boolean(ns.lowStock ?? true),
          newCustomer: Boolean(ns.newCustomer ?? false),
          payment: Boolean(ns.payment ?? true),
          dailySummary: Boolean(ns.dailySummary ?? true),
          weeklySummary: Boolean(ns.weeklySummary ?? false),
        });
      }
      const ss = s.seo_settings as Record<string, unknown> | null;
      if (ss) {
        setSeo((prev) => ({
          ...prev,
          siteTitle: String(ss.siteTitle ?? prev.siteTitle),
          metaDesc: String(ss.metaDesc ?? prev.metaDesc),
          ogTitle: String(ss.ogTitle ?? prev.ogTitle),
          ogDesc: String(ss.ogDesc ?? prev.ogDesc),
          ga4: String(ss.ga4 ?? prev.ga4),
          fbPixel: String(ss.fbPixel ?? prev.fbPixel),
          robotsTxt: Boolean(ss.robotsTxt ?? prev.robotsTxt),
          sitemap: Boolean(ss.sitemap ?? prev.sitemap),
          structuredData: Boolean(ss.structuredData ?? prev.structuredData),
        }));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shipping state ──
  const [shipping, setShipping] = useState({
    standard: "200", express: "500", freeThreshold: "3500",
    carrier: "TCS", estimatedStd: "3–5", estimatedExp: "1–2",
    codEnabled: true,
  });

  // ── Payment methods state ──
  const [payment, setPayment] = useState({
    cod: true, jazzcash: true, easypaisa: true, bankTransfer: true,
    bankName: "Meezan Bank", accountTitle: "Habiba Minhas", accountNo: "0144-0123456789",
    iban: "PK36MEZN0000144012345679",
  });

  // ── Notifications state ──
  const [notif, setNotif] = useState({
    newOrder: true, orderShipped: true, orderDelivered: false,
    lowStock: true, newCustomer: false, payment: true,
    dailySummary: true, weeklySummary: false,
  });

  // ── Security state ──
  const [sec, setSec] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  // ── SEO state ──
  const [seo, setSeo] = useState({
    siteTitle: "Habiba Minhas — Luxury Boutique Pakistan",
    metaDesc: "Premium ladies suits, kids festive wear, baby bedding, and handcrafted accessories — made with love in Pakistan.",
    ogTitle: "Habiba Minhas", ogDesc: "Shop handcrafted fashion & nursery essentials.",
    robotsTxt: true, sitemap: true, structuredData: true,
    ga4: "", fbPixel: "",
  });

  return (
    <AdminShell title="Settings">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Nav */}
            <aside className="lg:col-span-3">
              <nav className="flex flex-col gap-0.5 border border-border-soft bg-ivory p-1 sticky top-0">
                {SECTIONS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left text-[12px] uppercase tracking-[0.2em] transition-colors ${
                      active === id ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 flex flex-col gap-6">

              {/* ── STORE INFORMATION ── */}
              {active === "store" && (
                <>
                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Store className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-2xl italic">Store information</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Store name">
                        <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="Store email">
                        <input type="email" value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="WhatsApp / Phone">
                        <input type="tel" value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="City">
                        <input value={store.city} onChange={(e) => setStore({ ...store, city: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="Currency">
                        <select value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink">
                          <option value="PKR">PKR — Pakistani Rupee</option>
                          <option value="USD">USD — US Dollar</option>
                          <option value="AED">AED — UAE Dirham</option>
                        </select>
                      </Field>
                      <Field label="Timezone">
                        <select value={store.timezone} onChange={(e) => setStore({ ...store, timezone: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink">
                          <option value="Asia/Karachi">Asia/Karachi (PKT +05:00)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                          <option value="Europe/London">Europe/London (GMT +00:00)</option>
                        </select>
                      </Field>
                      <Field label="Store description">
                        <textarea rows={3} value={store.desc} onChange={(e) => setStore({ ...store, desc: e.target.value })}
                          className="sm:col-span-2 border border-border-soft bg-cream px-3 py-2.5 text-[14px] outline-none focus:border-ink resize-none" />
                      </Field>
                    </div>
                    <SaveBar onSave={() => updateSettings({ store_name: store.name, store_email: store.email, store_phone: store.phone, store_city: store.city, description: store.desc, currency: store.currency, timezone: store.timezone }).catch(() => {})} />
                  </section>

                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-xl italic">Store logo & branding</h2>
                    </div>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border-soft bg-cream p-8 transition-colors hover:border-ink/30">
                      <Upload className="h-6 w-6 text-muted" />
                      <span className="text-[12px] text-ink-soft">Upload logo</span>
                      <span className="text-[11px] text-muted">SVG, PNG, WebP · max 2 MB</span>
                      <input type="file" accept="image/*" className="sr-only" />
                    </label>
                  </section>
                </>
              )}

              {/* ── SHIPPING ── */}
              {active === "shipping" && (
                <section className="border border-border-soft bg-ivory p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gold-dark" />
                    <h2 className="font-display text-2xl italic">Shipping & delivery</h2>
                  </div>

                  <div className="mb-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted mb-3">Courier partner</div>
                    <div className="flex gap-2">
                      {["TCS", "Leopard", "Trax", "M&P"].map((c) => (
                        <button key={c} onClick={() => setShipping({ ...shipping, carrier: c })}
                          className={`h-9 px-4 border text-[12px] uppercase tracking-[0.18em] transition-colors ${shipping.carrier === c ? "border-ink bg-ink text-ivory" : "border-border-soft text-ink-soft hover:bg-cream"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-5">
                    {[
                      { key: "standard" as const, label: "Standard delivery", sub: `${shipping.estimatedStd} business days`, prefix: "Rs." },
                      { key: "express"  as const, label: "Express delivery",  sub: `${shipping.estimatedExp} business days · major cities only`, prefix: "Rs." },
                      { key: "freeThreshold" as const, label: "Free shipping threshold", sub: "Orders above this value ship free", prefix: "Rs." },
                    ].map(({ key, label, sub, prefix }) => (
                      <div key={key} className="flex items-center justify-between border border-border-soft bg-cream p-4">
                        <div>
                          <div className="text-[13px] font-medium">{label}</div>
                          <div className="text-[12px] text-ink-soft">{sub}</div>
                        </div>
                        <div className="flex items-center gap-2 text-[13px]">
                          <span className="text-muted">{prefix}</span>
                          <input
                            value={shipping[key]}
                            onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                            className="w-28 border border-border-soft bg-ivory px-3 py-1.5 text-right text-[13px] outline-none focus:border-ink"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Toggle
                      checked={shipping.codEnabled}
                      onChange={(v) => setShipping({ ...shipping, codEnabled: v })}
                      label="Cash on Delivery"
                      sub="Allow customers to pay when their order arrives"
                    />
                  </div>
                  <SaveBar label="Update rates" onSave={() => updateSettings({ shipping_rates: { standard: Number(shipping.standard), express: Number(shipping.express), freeThreshold: Number(shipping.freeThreshold), carrier: shipping.carrier, estimatedStd: shipping.estimatedStd, estimatedExp: shipping.estimatedExp, codEnabled: shipping.codEnabled } }).catch(() => {})} />
                </section>
              )}

              {/* ── PAYMENT METHODS ── */}
              {active === "payment" && (
                <>
                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-2xl italic">Payment methods</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Toggle checked={payment.cod}         onChange={(v) => setPayment({ ...payment, cod: v })}         label="Cash on Delivery (COD)" sub="No upfront payment required" />
                      <Toggle checked={payment.jazzcash}    onChange={(v) => setPayment({ ...payment, jazzcash: v })}    label="JazzCash"               sub="Mobile wallet · Pakistan" />
                      <Toggle checked={payment.easypaisa}   onChange={(v) => setPayment({ ...payment, easypaisa: v })}   label="Easypaisa"              sub="Mobile wallet · Pakistan" />
                      <Toggle checked={payment.bankTransfer} onChange={(v) => setPayment({ ...payment, bankTransfer: v })} label="Bank Transfer"        sub="Manual payment confirmation required" />
                    </div>
                  </section>

                  {payment.bankTransfer && (
                    <section className="border border-border-soft bg-ivory p-6">
                      <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">Bank account details</div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Bank name">
                          <input value={payment.bankName} onChange={(e) => setPayment({ ...payment, bankName: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
                        </Field>
                        <Field label="Account title">
                          <input value={payment.accountTitle} onChange={(e) => setPayment({ ...payment, accountTitle: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
                        </Field>
                        <Field label="Account number">
                          <input value={payment.accountNo} onChange={(e) => setPayment({ ...payment, accountNo: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] font-mono outline-none focus:border-ink" />
                        </Field>
                        <Field label="IBAN">
                          <input value={payment.iban} onChange={(e) => setPayment({ ...payment, iban: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] font-mono outline-none focus:border-ink" />
                        </Field>
                      </div>
                      <SaveBar onSave={() => updateSettings({ payment_methods: { cod: payment.cod, jazzcash: payment.jazzcash, easypaisa: payment.easypaisa, bankTransfer: payment.bankTransfer, bankName: payment.bankName, accountTitle: payment.accountTitle, accountNo: payment.accountNo, iban: payment.iban } }).catch(() => {})} />
                    </section>
                  )}
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {active === "notifications" && (
                <section className="border border-border-soft bg-ivory p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gold-dark" />
                    <h2 className="font-display text-2xl italic">Notifications</h2>
                  </div>

                  <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">Order alerts</div>
                  <div className="flex flex-col gap-2 mb-6">
                    <Toggle checked={notif.newOrder}       onChange={(v) => setNotif({ ...notif, newOrder: v })}       label="New order placed"        sub="Notify when a customer places an order" />
                    <Toggle checked={notif.orderShipped}   onChange={(v) => setNotif({ ...notif, orderShipped: v })}   label="Order dispatched"        sub="Notify when an order is marked shipped" />
                    <Toggle checked={notif.orderDelivered} onChange={(v) => setNotif({ ...notif, orderDelivered: v })} label="Order delivered"         sub="Notify when an order is marked delivered" />
                    <Toggle checked={notif.payment}        onChange={(v) => setNotif({ ...notif, payment: v })}        label="Payment received"        sub="Notify on verified JazzCash / bank payments" />
                  </div>

                  <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">Inventory alerts</div>
                  <div className="flex flex-col gap-2 mb-6">
                    <Toggle checked={notif.lowStock}    onChange={(v) => setNotif({ ...notif, lowStock: v })}    label="Low stock warning"   sub="Alert when a product has 5 or fewer units" />
                    <Toggle checked={notif.newCustomer} onChange={(v) => setNotif({ ...notif, newCustomer: v })} label="New customer signup" sub="Notify when a new account is registered" />
                  </div>

                  <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">Reports</div>
                  <div className="flex flex-col gap-2">
                    <Toggle checked={notif.dailySummary}  onChange={(v) => setNotif({ ...notif, dailySummary: v })}  label="Daily sales summary"  sub="Receive a daily digest email each morning" />
                    <Toggle checked={notif.weeklySummary} onChange={(v) => setNotif({ ...notif, weeklySummary: v })} label="Weekly performance"   sub="Receive a weekly analytics summary on Mondays" />
                  </div>
                  <SaveBar label="Save preferences" onSave={() => updateSettings({ notification_settings: { newOrder: notif.newOrder, orderShipped: notif.orderShipped, orderDelivered: notif.orderDelivered, lowStock: notif.lowStock, newCustomer: notif.newCustomer, payment: notif.payment, dailySummary: notif.dailySummary, weeklySummary: notif.weeklySummary } }).catch(() => {})} />
                </section>
              )}

              {/* ── SECURITY ── */}
              {active === "security" && (
                <>
                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-2xl italic">Change password</h2>
                    </div>
                    <div className="flex flex-col gap-4 max-w-sm">
                      <Field label="Current password">
                        <div className="relative">
                          <input
                            type={showPw ? "text" : "password"}
                            value={sec.current}
                            onChange={(e) => setSec({ ...sec, current: e.target.value })}
                            className="h-11 w-full border border-border-soft bg-cream px-3 pr-10 text-[14px] outline-none focus:border-ink"
                          />
                          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                      <Field label="New password">
                        <input type="password" value={sec.newPw} onChange={(e) => setSec({ ...sec, newPw: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="Confirm new password">
                        <input type="password" value={sec.confirm} onChange={(e) => setSec({ ...sec, confirm: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                    </div>
                    {sec.newPw && sec.confirm && sec.newPw !== sec.confirm && (
                      <p className="mt-2 text-[12px] text-sale">Passwords do not match.</p>
                    )}
                    <SaveBar label="Update password" onSave={() => setSec({ current: "", newPw: "", confirm: "" })} />
                  </section>

                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-xl italic">Active sessions</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        { device: "Chrome on Windows 11", location: "Karachi, PK", time: "Now · current session", current: true },
                        { device: "Safari on iPhone 15",  location: "Karachi, PK", time: "Yesterday 9:42 PM",     current: false },
                      ].map((s) => (
                        <div key={s.device} className="flex items-center justify-between border border-border-soft bg-cream p-4">
                          <div>
                            <div className="flex items-center gap-2 text-[13px] font-medium">
                              {s.current && <span className="h-2 w-2 rounded-full bg-sage" />}
                              {s.device}
                            </div>
                            <div className="text-[11px] text-muted mt-0.5">{s.location} · {s.time}</div>
                          </div>
                          {!s.current && (
                            <button className="text-[11px] uppercase tracking-[0.18em] text-sale hover:opacity-70 transition-opacity">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* ── SEO ── */}
              {active === "seo" && (
                <>
                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gold-dark" />
                      <h2 className="font-display text-2xl italic">SEO & metadata</h2>
                    </div>
                    <div className="flex flex-col gap-5">
                      <Field label="Site title">
                        <input value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                          className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                      </Field>
                      <Field label="Meta description">
                        <textarea rows={3} value={seo.metaDesc} onChange={(e) => setSeo({ ...seo, metaDesc: e.target.value })}
                          className="border border-border-soft bg-cream px-3 py-2.5 text-[14px] outline-none focus:border-ink resize-none" />
                      </Field>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="OG / Social title">
                          <input value={seo.ogTitle} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
                        </Field>
                        <Field label="OG description">
                          <input value={seo.ogDesc} onChange={(e) => setSeo({ ...seo, ogDesc: e.target.value })}
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
                        </Field>
                        <Field label="Google Analytics 4 ID">
                          <input value={seo.ga4} onChange={(e) => setSeo({ ...seo, ga4: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] font-mono outline-none focus:border-ink" />
                        </Field>
                        <Field label="Meta Pixel ID">
                          <input value={seo.fbPixel} onChange={(e) => setSeo({ ...seo, fbPixel: e.target.value })}
                            placeholder="123456789012345"
                            className="h-10 border border-border-soft bg-cream px-3 text-[13px] font-mono outline-none focus:border-ink" />
                        </Field>
                      </div>
                    </div>
                    <SaveBar onSave={() => updateSettings({ seo_settings: { siteTitle: seo.siteTitle, metaDesc: seo.metaDesc, ogTitle: seo.ogTitle, ogDesc: seo.ogDesc, ga4: seo.ga4, fbPixel: seo.fbPixel, robotsTxt: seo.robotsTxt, sitemap: seo.sitemap, structuredData: seo.structuredData } }).catch(() => {})} />
                  </section>

                  <section className="border border-border-soft bg-ivory p-6">
                    <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">Technical SEO</div>
                    <div className="flex flex-col gap-2">
                      <Toggle checked={seo.robotsTxt}      onChange={(v) => setSeo({ ...seo, robotsTxt: v })}      label="robots.txt"        sub="Allow search engines to crawl the store" />
                      <Toggle checked={seo.sitemap}        onChange={(v) => setSeo({ ...seo, sitemap: v })}        label="XML Sitemap"       sub="Auto-generate and submit sitemap to Google" />
                      <Toggle checked={seo.structuredData} onChange={(v) => setSeo({ ...seo, structuredData: v })} label="Structured Data"   sub="Enable JSON-LD schema for products and breadcrumbs" />
                    </div>
                    <SaveBar label="Save SEO settings" onSave={() => updateSettings({ seo_settings: { siteTitle: seo.siteTitle, metaDesc: seo.metaDesc, ogTitle: seo.ogTitle, ogDesc: seo.ogDesc, ga4: seo.ga4, fbPixel: seo.fbPixel, robotsTxt: seo.robotsTxt, sitemap: seo.sitemap, structuredData: seo.structuredData } }).catch(() => {})} />
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
    </AdminShell>
  );
}
