"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { customerSignIn } from "@/lib/actions/customer-auth";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params?.get("redirect") ?? "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await customerSignIn(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

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
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5" noValidate>

              {error && (
                <div className="border border-sale/40 bg-sale/5 p-3 text-[13px] text-sale">
                  {error}
                </div>
              )}

              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-muted">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-end">
                <Link
                  href="/account/forgot-password"
                  className="text-[12px] text-gold-dark underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-14 items-center justify-center bg-ink text-[12px] uppercase tracking-[0.32em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
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
