"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { trackSubscribe } from "@/lib/analytics";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[560px] text-center">
        <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">
          The Atelier Letter
        </span>
        <h3 className="mt-4 font-display text-3xl italic leading-tight text-ivory sm:text-4xl">
          Slow dispatches from the studio.
        </h3>
        <p className="mt-4 text-[13px] leading-relaxed text-ivory/55">
          New collections, fabric notes, restocks, and the occasional
          behind-the-scenes from Karachi. One email a week, never more.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email || busy) return;
            setBusy(true);
            setError("");
            /* This used to set `sent` and clear the box without saving anything. Report
               success only once the address is actually stored, so the tick means what a
               person reading it assumes it means. */
            const res = await subscribeToNewsletter(email, "footer");
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Could not subscribe.");
              return;
            }
            trackSubscribe("footer-newsletter");
            setSent(true);
            setEmail("");
          }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-12 w-full border border-ivory/20 bg-ivory/5 px-4 text-[14px] text-ivory outline-none placeholder:text-ivory/30 transition-colors focus:border-gold-dark focus:bg-ivory/10 sm:flex-1"
          />
          <button
            type="submit"
            disabled={busy || sent}
            className="group flex h-12 w-full shrink-0 items-center justify-center gap-2 bg-gold-dark px-8 text-[11px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ivory hover:text-ink sm:w-auto"
          >
            {sent ? "Subscribed ✓" : busy ? "Subscribing…" : "Subscribe"}
            {!sent && !busy && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        {/* Renders nothing unless a submit failed, so the server-rendered HTML is unchanged. */}
        {error && (
          <p className="mt-3 text-[13px] text-gold-dark" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
