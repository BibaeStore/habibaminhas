import { Zap, Gift, Check, ArrowRight, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/ui/page-header";

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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader title="Marketing & SEO" />

        {/* AI Features badge */}
        <div className="mt-2 mb-6 flex">
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text-soft)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--admin-primary)]" /> AI Features Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* AI Content Importer */}
          <AdminCard className="lg:col-span-2 bg-[var(--admin-text)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--admin-radius)] bg-white/10">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">AI Content Importer</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-white/60">
              Generate SEO-optimized blog posts tailored to the Pakistani market — driving organic
              traffic from Eid shopping, bridal searches, and baby gifting seasons.
            </p>
            <ul className="mt-5 space-y-2.5">
              {aiFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary)]">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-[12px] text-white/70">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex h-11 items-center gap-2 rounded-[var(--admin-radius)] bg-[var(--admin-primary)] px-6 text-[13px] font-medium text-white transition-colors hover:opacity-90">
                <Zap className="h-3.5 w-3.5" /> Import 3 Localised Blogs
              </button>
              <button className="flex h-11 items-center gap-2 rounded-[var(--admin-radius)] border border-white/20 px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white">
                View Live Blog <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </AdminCard>

          {/* Side cards */}
          <div className="flex flex-col gap-5">

            {/* Coupons */}
            <AdminCard>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--admin-radius)] bg-blue-50">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--admin-text)]">Coupons &amp; Rewards</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--admin-text-soft)]">
                Create discount codes, referral rewards, and loyalty points for your customers.
              </p>
              <button
                disabled
                className="mt-5 h-9 w-full cursor-not-allowed rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] text-[12px] font-medium text-[var(--admin-text-muted)]"
              >
                Upcoming Feature
              </button>
            </AdminCard>

            {/* Placeholder */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] p-6 text-center">
              <Sparkles className="mb-3 h-6 w-6 text-[var(--admin-text-muted)]" />
              <p className="text-[12px] leading-relaxed text-[var(--admin-text-muted)]">
                More AI SEO tools are coming soon — email campaigns, social scheduling, and more.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <AdminCard padded={false} className="mt-6">
          <div className="border-b border-[var(--admin-border)] px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">Quick SEO tips for Habiba Minhas</h2>
          </div>
          <div className="grid grid-cols-1 gap-0 divide-y divide-[var(--admin-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { title: "Target Eid searches", body: "Update product titles to include 'Eid collection 2026', 'mehndi outfits', and 'shaadi suits' during April–May." },
              { title: "Use local city keywords", body: "Add 'available in Karachi', 'ship to Lahore' etc. in product descriptions — Google surfaces hyper-local results." },
              { title: "Blog about baby gifting", body: "Posts like 'best baby bedding gifts Pakistan 2026' rank fast for low-competition long-tail queries." },
            ].map((t) => (
              <div key={t.title} className="p-5">
                <div className="mb-2 text-[13px] font-semibold text-[var(--admin-text)]">{t.title}</div>
                <p className="text-[12px] leading-relaxed text-[var(--admin-text-soft)]">{t.body}</p>
              </div>
            ))}
          </div>
        </AdminCard>

      </div>
    </AdminShell>
  );
}
