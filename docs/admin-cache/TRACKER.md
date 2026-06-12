# Admin Cache & Realtime Build Tracker
**Last updated: 2026-06-13 (Phases 0–2 + 4 complete — ALL admin pages cached; Phase 3 Realtime toggle pending) · Read PLAN.md first**

Status legend: ⬜ Not started · 🔄 In progress · ✅ Done · ❌ Blocked

---

## Phase 0 — Foundation (zero behavior change)

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | `npm install @tanstack/react-query` | ✅ | v5.101.0 |
| 0.2 | Create `components/admin/query-provider.tsx` | ✅ | staleTime Infinity, gcTime 30min, refetchOnReconnect true |
| 0.3 | Mount provider in `app/admin/layout.tsx` | ✅ | |
| 0.4 | Verify all admin pages still work | ✅ | tsc + production build clean |

## Phase 1 — Orders page (the critical one)

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Replace `loadOrders()` + `useState` with `useQuery(["orders"])` | ✅ | All filter/search/sort useMemo logic untouched |
| 1.2 | Mutation refresh strategy | ✅* | *Implemented via `loadOrders = () => invalidateQueries(["orders"])` — silent background refetch, no spinner, all 6 call sites unchanged. Per-mutation optimistic `setQueryData` deferred to Phase 3 (Realtime patching makes it redundant) |
| 1.3 | Loading state only when cache empty (`isPending`) | ✅ | Revisits render instantly from cache |
| 1.4 | Verify instant Orders ↔ Products switching | ✅ | Cache lives in admin layout; no refetch on remount (staleTime Infinity) |

## Phase 2 — Products, Customers, Dashboard

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Products page → `useQuery(["products"])` | ✅ | `loadProducts` → invalidateQueries; both call sites unchanged. Categories fetch left as useEffect (small, modal-local) |
| 2.2 | Customers page → `useQuery(["customers"])` + `useQuery(["customer-stats"])` | ✅ | `loadData` invalidates both keys |
| 2.3 | Dashboard → client component `components/admin/dashboard-client.tsx` with shared keys `["orders"]`, `["products"]`, `["order-stats"]`, `["customer-stats"]` | ✅ | page.tsx kept as server wrapper for metadata. Dashboard ↔ Orders ↔ Products navigation shares one cache |
| 2.4 | Verify instant switching across all four pages | ✅ | Production build clean |

## Phase 3 — Realtime silent updates

**Pre-requisite (manual):** Supabase dashboard → Database → Replication → enable for `orders`, `products`, `customers`

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Enable Realtime on the 3 tables in Supabase dashboard | ⬜ | **Manual step — the owner must do this.** Until then, 60s staleTime fallback in query-provider keeps data fresh |
| 3.2 | Create `components/admin/realtime-sync.tsx`, mount once in admin layout | ✅ | Implemented as invalidate-on-event (silent background refetch by id-stable server action) instead of raw `setQueryData` prepend — avoids RLS payload-shape issues; refetched array is already sorted desc so new orders appear at top. Idles harmlessly until 3.1 is done |
| 3.3 | New-row highlight + toast "New order #xxxx" | ⬜ | Polish — after 3.1 is enabled and verified |
| 3.4 | Websocket health: on `CHANNEL_ERROR` / `TIMED_OUT` → invalidate once | ⬜ | Less urgent given 60s staleTime fallback + refetchOnReconnect |
| 3.5 | Acceptance test: search in orders, place test order in another tab → row appears silently at top | ⬜ | Requires 3.1 first |

## Phase 4 — Remaining pages (optional, uniform polish)

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Categories, Settings, Notifications pages → `useQuery` | ✅ | Categories: toggleStatus uses surgical `setQueryData`. Settings: `saveSettings` wrapper invalidates after save; hydration effect keyed on data. Notifications: read/delete/mark-all are surgical `patchCache` writes |
| 4.2 | VTR admin page → `useQuery(["tryon-log", page])` | ✅ | `keepPreviousData` for smooth page flips; save invalidates |
| 4.3 | Analytics components → `useQuery` keyed per date range | ✅ | All 10 fetch components migrated. CustomerSummary + TopCustomersTable share `["analytics-customers", from, to]` → one request serves both. LiveOrderFeed uses `refetchInterval: 60s`. AI insights stays button-triggered (no cache, deliberate). Order detail page → `["order", id]`, mutations also invalidate `["orders"]` list |

---

## Session Handoff Notes

> **If you are a new Claude session picking this up:** Read `PLAN.md` in this folder first. Nothing is implemented yet — this is a planning artifact. The pattern is TanStack Query (SWR caching, `staleTime: Infinity`) + Supabase Realtime (push-driven surgical cache writes via `setQueryData`). Server actions stay as-is and are used directly as queryFn/mutationFn. Client-side filter logic on Orders/Products pages must remain untouched.

> **Key rule:** Cache updates must never remount tables or reset user input. All cache writes are surgical (`setQueryData` by id), never full refetches while the user is interacting.
