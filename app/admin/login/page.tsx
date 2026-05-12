"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(true);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    router.push("/admin/");
    router.refresh();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

      {/* ── Left — editorial image panel ──────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/editorial/ladies-collection.webp"
          alt="Habiba Minhas collection"
          fill
          sizes="50vw"
          priority
          className="object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink/85" />

        <div className="relative flex h-full flex-col justify-between p-10 text-ivory">
          {/* Logo top-left */}
          <div>
            <Image
              src="/logo/habiba-minhas-logo-t.png"
              alt="Habiba Minhas"
              width={200}
              height={67}
              className="h-[52px] w-auto brightness-0 invert opacity-90"
            />
            <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-ivory/50">
              Admin Portal
            </div>
          </div>

          {/* Bottom copy */}
          <div className="max-w-sm">
            <div className="mb-4 inline-flex items-center gap-2 border border-ivory/20 bg-ivory/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ivory/70 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-dark" />
              Secure admin access
            </div>
            <h2 className="font-display text-3xl italic leading-tight text-ivory">
              Manage your store with confidence.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ivory/60">
              Orders, products, customers — everything in one place.
            </p>
          </div>

          <div className="flex items-center justify-between text-[12px] text-ivory/40">
            <span>© {new Date().getFullYear()} Habiba Minhas Atelier</span>
            <Link href="/" className="inline-flex items-center gap-1.5 text-ivory/60 transition-colors hover:text-ivory">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to store
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Right — login form ─────────────────────────────────────── */}
      <main className="flex flex-col bg-ivory">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-4 lg:hidden">
          <Image
            src="/logo/habiba-minhas-logo-t.png"
            alt="Habiba Minhas"
            width={160}
            height={54}
            className="h-[36px] w-auto"
          />
          <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-ink-soft hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Store
          </Link>
        </div>

        {/* Form centred */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[400px]">

            {/* Logo — desktop only */}
            <div className="mb-10 hidden lg:block">
              <Image
                src="/logo/habiba-minhas-logo-t.png"
                alt="Habiba Minhas"
                width={200}
                height={67}
                className="h-[56px] w-auto"
              />
            </div>

            {/* Heading */}
            <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">
              Admin Portal
            </span>
            <h1 className="mt-3 font-display text-4xl italic leading-tight text-ink">
              Welcome back.
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Sign in to continue managing Habiba Minhas.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@habibaminhas.com"
                    className="h-12 w-full border border-border-soft bg-cream pl-10 pr-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-ink focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full border border-border-soft bg-cream pl-10 pr-11 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-ink focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-ink"
                />
                <span className="text-[13px] text-ink-soft">Keep me signed in on this device</span>
              </label>

              {/* Error */}
              {error && (
                <div role="alert" className="border border-sale/30 bg-sale/5 px-4 py-3 text-[13px] text-sale">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory" />
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </form>

            {/* Footer note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected admin access · SSL encrypted
            </div>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="border-t border-border-soft px-6 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-muted lg:hidden">
          © {new Date().getFullYear()} Habiba Minhas Atelier
        </div>
      </main>
    </div>
  );
}
