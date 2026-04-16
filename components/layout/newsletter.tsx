"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="mt-14 grid items-center gap-8 border border-border-soft bg-ivory px-6 py-10 sm:px-10 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">
          The Atelier Letter
        </div>
        <h3 className="mt-3 font-display text-3xl italic leading-tight text-ink sm:text-4xl">
          Slow dispatches from the studio.
        </h3>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-soft">
          New collections, fabric notes, restocks, and the occasional
          behind-the-scenes from Karachi. One email a week, never more.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return;
          setSent(true);
          setEmail("");
        }}
        className="flex w-full items-end gap-3 lg:col-span-6"
      >
        <label className="flex-1">
          <span className="block text-[11px] uppercase tracking-[0.24em] text-muted">
            Email address
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 h-11 w-full border-0 border-b border-ink/25 bg-transparent px-0 text-[14px] text-ink outline-none placeholder:text-muted focus:border-ink"
          />
        </label>
        <button
          type="submit"
          className="group flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
        >
          {sent ? "Subscribed" : "Subscribe"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </form>
    </div>
  );
}
