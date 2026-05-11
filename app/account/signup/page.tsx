"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { customerSignUp } from "@/lib/actions/customer-auth";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fullName = `${firstName} ${lastName}`.trim();
    const result = await customerSignUp(fullName, email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    if (result.needsConfirmation) {
      setConfirmationSent(true);
      setSubmitting(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

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

            {confirmationSent ? (
              <div className="mt-10 border border-gold-dark/40 bg-cream p-6">
                <h2 className="font-display text-2xl italic">Check your inbox.</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  We sent a confirmation link to <strong className="text-ink">{email}</strong>.
                  Click it to verify your email, then sign in.
                </p>
                <Link
                  href="/account/login"
                  className="mt-5 inline-flex h-11 items-center bg-ink px-6 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
                >
                  Go to sign in
                </Link>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5" noValidate>

              {error && (
                <div className="border border-sale/40 bg-sale/5 p-3 text-[13px] text-sale">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted">First name</span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Fatima"
                    autoComplete="given-name"
                    className="h-12 border border-border-soft bg-cream px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted">Last name</span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Raza"
                    autoComplete="family-name"
                    className="h-12 border border-border-soft bg-cream px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-muted">Email address</span>
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

              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-muted">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex h-14 items-center justify-center bg-ink text-[12px] uppercase tracking-[0.32em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create account"}
              </button>
            </form>
            )}

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
