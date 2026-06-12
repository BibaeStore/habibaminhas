# Analytics Build Tracker
**Last updated: 2026-06-12 (Phases 0–7 complete) · Read PLAN.md first**

Status legend: ⬜ Not started · 🔄 In progress · ✅ Done · ❌ Blocked

---

## Phase 0 — Foundation (do this first, no exceptions)
*Goal: Kill the flash bug. Remove all mock data. Install Recharts. Wire the date-range bar. Every component shows a skeleton instead of fake numbers.*

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | `npm install recharts` | ✅ | Added 38 packages |
| 0.2 | Delete all mock constants from `app/admin/analytics/page.tsx` (KPI_DATA, REVENUE_7D, REVENUE_30D, CAT_BREAKDOWN, TOP_PRODUCTS, PAYMENT_SPLIT, ORDERS_SPARKLINE*) | ✅ | Flash bug eliminated |
| 0.3 | Rebuild `page.tsx` as a layout shell — holds only `dateRange` state and renders component slots | ✅ | No data fetching in page.tsx at all |
| 0.4 | Create `components/admin/analytics/skeleton.tsx` — reusable skeleton shimmer for cards, chart areas, table rows | ✅ | 6 exports: SkeletonKPICard, SkeletonChartCard, SkeletonBarListCard, SkeletonTableCard, SkeletonFeedCard, SkeletonInsightsCard |
| 0.5 | Create `components/admin/analytics/date-range-bar.tsx` — preset buttons + custom date picker | ✅ | Exports DateRange type + getPresetRange utility |
| 0.6 | Default date range on page load = **Last 7 days** | ✅ | `defaultRange()` initializer in page.tsx |

---

## Phase 1 — KPI Cards (real numbers, no charts)
*Goal: The 4 headline numbers at the top are real, always correct, filter-aware, and never flash.*

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Create `app/api/admin/analytics/kpis/route.ts` | ✅ | Returns confirmed_revenue, pending_revenue, order_count, aov, delivered_count, pending_count |
| 1.2 | Create `components/admin/analytics/kpi-card.tsx` | ✅ | Shows inline skeleton when loading=true |
| 1.3 | Create `components/admin/analytics/kpi-row.tsx` | ✅ | Re-fetches on dateRange change via `.getTime()` deps |
| 1.4 | Remove the `realStats` useEffect from page.tsx | ✅ | Was removed in Phase 0 rebuild |
| 1.5 | No fake percentage change values | ✅ | KPI cards show honest subtexts only |

---

## Phase 2 — Revenue & Order Charts
*Goal: Real charts from real data using Recharts. Both filter-aware.*

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Create `app/api/admin/analytics/revenue-chart/route.ts` | ✅ | PKT date bucketing via toLocaleDateString("en-CA", {timeZone:"Asia/Karachi"}) |
| 2.2 | Create `app/api/admin/analytics/order-volume/route.ts` | ✅ | Same PKT bucketing pattern |
| 2.3 | Create `components/admin/analytics/revenue-chart.tsx` | ✅ | Recharts AreaChart — two areas (confirmed #2563eb, pending #93c5fd). SSR-guarded with mounted state. |
| 2.4 | Create `components/admin/analytics/order-volume-chart.tsx` | ✅ | Recharts BarChart — peak bar highlighted darker |
| 2.5 | Both charts show "No orders in this period" empty state | ✅ | |
| 2.6 | Revenue chart shows total confirmed + pending in header | ✅ | |

---

## Phase 3 — Category, Payment, Funnel
*Goal: Where is revenue coming from? How are orders moving through the pipeline?*

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Create `app/api/admin/analytics/category-breakdown/route.ts` | ✅ | 3-query join: orders→order_items→products. Groups by products.category. |
| 3.2 | Create `app/api/admin/analytics/payment-split/route.ts` | ✅ | Groups orders by payment_method. Returns count + revenue + pct. |
| 3.3 | Create `app/api/admin/analytics/order-funnel/route.ts` | ✅ | All 5 statuses counted (incl. cancelled for drop-off view) |
| 3.4 | Create `components/admin/analytics/category-breakdown.tsx` | ✅ | Horizontal bars; color palette with known-category overrides |
| 3.5 | Create `components/admin/analytics/payment-split.tsx` | ✅ | Recharts PieChart donut (fixed 110×110px avoids SSR ResizeObserver) + legend |
| 3.6 | Create `components/admin/analytics/order-funnel.tsx` | ✅ | Horizontal bars; funnel stages taper off non-cancelled max; cancelled shown separately |

---

## Phase 4 — Product Intelligence
*Goal: Which products sell? Which never sell? Strategy recommendations from real data.*

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Create `app/api/admin/analytics/top-products/route.ts` | ✅ | Groups by product_title (survives deleted products). Accepts ?limit= |
| 4.2 | Create `app/api/admin/analytics/inventory/route.ts` | ✅ | No date filter (snapshot). Parallel query: all products + all-time sold IDs. Returns out_of_stock, low_stock (≤5), dead_count, stock_value |
| 4.3 | Create `components/admin/analytics/top-products-table.tsx` | ✅ | Client-side sort by any column (units_sold default). Sort chevron icons. View all → /admin/products |
| 4.4 | Create `components/admin/analytics/inventory-panel.tsx` | ✅ | 3 stat badges + compact lists (max 6 per section). All-clear green state. Stock value + dead stock footnote |

---

## Phase 5 — Customer Analytics
*Goal: Who is buying? New or returning? Where from?*

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Create `app/api/admin/analytics/customers/route.ts` | ✅ | new_count, returning_count, top_customers. Classifies new/returning via "before range" email set. |
| 5.2 | Create `components/admin/analytics/customer-summary.tsx` | ✅ | 3 stat cards: New, Returning, Total buyers + repeat rate % |
| 5.3 | Create `components/admin/analytics/top-customers-table.tsx` | ✅ | Table: Customer (name+email+city), Orders, Spent, Tier badge |

---

## Phase 6 — Supabase Realtime (Live Feed)
*Goal: New orders appear on screen the moment they're placed. No page refresh.*

**Pre-requisite:** Enable Realtime on the `orders` table in Supabase dashboard:
`Database → Replication → Tables → orders → enable`

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Enable Realtime on `orders` table in Supabase dashboard (manual step) | ⬜ | One-time setup — do when ready to enable websocket push |
| 6.2 | Create `components/admin/analytics/live-order-feed.tsx` | ✅ | Static for now: last 10 orders, auto-refreshes every 60s. Realtime websocket upgrade pending 6.1 |
| 6.3 | KPI re-fetch on new order | ⬜ | Pending Realtime setup |
| 6.4 | Pulse badge on KPI cards | ⬜ | Pending Realtime setup |

---

## Phase 7 — AI Insights Panel
*Goal: Claude API gives actionable strategy advice based on real order data.*

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Create `app/api/admin/analytics/ai-insights/route.ts` | ✅ | Guards: no key → 503 "not_configured"; < 20 orders → "not_enough_data" with progress bar. Calls claude-sonnet-4-6 via fetch when ready. |
| 7.2 | Create `components/admin/analytics/ai-insights-panel.tsx` | ✅ | 5 states: idle, loading, not_configured (shows .env instructions), not_enough_data (with progress bar), ok (bullet list), error |
| 7.3 | Prompt specific to Habiba Minhas | ✅ | COD market, Pakistani clothing context included |
| 7.4 | Caching | ⬜ | Add localStorage cache after first successful API call |

---

## Known Blockers / Dependencies

| Item | Status | Notes |
|---|---|---|
| Recharts not installed | ✅ | Done in Phase 0 |
| Supabase Realtime not enabled on orders table | ⬜ | Manual step in Supabase dashboard — before Phase 6 |
| CLAUDE API key already in .env.local as `GEMINI_API_KEY` (wrong name) | ⬜ | Check: should be `ANTHROPIC_API_KEY` or use existing key. Verify before Phase 7 |

---

## Session Handoff Notes

> **If you are a new Claude session picking this up:** Read `PLAN.md` first for architecture, then come back to this TRACKER to see what's done. Check the ✅ boxes below to know the current state. The codebase is at `D:\Projetcs\Habiba Minhas`. The analytics page is at `app/admin/analytics/page.tsx`. All data is currently mock/hardcoded — nothing real except the KPI numbers which flash in after load.

> **Start from the top of Phase 0 and work down. Do not skip phases — each one builds on the previous.**

> **Key rule:** Revenue = delivered orders only. COD market. Never show fake data — always honest empty states.
