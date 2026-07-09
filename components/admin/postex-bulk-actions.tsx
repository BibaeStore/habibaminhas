"use client";

/**
 * PostEx bulk actions for the admin orders list. Self-contained and env-gated:
 * renders nothing unless PostEx is configured, so the existing bulk bar is
 * unchanged when the feature is off.
 */
import { useEffect, useState } from "react";
import { Truck, Printer, RefreshCw, ClipboardList, Loader2, X } from "lucide-react";
import { postexEnabled } from "@/lib/actions/postex";
import {
  bulkBookPostex,
  bulkSyncPostex,
  bulkGetAirwayBills,
  bulkGetLoadSheet,
  type BulkReport,
} from "@/lib/actions/postex-bulk";

type Action = "" | "book" | "sync" | "awb" | "loadsheet";

function openPdf(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function PostexBulkActions({
  selectedIds,
  adminEmail,
  onDone,
}: {
  selectedIds: string[];
  adminEmail?: string;
  onDone: () => void | Promise<void>;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<Action>("");
  const [report, setReport] = useState<BulkReport | null>(null);

  useEffect(() => {
    postexEnabled().then(setEnabled);
  }, []);

  if (!enabled || selectedIds.length === 0) return null;

  async function run(action: Action, fn: () => Promise<BulkReport>) {
    setBusy(action);
    setReport(null);
    try {
      const res = await fn();
      setReport(res);
      if (res.pdfBase64 && res.filename) openPdf(res.pdfBase64, res.filename);
      if (action === "book" || action === "sync") await onDone();
    } catch (e) {
      setReport({ ok: false, succeeded: 0, failed: selectedIds.length, skipped: 0, results: [], message: (e as Error).message });
    } finally {
      setBusy("");
    }
  }

  const disabled = busy !== "";
  const problems = report?.results.filter((r) => !r.ok) ?? [];

  // Styled to match the existing dark bulk-action bar it renders inside.
  const btn =
    "flex items-center gap-1.5 rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <>
      <div className="mx-1 h-6 w-px bg-white/30" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">PostEx</span>

      <button className={btn} disabled={disabled}
        onClick={() => run("book", () => bulkBookPostex(selectedIds, adminEmail))}>
        {busy === "book" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
        Book
      </button>
      <button className={btn} disabled={disabled}
        onClick={() => run("awb", () => bulkGetAirwayBills(selectedIds))}>
        {busy === "awb" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
        Airway Bills
      </button>
      <button className={btn} disabled={disabled}
        onClick={() => run("sync", () => bulkSyncPostex(selectedIds, adminEmail))}>
        {busy === "sync" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Sync
      </button>
      <button className={btn} disabled={disabled}
        onClick={() => run("loadsheet", () => bulkGetLoadSheet(selectedIds))}>
        {busy === "loadsheet" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
        Load Sheet
      </button>

      {/* Result report */}
      {report && (
        <div
          className="fixed bottom-28 left-1/2 z-[60] w-[min(680px,92vw)] -translate-x-1/2 rounded-lg p-4 shadow-lg"
          style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[14px] font-semibold" style={{ color: "var(--admin-text)" }}>
              {report.message
                ? report.message
                : `${report.succeeded} succeeded · ${report.failed} failed · ${report.skipped} skipped`}
            </div>
            <button onClick={() => setReport(null)} aria-label="Close" style={{ color: "var(--admin-text-muted)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {problems.length > 0 && (
            <ul className="max-h-48 overflow-y-auto text-[13px]">
              {problems.map((r) => (
                <li key={r.orderId} className="flex gap-2 border-t py-1.5" style={{ borderColor: "var(--admin-border)" }}>
                  <span className="font-mono shrink-0" style={{ color: "var(--admin-text-muted)" }}>{r.orderNumber}</span>
                  <span style={{ color: "#92400e" }}>{r.message}</span>
                </li>
              ))}
            </ul>
          )}
          {problems.length > 0 && (
            <p className="mt-2 text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
              Fix these orders individually from their detail page (e.g. choose the correct PostEx city).
            </p>
          )}
        </div>
      )}
    </>
  );
}
