"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ShieldCheck, RotateCcw, Truck } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">

      {/* ── Left: editorial image panel ───────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%]">
        <Image
          src="/editorial/ladies-collection.webp"
          alt="Habiba Minhas Ladies Collection"
          fill
          priority
          sizes="55vw"
          className="object-cover object-top"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />

        {/* Top brand wordmark */}
        <div className="absolute left-10 top-10">
          <Link href="/" className="font-display text-2xl italic text-ivory/90 hover:text-ivory">
            Habiba Minhas
          </Link>
        </div>

        {/* Bottom quote */}
        <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14">
          <span className="text-[10px] uppercase tracking-[0.38em] text-gold-light">
            Karachi · Est. 2026
          </span>
          <p className="mt-4 max-w-sm font-display text-3xl font-light italic leading-[1.2] text-ivory xl:text-4xl">
            Every thread tells a story worth wearing.
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            {[
              { icon: Truck,       text: "Flat Rs. 250 delivery nationwide" },
              { icon: RotateCcw,   text: "14-day hassle-free returns" },
              { icon: ShieldCheck, text: "Secure & encrypted checkout" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-[12px] text-ivory/75">
                <Icon className="h-3.5 w-3.5 shrink-0 text-gold-light" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">

        {/* Mobile-only hero strip */}
        <div className="relative h-48 sm:h-56 lg:hidden">
          <Image
            src="/editorial/ladies-collection.webp"
            alt="Habiba Minhas"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-6">
            <Link href="/" className="font-display text-xl italic text-ivory">
              Habiba Minhas
            </Link>
          </div>
        </div>

        {/* Form wrapper — vertically centred on desktop */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <span className="text-[10px] uppercase tracking-[0.36em] text-gold-dark">
              Welcome back
            </span>
            <h1 className="mt-3 font-display text-5xl font-light italic leading-[1.05]">
              Sign in.
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              Your bag, wishlist, and order history — all in one place.
            </p>

            {/* Form */}
            <form className="mt-10 flex flex-col gap-5" noValidate>

              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-muted">
                  Email address
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-12 border border-border-soft bg-cream px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                />
              </label>

              {/* Password */}
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-muted">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 w-full border border-border-soft bg-cream px-4 pr-12 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </label>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-ink-soft">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ink"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-[12px] text-gold-dark underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 flex h-14 items-center justify-center bg-ink text-[12px] uppercase tracking-[0.32em] text-ivory transition-colors hover:bg-gold-dark"
              >
                Sign in
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-1">
                <span className="h-px flex-1 bg-border-soft" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted">or</span>
                <span className="h-px flex-1 bg-border-soft" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-3 border border-border-soft bg-ivory text-[12px] uppercase tracking-[0.26em] text-ink transition-colors hover:border-ink hover:bg-cream"
              >
                {/* Google G icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-[13px] text-ink-soft">
              New here?{" "}
              <Link
                href="/account/signup"
                className="font-medium text-ink underline underline-offset-4 hover:text-gold-dark"
              >
                Create an account
              </Link>
            </p>

            {/* Security note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
