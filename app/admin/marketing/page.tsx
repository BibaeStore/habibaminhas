import Link from "next/link";
import { Zap, Gift, Check, ArrowRight, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "Marketing & SEO | Admin" };

const aiFeatures = [
  "Localized Keywords (Shaadi, Jora, COD, Pakistan)",
  "Automatic JSON-LD Schema Integration",
  "Mobile-First Reading Experience",
  "Internal Linking to Shop Categories",
];

export default function AdminMarketingPage() {
  return (
    <AdminShell title="Marketing">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Marketing & SEO</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Grow your brand with AI authority</p>
            </div>
            <span className="flex items-center gap-1.5 border border-gold-dark/30 bg-gold/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-gold-dark">
              <Sparkles className="h-3 w-3" /> AI Features Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* AI Content Importer */}
            <div className="lg:col-span-2 bg-ink text-ivory p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center bg-ivory/10">
                <Zap className="h-6 w-6 text-ivory" />
              </div>
              <h2 className="font-display text-3xl italic text-ivory">AI Content Importer</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-ivory/60">
                Generate SEO-optimized blog posts tailored to the Pakistani market — driving organic
                traffic from Eid shopping, bridal searches, and baby gifting seasons.
              </p>
              <ul className="mt-5 space-y-2.5">
                {aiFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-gold-dark">
                      <Check className="h-2.5 w-2.5 text-ink" />
                    </div>
                    <span className="text-[12px] text-ivory/70">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="flex h-11 items-center gap-2 bg-gold-dark px-6 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gold">
                  <Zap className="h-3.5 w-3.5" /> Import 3 Localised Blogs
                </button>
                <button className="flex h-11 items-center gap-2 border border-ivory/20 px-6 text-[11px] uppercase tracking-[0.22em] text-ivory/70 transition-colors hover:border-ivory/40 hover:text-ivory">
                  View Live Blog <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Side cards */}
            <div className="flex flex-col gap-5">

              {/* Coupons */}
              <div className="border border-border-soft bg-ivory p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center bg-blue-50">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-xl italic">Coupons & Rewards</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                  Create discount codes, referral rewards, and loyalty points for your customers.
                </p>
                <button
                  disabled
                  className="mt-5 h-9 w-full border border-border-soft bg-cream text-[11px] uppercase tracking-[0.2em] text-muted cursor-not-allowed"
                >
                  Upcoming Feature
                </button>
              </div>

              {/* Placeholder */}
              <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed border-border-soft p-6 text-center">
                <Sparkles className="mb-3 h-6 w-6 text-muted" />
                <p className="text-[12px] leading-relaxed text-muted">
                  More AI SEO tools are coming soon — email campaigns, social scheduling, and more.
                </p>
              </div>
            </div>
          </div>

          {/* SEO Tips */}
          <section className="mt-6 border border-border-soft bg-ivory p-6">
            <h2 className="font-display text-xl italic mb-4">Quick SEO tips for Habiba Minhas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { title: "Target Eid searches", body: "Update product titles to include 'Eid collection 2026', 'mehndi outfits', and 'shaadi suits' during April–May." },
                { title: "Use local city keywords", body: "Add 'available in Karachi', 'ship to Lahore' etc. in product descriptions — Google surfaces hyper-local results." },
                { title: "Blog about baby gifting", body: "Posts like 'best baby bedding gifts Pakistan 2026' rank fast for low-competition long-tail queries." },
              ].map((t) => (
                <div key={t.title} className="border border-border-soft bg-cream p-4">
                  <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em]">{t.title}</div>
                  <p className="text-[12px] leading-relaxed text-ink-soft">{t.body}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
    </AdminShell>
  );
}
