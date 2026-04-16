import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Store, Truck, CreditCard, Bell, Shield, Globe } from "lucide-react";

export const metadata = { title: "Settings | Admin" };

const sections = [
  { icon: Store, label: "Store information" },
  { icon: Truck, label: "Shipping & delivery" },
  { icon: CreditCard, label: "Payment methods" },
  { icon: Bell, label: "Notifications" },
  { icon: Shield, label: "Security" },
  { icon: Globe, label: "SEO & metadata" },
];

export default function AdminSettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Settings" />
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Settings nav */}
            <aside className="lg:col-span-3">
              <nav className="flex flex-col gap-0.5 border border-border-soft bg-ivory p-1">
                {sections.map(({ icon: Icon, label }, i) => (
                  <button
                    key={label}
                    className={`flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.2em] text-left transition-colors ${
                      i === 0 ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Store info form */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              <section className="border border-border-soft bg-ivory p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Store className="h-4 w-4 text-gold-dark" />
                  <h2 className="font-display text-2xl italic">Store information</h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Store name</span>
                    <input defaultValue="Habiba Minhas" className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Store email</span>
                    <input type="email" defaultValue="info@habibaminhas.com" className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">WhatsApp</span>
                    <input type="tel" defaultValue="+92 312 0295812" className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">City</span>
                    <input defaultValue="Karachi, Pakistan" className="h-11 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink" />
                  </label>
                  <label className="sm:col-span-2 flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Store description</span>
                    <textarea rows={3} defaultValue="Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan." className="border border-border-soft bg-cream px-3 py-2.5 text-[14px] outline-none focus:border-ink resize-none" />
                  </label>
                </div>
                <button className="mt-5 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.26em] text-ivory hover:bg-gold-dark transition-colors">
                  Save changes
                </button>
              </section>

              {/* Shipping settings */}
              <section className="border border-border-soft bg-ivory p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Truck className="h-4 w-4 text-gold-dark" />
                  <h2 className="font-display text-2xl italic">Shipping rates</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Standard delivery", sub: "3–5 business days via TCS", rate: "Rs. 200" },
                    { label: "Express delivery", sub: "1–2 business days, major cities only", rate: "Rs. 500" },
                    { label: "Free shipping threshold", sub: "Orders above this value ship free", rate: "Rs. 3,500" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between border border-border-soft bg-cream p-4">
                      <div>
                        <div className="text-[13px] font-medium">{s.label}</div>
                        <div className="text-[12px] text-ink-soft">{s.sub}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input defaultValue={s.rate} className="w-28 border border-border-soft bg-ivory px-3 py-1.5 text-right text-[13px] outline-none focus:border-ink" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.26em] text-ivory hover:bg-gold-dark transition-colors">
                  Update rates
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
