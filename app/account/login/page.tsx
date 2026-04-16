import Link from "next/link";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-2">
      <div className="order-2 flex items-center justify-center px-6 py-16 sm:px-10 lg:order-1">
        <div className="w-full max-w-md">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Welcome back
          </span>
          <h1 className="mt-3 font-display text-4xl italic leading-tight">Sign in.</h1>
          <p className="mt-2 text-[13px] text-ink-soft">
            Your bag, your wishlist, and your orders — together.
          </p>
          <form className="mt-10 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Email
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="h-11 border-0 border-b border-ink/25 bg-transparent px-0 text-[14px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Password
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="h-11 border-0 border-b border-ink/25 bg-transparent px-0 text-[14px] outline-none focus:border-ink"
              />
            </label>
            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" className="h-3.5 w-3.5" /> Remember me
              </label>
              <Link href="#" className="text-gold-dark hover:text-gold-dark-dark">
                Forgot password?
              </Link>
            </div>
            <button className="h-14 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark">
              Sign in
            </button>
            <div className="relative py-2 text-center text-[11px] uppercase tracking-[0.24em] text-muted">
              <span className="relative z-10 bg-ivory px-3">or</span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-border-soft" />
            </div>
            <button
              type="button"
              className="h-12 border border-ink text-[12px] uppercase tracking-[0.26em] hover:bg-ink hover:text-ivory"
            >
              Continue with Google
            </button>
          </form>
          <p className="mt-8 text-center text-[13px] text-ink-soft">
            New here?{" "}
            <Link href="/account/signup" className="text-ink underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <div className="order-1 relative lg:order-2">
        <PlaceholderImage
          tone={["#efe3d0", "#a8804b", "#2a1f17"]}
          motif="floral"
          aspect="4/5"
          animate
          className="h-full lg:aspect-auto"
          overlay
        >
          <div className="absolute inset-x-0 bottom-0 p-8 text-ivory sm:p-12">
            <span className="text-[11px] uppercase tracking-[0.34em]">
              Est. 2026
            </span>
            <p className="mt-3 max-w-md font-display text-2xl italic leading-tight sm:text-3xl">
              A quiet house of cloth, composed in Karachi and dispatched to forty-two countries.
            </p>
          </div>
        </PlaceholderImage>
      </div>
    </div>
  );
}
