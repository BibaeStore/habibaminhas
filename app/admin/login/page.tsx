"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col justify-between bg-ink px-8 py-10 sm:px-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 bg-gold-dark overflow-hidden">
            <Image src="/logo/habiba-minhas-icon-t.png" alt="Habiba Minhas" fill sizes="36px" className="object-contain p-1" />
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

          {error && (
            <div className="mt-6 border border-sale/40 bg-sale/10 px-4 py-3 text-[12px] text-sale">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-gold-dark/80">
                Email address
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-12 border-0 border-b border-ivory/20 bg-transparent px-0 text-[14px] text-ivory outline-none placeholder:text-ivory/25 focus:border-gold-dark"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-14 items-center justify-center gap-2 bg-gold-dark text-[12px] uppercase tracking-[0.28em] text-ink transition-colors hover:bg-ivory disabled:opacity-60"
            >
              <Lock className="h-3.5 w-3.5" />
              {loading ? "Signing in…" : "Sign in securely"}
            </button>
          </form>

          <div className="mt-10 flex items-start gap-3 border border-ivory/10 bg-ivory/5 p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
            <p className="text-[11px] leading-relaxed text-ivory/40">
              This portal is restricted to authorised Habiba Minhas staff only. Unauthorised access attempts are logged and reported.
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] text-ivory/30">
            First time?{" "}
            <Link href="/admin/setup" className="text-gold-dark hover:text-ivory transition-colors">
              Create admin account →
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-ivory/30">
          <span>© 2026 Habiba Minhas</span>
          <Link href="/" className="transition-colors hover:text-ivory/60">
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
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent" />
      </div>
    </div>
  );
}
