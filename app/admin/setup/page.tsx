"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { createFirstAdmin } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";

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
    <div className="flex min-h-screen items-start justify-center bg-[var(--admin-surface-alt)] px-4 py-10">
      <div className="w-full max-w-[640px]">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[18px] font-semibold text-[var(--admin-text)]">Habiba Minhas</div>
            <div className="text-[12px] text-[var(--admin-text-muted)]">Admin Setup</div>
          </div>
        </div>

        <AdminCard>
          <h2 className="text-[20px] font-semibold text-[var(--admin-text)]">Create Admin Account</h2>
          <p className="mt-1 text-[14px] text-[var(--admin-text-muted)]">
            Set up the first super-admin for your store. This page is only available once.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-danger-soft)] bg-[var(--admin-danger-soft)] px-3 py-2 text-[14px] text-[var(--admin-danger)]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Habiba Minhas"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">
                Email Address
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@habibaminhas.com"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">
                Password
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">
                Confirm Password
              </label>
              <input
                required
                type="password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat password"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>

            <div className="mt-2">
              <AdminButton type="submit" fullWidth loading={loading}>
                Create Admin Account
              </AdminButton>
            </div>
          </form>
        </AdminCard>

      </div>
    </div>
  );
}
