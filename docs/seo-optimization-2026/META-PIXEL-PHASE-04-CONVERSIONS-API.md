# Change record — Meta Pixel Phase 04 (Conversions API + delivery signal)

**Date**: 30 August 2026
**Branch**: `fix/settings-pixel-key-collision`
**SEO surface**: **none.** This phase is server-to-server. The only client-side change is that
`lib/analytics.ts` now imports its normalisation rules from a shared module instead of defining
them inline — behaviour identical, measured at +692 bytes.

---

## What was built

### 1. `lib/tracking/capi.ts` — the Conversions API client

Sends events to Meta from the server, alongside the browser pixel. Browser-only tracking loses
whatever the browser loses: ad-blockers, iOS tracking restrictions, a tab closed before the
beacon flushes, a dropped mobile connection. On a Pakistani mobile-first audience that is a
large and *biased* slice — the shoppers it drops are not a random sample — so Meta ends up
optimising against a distorted picture of who actually buys.

**Failure policy**: nothing here may ever break an order. `sendServerEvent` returns a result
object instead of throwing, caps itself at 6 seconds, and callers ignore the outcome beyond
logging. A sale that succeeded but went unreported is a reporting problem; an order that failed
because Meta was slow is a lost customer.

### 2. Deduplication — the part that can lose money

Both halves report the same purchase. Meta collapses them into one **only** when they arrive
with an identical `event_id`. Get it wrong and every sale is counted twice, which is strictly
worse than sending nothing from the server.

So `Purchase` uses `purchase-{orderNumber}` on both sides — the browser in `lib/analytics.ts`,
the server in `lib/tracking/capi.ts`. A test asserts the two literals agree.

### 3. `lib/tracking/normalize.ts` — shared normalisation

Meta hashes literally: `"Habiba@Example.COM "` and `"habiba@example.com"` produce completely
different digests. If the browser and server normalised even slightly differently, the same
customer would hash to two different people and match quality would collapse — silently, with
worse ad performance months later as the only symptom.

Both sides now import the same functions. A test asserts the browser's output is byte-identical
to the shared function's.

### 4. The delivery signal

**The artifact called this a "PostEx delivery webhook". PostEx has no webhook** — status is
pull-only via `syncPostexOrder`, driven by a cron. The signal was therefore hooked to the
status transition inside that sync, not to a webhook that does not exist.

When an order transitions into `delivered`, an `OrderDelivered` event is sent with the real
order value and `action_source: system_generated` (something we observed from the courier, not
something the shopper did).

**Why this matters here specifically**: `Purchase` fires when an order is *placed*, but this is
a cash-on-delivery market where a meaningful share of parcels are refused at the door and
returned. Meta-reported revenue therefore overstates settled revenue by the RTO rate — commonly
20–40% in Pakistan. Reporting genuine handovers gives a number to bid against that reflects
money actually collected.

### 5. Idempotency — `orders.meta_capi_purchase_at` / `meta_capi_delivered_at`

Migration `20260830_meta_capi_columns.sql`, applied. The PostEx poll re-runs over every
in-flight consignment every few minutes; without a marker an order sitting in `delivered` would
emit the event on every pass, inflating the very figure this phase exists to correct.

Timestamps rather than booleans, because "when did Meta learn about this?" is the question worth
answering when a number looks wrong.

### 6. Marketing page closes the loop

The **Conversions API** row on `/admin/marketing` no longer says a hardcoded "Not set up". It
reports whether a token is present and when the server last successfully reported a sale, read
from the send-markers on `orders` — so it reflects what Meta actually accepted, not what we
attempted. A **Delivery signal** row was added alongside it.

---

## ⚠️ Not yet live — the owner must supply a token

The code is complete and safe to deploy: with no token, `sendServerEvent` returns
`not_configured`, logs, and changes nothing. **No server events will reach Meta until an access
token with permission on the pixel is configured.**

`META_CAPI_ACCESS_TOKEN` is checked first, falling back to `META_SYSTEM_USER_TOKEN`. The
existing system-user token was created for Facebook Page and Instagram publishing; **pixel
access is a separate grant**, so it will most likely need extending or a dedicated token
creating in Meta Business Manager (Business Settings → System Users → Assign Assets → the
pixel, with the Manage permission).

Set `META_CAPI_ACCESS_TOKEN` in Vercel, redeploy, then place a test order and watch Meta Events
Manager. Putting the Test Events code into the Marketing page routes server events to the Test
Events screen instead of live reporting while checking.

## Verification performed

- `npx tsc --noEmit` — clean.
- `npx eslint` on all changed files — **no new problems**. Four pre-existing `no-explicit-any`
  errors in `lib/actions/orders.ts` were confirmed present at HEAD by linting a stashed tree.
- `npm run build` — exit 0.
- **15 assertions**, including the two that can lose money: that both halves derive
  `purchase-{orderNumber}` identically, and that the browser's match keys are byte-identical to
  the shared normaliser's. Also: SHA-256 output shape, and that a missing token returns
  `not_configured` rather than throwing.

  | | Chunks | Total client JS |
  |---|---|---|
  | After Phase 03 | 63 | 2,476,080 bytes |
  | After Phase 04 | 63 | 2,476,772 bytes |
  | **Delta** | **0** | **+692 bytes** |
  | **Cumulative, phases 02–04** | **0** | **+3,819 bytes (+0.15%)** |
