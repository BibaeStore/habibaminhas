"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Settings, LogOut, TrendingUp, LayoutGrid, X, Bell,
} from "lucide-react";
import { adminLogout } from "@/lib/actions/auth";
import { getOrderStats } from "@/lib/actions/orders";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

// Dashboard first — standalone home item above all sections
const HOME: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
];

const DAILY: NavItem[] = [
  { label: "Orders",        href: "/admin/orders",        icon: ShoppingBag, badge: true },
  { label: "Products",      href: "/admin/products",      icon: Package },
  { label: "Customers",     href: "/admin/customers",     icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
];

const SETUP: NavItem[] = [
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
  { label: "Analytics",  href: "/admin/analytics",  icon: TrendingUp },
  { label: "Settings",   href: "/admin/settings",   icon: Settings },
];

function NavItem({
  item, pathname, pendingCount, onItemClick,
}: {
  item: NavItem; pathname: string | null; pendingCount: number; onItemClick?: () => void;
}) {
  const { label, href, icon: Icon, badge } = item;
  // Normalize pathname: strip trailing slash, then match exactly (dashboard)
  // or as a path prefix (e.g. /admin/orders/ORD-xxx also highlights Orders)
  const norm   = (pathname ?? "").replace(/\/$/, "");
  const isDash = href === "/admin";
  const active = isDash ? norm === "/admin" : norm === href || norm.startsWith(href + "/");
  const count  = badge && pendingCount > 0 ? pendingCount : 0;

  return (
    <li>
      <Link
        href={href}
        onClick={onItemClick}
        className="group relative flex h-[54px] w-full items-center gap-4 px-5 text-[16px] font-medium transition-all duration-150"
        style={{
          color:      active ? "#faf7f1" : "rgba(250,247,241,0.6)",
          background: active ? "rgba(184,148,100,0.2)" : "transparent",
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(250,247,241,0.9)"; }}}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent";              e.currentTarget.style.color = "rgba(250,247,241,0.6)";  }}}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: "#b89464" }} />
        )}
        <Icon className={`h-[22px] w-[22px] shrink-0 transition-colors ${active ? "text-[#b89464]" : ""}`} />
        <span className="flex-1 leading-none">{label}</span>
        {count > 0 && (
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-bold text-ivory"
            style={{ background: "#b89464" }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </li>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pb-1 pt-6 text-[10px] font-bold uppercase tracking-[0.25em]"
      style={{ color: "rgba(250,247,241,0.28)" }}>
      {children}
    </div>
  );
}

export function AdminSidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [pending, setPending]            = useState(0);
  const [isPending, startTransition]     = useTransition();

  useEffect(() => {
    getOrderStats()
      .then((s) => setPending(s.byStatus.pending + s.byStatus.processing))
      .catch(() => {});
  }, []);

  function handleLogout() { startTransition(() => { adminLogout(); }); }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] shrink-0 flex-col transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          background:  "#1a1612",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ivory/50 transition-colors hover:bg-white/10 hover:text-ivory md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── Logo header ───────────────────────────────────────── */}
        <div className="flex items-center px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Image
            src="/logo/habiba-minhas-logo-t.png"
            alt="Habiba Minhas"
            width={220}
            height={74}
            className="w-full max-w-[190px] object-contain brightness-0 invert opacity-90"
            style={{ height: "auto" }}
          />
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto py-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(184,148,100,0.25) transparent" }}
        >
          <style>{`
            .admin-nav::-webkit-scrollbar { width: 3px; }
            .admin-nav::-webkit-scrollbar-track { background: transparent; }
            .admin-nav::-webkit-scrollbar-thumb { background: rgba(184,148,100,0.25); border-radius: 10px; }
          `}</style>
          <div className="admin-nav">
            {/* Dashboard — always first, no section label */}
            <ul className="flex flex-col gap-0.5 pt-2">
              {HOME.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} pendingCount={0} onItemClick={onClose} />
              ))}
            </ul>

            <SectionLabel>Daily Tasks</SectionLabel>
            <ul className="flex flex-col gap-0.5">
              {DAILY.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} pendingCount={pending} onItemClick={onClose} />
              ))}
            </ul>

            <SectionLabel>Setup & Reports</SectionLabel>
            <ul className="flex flex-col gap-0.5">
              {SETUP.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} pendingCount={0} onItemClick={onClose} />
              ))}
            </ul>
          </div>
        </nav>

        {/* ── User footer ───────────────────────────────────────── */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="mb-3 flex items-center gap-3 px-1">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-ivory"
              style={{ background: "#b89464" }}
            >
              HM
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold" style={{ color: "rgba(250,247,241,0.9)" }}>
                Habiba Minhas
              </div>
              <div className="text-[12px]" style={{ color: "rgba(250,247,241,0.4)" }}>Super Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-all"
            style={{ color: "rgba(250,247,241,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#faf7f1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(250,247,241,0.5)"; }}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
