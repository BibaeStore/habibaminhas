import Link from "next/link";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export const metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-2">
      <div className="relative order-2 lg:order-1">
        <PlaceholderImage
          tone={["#ead7d1", "#c9917e", "#5a2a22"]}
          motif="arch"
          aspect="4/5"
          animate
          className="h-full lg:aspect-auto"
          overlay
        >
          <div className="absolute inset-x-0 bottom-0 p-8 text-ivory sm:p-12">
            <span className="text-[11px] uppercase tracking-[0.34em]">
              Members
            </span>
            <p className="mt-3 max-w-md font-display text-2xl italic leading-tight sm:text-3xl">
              Early access to new drops, restocks, and private sales — in your inbox first.
            </p>
          </div>
        </PlaceholderImage>
      </div>
      <div className="order-1 flex items-center justify-center px-6 py-16 sm:px-10 lg:order-2">
        <div className="w-full max-w-md">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Join the atelier
          </span>
          <h1 className="mt-3 font-display text-4xl italic leading-tight">
            Create account.
          </h1>
          <form className="mt-10 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  First name
                </span>
                <input className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  Last name
                </span>
                <input className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Email
              </span>
              <input
                type="email"
                className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Password
              </span>
              <input
                type="password"
                className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex items-start gap-2 text-[12px] text-ink-soft">
              <input type="checkbox" className="mt-1 h-3.5 w-3.5" />
              Sign me up for The Atelier Letter — I'll be first in line for restocks and sales.
            </label>
            <button className="h-14 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark">
              Create account
            </button>
          </form>
          <p className="mt-8 text-center text-[13px] text-ink-soft">
            Already have one?{" "}
            <Link href="/account/login" className="text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
