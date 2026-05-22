"use client";

import { useState, useEffect } from "react";
import {
  Store, Truck, CreditCard, Bell, Shield, Globe,
  Check, Eye, EyeOff, Upload, Save,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]";
const inputSmCls =
  "h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[14px] outline-none focus:border-[var(--admin-primary)]";
const textareaCls =
  "w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--admin-primary)] resize-none";

function SectionSaveButton({ label = "Save changes", onSave }: { label?: string; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div className="mt-6 flex">
      <AdminButton variant="primary" onClick={handle} leadingIcon={saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}>
        {saved ? "Saved!" : label}
      </AdminButton>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
      <div>
        <div className="text-[14px] font-medium text-[var(--admin-text)]">{label}</div>
        {sub && <div className="mt-0.5 text-[13px] text-[var(--admin-text-soft)]">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-border)]"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
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
    siteTitle: "Habiba Minhas — Luxury Fashion Brand Pakistan",
    metaDesc: "Premium ladies suits, kids festive wear, baby bedding, and handcrafted accessories — made with love in Pakistan.",
    ogTitle: "Habiba Minhas", ogDesc: "Shop handcrafted fashion & nursery essentials.",
    robotsTxt: true, sitemap: true, structuredData: true,
    ga4: "", fbPixel: "",
  });

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <PageHeader title="Settings" />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">

          {/* Side nav */}
          <nav className="flex flex-col gap-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex h-12 items-center gap-3 rounded-[var(--admin-radius)] px-4 text-[15px] font-medium transition-colors ${
                  active === id
                    ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                    : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex flex-col gap-6">

            {/* ── STORE INFORMATION ── */}
            {active === "store" && (
              <>
                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Store information</h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Store name">
                      <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Store email">
                      <input type="email" value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="WhatsApp / Phone">
                      <input type="tel" value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="City">
                      <input value={store.city} onChange={(e) => setStore({ ...store, city: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Currency">
                      <select value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })}
                        className={inputCls}>
                        <option value="PKR">PKR — Pakistani Rupee</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="AED">AED — UAE Dirham</option>
                      </select>
                    </Field>
                    <Field label="Timezone">
                      <select value={store.timezone} onChange={(e) => setStore({ ...store, timezone: e.target.value })}
                        className={inputCls}>
                        <option value="Asia/Karachi">Asia/Karachi (PKT +05:00)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                        <option value="Europe/London">Europe/London (GMT +00:00)</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Store description">
                        <textarea rows={3} value={store.desc} onChange={(e) => setStore({ ...store, desc: e.target.value })}
                          className={textareaCls} />
                      </Field>
                    </div>
                  </div>
                  <SectionSaveButton onSave={() => updateSettings({ store_name: store.name, store_email: store.email, store_phone: store.phone, store_city: store.city, description: store.desc, currency: store.currency, timezone: store.timezone }).catch(() => {})} />
                </AdminCard>

                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Store logo & branding</h2>
                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-8 transition-colors hover:border-[var(--admin-primary)]">
                    <Upload className="h-6 w-6 text-[var(--admin-text-muted)]" />
                    <span className="text-[14px] font-medium text-[var(--admin-text-soft)]">Upload logo</span>
                    <span className="text-[13px] text-[var(--admin-text-muted)]">SVG, PNG, WebP · max 2 MB</span>
                    <input type="file" accept="image/*" className="sr-only" />
                  </label>
                </AdminCard>
              </>
            )}

            {/* ── SHIPPING ── */}
            {active === "shipping" && (
              <AdminCard>
                <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Shipping & delivery</h2>

                <div className="mt-5">
                  <p className="mb-2 text-[13px] font-semibold text-[var(--admin-text-soft)]">Courier partner</p>
                  <div className="flex flex-wrap gap-2">
                    {["TCS", "Leopard", "Trax", "M&P"].map((c) => (
                      <button key={c} onClick={() => setShipping({ ...shipping, carrier: c })}
                        className={`h-9 rounded-[var(--admin-radius)] border px-4 text-[14px] font-medium transition-colors ${
                          shipping.carrier === c
                            ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                            : "border-[var(--admin-border)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {[
                    { key: "standard" as const, label: "Standard delivery", sub: `${shipping.estimatedStd} business days`, prefix: "Rs." },
                    { key: "express"  as const, label: "Express delivery",  sub: `${shipping.estimatedExp} business days · major cities only`, prefix: "Rs." },
                    { key: "freeThreshold" as const, label: "Free shipping threshold", sub: "Orders above this value ship free", prefix: "Rs." },
                  ].map(({ key, label, sub, prefix }) => (
                    <div key={key} className="flex items-center justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
                      <div>
                        <div className="text-[14px] font-medium text-[var(--admin-text)]">{label}</div>
                        <div className="mt-0.5 text-[13px] text-[var(--admin-text-soft)]">{sub}</div>
                      </div>
                      <div className="flex items-center gap-2 text-[14px]">
                        <span className="text-[var(--admin-text-muted)]">{prefix}</span>
                        <input
                          value={shipping[key]}
                          onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                          className="w-28 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-right text-[14px] outline-none focus:border-[var(--admin-primary)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Toggle
                    checked={shipping.codEnabled}
                    onChange={(v) => setShipping({ ...shipping, codEnabled: v })}
                    label="Cash on Delivery"
                    sub="Allow customers to pay when their order arrives"
                  />
                </div>
                <SectionSaveButton label="Update rates" onSave={() => updateSettings({ shipping_rates: { standard: Number(shipping.standard), express: Number(shipping.express), freeThreshold: Number(shipping.freeThreshold), carrier: shipping.carrier, estimatedStd: shipping.estimatedStd, estimatedExp: shipping.estimatedExp, codEnabled: shipping.codEnabled } }).catch(() => {})} />
              </AdminCard>
            )}

            {/* ── PAYMENT METHODS ── */}
            {active === "payment" && (
              <AdminCard>
                <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Payment methods</h2>
                <p className="mt-1 text-[14px] text-[var(--admin-text-muted)]">
                  Cash on Delivery is currently the only available checkout option.
                  Additional gateways (JazzCash, Easypaisa, card) can be enabled later
                  once integrated.
                </p>
                <div className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-4 py-3 text-[14px]">
                  <span className="font-semibold text-[var(--admin-text)]">Cash on Delivery</span>
                  <span className="ml-2 text-[var(--admin-text-muted)]">Active</span>
                </div>
              </AdminCard>
            )}

            {/* ── NOTIFICATIONS ── */}
            {active === "notifications" && (
              <AdminCard>
                <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Notifications</h2>

                <p className="mt-5 mb-2 text-[13px] font-semibold text-[var(--admin-text-soft)]">Order alerts</p>
                <div className="flex flex-col gap-2">
                  <Toggle checked={notif.newOrder}       onChange={(v) => setNotif({ ...notif, newOrder: v })}       label="New order placed"        sub="Notify when a customer places an order" />
                  <Toggle checked={notif.orderShipped}   onChange={(v) => setNotif({ ...notif, orderShipped: v })}   label="Order dispatched"        sub="Notify when an order is marked shipped" />
                  <Toggle checked={notif.orderDelivered} onChange={(v) => setNotif({ ...notif, orderDelivered: v })} label="Order delivered"         sub="Notify when an order is marked delivered" />
                  <Toggle checked={notif.payment}        onChange={(v) => setNotif({ ...notif, payment: v })}        label="Payment received"        sub="Notify on verified JazzCash / bank payments" />
                </div>

                <p className="mt-6 mb-2 text-[13px] font-semibold text-[var(--admin-text-soft)]">Inventory alerts</p>
                <div className="flex flex-col gap-2">
                  <Toggle checked={notif.lowStock}    onChange={(v) => setNotif({ ...notif, lowStock: v })}    label="Low stock warning"   sub="Alert when a product has 5 or fewer units" />
                  <Toggle checked={notif.newCustomer} onChange={(v) => setNotif({ ...notif, newCustomer: v })} label="New customer signup" sub="Notify when a new account is registered" />
                </div>

                <p className="mt-6 mb-2 text-[13px] font-semibold text-[var(--admin-text-soft)]">Reports</p>
                <div className="flex flex-col gap-2">
                  <Toggle checked={notif.dailySummary}  onChange={(v) => setNotif({ ...notif, dailySummary: v })}  label="Daily sales summary"  sub="Receive a daily digest email each morning" />
                  <Toggle checked={notif.weeklySummary} onChange={(v) => setNotif({ ...notif, weeklySummary: v })} label="Weekly performance"   sub="Receive a weekly analytics summary on Mondays" />
                </div>
                <SectionSaveButton label="Save preferences" onSave={() => updateSettings({ notification_settings: { newOrder: notif.newOrder, orderShipped: notif.orderShipped, orderDelivered: notif.orderDelivered, lowStock: notif.lowStock, newCustomer: notif.newCustomer, payment: notif.payment, dailySummary: notif.dailySummary, weeklySummary: notif.weeklySummary } }).catch(() => {})} />
              </AdminCard>
            )}

            {/* ── SECURITY ── */}
            {active === "security" && (
              <>
                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Change password</h2>
                  <div className="mt-4 flex flex-col gap-4 max-w-sm">
                    <Field label="Current password">
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          value={sec.current}
                          onChange={(e) => setSec({ ...sec, current: e.target.value })}
                          className={`${inputCls} pr-10`}
                        />
                        <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                    <Field label="New password">
                      <input type="password" value={sec.newPw} onChange={(e) => setSec({ ...sec, newPw: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Confirm new password">
                      <input type="password" value={sec.confirm} onChange={(e) => setSec({ ...sec, confirm: e.target.value })}
                        className={inputCls} />
                    </Field>
                  </div>
                  {sec.newPw && sec.confirm && sec.newPw !== sec.confirm && (
                    <p className="mt-2 text-[13px] text-[var(--admin-danger)]">Passwords do not match.</p>
                  )}
                  <SectionSaveButton label="Update password" onSave={() => setSec({ current: "", newPw: "", confirm: "" })} />
                </AdminCard>

                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Active sessions</h2>
                  <div className="mt-4 flex flex-col gap-2">
                    {[
                      { device: "Chrome on Windows 11", location: "Karachi, PK", time: "Now · current session", current: true },
                      { device: "Safari on iPhone 15",  location: "Karachi, PK", time: "Yesterday 9:42 PM",     current: false },
                    ].map((s) => (
                      <div key={s.device} className="flex items-center justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
                        <div>
                          <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--admin-text)]">
                            {s.current && <span className="h-2 w-2 rounded-full bg-[var(--admin-success)]" />}
                            {s.device}
                          </div>
                          <div className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">{s.location} · {s.time}</div>
                        </div>
                        {!s.current && (
                          <AdminButton variant="danger" size="sm" disabled title="Session management coming soon">Revoke</AdminButton>
                        )}
                      </div>
                    ))}
                  </div>
                </AdminCard>
              </>
            )}

            {/* ── SEO ── */}
            {active === "seo" && (
              <>
                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">SEO & metadata</h2>
                  <div className="mt-4 flex flex-col gap-5">
                    <Field label="Site title">
                      <input value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Meta description">
                      <textarea rows={3} value={seo.metaDesc} onChange={(e) => setSeo({ ...seo, metaDesc: e.target.value })}
                        className={textareaCls} />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="OG / Social title">
                        <input value={seo.ogTitle} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                          className={inputSmCls} />
                      </Field>
                      <Field label="OG description">
                        <input value={seo.ogDesc} onChange={(e) => setSeo({ ...seo, ogDesc: e.target.value })}
                          className={inputSmCls} />
                      </Field>
                      <Field label="Google Analytics 4 ID">
                        <input value={seo.ga4} onChange={(e) => setSeo({ ...seo, ga4: e.target.value })}
                          placeholder="G-XXXXXXXXXX"
                          className={`${inputSmCls} font-mono`} />
                      </Field>
                      <Field label="Meta Pixel ID">
                        <input value={seo.fbPixel} onChange={(e) => setSeo({ ...seo, fbPixel: e.target.value })}
                          placeholder="123456789012345"
                          className={`${inputSmCls} font-mono`} />
                      </Field>
                    </div>
                  </div>
                  <SectionSaveButton onSave={() => updateSettings({ seo_settings: { siteTitle: seo.siteTitle, metaDesc: seo.metaDesc, ogTitle: seo.ogTitle, ogDesc: seo.ogDesc, ga4: seo.ga4, fbPixel: seo.fbPixel, robotsTxt: seo.robotsTxt, sitemap: seo.sitemap, structuredData: seo.structuredData } }).catch(() => {})} />
                </AdminCard>

                <AdminCard>
                  <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Technical SEO</h2>
                  <div className="mt-4 flex flex-col gap-2">
                    <Toggle checked={seo.robotsTxt}      onChange={(v) => setSeo({ ...seo, robotsTxt: v })}      label="robots.txt"        sub="Allow search engines to crawl the store" />
                    <Toggle checked={seo.sitemap}        onChange={(v) => setSeo({ ...seo, sitemap: v })}        label="XML Sitemap"       sub="Auto-generate and submit sitemap to Google" />
                    <Toggle checked={seo.structuredData} onChange={(v) => setSeo({ ...seo, structuredData: v })} label="Structured Data"   sub="Enable JSON-LD schema for products and breadcrumbs" />
                  </div>
                  <SectionSaveButton label="Save SEO settings" onSave={() => updateSettings({ seo_settings: { siteTitle: seo.siteTitle, metaDesc: seo.metaDesc, ogTitle: seo.ogTitle, ogDesc: seo.ogDesc, ga4: seo.ga4, fbPixel: seo.fbPixel, robotsTxt: seo.robotsTxt, sitemap: seo.sitemap, structuredData: seo.structuredData } }).catch(() => {})} />
                </AdminCard>
              </>
            )}

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
