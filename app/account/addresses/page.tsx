import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { getCustomerSession } from "@/lib/actions/customer-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Addresses — Habiba Minhas" };

export default async function AddressesPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?redirect=/account/addresses");

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
          <div className="flex flex-col items-center justify-center gap-5 border border-border-soft bg-cream py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory">
              <MapPin className="h-7 w-7 text-muted" />
            </div>
            <div>
              <h2 className="font-display text-2xl italic">No saved addresses yet</h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">
                Address management is coming soon. For now, you can enter your delivery address at checkout each time you order.
              </p>
            </div>
            <Link
              href="/ladies"
              className="mt-2 inline-flex h-11 items-center bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
            >
              Start shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
