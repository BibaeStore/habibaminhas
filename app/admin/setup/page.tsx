"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { createFirstAdmin } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const result = await createFirstAdmin(form.name, form.email, form.password);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-ink">
            <ShieldCheck className="h-5 w-5 text-ivory" />
          </div>
          <div>
            <div className="font-display text-xl italic">Habiba Minhas</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted">Admin Setup</div>
          </div>
        </div>

        <div className="border border-border-soft bg-ivory p-8">
          <h1 className="font-display text-2xl italic mb-1">Create Admin Account</h1>
          <p className="text-[12px] text-muted mb-6">Set up the first super-admin for your store. This page is only available once.</p>

          {error && (
            <div className="mb-4 border border-sale/30 bg-sale/10 px-4 py-3 text-[12px] text-sale">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Full Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Habiba Minhas"
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email Address</span>
              <input
                required type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@habibaminhas.com"
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Password</span>
              <input
                required type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Confirm Password</span>
              <input
                required type="password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat password"
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full bg-ink text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create Admin Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
