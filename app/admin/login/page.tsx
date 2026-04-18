"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";
import { AdminButton } from "@/components/admin/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-surface-alt)] px-4">
      <div className="w-full max-w-[400px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold text-[var(--admin-text)]">
            Sign in to admin
          </h1>
          <p className="mt-1 text-[14px] text-[var(--admin-text-muted)]">
            Enter your email and password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[var(--admin-radius)] border border-[var(--admin-danger-soft)] bg-[var(--admin-danger-soft)] px-3 py-2 text-[14px] text-[var(--admin-danger)]"
            >
              {error}
            </div>
          )}

          <AdminButton type="submit" fullWidth loading={loading}>
            Sign in
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
