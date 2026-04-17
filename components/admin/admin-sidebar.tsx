"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  LogOut, ChevronRight, TrendingUp,
  LayoutGrid, Megaphone, X,
} from "lucide-react";

const nav = [
  { label: "Dashboard",  href: "/admin",             icon: LayoutDashboard },
  { label: "Orders",     href: "/admin/orders",       icon: ShoppingBag, badge: "7" },
  { label: "Products",   href: "/admin/products",     icon: Package },
  { label: "Categories", href: "/admin/categories",   icon: LayoutGrid },
  { label: "Customers",  href: "/admin/customers",    icon: Users },
  { label: "Analytics",  href: "/admin/analytics",    icon: TrendingUp },
  { label: "Marketing",  href: "/admin/marketing",    icon: Megaphone },
  { label: "Settings",   href: "/admin/settings",     icon: Settings },
];

export function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 md:hidden"
          onClick={onClose}
        />
      )}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-ink text-ivory shrink-0 transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-ivory/40 hover:text-ivory md:hidden"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-ivory/10 px-6 py-5">
        <div className="relative h-8 w-8 shrink-0">
          <Image src="/logo/habiba-minhas-icon-t.png" alt="Habiba Minhas" fill sizes="32px" className="object-contain" />
        </div>
        <div>
          <div className="font-display text-[14px] italic text-ivory leading-none">Habiba Minhas</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.32em] text-gold-dark">Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {nav.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.2em] transition-all ${
                active
                  ? "bg-gold-dark/15 text-gold-dark"
                  : "text-ivory/50 hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
              {badge && (
                <span className="flex h-5 w-5 items-center justify-center bg-gold-dark text-[10px] font-medium text-ink">
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="ml-auto h-3 w-3 text-gold-dark" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-ivory/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden bg-gold-dark/20 flex items-center justify-center">
            <span className="font-display text-[13px] italic text-gold-dark">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[12px] font-medium text-ivory">Habiba Minhas</div>
            <div className="truncate text-[10px] text-ivory/40">Super Admin</div>
          </div>
          <button className="text-ivory/30 hover:text-sale transition-colors" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
