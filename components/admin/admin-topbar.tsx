"use client";

import { Bell, Menu, ExternalLink, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";

const LABELS: Record<string, string> = {
  admin:         "Dashboard",
  orders:        "Orders",
  products:      "Products",
  customers:     "Customers",
  categories:    "Categories",
  analytics:     "Analytics",
  settings:      "Settings",
  notifications: "Notifications",
};

function useBreadcrumbs() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({ label: LABELS[seg] ?? seg, href: path });
  }
  return crumbs;
}

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const breadcrumbs         = useBreadcrumbs();
  const currentPage         = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard";

  const refresh = useCallback(() => {
    getUnreadCount().then(setUnread).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <header
      className="shrink-0"
      style={{ background: "var(--admin-surface)", borderBottom: "1px solid var(--admin-border)" }}
    >
      {/* ── Single main row ──────────────────────────────────── */}
      <div className="flex h-[68px] items-center gap-3 px-4 md:px-6">

        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--admin-text-soft)] transition-colors hover:bg-[var(--admin-surface-alt)] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title + breadcrumb */}
        <div className="hidden flex-col md:flex">
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-1 mb-0.5">
              {breadcrumbs.slice(0, -1).map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" style={{ color: "var(--admin-text-muted)" }} />}
                  <Link
                    href={crumb.href}
                    className="text-[12px] transition-colors hover:text-[var(--admin-primary)]"
                    style={{ color: "var(--admin-text-muted)" }}
                  >
                    {crumb.label}
                  </Link>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-[22px] font-semibold leading-tight" style={{ color: "var(--admin-text)" }}>
            {currentPage}
          </h1>
        </div>

        {/* Mobile: just the page title */}
        <h1 className="text-[20px] font-semibold md:hidden" style={{ color: "var(--admin-text)" }}>
          {currentPage}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search — desktop only */}
        <div className="relative hidden w-full max-w-[320px] md:flex">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--admin-text-muted)" }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, products…"
            className="h-10 w-full pl-10 pr-4 text-[14px] outline-none transition-colors"
            style={{
              background:   "var(--admin-surface-alt)",
              border:       "1px solid var(--admin-border)",
              borderRadius: "99px",
              color:        "var(--admin-text)",
            }}
            onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--admin-primary)")}
            onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--admin-border)")}
          />
        </div>

        {/* Notifications — circle, no box border */}
        <Link
          href="/admin/notifications"
          aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--admin-text-soft)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Bell className="h-[22px] w-[22px]" />
          {unread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-ivory"
              style={{ background: "var(--admin-primary)" }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        {/* Profile avatar */}
        <div
          className="flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full text-[13px] font-bold text-ivory"
          style={{ background: "var(--admin-primary)" }}
          title="Habiba Minhas — Super Admin"
        >
          HM
        </div>

        {/* View Store — text + icon, no box */}
        <Link
          href="/"
          target="_blank"
          className="hidden shrink-0 items-center gap-1.5 text-[14px] font-medium transition-colors sm:flex"
          style={{ color: "var(--admin-text-soft)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--admin-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--admin-text-soft)")}
        >
          View Store
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
