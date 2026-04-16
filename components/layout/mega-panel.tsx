"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MegaMenu } from "@/lib/data";
import { PlaceholderImage } from "@/components/common/placeholder-image";

const toneMap = {
  rose: ["#f6d9da", "#c9917e", "#5a2a22"] as [string, string, string],
  sage: ["#dbe3d0", "#8c9b7e", "#3d4a36"] as [string, string, string],
  gold: ["#efe3d0", "#a8804b", "#2a1f17"] as [string, string, string],
  ink: ["#d7dbe4", "#6f7c8f", "#1a1612"] as [string, string, string],
};

export function MegaPanel({
  menu,
  onClose,
}: {
  menu: MegaMenu;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-full hidden lg:block">
      <div className="border-t border-border-soft bg-ivory shadow-soft animate-fade-up">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-10 px-8 py-10">
          <div className="col-span-8 grid grid-cols-4 gap-8">
            {menu.columns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-4">
                <span className="font-display text-lg italic text-ink">
                  {col.heading}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {col.items?.map((it) => (
                    <li key={it.label}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        className="group inline-flex items-center gap-2 text-[13px] text-ink-soft hover:text-ink"
                      >
                        <span className="link-underline">{it.label}</span>
                        {it.badge ? (
                          <span
                            className={`text-[9px] uppercase tracking-[0.22em] ${
                              it.badge === "Sale" ? "text-sale" : "text-gold-dark"
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
          {menu.feature ? (
            <Link
              href={menu.feature.href}
              onClick={onClose}
              className="col-span-4 group relative block"
            >
              <PlaceholderImage
                tone={toneMap[menu.feature.tone]}
                motif="floral"
                aspect="4/5"
                overlay
                animate
                className="h-full"
              >
                <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                  <span className="text-[10px] uppercase tracking-[0.32em] opacity-90">
                    Featured
                  </span>
                  <h3 className="mt-2 font-display text-2xl italic leading-tight">
                    {menu.feature.title}
                  </h3>
                  <p className="mt-1 max-w-xs text-[12px] leading-relaxed opacity-85">
                    {menu.feature.subtitle}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.28em]">
                    Explore
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </PlaceholderImage>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
