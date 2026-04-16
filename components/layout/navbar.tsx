"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  Globe,
} from "lucide-react";
import { megaMenus } from "@/lib/data";
import { MegaPanel } from "./mega-panel";
import { MobileMenu } from "./mobile-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-ivory/85 backdrop-blur-md transition-shadow",
        scrolled ? "shadow-[0_1px_0_rgba(26,22,18,0.06)]" : "",
      )}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:h-[74px] sm:px-8">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6">
          {/* Mobile: hamburger + search */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Logo — left-aligned on all breakpoints */}
          <Link href="/" aria-label="Habiba Minhas">
            <Image
              src="/logo/habiba-minhas-logo-t.png"
              alt="Habiba Minhas"
              width={260}
              height={87}
              className="h-[58px] w-auto sm:h-[70px]"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {megaMenus.map((m) => (
              <button
                key={m.label}
                type="button"
                onMouseEnter={() => setOpen(m.label)}
                onClick={() => setOpen(open === m.label ? null : m.label)}
                className={cn(
                  "group relative px-4 py-3 text-[12px] uppercase tracking-[0.26em] transition-colors",
                  open === m.label ? "text-gold-dark" : "text-ink hover:text-gold-dark",
                )}
              >
                {m.label}
                <ChevronDown
                  className={cn(
                    "ml-1 inline h-3 w-3 transition-transform",
                    open === m.label && "rotate-180",
                  )}
                />
              </button>
            ))}
            <Link
              href="/new"
              className="px-4 py-3 text-[12px] uppercase tracking-[0.26em] text-ink hover:text-gold-dark"
            >
              New In
            </Link>
            <Link
              href="/about"
              className="px-4 py-3 text-[12px] uppercase tracking-[0.26em] text-ink hover:text-gold-dark"
            >
              About
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            className="hidden lg:inline-flex items-center gap-2 p-2 text-ink hover:text-gold-dark"
          >
            <Search className="h-[18px] w-[18px]" />
            <span className="hidden xl:inline text-[11px] uppercase tracking-[0.28em]">
              Search
            </span>
          </button>
          <button
            type="button"
            aria-label="Region"
            className="hidden md:inline-flex items-center gap-1 p-2 text-ink hover:text-gold-dark"
          >
            <Globe className="h-[18px] w-[18px]" />
            <span className="text-[11px] uppercase tracking-[0.22em]">PK</span>
          </button>
          <Link href="/account" aria-label="Account" className="p-2 text-ink hover:text-gold-dark">
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="p-2 text-ink hover:text-gold-dark"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative p-2 text-ink hover:text-gold-dark"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ivory">
              2
            </span>
          </Link>
        </div>
      </div>

      {open
        ? (() => {
            const active = megaMenus.find((m) => m.label === open);
            return active ? (
              <MegaPanel menu={active} onClose={() => setOpen(null)} />
            ) : null;
          })()
        : null}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
