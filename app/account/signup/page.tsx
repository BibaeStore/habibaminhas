"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">

      {/* ── Left: image panel ─────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%]">
        <Image
          src="/editorial/kids-festive.webp"
          alt="Habiba Minhas Kids Collection"
          fill
          priority
          sizes="55vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />

        <div className="absolute left-10 top-10">
          <Link href="/" className="font-display text-2xl italic text-ivory/90 hover:text-ivory">
            Habiba Minhas
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14">
          <span className="text-[10px] uppercase tracking-[0.38em] text-gold-light">
            Members
          </span>
          <p className="mt-4 max-w-sm font-display text-3xl font-light italic leading-[1.2] text-ivory xl:text-4xl">
            Early access. Private sales. First in line.
          </p>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ivory/70">
            Join the atelier and receive new drops, restocks, and exclusive offers before anyone else.
          </p>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">

        {/* Mobile hero strip */}
        <div className="relative h-48 sm:h-56 lg:hidden">
          <Image
            src="/editorial/kids-festive.webp"
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

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[420px]">

            <span className="text-[10px] uppercase tracking-[0.36em] text-gold-dark">
              Join the atelier
            </span>
            <h1 className="mt-3 font-display text-5xl font-light italic leading-[1.05]">
              Create account.
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              One account for your wishlist, orders, and early access.
            </p>

            <form className="mt-10 flex flex-col gap-5" noValidate>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted">
                    First name
                  </span>
                  <input
                    type="text"
                    placeholder="Fatima"
                    autoComplete="given-name"
                    className="h-12 border border-border-soft bg-cream px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted">
                    Last name
                  </span>
                  <input
                    type="text"
                    placeholder="Raza"
                    autoComplete="family-name"
                    className="h-12 border border-border-soft bg-cream px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                </label>
              </div>

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
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="h-12 w-full border border-border-soft bg-cream px-4 pr-12 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </label>

              {/* Newsletter opt-in */}
              <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-ink-soft">
                <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
                Sign me up for The Atelier Letter — I'll be first in line for new drops and exclusive offers.
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="mt-1 flex h-14 items-center justify-center bg-ink text-[12px] uppercase tracking-[0.32em] text-ivory transition-colors hover:bg-gold-dark"
              >
                Create account
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-ink-soft">
              Already have an account?{" "}
              <Link
                href="/account/login"
                className="font-medium text-ink underline underline-offset-4 hover:text-gold-dark"
              >
                Sign in
              </Link>
            </p>

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
