# Analytics Build Tracker
**Last updated: 2026-06-11 · Read PLAN.md first**

Status legend: ⬜ Not started · 🔄 In progress · ✅ Done · ❌ Blocked

---

## Phase 0 — Foundation (do this first, no exceptions)
*Goal: Kill the flash bug. Remove all mock data. Install Recharts. Wire the date-range bar. Every component shows a skeleton instead of fake numbers.*

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | `npm install recharts` | ⬜ | |
| 0.2 | Delete all mock constants from `app/admin/analytics/page.tsx` (KPI_DATA, REVENUE_7D, REVENUE_30D, CAT_BREAKDOWN, TOP_PRODUCTS, PAYMENT_SPLIT, ORDERS_SPARKLINE*) | ⬜ | This is the root cause of the flash bug |
| 0.3 | Rebuild `page.tsx` as a layout shell — holds only `dateRange` state and renders component slots | ⬜ | No data fetching in page.tsx itself |
| 0.4 | Create `components/admin/analytics/skeleton.tsx` — reusable skeleton shimmer for cards, chart areas, table rows | ⬜ | |
| 0.5 | Create `components/admin/analytics/date-range-bar.tsx` — preset buttons + custom date picker | ⬜ | Presets: Today, Yesterday, Last 7 days, This month, Last month, This year, All time, Custom |
| 0.6 | Default date range on page load = **Last 7 days** | ⬜ | |

---

## Phase 1 — KPI Cards (real numbers, no charts)
*Goal: The 4 headline numbers at the top are real, always correct, filter-aware, and never flash.*

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Create `app/api/admin/analytics/kpis/route.ts` | ⬜ | Returns: confirmed_revenue (delivered), pending_revenue (non-cancelled non-delivered), order_count, aov. Accepts `?from=&to=` |
| 1.2 | Create `components/admin/analytics/kpi-card.tsx` — single card, accepts value + label + subtext + loading prop | ⬜ | Shows skeleton when loading=true |
| 1.3 | Create `components/admin/analytics/kpi-row.tsx` — fetches from /api/admin/analytics/kpis/, renders 4 KPICards | ⬜ | Re-fetches when dateRange changes |
| 1.4 | Remove the `realStats` useEffect from page.tsx (replaced by kpi-row) | ⬜ | |
| 1.5 | Verify: no fake percentage change values shown (no previous-period comparison yet — add in Phase 2+) | ⬜ | |

---

## Phase 2 — Revenue & Order Charts
*Goal: Real charts from real data using Recharts. Both filter-aware.*

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Create `app/api/admin/analytics/revenue-chart/route.ts` | ⬜ | Daily buckets: `{ date, confirmed_revenue, pending_revenue }[]`. Group orders by date. Confirmed = delivered, Pending = rest non-cancelled |
| 2.2 | Create `app/api/admin/analytics/order-volume/route.ts` | ⬜ | `{ date, count }[]` daily order count |
| 2.3 | Create `components/admin/analytics/revenue-chart.tsx` | ⬜ | Recharts AreaChart — two areas: confirmed (solid) + pending (lighter). Tooltip shows both. |
| 2.4 | Create `components/admin/analytics/order-volume-chart.tsx` | ⬜ | Recharts BarChart — daily bars, hover tooltip |
| 2.5 | Both charts show "No orders in this period" empty state | ⬜ | |
| 2.6 | Revenue chart shows total confirmed + total pending in its header (not in chart, just text) | ⬜ | |

---

## Phase 3 — Category, Payment, Funnel
*Goal: Where is revenue coming from? How are orders moving through the pipeline?*

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Create `app/api/admin/analytics/category-breakdown/route.ts` | ⬜ | Join order_items → orders, group by product category (from products table via product_id). Returns revenue + count + pct per category |
| 3.2 | Create `app/api/admin/analytics/payment-split/route.ts` | ⬜ | Group orders by payment_method. Returns count + revenue + pct |
| 3.3 | Create `app/api/admin/analytics/order-funnel/route.ts` | ⬜ | Count by status: pending / processing / dispatched / delivered / cancelled. Returns count + pct |
| 3.4 | Create `components/admin/analytics/category-breakdown.tsx` | ⬜ | Horizontal bars with label + revenue + pct. 4 categories: Ladies, Kids, Baby, Accessories |
| 3.5 | Create `components/admin/analytics/payment-split.tsx` | ⬜ | Recharts PieChart (donut). Segments: COD / JazzCash / Easypaisa / Bank Transfer |
| 3.6 | Create `components/admin/analytics/order-funnel.tsx` | ⬜ | Simple funnel bars or horizontal progress bars showing drop-off at each stage |

---

## Phase 4 — Product Intelligence
*Goal: Which products sell? Which never sell? Strategy recommendations from real data.*

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Create `app/api/admin/analytics/top-products/route.ts` | ⬜ | Aggregate order_items by product_title (group by product_id OR product_title). Returns: units_sold, revenue, order_count. Sorted by units_sold desc. Limit 10 |
| 4.2 | Create `app/api/admin/analytics/inventory/route.ts` | ⬜ | From products table: low_stock (1-5 units), out_of_stock (0 units), dead_stock (products with product_id never in order_items), total stock value (price × stock for all active products) |
| 4.3 | Create `components/admin/analytics/top-products-table.tsx` | ⬜ | Table: rank, product name, units sold, revenue. Sortable by column. Link to /admin/products |
| 4.4 | Create `components/admin/analytics/inventory-panel.tsx` | ⬜ | 3 mini lists: Low Stock / Out of Stock / Never Sold. Each links to product edit |

---

## Phase 5 — Customer Analytics
*Goal: Who is buying? New or returning? Where from?*

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Create `app/api/admin/analytics/customers/route.ts` | ⬜ | From orders + customers: new customers in period (first_order in range), returning (had orders before range), top 5 customers by spend in period, city breakdown |
| 5.2 | Create `components/admin/analytics/customer-summary.tsx` | ⬜ | Cards: New customers, Returning customers, Repeat purchase rate, VIP count |
| 5.3 | Create `components/admin/analytics/top-customers-table.tsx` | ⬜ | Table: name, email, orders in period, spent in period, lifetime spent, tier badge |

---

## Phase 6 — Supabase Realtime (Live Feed)
*Goal: New orders appear on screen the moment they're placed. No page refresh.*

**Pre-requisite:** Enable Realtime on the `orders` table in Supabase dashboard:
`Database → Replication → Tables → orders → enable`

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Enable Realtime on `orders` table in Supabase dashboard (manual step) | ⬜ | One-time setup |
| 6.2 | Create `components/admin/analytics/live-order-feed.tsx` | ⬜ | Shows last 10 orders in a table. Subscribes to orders INSERT via `supabase.channel('orders-live').on('postgres_changes', ...)`. New order slides in at top with a brief highlight |
| 6.3 | When new order arrives: re-fetch KPI row (emit refresh signal or use a shared context counter) | ⬜ | KPIs should update within ~1s of new order without full page reload |
| 6.4 | Show a subtle pulse / "1 new order" badge on the KPI cards when live update arrives | ⬜ | |

---

## Phase 7 — AI Insights Panel
*Goal: Claude API gives actionable strategy advice based on real order data.*

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Create `app/api/admin/analytics/ai-insights/route.ts` | ⬜ | POST. Builds a data summary from DB, calls Claude API (`claude-sonnet-4-6`), streams or returns recommendations. Gate: if total orders < 20, return "not enough data" without calling Claude API |
| 7.2 | Create `components/admin/analytics/ai-insights-panel.tsx` | ⬜ | Card with "Get AI Recommendations" button. Shows loading spinner while Claude thinks. Renders markdown-style bullet recommendations. Shows last-generated timestamp |
| 7.3 | AI prompt is specific to Habiba Minhas — mentions COD market, Pakistani clothing, Eid/wedding season context | ⬜ | See PLAN.md for prompt template |
| 7.4 | Recommendations are cached for 1 hour (don't re-call Claude on every page visit) | ⬜ | Simple in-memory or localStorage cache |

---

## Known Blockers / Dependencies

| Item | Status | Notes |
|---|---|---|
| Recharts not installed | ⬜ | `npm install recharts` — Phase 0 |
| Supabase Realtime not enabled on orders table | ⬜ | Manual step in Supabase dashboard — before Phase 6 |
| CLAUDE API key already in .env.local as `GEMINI_API_KEY` (wrong name) | ⬜ | Check: should be `ANTHROPIC_API_KEY` or use existing key. Verify before Phase 7 |

---

## Session Handoff Notes

> **If you are a new Claude session picking this up:** Read `PLAN.md` first for architecture, then come back to this TRACKER to see what's done. Check the ✅ boxes below to know the current state. The codebase is at `D:\Projetcs\Habiba Minhas`. The analytics page is at `app/admin/analytics/page.tsx`. All data is currently mock/hardcoded — nothing real except the KPI numbers which flash in after load.

> **Start from the top of Phase 0 and work down. Do not skip phases — each one builds on the previous.**

> **Key rule:** Revenue = delivered orders only. COD market. Never show fake data — always honest empty states.
