"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-[#1a1612] bg-[#1a1612] px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] text-white transition-opacity hover:opacity-80"
    >
      <Printer className="h-3.5 w-3.5" />
      Print / Save as PDF
    </button>
  );
}
