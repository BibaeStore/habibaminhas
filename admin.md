# Habiba Minhas — Admin Guide

The admin panel lives at `/admin`. It is protected by JWT cookie authentication — only users with a valid `hm_admin_token` cookie can access it.

---

## Accessing the Admin

1. Go to `https://habibaminhas.com/admin/login` (or `localhost:3000/admin/login` locally)
2. Enter admin email and password
3. You are redirected to `/admin` (dashboard overview)

To create the first admin account, visit `/admin/setup` — this route is only usable once (it locks after the first admin is created).

---

## Dashboard (`/admin`)

Shows at a glance:
- Today's order count and revenue
- Total orders and total revenue
- Order status breakdown (pending / processing / dispatched / delivered / cancelled)
- Recent orders table with quick-link to each order detail

---

## Products (`/admin/products`)

### Adding a product

1. Click **Add Product**
2. Fill in:
   - **Title** — product name (shown on site and emails)
   - **Slug** — URL-friendly identifier (auto-generates from title; must be unique)
   - **Category** — links to a category from the DB
   - **Description** — shown on the product detail page
   - **Price** — in PKR (whole number)
   - **Sale price** — optional; shows crossed-out original price on site
   - **Status** — `active` (visible), `draft` (hidden), `archived`
   - **Stock** — current inventory count; triggers low-stock alerts when below threshold (default: 5)
   - **Sizes** — comma-separated (e.g. `XS,S,M,L,XL`) or leave blank for one-size
   - **SKU** — optional internal reference
   - **Images** — Supabase Storage URLs; first image is the primary thumbnail
   - **Palette** — 3 brand colour swatches shown on the product card

3. Click **Save**

### Editing a product

Click any product row to open the edit form. All fields are editable. Stock is updated in real time.

### Product status

| Status | Visible on site |
|---|---|
| `active` | Yes |
| `draft` | No |
| `archived` | No |

---

## Categories (`/admin/categories`)

Categories drive both the mega-menu navigation and the product catalogue structure.

### Fields

| Field | Purpose |
|---|---|
| **Name** | Display name in the nav and category pages |
| **Slug** | URL segment (e.g. `ladies-suits`) |
| **Parent** | Set to make this a sub-category |
| **Description** | Optional — shown on collection pages |
| **Image URL** | WebP image for the mega-menu feature tile |
| **Nav href** | Full path the nav link points to (e.g. `/ladies`, `/kids`) |
| **Sort order** | Controls the order in the mega-menu |
| **Active** | Toggle on/off without deleting |

### Nav refresh

Every save/delete in categories calls `revalidatePath("/", "layout")` which busts the site-wide navigation cache. The updated menu appears on the next page load — no manual rebuild needed.

---

## Orders (`/admin/orders`)

### Order list

- Filter by status: All, Pending, Processing, Dispatched, Delivered, Cancelled
- Search by order number or customer name
- Export all visible orders as CSV (downloads immediately)
- Print (opens the browser print dialog)

### Order detail

Click any order row to open the full detail panel:

- Customer name, phone, email, address
- All line items with quantities and prices
- Subtotal, shipping, total
- Payment method and status
- Current status with a status-change dropdown
- Courier name and tracking number fields
- Notes field for internal use

### Changing order status

1. Open the order detail
2. Select the new status from the dropdown
3. Click **Save** — the customer's order tracker page updates immediately

### Status flow

```
pending → processing → dispatched → delivered
                    ↘ cancelled
```

### Adding a tracking number

1. Open the order detail
2. Enter the courier tracking number in the **Tracking Number** field
3. Save — the tracking number appears on the customer's `/track` page

---

## Customers (`/admin/customers`)

Shows all customers who have placed at least one order.

| Column | Source |
|---|---|
| Name | From the last order placed |
| Email | Unique identifier |
| Phone | From the last order |
| City | From the shipping address |
| Tier | Auto-assigned: New (<3 orders), Regular (≥3 orders), VIP (≥Rs. 50,000 spent) |
| Total orders | Count of all orders |
| Total spent | Sum of all order totals |

Click a customer to see their full order history.

Export as CSV downloads all visible customers.

---

## Analytics (`/admin/analytics`)

Shows charts for:
- Daily revenue (last 30 days)
- Orders by status (pie/bar)
- Payment method split
- Top-selling products

> Note: charts currently use hardcoded demo data for the visual layout. Connect to live Supabase queries to activate real data.

---

## Notifications (`/admin/notifications`)

Low-stock alerts appear here automatically when a product's stock falls below the threshold (default: 5 units, set in `lib/inventory-constants.ts`).

- Mark individual notifications as read
- Mark all as read
- Notifications are also visible as a badge count on the admin sidebar

---

## Settings (`/admin/settings`)

### Shipping

| Setting | Effect |
|---|---|
| Standard shipping cost | The flat Rs. amount charged on all orders |
| Carrier name | Shown on order confirmation pages (e.g. TCS, Leopards) |
| Free shipping threshold | Set to `9999999` to effectively disable free shipping |

### Payment methods

Toggle which payment options appear at checkout:
- Cash on Delivery (COD)
- Bank Transfer / Debit Card
- JazzCash
- Easypaisa

### SEO

- Site title and meta description used for the homepage
- Social sharing image URL

### Promo bar

Text messages cycling in the top announcement bar. Enter each message on a new line. Changes reflect on the next page load.

### Analytics integrations

- **Google Analytics 4** — paste your GA4 Measurement ID (e.g. `G-XXXXXXXXXX`)
- **Meta Pixel** — paste your Pixel ID

Both are injected into the `<head>` via `app/layout.tsx`. Leave blank to disable.

---

## Low-Stock Threshold

Edit `lib/inventory-constants.ts`:

```ts
export const LOW_STOCK_THRESHOLD = 5; // change this number
```

When a product's stock reaches or crosses this number after an order, a notification is created and sent.

---

## Email Notifications

On every successful order, two emails are sent automatically:
1. **Customer** — order confirmation with PDF invoice attached
2. **Admin** (`info@habibaminhas.com`) — new-order alert with PDF invoice, CC to `team@habibaminhas.com`

Emails are fire-and-forget — a failed email does not block the order. Check the Vercel function logs if emails stop arriving.

SMTP credentials are in `.env.local` (`EMAIL_USER`, `EMAIL_PASS`). The Gmail App Password must be kept active in the Google account security settings.
