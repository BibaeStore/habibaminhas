"use client";

/**
 * PostEx bulk actions for the admin orders list. Self-contained and env-gated:
 * renders nothing unless PostEx is configured, so the existing bulk bar is
 * unchanged when the feature is off.
 */
import { useEffect, useState } from "react";
import { Truck, Printer, RefreshCw, ClipboardList, Loader2, X, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { postexEnabled } from "@/lib/actions/postex";
import {
  bulkBookPostex,
  bulkCancelPostex,
  bulkSyncPostex,
  bulkGetAirwayBills,
  bulkGetLoadSheet,
  type BulkReport,
} from "@/lib/actions/postex-bulk";

type Action = "" | "book" | "sync" | "awb" | "loadsheet" | "cancel";

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
  const [confirmCancel, setConfirmCancel] = useState(false);

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
      if (action === "book" || action === "sync" || action === "cancel") await onDone();
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
      <button
        className="flex items-center gap-1.5 rounded-md border border-red-400/50 bg-transparent px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={() => setConfirmCancel(true)}
      >
        {busy === "cancel" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
        Cancel Bookings
      </button>

      {/* Destructive action — always confirm first */}
      {confirmCancel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-[min(460px,92vw)] rounded-lg p-6 shadow-lg"
            style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)" }}>
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: "#b91c1c" }} />
              <h3 className="text-[16px] font-bold" style={{ color: "var(--admin-text)" }}>
                Cancel {selectedIds.length} PostEx booking{selectedIds.length !== 1 ? "s" : ""}?
              </h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
              This cancels the consignment{selectedIds.length !== 1 ? "s" : ""} at PostEx and marks the
              order{selectedIds.length !== 1 ? "s" : ""} cancelled. Delivered orders are skipped. You can
              re-book afterwards. This cannot be undone at PostEx.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmCancel(false)}
                className="rounded-md border px-4 py-2 text-[14px] font-medium"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              >
                Keep bookings
              </button>
              <button
                onClick={() => {
                  setConfirmCancel(false);
                  void run("cancel", () => bulkCancelPostex(selectedIds, adminEmail));
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-[14px] font-semibold text-white hover:bg-red-700"
              >
                Yes, cancel {selectedIds.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result report — centered modal, colour-coded by outcome */}
      {report && (() => {
        const hasProblems = report.failed > 0 || problems.length > 0;
        const nothingHappened = report.succeeded === 0 && !hasProblems;
        const tone = hasProblems
          ? { bg: "#fef2f2", bar: "#b91c1c", text: "#7f1d1d", Icon: AlertTriangle, title: "Completed with problems" }
          : nothingHappened
            ? { bg: "#fffbeb", bar: "#b45309", text: "#78350f", Icon: AlertTriangle, title: "Nothing to do" }
            : { bg: "#f0fdf4", bar: "#15803d", text: "#14532d", Icon: CheckCircle2, title: "Success" };

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setReport(null)}>
            <div
              className="w-[min(620px,94vw)] overflow-hidden rounded-xl shadow-2xl"
              style={{ background: "var(--admin-surface)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Coloured header */}
              <div className="flex items-start gap-3 px-6 py-5" style={{ background: tone.bg, borderBottom: `3px solid ${tone.bar}` }}>
                <tone.Icon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: tone.bar }} />
                <div className="flex-1">
                  <div className="text-[17px] font-bold" style={{ color: tone.text }}>{tone.title}</div>
                  <div className="mt-1 text-[14px]" style={{ color: tone.text }}>
                    {report.message ?? (
                      <>
                        <strong>{report.succeeded}</strong> succeeded
                        {report.failed > 0 && <> · <strong>{report.failed}</strong> failed</>}
                        {report.skipped > 0 && <> · <strong>{report.skipped}</strong> skipped</>}
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => setReport(null)} aria-label="Close" style={{ color: tone.bar }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {problems.length > 0 && (
                <div className="px-6 py-4">
                  <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
                    Orders needing attention
                  </div>
                  <ul className="max-h-64 overflow-y-auto text-[13px]">
                    {problems.map((r) => (
                      <li key={r.orderId} className="flex gap-3 border-t py-2" style={{ borderColor: "var(--admin-border)" }}>
                        <span className="shrink-0 font-mono" style={{ color: "var(--admin-text)" }}>{r.orderNumber}</span>
                        <span style={{ color: "#b91c1c" }}>{r.message}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[12px]" style={{ color: "var(--admin-text-muted)" }}>
                    Open these orders individually to fix them (e.g. choose the correct PostEx city).
                  </p>
                </div>
              )}

              <div className="flex justify-end px-6 py-4" style={{ borderTop: "1px solid var(--admin-border)" }}>
                <button
                  onClick={() => setReport(null)}
                  className="rounded-md px-5 py-2 text-[14px] font-semibold text-white"
                  style={{ background: tone.bar }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
