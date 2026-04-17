"use client";

import { Search, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";

export function AdminTopbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    getUnreadCount().then(setUnread).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border-soft bg-ivory px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-cream md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl italic text-ink md:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search…"
            className="h-9 w-56 border border-border-soft bg-cream pl-9 pr-3 text-[12px] outline-none focus:border-ink"
          />
        </div>

        {/* Notification bell */}
        <Link
          href="/admin/notifications"
          className="relative flex h-9 w-9 items-center justify-center border border-border-soft bg-cream text-muted hover:text-ink transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-gold-dark px-1 text-[10px] font-bold text-ink leading-none">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

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
