"use client";

import { Search, Bell, Menu, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";
import { AdminButton } from "./ui/button";

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
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--admin-text)] md:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input
            type="search"
            placeholder="Search…"
            className="h-11 w-60 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] pl-10 pr-3 text-[15px] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-primary)] focus:bg-[var(--admin-surface)]"
          />
        </div>

        <Link
          href="/admin/notifications"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-[11px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <Link href="/" target="_blank" className="hidden sm:block">
          <AdminButton variant="outline" trailingIcon={<ExternalLink className="h-4 w-4" />}>
            View store
          </AdminButton>
        </Link>
      </div>
    </header>
  );
}
