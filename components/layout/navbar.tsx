"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Heart, Menu, ChevronDown, Globe } from "lucide-react";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { megaMenus as fallbackMenus, type MegaMenu } from "@/lib/data";
import { MegaPanel } from "./mega-panel";
import { MobileMenu } from "./mobile-menu";
import { cn } from "@/lib/utils";

type FetchedMenu = Omit<MegaMenu, "feature"> & {
  feature?: {
    title: string;
    subtitle: string;
    href: string;
    image: string | null;
  };
};

const TONES = ["rose", "gold", "sage", "ink"] as const;

function adaptFetched(menus: FetchedMenu[]): MegaMenu[] {
  return menus.map((m, idx) => ({
    ...m,
    feature: m.feature
      ? {
          title: m.feature.title,
          subtitle: m.feature.subtitle,
          href: m.feature.href,
          tone: TONES[idx % TONES.length],
          image: m.feature.image ?? undefined,
        }
      : undefined,
  }));
}

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [menus, setMenus] = useState<MegaMenu[]>(fallbackMenus);

  // Close-delay timer — prevents panel closing when mouse crosses the 74px header gap
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(null), 150);
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/categories/images")
      .then((r) => r.json())
      .then((map: Record<string, string>) => setCategoryImages(map))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/nav-menu")
      .then((r) => r.json())
      .then((fetched: FetchedMenu[]) => {
        if (Array.isArray(fetched) && fetched.length > 0) {
          setMenus(adaptFetched(fetched));
        }
      })
      .catch(() => {});
  }, []);

  const goToSearch = () => {
    setOpen(null);
    router.push("/search");
  };

  return (
    <header
      className={cn(
        "bg-ivory/95 backdrop-blur-md transition-shadow",
        scrolled ? "shadow-[0_1px_0_rgba(26,22,18,0.06)]" : "",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-[52px] w-full max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-8">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6">
          {/* Mobile: hamburger + search */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={goToSearch}
              className="p-2 text-ink hover:text-gold-dark"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" aria-label="Habiba Minhas" onMouseEnter={cancelClose}>
            <Image
              src="/logo/habiba-minhas-logo-t.png"
              alt="Habiba Minhas"
              width={260}
              height={87}
              className="h-[40px] w-auto sm:h-[64px]"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {menus.map((m) => (
              <button
                key={m.label}
                type="button"
                onMouseEnter={() => {
                  cancelClose();
                  setOpen(m.label);
                }}
                onClick={() => setOpen(open === m.label ? null : m.label)}
                className={cn(
                  "group relative px-3 py-3 text-[10px] uppercase tracking-[0.22em] transition-colors",
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
              href="/about"
              onMouseEnter={() => { cancelClose(); setOpen(null); }}
              className="px-3 py-3 text-[10px] uppercase tracking-[0.22em] text-ink hover:text-gold-dark"
            >
              About
            </Link>
          </div>
        </div>

        {/* Right: utility icons */}
        <div className="flex items-center gap-1 sm:gap-2" onMouseEnter={cancelClose}>
          {/* Search button → navigates to /search page */}
          <button
            type="button"
            aria-label="Search"
            onClick={goToSearch}
            className="hidden lg:inline-flex items-center gap-2 border border-border-soft px-3 py-1.5 text-ink hover:border-ink hover:text-gold-dark transition-colors"
          >
            <Search className="h-[15px] w-[15px]" />
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
          <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-ink hover:text-gold-dark">
            <Heart className="h-[18px] w-[18px]" />
          </Link>
          <CartTrigger />
        </div>
      </div>

      {open
        ? (() => {
            const active = menus.find((m) => m.label === open);
            return active ? (
              <MegaPanel
                menu={active}
                categoryImages={categoryImages}
                onClose={() => setOpen(null)}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              />
            ) : null;
          })()
        : null}

      <MobileMenu menus={menus} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
