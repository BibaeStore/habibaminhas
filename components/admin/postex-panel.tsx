"use client";

/**
 * PostEx controls for the admin order-detail page. Fully self-contained and
 * env-gated: renders nothing unless PostEx is configured, so dropping it into
 * the order page changes nothing when the feature is off.
 */
import { useEffect, useState } from "react";
import { Truck, Download, RefreshCw, XCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import {
  postexEnabled,
  bookPostexShipment,
  cancelPostexShipment,
  syncPostexStatus,
  getPostexAirwayBill,
  type BookPostexResult,
} from "@/lib/actions/postex";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders">;

export function PostexPanel({
  order,
  adminEmail,
  onRefresh,
}: {
  order: Order;
  adminEmail: string;
  onRefresh: () => void | Promise<void>;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<"" | "book" | "awb" | "sync" | "cancel">("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cityPrompt, setCityPrompt] = useState<{ suggestions: string[] } | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    postexEnabled().then(setEnabled);
  }, []);

  if (enabled === null || enabled === false) return null;

  const booked = Boolean(order.postex_tracking_number);

  function handleResult(res: BookPostexResult) {
    if (res.ok) {
      setNotice(`Booked ✓ Tracking ${res.trackingNumber} · collect ${formatPrice(res.codAmount)} · ${res.cityName}`);
      setError(null);
      setCityPrompt(null);
      void onRefresh();
      return;
    }
    if (res.reason === "city_unmatched") {
      setCityPrompt({ suggestions: res.suggestions ?? [] });
      setError(res.message);
      return;
    }
    setError(res.message);
  }

  async function doBook(cityOverride?: string) {
    setBusy("book");
    setError(null);
    setNotice(null);
    try {
      const res = await bookPostexShipment(order.id, { cityNameOverride: cityOverride, adminEmail });
      handleResult(res);
    } finally {
      setBusy("");
    }
  }

  async function doSync() {
    setBusy("sync");
    setError(null);
    setNotice(null);
    try {
      const res = await syncPostexStatus(order.id, { adminEmail });
      if (res.ok) {
        setNotice(`Synced ✓ PostEx: ${res.postexStatus || "—"} → ${res.status}`);
        void onRefresh();
      } else setError(res.message ?? "Sync failed.");
    } finally {
      setBusy("");
    }
  }

  async function doCancel() {
    setBusy("cancel");
    setError(null);
    setNotice(null);
    try {
      const res = await cancelPostexShipment(order.id, { adminEmail });
      if (res.ok) {
        setNotice("PostEx booking cancelled.");
        setConfirmCancel(false);
        void onRefresh();
      } else setError(res.message ?? "Cancel failed.");
    } finally {
      setBusy("");
    }
  }

  async function doDownloadAwb() {
    setBusy("awb");
    setError(null);
    try {
      const res = await getPostexAirwayBill(order.id);
      if (res.ok && res.base64) {
        const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else setError(res.message ?? "Could not fetch airway bill.");
    } finally {
      setBusy("");
    }
  }

  const settled = order.postex_cod_settled;

  return (
    <div
      className="mt-4 rounded-lg p-4"
      style={{ border: "1px solid var(--admin-border)", background: "var(--admin-surface-alt, var(--admin-surface))" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4" style={{ color: "var(--admin-primary)" }} />
        <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: "var(--admin-text)" }}>
          PostEx
        </span>
        {booked && (
          <span
            className="ml-auto rounded px-2 py-0.5 font-mono text-[12px]"
            style={{ background: "var(--admin-surface)", color: "var(--admin-text-muted)" }}
          >
            {order.postex_tracking_number}
          </span>
        )}
      </div>

      {/* Messages */}
      {notice && (
        <div className="mb-3 flex items-start gap-2 rounded p-2 text-[13px]" style={{ background: "#d1fae5", color: "#065f46" }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded p-2 text-[13px]" style={{ background: "#fef3c7", color: "#92400e" }}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!booked ? (
        <>
          {/* City picker appears only on a mismatch */}
          {cityPrompt && (
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-semibold" style={{ color: "var(--admin-text)" }}>
                Select the correct PostEx delivery city
              </label>
              <input
                list="postex-city-suggestions"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Start typing a city…"
                className="h-10 w-full px-3 text-[14px] outline-none"
                style={{ border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius)", background: "var(--admin-surface)", color: "var(--admin-text)" }}
              />
              <datalist id="postex-city-suggestions">
                {cityPrompt.suggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}
          <AdminButton
            onClick={() => doBook(cityPrompt ? cityInput.trim() || undefined : undefined)}
            disabled={busy !== "" || (Boolean(cityPrompt) && !cityInput.trim())}
          >
            {busy === "book" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            {cityPrompt ? "Book with this city" : "Book with PostEx"}
          </AdminButton>
        </>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 text-[13px]">
            <div>
              <div className="text-[11px] uppercase" style={{ color: "var(--admin-text-muted)" }}>PostEx status</div>
              <div style={{ color: "var(--admin-text)" }}>{order.postex_status || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase" style={{ color: "var(--admin-text-muted)" }}>COD to collect</div>
              <div style={{ color: "var(--admin-text)" }}>
                {order.postex_cod_amount != null ? formatPrice(order.postex_cod_amount) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase" style={{ color: "var(--admin-text-muted)" }}>Settlement</div>
              <div style={{ color: settled ? "#065f46" : "var(--admin-text-muted)" }}>
                {settled ? `Settled ${order.postex_settlement_date ?? ""}` : "Pending"}
                {order.postex_cpr ? ` · CPR ${order.postex_cpr}` : ""}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase" style={{ color: "var(--admin-text-muted)" }}>Last synced</div>
              <div style={{ color: "var(--admin-text-muted)" }}>
                {order.postex_synced_at ? new Date(order.postex_synced_at).toLocaleString("en-PK") : "—"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AdminButton variant="outline" onClick={doDownloadAwb} disabled={busy !== ""}>
              {busy === "awb" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Airway Bill
            </AdminButton>
            <AdminButton variant="outline" onClick={doSync} disabled={busy !== ""}>
              {busy === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync status
            </AdminButton>
            {!confirmCancel ? (
              <AdminButton variant="outline" onClick={() => setConfirmCancel(true)} disabled={busy !== ""}>
                <XCircle className="h-4 w-4" />
                Cancel booking
              </AdminButton>
            ) : (
              <>
                <AdminButton variant="danger" onClick={doCancel} disabled={busy !== ""}>
                  {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Confirm cancel
                </AdminButton>
                <AdminButton variant="outline" onClick={() => setConfirmCancel(false)} disabled={busy !== ""}>
                  Keep
                </AdminButton>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
