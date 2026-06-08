"use client";

import { Printer, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export function PrintButton() {
  const params = useParams();
  const orderNumber = params.id as string;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/invoice/${orderNumber}`);
      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HabibaMinhas-Invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 border border-[#1a1612] bg-[#1a1612] px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {downloading ? "Downloading..." : "Download PDF"}
      </button>
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
