# Module: Cart & Wishlist

Bag and wishlist surfaces. Both are **stateless stubs** in Phase 1 — they render from fixture data so we can style and test the flows without a state layer yet.

## Files

| Path                         | Role                           |
|------------------------------|--------------------------------|
| `app/cart/page.tsx`          | Bag view                       |
| `app/wishlist/page.tsx`      | Saved items grid               |
| `components/product/product-card.tsx` | Wishlist renders via cards |

## Cart page

- Left column (8/12): scrollable line-item list — each line has thumbnail, title, collection meta, size / colour chips, quantity stepper, remove button, line total.
- Right column (4/12): sticky `Order Summary` panel with subtotal, shipping (free > Rs. 3,500 — badge **Complimentary**), gift wrap line ("Free"), total in display font, and a full-width CTA.
- Below CTA: trust strip (3 lines: shipping, returns, secure checkout).
- Mobile: columns stack; summary is the last section.

## Phase 2 — adding real cart state

Suggested approach (server-friendly):

1. Put cart into a cookie-backed store — pair with a React Server Action.
2. Expose a `lib/cart.ts` with `getCart() / addItem() / removeItem() / setQty()`.
3. `app/cart/page.tsx` becomes `async` and `await`s `getCart()`.
4. Mutations use a client form wrapper that calls the server action and `router.refresh()`.
5. Mirror the count to the navbar via `cookies().get('cart-count')` so the badge updates without hydration flicker.

## Wishlist

Simple grid — reuses `<ProductGrid>`. No quantity, no variants — just the card. Same Phase 2 treatment applies.

## Computed values today

```ts
const subtotal = lineItems.reduce((s, l) => s + l.product.price * l.qty, 0);
const shipping = subtotal > 3500 ? 0 : 250;
const total = subtotal + shipping;
```

Keep this in the view for now; move to the store in Phase 2.
