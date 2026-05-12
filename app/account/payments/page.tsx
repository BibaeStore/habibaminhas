import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { getCustomerSession } from "@/lib/actions/customer-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment Methods — Habiba Minhas" };

export default async function PaymentsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?redirect=/account/payments");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Payments</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Payment methods.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Your available checkout payment options.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-6">

          {/* Active method — COD */}
          <section className="border border-border-soft bg-cream">
            <div className="flex items-center gap-5 px-6 py-5">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-border-soft bg-ivory p-1">
                <Image
                  src="/logos/payments/cod.webp"
                  alt="Cash on Delivery"
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-semibold text-ink">Cash on Delivery</div>
                  <span className="flex items-center gap-1 border border-sage/30 bg-sage/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-sage">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Active
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  Pay when your order arrives. Available nationwide across Pakistan — no advance payment required.
                </p>
              </div>
              <ShieldCheck className="h-6 w-6 shrink-0 text-gold-dark" />
            </div>
          </section>

          {/* Coming soon notice */}
          <div className="border border-border-soft bg-ivory px-6 py-8 text-center">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Card and digital wallet payment options are coming soon. For now, all orders are settled via Cash on Delivery at your doorstep.
            </p>
            <Link
              href="/help/payments"
              className="mt-4 inline-flex text-[12px] uppercase tracking-[0.24em] text-gold-dark hover:text-ink"
            >
              Learn more about payment →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
