"use client";

import Link from "next/link";
import { ChevronRight, Bell, Lock, Trash2, User, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { customerUpdateName, customerUpdatePassword } from "@/lib/actions/customer-auth";

export default function SettingsPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [nameError, setNameError] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  const [notifState, setNotifState] = useState({
    orderUpdates: true,
    newArrivals: true,
    offers: false,
    journal: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError("Please enter your name."); return; }
    setNameStatus("saving"); setNameError("");
    const result = await customerUpdateName(name.trim());
    if (result.error) { setNameError(result.error); setNameStatus("error"); return; }
    setNameStatus("saved");
    setTimeout(() => setNameStatus("idle"), 2500);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPw || newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwStatus("saving"); setPwError("");
    const result = await customerUpdatePassword(newPw);
    if (result.error) { setPwError(result.error); setPwStatus("error"); return; }
    setPwStatus("saved");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwStatus("idle"), 2500);
  }

  function handleNotifToggle(key: keyof typeof notifState) {
    setNotifState((prev) => ({ ...prev, [key]: !prev[key] }));
    setNotifSaved(false);
  }

  function handleSaveNotif() {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  }

  const inputCls = "h-12 border border-border-soft bg-cream px-4 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory";
  const btnCls = "mt-6 h-11 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">

      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <Link href="/account" className="transition-colors hover:text-ink">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-soft">Settings</span>
      </nav>

      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Your account</span>
      <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Settings.</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Manage your name, password, and notification preferences.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">

        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-8">

          {/* Personal info */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Personal information</h2>
            </div>
            <form onSubmit={handleSaveName} className="max-w-sm flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Display name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </label>
              {nameError && <p className="text-[12px] text-sale">{nameError}</p>}
              <button type="submit" disabled={nameStatus === "saving"} className={btnCls}>
                {nameStatus === "saved"
                  ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Saved</span>
                  : nameStatus === "saving" ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>

          {/* Password */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Change password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="max-w-sm flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">New password</span>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" className={inputCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Confirm new password</span>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password" className={inputCls} />
              </label>
              {pwError && <p className="text-[12px] text-sale">{pwError}</p>}
              <p className="text-[12px] text-ink-soft">
                Forgotten your current password?{" "}
                <Link href="/account/forgot-password" className="text-gold-dark hover:text-ink">
                  Reset via email
                </Link>
              </p>
              <button type="submit" disabled={pwStatus === "saving"} className={btnCls}>
                {pwStatus === "saved"
                  ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Updated</span>
                  : pwStatus === "saving" ? "Updating…" : "Update password"}
              </button>
            </form>
          </section>

          {/* Notifications */}
          <section className="border border-border-soft bg-ivory p-6">
            <div className="mb-5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-gold-dark" />
              <h2 className="font-display text-2xl italic">Notifications</h2>
            </div>
            <div className="flex flex-col gap-4">
              {([
                { key: "orderUpdates" as const, label: "Order updates",   sub: "Shipping, delivery, and return notifications" },
                { key: "newArrivals"  as const, label: "New arrivals",    sub: "Be first to know when new collections drop" },
                { key: "offers"       as const, label: "Exclusive offers", sub: "Flash sales, loyalty rewards, and special events" },
                { key: "journal"      as const, label: "Journal",          sub: "New posts from The Habiba Minhas Journal" },
              ]).map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-4 border-b border-border-soft pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-[13px] font-medium">{n.label}</div>
                    <div className="text-[12px] text-ink-soft">{n.sub}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={n.label}
                    onClick={() => handleNotifToggle(n.key)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${notifState[n.key] ? "bg-ink" : "bg-border-soft"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${notifState[n.key] ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleSaveNotif} className={btnCls}>
              {notifSaved
                ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Preferences saved</span>
                : "Save preferences"}
            </button>
          </section>

          {/* Danger zone */}
          <section className="border border-sale/20 bg-ivory p-6">
            <div className="mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-sale" />
              <h2 className="font-display text-2xl italic text-sale">Delete account</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              To permanently delete your account and all associated data, please contact our support team.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex h-11 items-center border border-sale px-8 text-[12px] uppercase tracking-[0.28em] text-sale transition-colors hover:bg-sale hover:text-ivory"
            >
              Contact support
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
