"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, User, Heart, ShoppingBag, Package } from "lucide-react";
import { megaMenus as fallbackMenus, type MegaMenu } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MobileMenu({
  menus: serverMenus,
  open,
  onClose,
}: {
  menus?: MegaMenu[];
  open: boolean;
  onClose: () => void;
}) {
  const megaMenus = serverMenus && serverMenus.length > 0 ? serverMenus : fallbackMenus;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close expanded submenu when panel closes
  useEffect(() => { if (!open) setExpanded(null); }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[200] bg-ink/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Slide panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[200] flex h-full w-[86%] max-w-[380px] flex-col bg-ivory shadow-[4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-modal="true"
        aria-hidden={!open}
      >
        {/* Logo header */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-border-soft px-5">
          <Link href="/" onClick={onClose} aria-label="Home">
            <Image
              src="/logo/habiba-minhas-logo-t.png"
              alt="Habiba Minhas"
              width={180}
              height={60}
              className="h-[80px] w-auto"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center text-ink hover:text-gold-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col">
            {megaMenus.map((m) => (
              <div key={m.label} className="border-b border-border-soft">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === m.label ? null : m.label)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-[12px] uppercase tracking-[0.28em] text-ink"
                >
                  {m.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      expanded === m.label && "rotate-180",
                    )}
                  />
                </button>

                {expanded === m.label && (
                  <div className="flex flex-col gap-4 bg-cream px-5 pb-5 pt-2">
                    {m.columns.map((c) => (
                      <div key={c.heading} className="flex flex-col gap-2">
                        <span className="font-display text-base italic text-ink">
                          {c.heading}
                        </span>
                        <ul className="flex flex-col gap-1.5">
                          {c.items?.map((it) => (
                            <li key={it.label}>
                              <Link
                                href={it.href}
                                onClick={onClose}
                                className="text-[13px] text-ink-soft hover:text-ink"
                              >
                                {it.label}
                                {it.badge && (
                                  <span
                                    className={`ml-2 text-[9px] uppercase tracking-[0.22em] ${it.badge === "Sale" ? "text-sale" : "text-gold-dark"
                                      }`}
                                  >
                                    · {it.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/shop"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[12px] uppercase tracking-[0.28em] text-ink"
            >
              New Arrival
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[12px] uppercase tracking-[0.28em] text-ink"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[12px] uppercase tracking-[0.28em] text-ink"
            >
              Contact Us
            </Link>
          </div>

          {/* Bottom utility links */}
          <div className="mt-auto flex flex-col gap-0.5 border-t border-border-soft bg-cream/60 px-5 py-5">
            <Link
              href="/track"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <Package className="h-4 w-4 text-gold-dark" />
              Track Your Order
            </Link>
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <ShoppingBag className="h-4 w-4" />
              Cart
            </Link>
          </div>
        </nav>
      </aside>
    </>,
    document.body,
  );
}
