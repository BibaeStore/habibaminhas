"use client";

import { useState } from "react";
import Link from "next/link";
import { customerForgotPassword } from "@/lib/actions/customer-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await customerForgotPassword(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Reset password.</h1>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
        Enter your email and we&apos;ll send you a secure link to set a new password.
      </p>

      {sent ? (
        <div className="mt-8 border border-gold-dark/40 bg-cream p-5">
          <p className="text-[13px] leading-relaxed text-ink">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div className="border border-sale/40 bg-sale/5 p-3 text-[13px] text-sale">{error}</div>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Email address</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none placeholder:text-muted/60 transition-colors focus:border-ink focus:bg-ivory"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="h-12 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[13px] text-ink-soft">
        Remembered it?{" "}
        <Link href="/account/login" className="font-medium text-ink underline underline-offset-4 hover:text-gold-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
