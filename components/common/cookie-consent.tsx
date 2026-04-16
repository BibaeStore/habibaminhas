"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Don't show if already answered
    if (localStorage.getItem("hm_cookies")) return;

    // Delay appearance until after the page loader finishes (~3.4s)
    const t = setTimeout(() => setVisible(true), 3600);
    return () => clearTimeout(t);
  }, []);

  function dismiss(accepted: boolean) {
    setLeaving(true);
    localStorage.setItem("hm_cookies", accepted ? "accepted" : "declined");
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-6 left-4 right-4 z-[9998] sm:left-6 sm:right-auto sm:max-w-sm"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? "translateY(12px)" : "translateY(0)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        animation: !leaving ? "cookie-in 0.45s cubic-bezier(0.2,0.6,0.2,1) both" : "none",
      }}
    >
      <style>{`
        @keyframes cookie-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative border border-border-soft bg-ivory shadow-lift">
        {/* Top accent bar */}
        <div className="h-[3px] w-full bg-gold" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/habiba-minhas-icon-t.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="font-display text-[17px] italic leading-snug text-ink">
                We use cookies
              </span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dismiss(false)}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border-soft text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
            We use cookies to enhance your browsing experience, personalise content,
            and analyse traffic. By clicking{" "}
            <strong className="font-medium text-ink">Accept All</strong>, you
            consent to our use of cookies.{" "}
            <Link
              href="/legal/privacy"
              className="underline underline-offset-2 hover:text-ink"
            >
              Privacy Policy
            </Link>
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => dismiss(true)}
              className="flex-1 h-10 bg-ink text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => dismiss(false)}
              className="flex-1 h-10 border border-ink/25 text-[11px] uppercase tracking-[0.26em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
