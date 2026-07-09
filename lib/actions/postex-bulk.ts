"use server";

/**
 * Bulk PostEx operations for the admin orders list.
 *
 * Design rules (deliberate):
 *  - Per-order isolation: one bad order (bad phone / unmatched city / API
 *    error) never fails the batch. Every action returns a per-order report.
 *  - City mismatches are SKIPPED and reported, never guessed — a wrong city
 *    means a misrouted parcel. Fix those few individually.
 *  - Requests are sequential with a small delay, not 50 parallel calls, so we
 *    don't hammer or get throttled by PostEx.
 *  - Nothing here mutates existing single-order code paths.
 */
import { revalidatePath } from "next/cache";
import { PDFDocument } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/server";
import { isPostexEnabled } from "@/lib/courier/postex/config";
import {
  fetchPostexAirwayBillBase64,
  fetchPostexLoadSheetBase64,
  trackPostexOrdersBulk,
} from "@/lib/courier/postex/client";
import { bookPostexShipment, syncPostexStatus } from "@/lib/actions/postex";

/** PostEx caps the airway-bill endpoint at 10 tracking numbers per request. */
const AWB_CHUNK = 10;
/** Bulk tracking chunk — keeps the query string a sane length. */
const TRACK_CHUNK = 25;
/** Politeness delay between sequential PostEx writes (ms). */
const THROTTLE_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export interface BulkItemResult {
  orderId: string;
  orderNumber: string;
  ok: boolean;
  /** Short human-readable outcome, e.g. "Booked CX-123" or the failure reason. */
  message: string;
  /** Machine-readable reason on failure, mirrors BookPostexResult.reason. */
  reason?: string;
}

export interface BulkReport {
  ok: boolean;
  succeeded: number;
  failed: number;
  skipped: number;
  results: BulkItemResult[];
  /** Present for PDF actions. */
  pdfBase64?: string;
  filename?: string;
  message?: string;
}

async function orderNumbers(ids: string[]): Promise<Map<string, string>> {
  const sb = createAdminClient();
  const { data } = await sb.from("orders").select("id, order_number").in("id", ids);
  return new Map((data ?? []).map((o) => [o.id, o.order_number]));
}

/* ------------------------------------------------------------------ *
 * 1. Bulk book
 * ------------------------------------------------------------------ */
export async function bulkBookPostex(orderIds: string[], adminEmail?: string): Promise<BulkReport> {
  if (!isPostexEnabled()) return { ok: false, succeeded: 0, failed: 0, skipped: 0, results: [], message: "PostEx is not configured." };

  const names = await orderNumbers(orderIds);
  const results: BulkItemResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const id of orderIds) {
    const orderNumber = names.get(id) ?? id;
    // No cityNameOverride: a mismatch must be resolved deliberately, per order.
    const res = await bookPostexShipment(id, { adminEmail });

    if (res.ok) {
      succeeded++;
      results.push({ orderId: id, orderNumber, ok: true, message: `Booked ${res.trackingNumber}` });
    } else if (res.reason === "already_booked") {
      skipped++;
      results.push({ orderId: id, orderNumber, ok: true, message: "Already booked — skipped", reason: res.reason });
    } else if (res.reason === "city_unmatched") {
      skipped++;
      const hint = res.suggestions?.length ? ` Try: ${res.suggestions.slice(0, 3).join(", ")}` : "";
      results.push({ orderId: id, orderNumber, ok: false, message: `City not recognised by PostEx.${hint}`, reason: res.reason });
    } else {
      failed++;
      results.push({ orderId: id, orderNumber, ok: false, message: res.message, reason: res.reason });
    }
    await sleep(THROTTLE_MS);
  }

  revalidatePath("/admin/orders");
  return { ok: failed === 0, succeeded, failed, skipped, results };
}

/* ------------------------------------------------------------------ *
 * 2. Bulk sync status
 * ------------------------------------------------------------------ */
export async function bulkSyncPostex(orderIds: string[], adminEmail?: string): Promise<BulkReport> {
  if (!isPostexEnabled()) return { ok: false, succeeded: 0, failed: 0, skipped: 0, results: [], message: "PostEx is not configured." };

  const sb = createAdminClient();
  const { data: orders } = await sb
    .from("orders")
    .select("id, order_number, postex_tracking_number")
    .in("id", orderIds);

  const results: BulkItemResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const booked = (orders ?? []).filter((o) => o.postex_tracking_number);
  for (const o of orders ?? []) {
    if (!o.postex_tracking_number) {
      skipped++;
      results.push({ orderId: o.id, orderNumber: o.order_number, ok: true, message: "Not booked — skipped", reason: "not_booked" });
    }
  }

  // Warm PostEx's cache / validate numbers cheaply in bulk, then persist per
  // order via the single-order action (which also pulls COD settlement).
  try {
    for (const grp of chunk(booked.map((o) => o.postex_tracking_number!), TRACK_CHUNK)) {
      await trackPostexOrdersBulk(grp);
    }
  } catch {
    // Bulk pre-fetch is an optimisation only — fall through to per-order sync.
  }

  for (const o of booked) {
    const res = await syncPostexStatus(o.id, { adminEmail });
    if (res.ok) {
      succeeded++;
      results.push({ orderId: o.id, orderNumber: o.order_number, ok: true, message: `${res.postexStatus || "—"} → ${res.status}` });
    } else {
      failed++;
      results.push({ orderId: o.id, orderNumber: o.order_number, ok: false, message: res.message ?? "Sync failed" });
    }
    await sleep(THROTTLE_MS);
  }

  revalidatePath("/admin/orders");
  return { ok: failed === 0, succeeded, failed, skipped, results };
}

/* ------------------------------------------------------------------ *
 * 3. Bulk airway bills (merged PDF)
 * ------------------------------------------------------------------ */
export async function bulkGetAirwayBills(orderIds: string[]): Promise<BulkReport> {
  if (!isPostexEnabled()) return { ok: false, succeeded: 0, failed: 0, skipped: 0, results: [], message: "PostEx is not configured." };

  const sb = createAdminClient();
  const { data: orders } = await sb
    .from("orders")
    .select("id, order_number, postex_tracking_number")
    .in("id", orderIds)
    .order("created_at", { ascending: true });

  const results: BulkItemResult[] = [];
  const booked = (orders ?? []).filter((o) => o.postex_tracking_number);
  const skippedOrders = (orders ?? []).filter((o) => !o.postex_tracking_number);
  for (const o of skippedOrders) {
    results.push({ orderId: o.id, orderNumber: o.order_number, ok: true, message: "Not booked — no label", reason: "not_booked" });
  }
  if (booked.length === 0) {
    return { ok: false, succeeded: 0, failed: 0, skipped: skippedOrders.length, results, message: "None of the selected orders are booked with PostEx." };
  }

  // PostEx returns one PDF per <=10 tracking numbers; merge the chunks.
  const merged = await PDFDocument.create();
  let succeeded = 0;
  let failed = 0;

  for (const grp of chunk(booked, AWB_CHUNK)) {
    try {
      const b64 = await fetchPostexAirwayBillBase64(grp.map((o) => o.postex_tracking_number!));
      const pdf = await PDFDocument.load(Buffer.from(b64, "base64"));
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
      succeeded += grp.length;
      for (const o of grp) results.push({ orderId: o.id, orderNumber: o.order_number, ok: true, message: "Label included" });
    } catch (e) {
      failed += grp.length;
      for (const o of grp) {
        results.push({ orderId: o.id, orderNumber: o.order_number, ok: false, message: `Label failed: ${(e as Error).message}` });
      }
    }
    await sleep(THROTTLE_MS);
  }

  if (succeeded === 0) {
    return { ok: false, succeeded, failed, skipped: skippedOrders.length, results, message: "Could not fetch any airway bills." };
  }

  const pdfBase64 = Buffer.from(await merged.save()).toString("base64");
  return {
    ok: failed === 0,
    succeeded,
    failed,
    skipped: skippedOrders.length,
    results,
    pdfBase64,
    filename: `PostEx-AirwayBills-${succeeded}-orders.pdf`,
  };
}

/* ------------------------------------------------------------------ *
 * 4. Load sheet (rider pickup manifest)
 * ------------------------------------------------------------------ */
export async function bulkGetLoadSheet(orderIds: string[]): Promise<BulkReport> {
  if (!isPostexEnabled()) return { ok: false, succeeded: 0, failed: 0, skipped: 0, results: [], message: "PostEx is not configured." };

  const sb = createAdminClient();
  const { data: orders } = await sb
    .from("orders")
    .select("id, order_number, postex_tracking_number, status")
    .in("id", orderIds);

  const results: BulkItemResult[] = [];
  const booked = (orders ?? []).filter((o) => o.postex_tracking_number && o.status !== "cancelled");
  const skipped = (orders ?? []).filter((o) => !o.postex_tracking_number || o.status === "cancelled");
  for (const o of skipped) {
    results.push({
      orderId: o.id,
      orderNumber: o.order_number,
      ok: true,
      message: o.status === "cancelled" ? "Cancelled — excluded" : "Not booked — excluded",
    });
  }
  if (booked.length === 0) {
    return { ok: false, succeeded: 0, failed: 0, skipped: skipped.length, results, message: "No active PostEx bookings in the selection." };
  }

  try {
    // pickupAddress is optional; PostEx falls back to the merchant's default
    // pickup address (the one registered at signup).
    const pdfBase64 = await fetchPostexLoadSheetBase64(booked.map((o) => o.postex_tracking_number!));
    for (const o of booked) results.push({ orderId: o.id, orderNumber: o.order_number, ok: true, message: "On load sheet" });
    return {
      ok: true,
      succeeded: booked.length,
      failed: 0,
      skipped: skipped.length,
      results,
      pdfBase64,
      filename: `PostEx-LoadSheet-${booked.length}-parcels.pdf`,
    };
  } catch (e) {
    return {
      ok: false,
      succeeded: 0,
      failed: booked.length,
      skipped: skipped.length,
      results,
      // PostEx rejects cancelled / not-yet-eligible consignments here.
      message: `${(e as Error).message}. A load sheet only accepts active, un-cancelled bookings.`,
    };
  }
}
