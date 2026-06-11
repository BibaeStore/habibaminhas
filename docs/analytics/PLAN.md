# Admin Analytics — Complete Architecture Plan
**Habiba Minhas E-Commerce · June 2026**

---

## Current State (Audit Results)

### What exists
- `app/admin/analytics/page.tsx` — client component, uses `getOrderStats()` + `getCustomerStats()` from server actions
- **100% of the visible data is hardcoded mock constants** (KPI_DATA, REVENUE_7D, CAT_BREAKDOWN, TOP_PRODUCTS, PAYMENT_SPLIT)
- The "flash / sudden jump" bug: mock constants render instantly on mount, then `useEffect` fetches real data and replaces KPI numbers ~500ms later — visually jarring

### What the database actually has right now (June 11, 2026)
| Table | Rows | Notes |
|---|---|---|
| `orders` | 7 | All from June 6–8, 2026 — store is brand new |
| `order_items` | 7 | One item per order so far |
| `customers` | 9 | |
| `products` | 57 | |
| Lifetime revenue | Rs. 39,750 | |

> **Important:** Any "last month" / "this year" view will be nearly empty — that's correct and expected. The dashboard must show honest empty states, not fake data.

---

## Key Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Revenue definition | **Delivered orders only** = Confirmed; all other non-cancelled = Pending | COD market: money in hand only when delivered |
| Profit tracking | ❌ Not in this build | No cost_price column yet |
| Live updates | **Supabase Realtime** (postgres_changes websocket) | True push — new order appears instantly, no page refresh |
| Charts | **Recharts** library | Clean, responsive, React-native, tooltips included |
| Data fetching | **API routes** (not server actions) | Client components re-fetch on date-filter change; server actions can't be called reliably from useEffect |
| AI insights | **Claude API — wired now, honest "not enough data" until 30+ orders** | Infra ready, advice meaningful only with real volume |
| Traffic / page views | ❌ Not tracked | Product intelligence comes from order_items only (which products sell most) |

---

## Date Range Filters

Every data-fetching component accepts a `{ from: Date, to: Date }` range. The filter bar at the top of the page controls all components simultaneously.

| Preset | Range |
|---|---|
| Today | midnight today → now |
| Yesterday | midnight yesterday → midnight today |
| Last 7 days | 7 days ago → now |
| This month | 1st of current month → now |
| Last month | 1st to last day of previous calendar month |
| This year | Jan 1 → now |
| All time | epoch → now |
| Custom | date-range picker (start + end) |

---

## Component Map

Every section is an **independent client component** — its own loading skeleton, its own data fetch, its own Realtime subscription if relevant. Nothing shares state or loading between components. If one fails, others still show.

```
AdminAnalyticsPage (layout shell only, holds dateRange state)
│
├── DateRangeBar          — preset buttons + custom picker (global filter)
│
├── KPIRow                — 4 cards in a grid
│   ├── KPICard: Confirmed Revenue   (delivered orders total)
│   ├── KPICard: Pending Revenue     (non-delivered, non-cancelled)
│   ├── KPICard: Orders              (count + status breakdown mini-bar)
│   └── KPICard: Avg Order Value     (confirmed only)
│
├── RevenueChart          — area/line chart, daily buckets, Recharts
├── OrderVolumeChart      — bar chart, daily order count, Recharts
│
├── CategoryBreakdown     — horizontal bars, revenue + % by category
├── PaymentSplit          — donut chart: COD / JazzCash / Easypaisa / Bank
├── OrderFunnel           — placed → dispatched → delivered → cancelled %
│
├── TopProductsTable      — from order_items aggregated, sortable
├── InventoryPanel        — low stock / out of stock / dead stock (never sold)
│
├── CustomerSummary       — new vs returning, tier breakdown, top city
├── TopCustomersTable     — by total_spent in the selected period
│
├── LiveOrderFeed         — real-time table: last 10 orders, new ones slide in at top
│
└── AIInsightsPanel       — Claude API recommendations (or "gathering data" state)
```

---

## API Routes to Build

All under `app/api/admin/analytics/`.

| Route | Method | Returns |
|---|---|---|
| `/api/admin/analytics/kpis/` | GET `?from=&to=` | confirmed_revenue, pending_revenue, order_count, aov |
| `/api/admin/analytics/revenue-chart/` | GET `?from=&to=` | `{ date, confirmed, pending }[]` daily buckets |
| `/api/admin/analytics/order-volume/` | GET `?from=&to=` | `{ date, count }[]` daily buckets |
| `/api/admin/analytics/category-breakdown/` | GET `?from=&to=` | `{ category, revenue, order_count, pct }[]` |
| `/api/admin/analytics/payment-split/` | GET `?from=&to=` | `{ method, count, revenue, pct }[]` |
| `/api/admin/analytics/order-funnel/` | GET `?from=&to=` | `{ status, count, pct }[]` |
| `/api/admin/analytics/top-products/` | GET `?from=&to=&limit=10` | `{ product_title, product_id, units_sold, revenue, order_count }[]` |
| `/api/admin/analytics/inventory/` | GET | `{ low_stock[], out_of_stock[], dead_stock[], stock_value }` |
| `/api/admin/analytics/customers/` | GET `?from=&to=` | new, returning, tier_breakdown, top_city, top_customers[] |
| `/api/admin/analytics/ai-insights/` | POST `{ summary }` | Claude API response with strategy recommendations |

All routes use `createAdminClient()` (service role, bypasses RLS). All routes respect trailing slash (next.config has `trailingSlash: true`).

---

## Supabase Realtime Plan

Subscribe to `orders` table INSERT events using `supabase.channel()`. The `LiveOrderFeed` component handles the subscription. When a new order INSERT is received:

1. Prepend the new order to the local `orders` state — no fetch, no refresh
2. Emit a custom event (`analytics:new-order`) so `KPIRow` components re-fetch their slice
3. Show a toast/pulse animation on the affected KPI cards

```typescript
// Pattern used in each realtime component
const client = createClient(); // browser client
useEffect(() => {
  const channel = client
    .channel("orders-realtime")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "orders",
    }, (payload) => {
      // handle new order
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
}, []);
```

> Note: Supabase Realtime must be **enabled** on the `orders` table in the Supabase dashboard (Database → Replication → enable for `orders`). This is a one-time manual step before Phase 5 can work.

---

## AI Insights Panel

**Route:** `POST /api/admin/analytics/ai-insights/`

**Trigger:** Manual button ("Get AI Recommendations") — not automatic on load. Claude API is billed, so don't call on every page visit.

**Input sent to Claude:** A structured JSON summary of:
- Top 5 products by units sold (current period)
- Revenue by category (current period)
- COD % vs prepaid %
- Cancellation rate
- Days since store launched
- Low stock items

**Prompt template:** "You are a business advisor for Habiba Minhas, a Pakistani clothing brand selling ladies suits, kids formal, baby products, and accessories. Analyze these recent sales metrics and give 3-5 specific, actionable recommendations. Be concise and practical."

**Minimum data gate:** If total orders < 20, return a canned response: "Your store is still gathering data. Come back when you have at least 20 orders for meaningful insights." This avoids billing the Claude API for advice based on 7 data points.

---

## The Flash Bug Fix

**Root cause:** `const KPI_DATA = { "7d": { revenue: "Rs. 2,66,300", ... } }` — hardcoded mock renders synchronously. `realStats` from `useEffect` replaces it ~500ms later. User sees numbers jump.

**Fix:** Remove ALL mock constants. Components start in a loading skeleton state (grey shimmer boxes). Real data fills in when the fetch resolves. No data is shown until it's real.

---

## Recharts Installation

```bash
npm install recharts
```

Charts to use:
- `AreaChart` + `Area` — revenue over time (smooth, shaded under curve)
- `BarChart` + `Bar` — order volume by day
- `PieChart` + `Pie` + `Cell` — payment method split
- Custom donut-style via `PieChart innerRadius`

---

## Empty / Insufficient Data States

Every component must handle these honestly:

| State | What to show |
|---|---|
| Loading | Animated skeleton shimmer matching the component shape |
| No data in period | "No orders in this period" with a soft icon — not zero bars |
| New store (< 7 days old) | "Trend comparison not available yet — check back in a week" |
| AI with < 20 orders | "Come back when you have 20+ orders for AI recommendations" |

---

## Files to Create / Modify

### New files
```
app/api/admin/analytics/kpis/route.ts
app/api/admin/analytics/revenue-chart/route.ts
app/api/admin/analytics/order-volume/route.ts
app/api/admin/analytics/category-breakdown/route.ts
app/api/admin/analytics/payment-split/route.ts
app/api/admin/analytics/order-funnel/route.ts
app/api/admin/analytics/top-products/route.ts
app/api/admin/analytics/inventory/route.ts
app/api/admin/analytics/customers/route.ts
app/api/admin/analytics/ai-insights/route.ts

components/admin/analytics/date-range-bar.tsx
components/admin/analytics/kpi-row.tsx
components/admin/analytics/kpi-card.tsx
components/admin/analytics/revenue-chart.tsx
components/admin/analytics/order-volume-chart.tsx
components/admin/analytics/category-breakdown.tsx
components/admin/analytics/payment-split.tsx
components/admin/analytics/order-funnel.tsx
components/admin/analytics/top-products-table.tsx
components/admin/analytics/inventory-panel.tsx
components/admin/analytics/customer-summary.tsx
components/admin/analytics/top-customers-table.tsx
components/admin/analytics/live-order-feed.tsx
components/admin/analytics/ai-insights-panel.tsx
components/admin/analytics/skeleton.tsx          (shared skeleton shapes)
```

### Modified files
```
app/admin/analytics/page.tsx   — gutted and rebuilt as layout shell only
package.json                   — add recharts
```

---

## Reference: Orders Table Fields Used in Analytics

```
orders.created_at          — date bucketing
orders.status              — pending / processing / dispatched / delivered / cancelled
orders.total               — revenue
orders.subtotal            — revenue before shipping
orders.shipping            — shipping fee
orders.payment_method      — COD / JazzCash / Easypaisa / Bank Transfer
orders.payment_status      — paid / pending / failed
orders.customer_email      — for new vs returning customer detection
orders.address (JSON)      — .city for geography

order_items.product_id     — join to products
order_items.product_title  — used directly (product may have been deleted)
order_items.quantity
order_items.unit_price
order_items.total_price

customers.tier             — New / Regular / VIP
customers.total_spent
customers.total_orders
customers.city
customers.created_at       — new this period
```
