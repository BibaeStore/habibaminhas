"use client";

import { Printer, Download } from "lucide-react";
import { useParams } from "next/navigation";

export function PrintButton() {
  const params = useParams();
  const orderNumber = params.id as string;

  return (
    <div className="flex items-center gap-3">
      {/* Simple link download - no fetch(), no JavaScript complexity */}
      <a
        href={`/api/invoice/${orderNumber}`}
        download={`HabibaMinhas-Invoice-${orderNumber}.pdf`}
        className="inline-flex items-center gap-2 border border-[#1a1612] bg-[#1a1612] px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] text-white transition-opacity hover:opacity-80"
      >
        <Download className="h-3.5 w-3.5" />
        Download PDF
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 border border-[#1a1612] bg-white px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] text-[#1a1612] transition-opacity hover:opacity-80"
      >
        <Printer className="h-3.5 w-3.5" />
        Print Page
      </button>
    </div>
  );
}
