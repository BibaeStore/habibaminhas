"use client";

import Link from "next/link";
import { useState } from "react";
import { X, ChevronDown, Globe, User, Heart, ShoppingBag } from "lucide-react";
import { megaMenus } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[86%] max-w-[380px] bg-ivory shadow-lift transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-soft px-5">
          <span className="font-display text-lg italic">Habiba Minhas</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex h-[calc(100%-4rem)] flex-col overflow-y-auto">
          <div className="flex flex-col">
            {megaMenus.map((m) => (
              <div key={m.label} className="border-b border-border-soft">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(expanded === m.label ? null : m.label)
                  }
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-[13px] uppercase tracking-[0.28em]"
                >
                  {m.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expanded === m.label && "rotate-180",
                    )}
                  />
                </button>
                {expanded === m.label ? (
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
                                {it.badge ? (
                                  <span
                                    className={`ml-2 text-[9px] uppercase tracking-[0.22em] ${
                                      it.badge === "Sale"
                                        ? "text-sale"
                                        : "text-gold-dark"
                                    }`}
                                  >
                                    · {it.badge}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link
              href="/new"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[13px] uppercase tracking-[0.28em]"
            >
              New Arrivals
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[13px] uppercase tracking-[0.28em]"
            >
              Contact Us
            </Link>
            <Link
              href="/offers"
              onClick={onClose}
              className="border-b border-border-soft px-5 py-4 text-[13px] uppercase tracking-[0.28em] text-sale"
            >
              Sale
            </Link>
          </div>
          <div className="mt-auto flex flex-col gap-1 bg-cream/60 px-5 py-6">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 py-2 text-[13px] text-ink-soft"
            >
              <User className="h-4 w-4" /> Account
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 py-2 text-[13px] text-ink-soft"
            >
              <Heart className="h-4 w-4" /> Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 py-2 text-[13px] text-ink-soft"
            >
              <ShoppingBag className="h-4 w-4" /> Cart
            </Link>
            <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted">
              <Globe className="h-3.5 w-3.5" /> Shipping to Pakistan
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
