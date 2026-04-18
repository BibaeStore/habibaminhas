"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  LayoutGrid,
  Megaphone,
  X,
  Bell,
} from "lucide-react";
import { adminLogout } from "@/lib/actions/auth";
import { getOrderStats } from "@/lib/actions/orders";
import { AdminButton } from "./ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  dynamicBadge?: boolean;
}

const DAILY: NavItem[] = [
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, dynamicBadge: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
];

const SETUP: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavGroup({
  title,
  items,
  pathname,
  pendingOrders,
  onItemClick,
}: {
  title: string;
  items: NavItem[];
  pathname: string | null;
  pendingOrders: number | null;
  onItemClick?: () => void;
}) {
  return (
    <div>
      <div className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--admin-text-muted)]">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {items.map(({ label, href, icon: Icon, dynamicBadge }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname?.startsWith(href));
          const badge =
            dynamicBadge && pendingOrders && pendingOrders > 0
              ? String(pendingOrders)
              : null;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onItemClick}
                className={`relative flex h-12 items-center gap-3 rounded-[var(--admin-radius)] px-4 text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                    : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--admin-primary)]" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [pendingOrders, setPendingOrders] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getOrderStats()
      .then((s) => setPendingOrders(s.byStatus.pending + s.byStatus.processing))
      .catch(() => {});
  }, []);

  function handleLogout() {
    startTransition(() => {
      adminLogout();
    });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[264px] shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] text-[var(--admin-primary)] font-bold">
            HM
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[var(--admin-text)] leading-none">
              Habiba Minhas
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">
              Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <NavGroup
            title="Daily tasks"
            items={DAILY}
            pathname={pathname}
            pendingOrders={pendingOrders}
            onItemClick={onClose}
          />
          <NavGroup
            title="Setup & reports"
            items={SETUP}
            pathname={pathname}
            pendingOrders={pendingOrders}
            onItemClick={onClose}
          />
        </nav>

        <div className="border-t border-[var(--admin-border)] p-3">
          <div className="flex items-center gap-3 px-1 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-bold text-[var(--admin-primary)]">
              H
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--admin-text)]">
                Habiba Minhas
              </div>
              <div className="truncate text-xs text-[var(--admin-text-muted)]">
                Super admin
              </div>
            </div>
          </div>
          <AdminButton
            variant="outline"
            fullWidth
            onClick={handleLogout}
            loading={isPending}
            leadingIcon={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </AdminButton>
        </div>
      </aside>
    </>
  );
}
