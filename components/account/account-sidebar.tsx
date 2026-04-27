"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, MapPin, CreditCard, Heart, User, LogOut, Settings } from "lucide-react";

const NAV = [
  { label: "Overview",  href: "/account",           icon: User },
  { label: "Orders",    href: "/account/orders",     icon: Package },
  { label: "Addresses", href: "/account/addresses",  icon: MapPin },
  { label: "Payments",  href: "/account/payments",   icon: CreditCard },
  { label: "Wishlist",  href: "/wishlist",            icon: Heart },
  { label: "Settings",  href: "/account/settings",   icon: Settings },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function signOut() {
    localStorage.removeItem("hm_customer_email");
    router.push("/account");
    router.refresh();
  }

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto border border-border-soft bg-ivory p-1 lg:flex-col lg:overflow-visible">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/account"
            ? pathname === "/account"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 whitespace-nowrap px-4 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors ${
              active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-sale transition-colors hover:bg-cream lg:mt-auto"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </nav>
  );
}
