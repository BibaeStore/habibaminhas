# PostEx COD Courier — Integration Plan (Planning Phase Only)

**Date:** 2026-07-09
**Guide read:** `docs/PostEx/PostEx-COD_API_Integration_Guide_V4.1.9.pdf` (Merchant API v4.1.9)
**Status:** PLANNING ONLY — nothing implemented. No code touched.
**Guiding principle:** Additive & isolated. The existing checkout, orders, admin, and tracking flows must keep working untouched. PostEx is bolted on beside them, env-gated, so if the token is absent the whole feature is invisible and the site behaves exactly as today.

---

## 1. What PostEx is and what the manual says

PostEx is a Pakistani **COD (Cash-on-Delivery) courier**. The merchant creates an order via API → PostEx picks up the parcel from our warehouse → delivers to the customer → collects the cash → later settles that cash to the merchant. The API is branded "Paid" (their payment arm) but it is the COD courier integration.

**Auth:** every call sends a single header `token` = our merchant token. No OAuth, no per-request signing. Simple.

**Base URL:** `https://api.postex.pk/services/integration/api/order/...`
(⚠️ Quirk: the two *Shipper Advice* endpoints use `/service/` — singular — not `/services/`. Noted so we don't chase a 404.)

**Money model:** COD — for a COD order, we tell PostEx the amount to collect (`invoicePayment`). PostEx later reports settlement (cash handed back to us) via the Payment Status API.

### The 16 endpoints, grouped by how we'll use them

**A. Setup / reference data (read once, cache)**
| # | Endpoint | Method | Purpose for us |
|---|----------|--------|----------------|
| 3.1 | `v2/get-operational-city?operationalCityType=Delivery` | GET | List of cities PostEx delivers to. **This is the fix for our "free-text city" gap** — we validate/map the customer's city against this list before booking. |
| 3.2 | `v1/get-merchant-address` | GET | Our warehouse pickup addresses + their `addressCode` (needed by Order Creation). |
| 3.3 | `v2/create-merchant-address` | POST | Create a pickup/return address. One-time; can also be done in their dashboard. |
| 3.4 | `v1/get-order-types` | GET | Returns `Normal / Reversed / Replacement`. We use **Normal** for standard sales. |
| 3.15 | `v1/get-order-status` | GET | Reference list of all status labels. |

**B. The core booking flow**
| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 3.5 | `v3/create-order` | POST | **The main call.** Books a shipment; returns a `trackingNumber` (`CX-XXXXXXXXXXX`), status `UnBooked`. |
| 3.7 | `v2/generate-load-sheet` | POST | Returns a **PDF manifest** for a batch of tracking numbers (rider pickup sheet). |
| 3.10 | `v1/getinvoice?trackingNumbers=...` | GET | Returns the **Airway Bill (AWB) label PDF** (max 10 numbers). We print & paste this on parcels — we do NOT design our own label. |

**C. Tracking & status (PULL — see the big caveat below)**
| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 3.8 | `v1/track-order/{trackingNumber}` | GET | Full status + `transactionStatusHistory` (journey timeline). |
| 3.9 | `v1/track-bulk-order` | GET | Track many tracking numbers at once. |
| 3.6 | `v2/get-unbooked-orders` | GET | Orders created but not yet picked up (reconciliation). |
| 3.16 | `v1/get-all-order` | GET | All orders filtered by `orderStatusID` + date range. |

**D. Money reconciliation**
| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 3.14 | `v1/payment-status/{trackingNumber}` | GET | COD settlement: `settle` flag, `settlementDate`, CPR receipt numbers. Confirms cash actually received. |

**E. Exceptions / lifecycle management**
| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 3.13 | `v1/cancel-order` | PUT | Cancel a booked order by tracking number. |
| 3.11 | `v2/save-shipper-advice` | PUT | On a failed delivery attempt: mark **Return Requested (1)** or **Retry Attempt (2)** + remarks. |
| 3.12 | `v1/get-shipper-advice/{trackingNumber}` | GET | Read back shipper-advice remarks. |

### ⚠️ Biggest architectural finding: there is NO webhook
PostEx does **not** push status updates to us. Every status field is **pull-only** (Track Order / Bulk Track / List Orders). So the plan I gave you earlier assuming a `webhooks/postex` endpoint is **wrong for PostEx** — instead we must **poll** on a schedule (a cron job) plus an on-demand "Sync now" button. This is normal for PostEx; just important to design correctly.

---

## 2. How this maps onto OUR system (from the code audit)

Our order creation is a Server Action (`lib/actions/orders.ts › createOrder`), address is a **JSONB blob**, money is **integer PKR**, order number is `ORD-2026-NNNN`, and `courier` / `tracking_number` columns already exist but are typed by hand today. Statuses: `pending → processing → dispatched → delivered → cancelled`.

### Field mapping: PostEx Order Creation ← our data
| PostEx field (create-order) | Source in our system | Work needed |
|---|---|---|
| `token` (header) | new env `POSTEX_API_TOKEN` | add env var |
| `orderRefNumber` | `orders.order_number` (`ORD-2026-0001`) | ✅ direct |
| `invoicePayment` (COD to collect) | `orders.total` (integer PKR) for COD; **`0` for prepaid** | ✅ with a rule |
| `customerName` | `orders.customer_name` | ✅ direct |
| `customerPhone` (`03xxxxxxxxx`) | `orders.customer_phone` (`+92 3XX…` free text) | 🔧 **normalize** to `03xxxxxxxxx` |
| `deliveryAddress` | `address.street` + `address.apartment` (JSONB) | 🔧 concatenate (note: guide mislabels this "email" — it is the street address) |
| `cityName` | `address.city` (free text) | 🔧 **validate/map** against Operational Cities |
| `invoiceDivision` | number of AWBs | constant `1` (one parcel per order to start) |
| `items` | `sum(order_items.quantity)` | 🔧 derive |
| `orderType` | — | constant `"Normal"` |
| `orderDetail` | title + qty + SKU summary of `order_items` | 🔧 build a short string |
| `pickupAddressCode` | from Pickup Address API | fetch once, store in settings/env |
| **Response** `trackingNumber` | → write to `orders.tracking_number`, set `courier="PostEx"` | ✅ store |

**Verdict: this is a clean, easy integration.** Token auth, plain JSON, and ~80% of the required fields already exist on our order. The only genuine engineering is: (1) phone normalization, (2) city validation/mapping, (3) status mapping, (4) polling instead of webhooks.

### Status mapping: PostEx → our internal status
PostEx statuses: `Unbooked, Booked, Picked By PostEx, En-Route to PostEx warehouse, PostEx WareHouse, Out For Delivery, Delivered, Attempted, Delivery Under Review, Out For Return, Returned, Expired, Un-Assigned By Me`.
History codes: `0001` At Merchant's Warehouse, `0003` At PostEx Warehouse, `0004` Package on Root, `0005` Delivered, `0002/0006/0007` Returned, `0008` Delivery Under Review, `0013` Attempt Made.

Proposed mapping to our 5 statuses:
| PostEx | Our status |
|---|---|
| Unbooked, Booked | `processing` |
| Picked By PostEx, En-Route, PostEx WareHouse, Out For Delivery, Package on Root, Attempted, Delivery Under Review | `dispatched` |
| Delivered | `delivered` |
| Returned, Out For Return, Expired, Un-Assigned By Me | `cancelled` (or a new `returned` — see Open Question 6) |

We also store the **raw** PostEx status + full history separately, so admins see the granular truth ("Attempt Made", "Out For Delivery") even though the customer stepper only shows our 5.

---

## 3. Isolation strategy — how we guarantee nothing breaks

Every change is **additive**. Nothing in the existing checkout/order/admin path is modified in a way that changes current behavior.

1. **Feature branch** — `feat/postex-integration` (per your branch-per-feature rule; nothing merges to `main` without your OK).
2. **Env-gated kill-switch** — if `POSTEX_API_TOKEN` is unset, every PostEx button/UI is hidden and every PostEx action no-ops. The site is byte-for-byte today's behavior until you flip it on.
3. **Self-contained module** — all PostEx logic lives in **new files** under `lib/courier/postex/` (client, types, city-map, status-map, phone-normalize). Nothing existing imports them.
4. **New server-action file** — `lib/actions/postex.ts`. We do **NOT** edit the core of `createOrder`. Booking is a **manual admin action** (a "Book with PostEx" button on the order detail page), never auto-fired at checkout. → the customer ordering flow is physically untouched → zero risk to sales.
5. **Additive DB migration only** — new **nullable** columns (`postex_tracking_number`, `postex_order_status`, `postex_status_history` jsonb, `postex_synced_at`, `postex_cod_settled`, `postex_settlement_date`, `postex_awb_url`). We do **not** alter or drop any existing column. The existing manual `courier`/`tracking_number` fields keep working; we also populate them so the current `/track` page and emails need no change.
6. **Polling via a protected cron route** — `app/api/cron/postex-sync/route.ts`, guarded by a secret header, plus a manual "Sync tracking" button. No change to any existing route.
7. **Additive UI** — new buttons/cards only, reusing existing `AdminButton`/`AdminCard`/`StatusPill`. No existing component rewritten.
8. **Reversibility** — because it's all new files + nullable columns + a branch, the whole thing can be disabled (unset env) or reverted (drop branch) with no residue.

---

## 4. Phased build plan (each phase independently testable, safe to stop between)

> Phases 0–2 involve **zero writes to PostEx** (read-only) and zero customer-facing change — completely safe to build and verify first.

- **Phase 0 — Setup & connectivity (read-only).** Add env vars, create the branch, build the `postex` HTTP client. Call **Operational Cities** + **Pickup Address** + **Order Types** to prove the token works and capture our `pickupAddressCode`. Deliverable: a connectivity test, no DB/UI change.
- **Phase 1 — Data prep helpers (pure functions).** Phone normalizer (`+92 3xx` → `03xxxxxxxxx`), city validator/mapper (customer city → operational city, with a manual-override fallback for mismatches), `items`/`orderDetail`/`invoicePayment` derivation. Unit-testable in isolation.
- **Phase 2 — Additive DB migration.** Add the nullable PostEx columns. Regenerate Supabase types. No behavior change.
- **Phase 3 — Booking (the core).** "Book with PostEx" button on `app/admin/orders/[id]/page.tsx` (Shipping & Tracking card, lines 455–509) → `bookPostexShipment(orderId)` in `lib/actions/postex.ts` → stores `trackingNumber`, mirrors into `courier`/`tracking_number`, advances status to `dispatched`, logs to `order_activity_log`. Plus a **Download AWB** button (Airway Bill API) and a **Load Sheet** button.
- **Phase 4 — Status sync.** Cron route + manual "Sync tracking" button → Track Order / Bulk Track → map to our status → update order + store raw history. Optionally auto-email customer on `dispatched`/`delivered` (reuse existing email system).
- **Phase 5 — COD reconciliation & exceptions.** Payment Status API → show settled/unsettled + CPR in admin. Wire Cancel Order and Save/Get Shipper Advice (return vs retry on failed attempts).
- **Phase 6 — Customer-facing polish.** Show the PostEx journey timeline + a "track on PostEx" deep link on `/track`. Still additive.

**Bulk operations** (book many, print many AWBs, sync many) reuse the existing bulk plumbing in `app/admin/orders/page.tsx` + `lib/actions/print.ts`.

---

## 5. What I need from you before building

1. **API token** — the merchant `token`. Tell me if it's **sandbox/test** or **live production**. The guide only lists the production base (`api.postex.pk`); ask PostEx if there's a staging URL/token. If not, we test in prod with one real test order and immediately **Cancel** it.
2. **Pickup/warehouse address** — is it already created in your PostEx dashboard? If yes, I'll fetch its `addressCode`. If no, I need: warehouse address, city, contact person name, phone1, phone2 (to call Create Pickup Address).
3. **Merchant registered name** at PostEx (for sanity-checking responses).
4. **COD-only, or prepaid too?** Confirms the `invoicePayment` rule (COD = order total; prepaid = 0).
5. **Booking trigger preference** — I strongly recommend **manual "Book with PostEx" per order** (safe, isolated) rather than auto-booking at checkout. Confirm you agree, or if you want auto-booking later.
6. **Returns handling** — add a new `returned` order status (recommended, since COD returns matter for money), or fold returns into `cancelled`?
7. **Cron availability** — you're on Vercel. Confirm your plan allows Vercel Cron for the status poll; otherwise we use manual-sync + sync-on-view.

---

## 5b. CONFIRMED account facts & decisions (verified live 2026-07-09, read-only)

- **Token:** valid, **production** (no sandbox). Stored in `.env.local` as `POSTEX_API_TOKEN` (git-ignored). Base `POSTEX_API_BASE=https://api.postex.pk/services/integration/api`.
- **Merchant / contact name:** "Habiba Minhas".
- **Pickup address (pre-created at signup):** `merchantAddressId 122498`, "Navy Height, Korangi Road, Karachi", phone `03120295812`, city **Karachi** (cityId 4), **`addressCode: 001`** → stored as `POSTEX_PICKUP_ADDRESS_CODE=001`. Owner does NOT need to enter it.
- **Order types:** Normal, Reversed, Replacement, Overland → we use **Normal**.
- **Operational cities:** **873** nationwide (Karachi included). This is the match list for the free-text city gap.
- **Booking trigger:** MANUAL "Book with PostEx" per order now; owner will later auto-trigger via a voice agent (plumbing must support both).
- **Scope:** ALL deliveries (COD + prepaid) go via PostEx nationwide. COD → `invoicePayment = order total`; prepaid → `invoicePayment = 0`.
- **Scheduler for status polling:** use **Supabase `pg_cron`** (owner already has Supabase) + a manual "Sync now" button. Do NOT depend on Vercel Cron / Vercel plan.
- **Money visibility:** mirror PostEx Payment Status into the owner's dashboard (per-order settled/collected + CPR + totals). PostEx remains source of truth.
- **Order status model (DECIDED):** 6 states — pending → processing → dispatched → delivered, plus **returned** (NEW) and cancelled. Customer `/track` shows the simple 4-step + returned/cancelled end states; admin sees raw PostEx stage + full history timeline.

### ⚠️ Label / pickup-address privacy — PostEx-side, NOT our code
The AWB label is a **PostEx-generated PDF**; we cannot edit its contents from our app. What prints (sender name/street/city) comes from PostEx's stored pickup record (currently full street). To show only city/mask the sender → **confirm with PostEx** (babar@postex.pk / 0300-0441793). Likewise, **return handling without a set return address is PostEx policy** — confirm self-collect behavior with them. We build to work either way; we do not control their PDF or their ops.

## 5c. Deployment checklist (go-live)
- Add these to **Vercel → Project → Settings → Environment Variables (Production)**: `POSTEX_API_TOKEN`, `POSTEX_API_BASE`, `POSTEX_PICKUP_ADDRESS_CODE`. `.env.local` is local-only; without these in Vercel the feature stays off in production (env kill-switch).
- Set up the Supabase `pg_cron` schedule for status polling.
- Confirm the two PostEx-side items (label masking, return handling) with Babar before/at go-live.
- Return/pickup address + label masking are **config/data, changeable later without re-implementing**. Reverse/Replacement (customer returns/exchanges) are a future add-on beside the core booking, not a rewrite.

## 6. Open questions / risks to watch
- **City mismatches** are the #1 operational risk: our checkout city is free text; PostEx only accepts operational cities. Plan: validate at booking time and let the admin pick the correct PostEx city if it doesn't match — never silently fail.
- **No sandbox** may mean testing against production; mitigate with immediate cancel of test bookings.
- **Rate/quantity limits**: AWB PDF is max 10 tracking numbers per call; bulk tracking should be chunked.
- **Doc inconsistencies** noted: `deliveryAddress` mislabeled "email"; Shipper Advice uses `/service/` (singular); status ID list has numbering gaps (skips 10–14). We code to the observed JSON, not the labels.
- **Phone edge cases**: landlines, missing leading 0, `+92`/`0092`/`92` prefixes — normalizer must handle all.
