"use client";

import { Search, Bell } from "lucide-react";
import Link from "next/link";

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-soft bg-ivory px-6 shrink-0">
      <h1 className="font-display text-2xl italic text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search…"
            className="h-9 w-56 border border-border-soft bg-cream pl-9 pr-3 text-[12px] outline-none focus:border-ink"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center border border-border-soft bg-cream text-muted hover:text-ink transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-gold-dark" />
        </button>
        <Link
          href="/"
          target="_blank"
          className="hidden h-9 items-center gap-2 border border-border-soft bg-cream px-4 text-[11px] uppercase tracking-[0.22em] text-ink-soft hover:bg-ink hover:text-ivory transition-colors sm:flex"
        >
          View store →
        </Link>
      </div>
    </header>
  );
}
