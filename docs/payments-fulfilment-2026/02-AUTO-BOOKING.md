# 02 — Automating PostEx Booking

**Status:** 📋 Plan only. Nothing implemented.
**Goal:** stop opening every order by hand to assign it to PostEx.

---

## 1. What happens today (audited)

### The manual path

1. Customer places an order → row inserted by `createOrder()` (`lib/actions/orders.ts:53`) with
   `status: "pending"`, no courier, no tracking number.
2. Admin opens `/admin/orders/<id>`, finds the PostEx panel, presses **Book**.
3. `bookPostexShipment()` (`lib/actions/postex.ts:69`) runs a chain of guards:

   | Guard | Behaviour on failure |
   |---|---|
   | PostEx configured (`POSTEX_API_TOKEN`) | `disabled` |
   | Already has `postex_tracking_number` | `already_booked` — idempotent, refuses |
   | City matches PostEx operational list | `city_unmatched` + suggestions |
   | Street address non-empty | `empty_address` |
   | Phone is a valid PK mobile | `invalid_phone` |

4. On success it writes `postex_tracking_number`, `postex_status`, `postex_cod_amount`,
   `postex_booked_at`, mirrors `courier`/`tracking_number` for the customer `/track` page and
   emails, and flips `pending` → `processing`.
5. A separate pg_cron job hits `/api/cron/postex-sync/` every 15 minutes to pull status updates
   (PostEx has no webhook — status is pull-only).

**This code is well built.** It is idempotent, it logs to `order_activity_log`, it handles
re-booking after cancellation with `-R2`/`-R3` order references, and it refuses to guess a city.
The problem is not the booking logic — it is that a human has to trigger it.

### The bulk path, and why it disappoints

`bulkBookPostex()` (`lib/actions/postex-bulk.ts:72`) already exists and is wired into the orders
list. Three concrete reasons it doesn't feel like a solution:

**a) Select-all only covers the current page.**
`PAGE_SIZE = 10` (`app/admin/orders/page.tsx:156`). The header checkbox is
`paginated.every(...)` and `handleSelectAll` iterates `paginated` — the ten rows on screen. For
100 orders that is ten rounds of select-then-book. This is the main cause of the pain you
described.

**b) A large batch will time out.**
Booking is strictly sequential with `THROTTLE_MS = 250` *plus* PostEx round-trip latency per
order. Assume ~1s each: 100 orders ≈ 2 minutes inside a single server action. `vercel.json`
raises `maxDuration` only for `app/api/virtual-try-on/route.ts`; everything else runs on the
default limit. **The batch will be killed mid-run.** Because each order commits individually,
you'd get a partial result with no report — which looks exactly like "it didn't work".

The sequential-with-throttle design is *correct* (don't hammer PostEx); it's the execution
context that's wrong. Long work does not belong in a request-scoped server action.

**c) City mismatches are skipped, by design.**
Deliberate and right — a wrong city means a misrouted parcel — but in a 100-row report the
skipped ones scroll past and it reads as failure.

---

## 2. Design options for automation

### Option A — Auto-book inside `createOrder()` ❌ Not recommended

Book the moment the order is placed.

- ❌ **Couples checkout to PostEx.** If PostEx is slow or down, order placement slows or fails.
  Never put a third-party API on the critical path of taking money.
- ❌ **No cancellation window.** Customers change their mind within minutes; you'd be cancelling
  real consignments.
- ❌ **No fraud screen.** COD fraud (fake names/addresses) is a real cost in this market.

### Option B — Scheduled auto-book worker ✅ **Recommended**

A cron-driven worker that periodically finds eligible orders and books them.

- ✅ **Reuses infrastructure that already works** — the exact pattern of
  `/api/cron/postex-sync/` + pg_cron + `CRON_SECRET`, which has been running reliably.
- ✅ **Completely decoupled** from checkout. PostEx downtime delays booking; it never affects a
  customer.
- ✅ **Natural home for a grace window** and per-order holds.
- ✅ **Runs outside request scope**, so batch size and timeouts are yours to control.
- ⚠️ Booking happens up to one cron interval late — irrelevant operationally (parcels are
  collected in daily pickups anyway).

### Option C — Auto-book on status → "processing"

Keeps a human decision point but removes the per-order panel visit.

- ✅ Preserves explicit human approval.
- ❌ Still requires a human action per order (or per bulk selection) — it reduces clicks rather
  than removing the chore. **Doesn't actually solve your problem.**

### Recommendation

**Option B as the engine, with Option C retained as a manual override.** Routine orders book
themselves; you keep the ability to force a booking, and the existing single-order panel and
bulk buttons stay exactly as they are for exceptions.

---

## 3. Proposed design

### 3.1 Eligibility rules

An order auto-books only when **all** hold:

| Rule | Reason |
|---|---|
| `status = 'pending'` | Not already processing, shipped, cancelled |
| `postex_tracking_number IS NULL` | Never double-book (existing guard already enforces) |
| `created_at < now() - grace_period` | Cancellation window (recommend 30–60 min) |
| `postex_autobook_hold IS NOT TRUE` | Per-order manual hold |
| Prepaid ⇒ `payment_status = 'paid'` | **Never ship a prepaid order that wasn't paid** |
| COD ⇒ always eligible after grace | COD collects at the door |

That fifth rule is why **Phase 0 (the `payment_status` bug) must land before auto-booking goes
live.** Today a bank-transfer order is written as `paid` with no money received — auto-booking
would ship those instantly, unpaid, with the courier told to collect nothing.

### 3.2 New database columns (additive, nullable — nothing existing changes)

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS postex_autobook_hold     boolean,     -- admin "don't auto-book this"
  ADD COLUMN IF NOT EXISTS postex_autobook_attempts integer,     -- retry counter
  ADD COLUMN IF NOT EXISTS postex_autobook_error    text,        -- last failure reason
  ADD COLUMN IF NOT EXISTS postex_autobook_at       timestamptz; -- when the worker booked it
```

Same additive pattern as `20260709_postex_integration_columns.sql` — the manual flow keeps
working untouched.

### 3.3 The worker

New route `app/api/cron/postex-autobook/route.ts`, structured as a near-copy of the existing
sync route (same `CRON_SECRET` auth, same fail-closed behaviour when unconfigured).

Behaviour:

1. Return immediately unless auto-book is enabled in settings (**kill-switch**).
2. Select eligible orders, oldest first, **capped per run** (start at 25).
3. For each, call the existing `bookPostexShipment()` — no new booking logic, no duplicated
   business rules.
4. Classify the outcome:
   - **success** → record `postex_autobook_at`
   - **`city_unmatched` / `invalid_phone` / `empty_address`** → these are *data* problems a
     retry will never fix. Record the error, **do not retry**, surface in an admin "Needs
     attention" queue.
   - **transient error** (network/5xx) → increment attempts, retry next run, give up after 3 and
     move to Needs attention.
5. Log every action to `order_activity_log` (as the manual path already does), tagged so you can
   tell auto from manual.

The cap plus the "don't retry data errors" rule is what stops a permanently-broken order being
re-attempted every 10 minutes forever.

### 3.4 Schedule

pg_cron every 10 minutes, mirroring the existing sync job. At a cap of 25 per run that is 150
orders/hour — far beyond current volume, with headroom.

### 3.5 Settings

Add to the admin settings module (alongside `shipping` and `payment`):

```ts
postex_autobook: {
  enabled: boolean;        // master switch, default FALSE
  graceMinutes: number;    // default 45
  codEnabled: boolean;     // auto-book COD orders?     default true
  prepaidEnabled: boolean; // auto-book prepaid orders? default true
  maxPerRun: number;       // default 25
}
```

Default **off**. You turn it on when you're ready, and can turn it off instantly if anything
looks wrong — no deploy needed.

---

## 4. Fixing the bulk experience (do this regardless)

Auto-booking handles the routine; bulk still matters for exceptions and backlog.

| Problem | Fix |
|---|---|
| Select-all covers only 10 rows | Add **"Select all N matching orders"** spanning the whole filtered set, not the page |
| Page size 10 | Make it configurable (10/25/50/100), remembered per admin |
| Large batches time out | Route batches over ~20 through the same worker: mark selected orders for immediate booking, let cron process them, show progress in the UI. No long-running server action |
| Failures scroll past | Split the result modal into **Booked / Skipped / Needs attention**, with the last group linking straight to each order |
| Repeat city mismatches | Persist a city-alias map (e.g. "Khi" → "Karachi") so a correction is made once, not every time |

**A note on `maxDuration`:** raising it in `vercel.json` would postpone the timeout, not remove
it. Anything unbounded-by-order-count belongs in the worker. Raising the limit is a reasonable
belt-and-braces addition, not the fix.

---

## 5. Admin order page — the target workflow

**Orders list gains:**
- A **PostEx column**: `—` / `Auto ✓ CX123…` / `Manual ✓ CX123…` / `⚠ Needs attention`
- A filter: *Needs attention* / *Awaiting auto-book* / *Booked* / *On hold*
- Per-row **Hold** toggle (sets `postex_autobook_hold`)
- The bulk bar keeps every existing button

**Order detail gains:**
- The existing PostEx panel, unchanged
- An auto-book status line: *"Auto-books at 14:35"* / *"Held"* / *"Failed: city not recognised"*
- A **city correction** control that retries with `cityNameOverride` — the existing action
  already supports this

**The daily routine this produces:** open *Needs attention*, fix the handful with bad
cities/phones, done. Everything else has already booked itself.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Auto-books an order the customer cancelled | Grace window + `cancelPostexShipment()` already exists |
| Ships an unpaid prepaid order | **Phase 0 fixes `payment_status` first.** Non-negotiable |
| Runaway retries against PostEx | Per-run cap, attempt limit, no retry on data errors |
| COD fraud auto-shipped | Grace window; optional rule to hold orders above a value threshold for review |
| Worker silently stops | Log each run; surface "last auto-book run" in admin so silence is visible |

---

## 7. What this does *not* change

- `bookPostexShipment()` — reused as-is, not modified
- The manual PostEx panel and all existing bulk buttons
- The 15-minute status sync
- Customer-facing tracking, emails, `/track`
- Anything about payments (that is [`03-PAYMENT-GATEWAY.md`](03-PAYMENT-GATEWAY.md))

The only edits to existing files are **additive**: new settings keys, new nullable columns, new
admin column and filter.
</content>
