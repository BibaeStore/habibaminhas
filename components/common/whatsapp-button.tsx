"use client";

import Link from "next/link";
import Image from "next/image";

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/923120295812"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110"
    >
      <Image
        src="/icons/whatsapp.png"
        alt="WhatsApp"
        width={56}
        height={56}
        className="h-14 w-14 drop-shadow-[0_4px_20px_rgba(37,211,102,0.5)]"
        priority
      />

      {/* Tooltip */}
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ivory opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
      </span>
    </Link>
  );
}
