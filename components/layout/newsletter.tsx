"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

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
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
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
            className="group flex h-12 w-full shrink-0 items-center justify-center gap-2 bg-gold-dark px-8 text-[11px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ivory hover:text-ink sm:w-auto"
          >
            {sent ? "Subscribed ✓" : "Subscribe"}
            {!sent && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
