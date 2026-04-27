import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Plus, Trash2, ShieldCheck,
  Star, CheckCircle2, Wifi, WifiOff, CreditCard, Smartphone,
} from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";

export const metadata = { title: "Payment Methods" };

const CARD_LOGO: Record<string, { src: string; w: number; h: number }> = {
  Visa:       { src: "/logos/payments/visa.webp",       w: 64, h: 22 },
  Mastercard: { src: "/logos/payments/mastercard.webp", w: 52, h: 32 },
};

const methods = [
  { id: 1, type: "Visa",       last4: "4242", expiry: "09/28", holder: "Dilawar Khan",  default: true  },
  { id: 2, type: "Mastercard", last4: "8821", expiry: "03/27", holder: "Dilawar Khan",  default: false },
];

const wallets = [
  { label: "JazzCash",  logo: "/logos/payments/jazzcash.webp",  connected: true,  number: "+92 312 0295812" },
  { label: "Easypaisa", logo: "/logos/payments/easypaisa.webp", connected: false, number: "" },
];

export default function PaymentsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Payments</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Payment methods.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your saved cards and digital wallets.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-10">

          {/* ── Saved cards ─────────────────────────────────────────── */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Saved cards</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {methods.map((m) => {
                const logo = CARD_LOGO[m.type];
                return (
                  <div key={m.id} className="flex flex-col">

                    {/* Card face */}
                    <div
                      className="relative h-[190px] overflow-hidden border border-border-soft bg-gradient-to-br from-[#f3eee3] via-[#ece4d4] to-[#e0d4be] p-5"
                      style={{ borderRadius: 0 }}
                    >
                      {/* Decorative circle blur — gives premium depth */}
                      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
                      <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-gold-dark/10 blur-xl" />

                      {/* Default badge */}
                      {m.default && (
                        <span className="absolute left-5 top-5 flex items-center gap-1 border border-gold-dark/40 bg-ivory/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-gold-dark backdrop-blur-sm">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Default
                        </span>
                      )}

                      {/* Card network logo — top right */}
                      {logo && (
                        <div className="absolute right-5 top-5 flex items-center justify-end">
                          <Image
                            src={logo.src}
                            alt={m.type}
                            width={logo.w}
                            height={logo.h}
                            className="object-contain drop-shadow-sm"
                          />
                        </div>
                      )}

                      {/* Chip — centre-left */}
                      <div className="absolute left-5 top-[50%] -translate-y-1/2">
                        <div className="relative h-8 w-10 overflow-hidden rounded-[3px] bg-gradient-to-br from-[#d4a956] via-[#b8914a] to-[#9a7b38] shadow-sm">
                          {/* Chip contacts */}
                          <div className="absolute inset-x-1 top-1 grid grid-cols-3 gap-[1px]">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-[5px] rounded-[1px] bg-[#e8c97a]/60" />
                            ))}
                          </div>
                          <div className="absolute inset-x-0 bottom-1 mx-1 h-[3px] rounded-[1px] bg-[#e8c97a]/40" />
                        </div>
                      </div>

                      {/* Card number — bottom */}
                      <div className="absolute bottom-10 left-5 right-5">
                        <div className="font-mono text-[15px] tracking-[0.22em] text-ink">
                          •••• •••• •••• {m.last4}
                        </div>
                      </div>

                      {/* Holder + expiry row */}
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                        <div>
                          <div className="text-[8px] uppercase tracking-[0.22em] text-muted">Cardholder</div>
                          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
                            {m.holder}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-[0.22em] text-muted">Expires</div>
                          <div className="text-[12px] font-medium text-ink">{m.expiry}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action bar below card */}
                    <div className="flex items-center gap-2 border border-t-0 border-border-soft bg-ivory px-4 py-3">
                      {!m.default ? (
                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center gap-2 border border-gold-dark/40 bg-gold-light py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark transition-colors hover:bg-gold-dark hover:text-ivory"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Set as default
                        </button>
                      ) : (
                        <div className="flex flex-1 items-center justify-center gap-2 py-2 text-[11px] uppercase tracking-[0.2em] text-muted">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                          Default card
                        </div>
                      )}
                      <button
                        type="button"
                        className="flex items-center gap-1.5 border border-sale/30 bg-sale/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sale transition-colors hover:bg-sale hover:text-ivory"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add new card tile */}
              <div className="flex flex-col">
                <button
                  type="button"
                  className="group flex h-[190px] flex-col items-center justify-center gap-3 border border-dashed border-border-soft bg-ivory transition-all hover:border-gold-dark hover:bg-gold-light/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border-soft bg-cream transition-all group-hover:border-gold-dark group-hover:bg-gold-light">
                    <Plus className="h-5 w-5 text-muted transition-colors group-hover:text-gold-dark" />
                  </div>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.26em] text-muted transition-colors group-hover:text-gold-dark">
                    Add new card
                  </span>
                  <span className="text-[11px] text-muted/60 group-hover:text-ink-soft">
                    Visa, Mastercard accepted
                  </span>
                </button>
                {/* Matching action bar height */}
                <div className="border border-t-0 border-dashed border-border-soft bg-transparent py-[28px]" />
              </div>
            </div>

            {/* Accepted logos strip */}
            <div className="mt-4 flex items-center gap-3 text-[11px] text-muted">
              <span className="uppercase tracking-[0.18em]">Accepted:</span>
              <Image src="/logos/payments/visa.webp"       alt="Visa"       width={36} height={13} className="object-contain opacity-70" />
              <Image src="/logos/payments/mastercard.webp" alt="Mastercard" width={32} height={20} className="object-contain opacity-70" />
              <Image src="/logos/payments/bank-transfer.webp" alt="Bank transfer" width={22} height={22} className="object-contain opacity-70" />
            </div>
          </section>

          {/* ── Digital wallets ──────────────────────────────────────── */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Digital wallets</h2>
            </div>

            <div className="flex flex-col gap-4">
              {wallets.map((w) => (
                <div key={w.label} className="flex items-center gap-5 border border-border-soft bg-ivory px-6 py-5">

                  {/* Logo */}
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-border-soft bg-cream p-1">
                    <Image
                      src={w.logo}
                      alt={w.label}
                      fill
                      sizes="64px"
                      className="object-contain p-0.5"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink">{w.label}</div>
                    {w.connected ? (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-soft">
                        <Wifi className="h-3.5 w-3.5 text-sage" />
                        Connected · {w.number}
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                        <WifiOff className="h-3.5 w-3.5" />
                        Not connected
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {w.connected ? (
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-2 border border-sale/30 bg-sale/5 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sale transition-colors hover:bg-sale hover:text-ivory"
                    >
                      <WifiOff className="h-3.5 w-3.5" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-2 border border-gold-dark/40 bg-gold-light px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark transition-colors hover:bg-gold-dark hover:text-ivory"
                    >
                      <Wifi className="h-3.5 w-3.5" />
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Cash on Delivery ─────────────────────────────────────── */}
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
                    Available
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  Pay when your order arrives. Available for all orders across Pakistan — no advance payment required.
                </p>
              </div>
              <ShieldCheck className="h-6 w-6 shrink-0 text-gold-dark" />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
