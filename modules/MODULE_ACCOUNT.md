# Module: Account

Login, sign-up, and the member dashboard.

## Files

| Path                                 | Role                        |
|--------------------------------------|-----------------------------|
| `app/account/login/page.tsx`         | Sign-in (email + password + Google)   |
| `app/account/signup/page.tsx`        | Create account (name, email, password, newsletter opt-in) |
| `app/account/page.tsx`               | Member dashboard (stats, recent orders, saved items) |

## Layout

Login and signup share a 50/50 split:

- One side is a full-bleed `PlaceholderImage` with an editorial quote overlay.
- The other side is the form in a centered `max-w-md` column, field labels tracked 22em above thin underline inputs.

Dashboard:

```
[ Eyebrow · Display heading · Subtitle ]

┌─ sidebar (3/12) ─┐  ┌─ main (9/12) ──────────────┐
│ Overview ●       │  │ 4 stat tiles                │
│ Orders           │  │ Recent orders table         │
│ Addresses        │  │ Wishlist preview (4 items)  │
│ Payments         │  │                             │
│ Wishlist         │  │                             │
│ Sign out         │  │                             │
└──────────────────┘  └─────────────────────────────┘
```

Sidebar is horizontally scrollable on mobile (`flex-row lg:flex-col overflow-x-auto`).

## Phase 2 — auth

All three pages are static mockups. To wire real auth:

1. Pick a provider (NextAuth / better-auth / self-rolled). Recommend NextAuth with credentials + Google OAuth for speed.
2. Put session accessors in `lib/auth.ts` (`getSession()`, `requireSession()`).
3. Convert `app/account/page.tsx` to `async`, read the session, redirect to `/account/login` if absent.
4. Wire the forms to server actions — the design already uses native forms so no JS migration needed.
5. Add a `middleware.ts` that guards `/account/*` except `login/signup`.

## Extending

- New dashboard section (e.g., Gift Cards) → add a sidebar entry and a sibling page under `app/account/<slug>/page.tsx`.
- Stat tile → extend the stats array in `app/account/page.tsx`.
- Order statuses → extend the ternary in the Recent Orders `<td>`: green for "Delivered", gold for "In transit"; add rose for "Returned" and muted for "Cancelled" when those states exist.
