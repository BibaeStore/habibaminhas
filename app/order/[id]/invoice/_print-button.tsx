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
      const url = `/api/invoice/${orderNumber}`;
      console.log("[Download] Fetching PDF from:", url);

      const response = await fetch(url);
      console.log("[Download] Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Download] Error response:", errorText);
        throw new Error(`Failed to download invoice: ${response.status} ${response.statusText}`);
      }

      console.log("[Download] Converting to blob...");
      const blob = await response.blob();
      console.log("[Download] Blob created, size:", blob.size, "type:", blob.type);
      console.log("[Download] Creating download link...");
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `HabibaMinhas-Invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      console.log("[Download] ✅ Download complete!");
    } catch (error) {
      console.error("[Download] ❌ Error:", error);
      alert(`Failed to download invoice. Please try again.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`);
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
