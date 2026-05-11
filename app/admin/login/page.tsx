"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";
import { AdminButton } from "@/components/admin/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/");
    router.refresh();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Left — brand visual */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/editorial/ladies-collection.webp"
          alt="Habiba Minhas ladies collection"
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm">
              <Image
                src="/logo/habiba-minhas-icon-t.png"
                alt=""
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="text-[16px] font-semibold leading-tight">
                Habiba Minhas
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                Admin Portal
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure admin access
            </div>
            <h2 className="text-[28px] font-semibold leading-tight">
              Manage your store with confidence.
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              Orders, products, customers — everything in one place. Sign in to
              continue running Habiba Minhas.
            </p>
          </div>

          <div className="flex items-center justify-between text-[13px] text-white/60">
            <span>© {new Date().getFullYear()} Habiba Minhas</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to store
            </Link>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex flex-col bg-[var(--admin-surface-alt)]">
        {/* Mobile brand bar */}
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 overflow-hidden rounded-md bg-[var(--admin-primary-soft)]">
              <Image
                src="/logo/habiba-minhas-icon-t.png"
                alt=""
                fill
                sizes="32px"
                className="object-contain p-1"
              />
            </div>
            <div className="text-[15px] font-semibold text-[var(--admin-text)]">
              Habiba Minhas
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Store
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Logo card on desktop */}
            <div className="mb-8 hidden flex-col items-start gap-3 lg:flex">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[var(--admin-primary-soft)]">
                <Image
                  src="/logo/habiba-minhas-icon-t.png"
                  alt=""
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </div>
            </div>

            <h1 className="text-[28px] font-semibold leading-tight text-[var(--admin-text)]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--admin-text-soft)]">
              Sign in to your admin dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@habibaminhas.com"
                    className="h-12 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary-soft)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-11 text-[15px] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary-soft)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[var(--admin-text-soft)] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]"
                />
                Keep me signed in on this device
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-danger-soft)] bg-[var(--admin-danger-soft)] px-3 py-2.5 text-[14px] text-[var(--admin-danger)]"
                >
                  <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--admin-danger)]" />
                  <span>{error}</span>
                </div>
              )}

              <AdminButton type="submit" fullWidth loading={loading} size="md" className="h-12 text-[16px]">
                Sign in to dashboard
              </AdminButton>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[var(--admin-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected admin access · SSL encrypted
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--admin-border)] px-6 py-4 text-center text-[12px] text-[var(--admin-text-muted)] lg:hidden">
          © {new Date().getFullYear()} Habiba Minhas
        </div>
      </main>
    </div>
  );
}
