import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata = { title: "Admin — Sign In | Habiba Minhas" };

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col justify-between bg-ink px-8 py-10 sm:px-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-gold-dark">
            <ShieldCheck className="h-4 w-4 text-ink" />
          </div>
          <div>
            <div className="font-display text-[15px] italic text-ivory">Habiba Minhas</div>
            <div className="text-[9px] uppercase tracking-[0.36em] text-gold-dark">Admin Portal</div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-md">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Restricted access
          </span>
          <h1 className="mt-3 font-display text-4xl italic leading-tight text-ivory sm:text-5xl">
            Welcome back.
          </h1>
          <p className="mt-2 text-[13px] text-ivory/50">
            Sign in to manage orders, products, and customers.
          </p>

          <form className="mt-10 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-gold-dark/80">
                Email address
              </span>
              <input
                type="email"
                placeholder="admin@habibaminhas.com"
                className="h-12 border-0 border-b border-ivory/20 bg-transparent px-0 text-[14px] text-ivory outline-none placeholder:text-ivory/25 focus:border-gold-dark"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-gold-dark/80">
                Password
              </span>
              <input
                type="password"
                placeholder="••••••••••••"
                className="h-12 border-0 border-b border-ivory/20 bg-transparent px-0 text-[14px] text-ivory outline-none placeholder:text-ivory/25 focus:border-gold-dark"
              />
            </label>
            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 text-ivory/50">
                <input type="checkbox" className="h-3.5 w-3.5 accent-gold-dark" />
                Keep me signed in
              </label>
              <button type="button" className="text-gold-dark hover:text-ivory transition-colors">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="mt-2 flex h-14 items-center justify-center gap-2 bg-gold-dark text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-ivory transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              Sign in securely
            </button>
          </form>

          <div className="mt-10 flex items-start gap-3 border border-ivory/10 bg-ivory/5 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
            <p className="text-[11px] leading-relaxed text-ivory/40">
              This portal is restricted to authorised Habiba Minhas staff only. Unauthorised access attempts are logged and reported.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-ivory/30">
          <span>© 2026 Habiba Minhas</span>
          <Link href="/" className="hover:text-ivory/60 transition-colors">
            ← Back to store
          </Link>
        </div>
      </div>

      {/* Right — brand image */}
      <div className="relative hidden lg:block">
        <Image
          src="/editorial/ladies-collection.webp"
          alt="Habiba Minhas"
          fill
          priority
          sizes="50vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <div className="border-l-2 border-gold-dark pl-6">
            <span className="text-[11px] uppercase tracking-[0.36em] text-gold-light">
              Est. 2026
            </span>
            <p className="mt-3 max-w-sm font-display text-3xl italic leading-tight text-ivory">
              Handcrafted in Pakistan. Managed with precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
