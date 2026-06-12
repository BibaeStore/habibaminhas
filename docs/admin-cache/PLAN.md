# Admin Instant-Navigation & Silent-Update Plan
**Habiba Minhas E-Commerce · June 2026**

---

## The Two Requirements (in the owner's words)

1. **Instant tab switching** — switching Products → Orders → Products should display instantly from cache. Only refetch if data actually changed in the database. No spinner on every visit.
2. **Silent table updates** — when a new order arrives while the admin is mid-search or mid-scroll on the orders table, the new row should slide in at the top quietly. No table reset, no UI interruption, no lost search text or scroll position.

## The Named Concept

This pattern is called **SWR — stale-while-revalidate**: serve the cached ("stale") copy instantly, revalidate in the background only when needed. The industry-standard implementation for React is **TanStack Query** (formerly React Query). We pair it with **Supabase Realtime** so revalidation is *push-driven* (database tells us when something changed) instead of *poll-driven* (refetching just in case).

> Decision: **TanStack Query** over Vercel's `swr` library — better mutation support, surgical cache writes (`setQueryData`) needed for silent row inserts, and devtools.

---

## Current State (Audit)

| Page | Fetch mechanism | Refetches on every visit? |
|---|---|---|
| `/admin/orders` | `getOrders()` server action in `useEffect` | Yes — full spinner |
| `/admin/products` | `getProducts()` + `getMainCategories()` in `useEffect` | Yes |
| `/admin/customers` | server action in `useEffect` | Yes |
| `/admin` (dashboard) | server actions in `useEffect` | Yes |
| `/admin/virtual-try-on` | `fetch()` API route, paginated | Yes |
| `/admin/analytics` | 10 components, each `fetch()` in `useEffect` | Yes |
| `/admin/categories`, `/admin/settings`, `/admin/notifications` | server actions in `useEffect` | Yes |

Key facts that make migration easy:
- **All filtering/search/sort on Orders + Products is client-side** (`useMemo` over the full array). The cache only needs to hold the raw array — filter state lives in the component and is untouched by cache updates. This is exactly what makes "silent insert without disturbing search" possible.
- Server actions are plain async functions — TanStack Query can call them directly as `queryFn`. **No API route rewrites needed.**
- Each page wraps itself in `<AdminShell>`; there's an `app/admin/layout.tsx` where the `QueryClientProvider` can live so the cache survives navigation.

---

## Architecture

```
app/admin/layout.tsx
└── <AdminQueryProvider>        ← one QueryClient, lives across all admin navigation
    └── pages use hooks:
        useQuery({ queryKey: ["orders"],    queryFn: getOrders,    staleTime: Infinity })
        useQuery({ queryKey: ["products"],  queryFn: getProducts,  staleTime: Infinity })
        useQuery({ queryKey: ["customers"], ... })
        ...

components/admin/realtime-sync.tsx   (mounted once in admin layout)
└── One Supabase Realtime channel per table (orders, products, customers)
    on INSERT  → queryClient.setQueryData(["orders"], old => [newRow, ...old])   ← silent prepend
    on UPDATE  → setQueryData map-replace the one row                            ← silent in-place
    on DELETE  → setQueryData filter the one row out
    (no refetch, no loading state, no table remount)
```

### Why `staleTime: Infinity` works here
Normally SWR refetches in the background on revisit "just in case". But since Supabase Realtime *pushes* every change into the cache the moment it happens, the cache is never actually stale — so we can disable background refetching entirely. Result: **zero unnecessary network requests, and tab switches are instant.** A `refetchOnReconnect` + manual Refresh button stays as the safety net (e.g. after laptop sleep breaks the websocket, TanStack refetches on reconnect automatically).

### Silent insert mechanics (requirement 2)
1. New order INSERT arrives over the websocket.
2. `setQueryData(["orders"], old => [newRow, ...old])` — React re-renders **only the table body**, not the page.
3. Search input, status filter, scroll position, open modals — all untouched (they're separate state).
4. If the admin's current filter excludes the new order (e.g. searching "Karachi", new order from Lahore), it simply doesn't appear — correct behavior.
5. A subtle highlight animation (2s fade) on the new row + a small toast "New order #1234" so it's noticed but not disruptive.
6. KPI/stat counters on the same page recompute automatically since they derive from the same cached array.

### Mutations (admin's own edits)
When the admin edits/deletes/creates from the UI, the Realtime echo will arrive anyway (~100–300ms later), but for snappy UX each mutation also writes the cache optimistically:
- `updateOrderStatus` → `setQueryData` replace row immediately → Realtime echo confirms (idempotent by `id`).
- Dedupe guard: all cache writers match on `id`, so a Realtime echo of our own edit replaces (not duplicates) the row.

---

## What Does NOT Change

- All server actions (`getOrders`, `updateProduct`, …) — kept as-is, used as `queryFn`/`mutationFn`.
- All client-side filter/search/sort logic — untouched, reads from cached array exactly as it reads from `useState` today.
- All UI markup, tables, modals, pagination controls — untouched.
- The storefront — completely unaffected; this is admin-only.
- Analytics page — already componentized; its components can optionally migrate to `useQuery` later for the same instant-switch benefit (Phase 4, lowest priority).

## Manual One-Time Setup (Supabase Dashboard)

Enable Realtime replication on: `orders`, `products`, `customers`
(Database → Replication → Tables → toggle each). Without this, everything still works — pages just fall back to a 60s `staleTime` background revalidate instead of push updates. The plan handles both modes.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Websocket silently dies (sleep/network) → cache goes stale without knowing | TanStack's `refetchOnReconnect` + channel `status` callback: on `CHANNEL_ERROR`/`TIMED_OUT`, invalidate affected queries once |
| Realtime not enabled on a table | Fallback `staleTime: 60s` per-table flag until enabled |
| Realtime payload lacks joined data (e.g. order row arrives without `order_items`) | On INSERT of an order, fetch that single order by id (one cheap query) then prepend the complete row |
| Memory growth from cache | One array per table, ~7 orders / 57 products today — negligible. `gcTime: 30min` default cleans unused queries |
| VTR log is server-paginated | Query key includes page: `["tryon-log", page]` — each page cached separately; Realtime INSERT invalidates page 1 only |

---

## Phases (see TRACKER.md)

- **Phase 0** — Install `@tanstack/react-query`, create `AdminQueryProvider`, mount in `app/admin/layout.tsx`. Zero behavior change.
- **Phase 1** — Migrate **Orders** page to `useQuery` + mutations. The most important page (this is where silent inserts matter most).
- **Phase 2** — Migrate **Products**, **Customers**, **Dashboard** pages.
- **Phase 3** — Build `realtime-sync.tsx`: one component, three channels, surgical cache writes + new-row highlight + toast. Enable Realtime in Supabase dashboard.
- **Phase 4 (optional)** — Migrate remaining pages (categories, settings, VTR, analytics components) for uniform instant navigation.

Each phase ships independently; the app works identically after every phase.
