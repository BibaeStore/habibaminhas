const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://habibaminhas.com";
const GOLD   = "#9a7b38";
const INK    = "#1a1612";
const MUTED  = "#8a8179";
const BG     = "#f5f2ed";
const CARD   = "#ffffff";
const BORDER = "#e8e2d8";
const GOLD_BG = "#fdf8f0";

function pkr(n: number) {
  return `Rs.&nbsp;${n.toLocaleString("en-PK")}`;
}

function base(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Habiba Minhas</title>
  <span style="display:none;font-size:1px;color:${BG};max-height:0;overflow:hidden;">${preheader}</span>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;color:${INK};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:32px 0;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" border="0" style="width:620px;max-width:620px;">

      <!-- ── Header ── -->
      <tr>
        <td style="padding:0;border-radius:8px 8px 0 0;overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <!-- Logo row — ivory background so the dark logo is visible -->
            <tr>
              <td style="background:#f9f6f0;padding:20px 32px;text-align:center;">
                <img src="https://habibaminhas.com/logo/habiba-minhas-logo-t.png"
                     alt="Habiba Minhas"
                     width="200" height="67"
                     style="display:inline-block;width:200px;height:auto;max-height:67px;border:0;outline:none;text-decoration:none;"
                />
              </td>
            </tr>
            <!-- Dark tagline row -->
            <tr>
              <td style="background:${INK};padding:12px 32px 16px;text-align:center;">
                <p style="margin:0;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#c8a978;font-family:Arial,sans-serif;">
                  Handcrafted with Love in Pakistan
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ── Gold bar ── -->
      <tr><td style="background:${GOLD};height:4px;font-size:4px;line-height:4px;">&nbsp;</td></tr>

      <!-- ── Body ── -->
      ${content}

      <!-- ── Footer ── -->
      <tr>
        <td style="background:${INK};padding:28px 32px;border-radius:0 0 8px 8px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:bold;color:${GOLD};letter-spacing:0.12em;text-transform:uppercase;">
            Habiba Minhas
          </p>
          <p style="margin:0 0 4px;font-size:11px;color:#c8a978;">
            <a href="mailto:info@habibaminhas.com" style="color:#c8a978;text-decoration:none;">info@habibaminhas.com</a>
            &nbsp;·&nbsp;
            <a href="mailto:support@habibaminhas.com" style="color:#c8a978;text-decoration:none;">support@habibaminhas.com</a>
            &nbsp;·&nbsp;
            <a href="https://wa.me/923120295812" style="color:#c8a978;text-decoration:none;">+92 312 0295812</a>
          </p>
          <p style="margin:0 0 10px;font-size:11px;color:#8a7a64;">
            14-Day Easy Returns &nbsp;·&nbsp; Cash on Delivery Available Nationwide
          </p>
          <p style="margin:0;font-size:10px;color:#5a5048;">
            &copy; ${new Date().getFullYear()} Habiba Minhas. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function itemsTable(items: Array<{
  title: string; size: string | null; sku: string | null;
  quantity: number; unitPrice: number; totalPrice: number;
}>) {
  const rows = items.map((it, idx) => `
  <tr style="background:${idx % 2 === 0 ? CARD : GOLD_BG};">
    <td style="padding:12px 14px;border-bottom:1px solid ${BORDER};">
      <span style="font-weight:bold;font-size:13px;color:${INK};">${it.title}</span>
      ${it.size ? `<br/><span style="font-size:11px;color:${MUTED};">Size: ${it.size}</span>` : ""}
      ${it.sku  ? `<br/><span style="font-size:10px;color:${MUTED};">SKU: ${it.sku}</span>`  : ""}
    </td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:${INK};border-bottom:1px solid ${BORDER};">${it.quantity}</td>
    <td style="padding:12px 10px;text-align:right;font-size:13px;color:${INK};border-bottom:1px solid ${BORDER};">${pkr(it.unitPrice)}</td>
    <td style="padding:12px 14px;text-align:right;font-weight:bold;font-size:13px;color:${INK};border-bottom:1px solid ${BORDER};">${pkr(it.totalPrice)}</td>
  </tr>`).join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
    <tr style="background:${INK};">
      <th style="padding:12px 14px;text-align:left;font-size:11px;letter-spacing:0.1em;color:#ffffff;font-weight:bold;text-transform:uppercase;">Description</th>
      <th style="padding:12px 10px;text-align:center;font-size:11px;letter-spacing:0.1em;color:#ffffff;font-weight:bold;text-transform:uppercase;">Qty</th>
      <th style="padding:12px 10px;text-align:right;font-size:11px;letter-spacing:0.1em;color:#ffffff;font-weight:bold;text-transform:uppercase;">Unit Price</th>
      <th style="padding:12px 14px;text-align:right;font-size:11px;letter-spacing:0.1em;color:#ffffff;font-weight:bold;text-transform:uppercase;">Total</th>
    </tr>
    ${rows}
  </table>`;
}

// ─── Customer Order Confirmation ──────────────────────────────────────────────
export type OrderEmailData = {
  orderNumber:   string;
  orderDate:     string;
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  address: { street: string; apartment?: string; city: string; province: string; postalCode?: string };
  items: Array<{ title: string; size: string | null; sku: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal:      number;
  shipping:      number;
  total:         number;
  paymentMethod: string;
  status:        string;
};

export function buildCustomerEmail(d: OrderEmailData): string {
  const firstName = d.customerName.split(" ")[0];
  const addr = d.address;
  const addrStr = [addr.street, addr.apartment, addr.city, addr.province, addr.postalCode]
    .filter(Boolean).join(", ");

  const content = `
  <!-- Hero message -->
  <tr>
    <td style="background:${CARD};padding:36px 32px 24px;text-align:center;">
      <div style="display:inline-block;background:${GOLD_BG};border:1px solid ${GOLD};border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:16px;">✓</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:bold;color:${INK};font-family:Georgia,serif;">
        Thank you, ${firstName}!
      </h1>
      <p style="margin:0;font-size:14px;color:${MUTED};">
        Your order has been placed and is being prepared with care.
      </p>
    </td>
  </tr>

  <!-- Order number badge -->
  <tr>
    <td style="background:${GOLD_BG};padding:14px 32px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Order Number</span><br/>
            <span style="font-size:18px;font-weight:bold;color:${INK};">${d.orderNumber}</span>
          </td>
          <td align="right">
            <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Date</span><br/>
            <span style="font-size:13px;color:${INK};">${d.orderDate}</span>
          </td>
          <td align="right" style="padding-left:24px;">
            <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Payment</span><br/>
            <span style="font-size:13px;color:${INK};">${d.paymentMethod}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Order items -->
  <tr>
    <td style="background:${CARD};padding:28px 32px;">
      <h2 style="margin:0 0 16px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">Order Items</h2>
      ${itemsTable(d.items)}

      <!-- Totals -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr>
          <td></td>
          <td width="280">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${GOLD_BG};border:1px solid ${BORDER};border-radius:6px;padding:0;">
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:${MUTED};">Subtotal</td>
                <td style="padding:10px 16px;font-size:13px;text-align:right;color:${INK};">${pkr(d.subtotal)}</td>
              </tr>
              <tr style="border-top:1px solid ${BORDER};">
                <td style="padding:10px 16px;font-size:13px;color:${MUTED};">Shipping</td>
                <td style="padding:10px 16px;font-size:13px;text-align:right;color:${INK};">${d.shipping === 0 ? "Free" : pkr(d.shipping)}</td>
              </tr>
              <tr style="border-top:2px solid ${GOLD};background:${INK};">
                <td style="padding:12px 16px;font-size:14px;font-weight:bold;color:${GOLD};text-transform:uppercase;letter-spacing:0.1em;border-radius:0 0 0 5px;">Total</td>
                <td style="padding:12px 16px;font-size:16px;font-weight:bold;text-align:right;color:#ffffff;border-radius:0 0 5px 0;">${pkr(d.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Delivery address -->
  <tr>
    <td style="background:${GOLD_BG};padding:24px 32px;border-top:1px solid ${BORDER};">
      <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">Delivery Address</h2>
      <p style="margin:0;font-weight:bold;font-size:14px;color:${INK};">${d.customerName}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED};line-height:1.6;">${addrStr}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED};">Phone: ${d.customerPhone}</p>
    </td>
  </tr>

  <!-- CTA buttons -->
  <tr>
    <td style="background:${CARD};padding:28px 32px;text-align:center;border-top:1px solid ${BORDER};">
      <a href="${SITE}/order/${d.orderNumber}"
         style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:13px 28px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:bold;border-radius:3px;margin:0 6px 8px;">
        Track My Order
      </a>
      <a href="${SITE}/shop"
         style="display:inline-block;background:transparent;color:${INK};text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:bold;border:1px solid ${BORDER};border-radius:3px;margin:0 6px 8px;">
        Continue Shopping
      </a>
      <p style="margin:20px 0 0;font-size:12px;color:${MUTED};">
        Have a question?&nbsp;
        <a href="https://wa.me/923120295812" style="color:${GOLD};text-decoration:none;font-weight:bold;">WhatsApp us</a>
        &nbsp;·&nbsp;
        <a href="mailto:support@habibaminhas.com" style="color:${GOLD};text-decoration:none;">support@habibaminhas.com</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@habibaminhas.com" style="color:${GOLD};text-decoration:none;">info@habibaminhas.com</a>
      </p>
    </td>
  </tr>`;

  return base(content, `Order confirmed: ${d.orderNumber} — We're getting your pieces ready.`);
}

// ─── Admin New Order Notification ────────────────────────────────────────────
export function buildAdminEmail(d: OrderEmailData): string {
  const addr = d.address;
  const addrStr = [addr.street, addr.apartment, addr.city, addr.province, addr.postalCode]
    .filter(Boolean).join(", ");

  const content = `
  <!-- Alert header -->
  <tr>
    <td style="background:${GOLD};padding:20px 32px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${INK};font-weight:bold;">🛍 New Order Received</p>
    </td>
  </tr>

  <!-- Order meta -->
  <tr>
    <td style="background:${CARD};padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px;">
            <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Order Number</span><br/>
            <span style="font-size:20px;font-weight:bold;color:${INK};">${d.orderNumber}</span>
          </td>
          <td align="right" style="padding-bottom:12px;">
            <a href="${SITE}/admin/orders"
               style="display:inline-block;background:${GOLD};color:#ffffff;text-decoration:none;padding:10px 20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:bold;border-radius:3px;">
              View in Admin →
            </a>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:${GOLD_BG};border:1px solid ${BORDER};border-radius:6px;margin-bottom:24px;">
        ${[
          ["Date",           d.orderDate],
          ["Customer",       d.customerName],
          ["Email",          d.customerEmail],
          ["Phone",          d.customerPhone],
          ["Address",        addrStr],
          ["Payment",        d.paymentMethod],
          ["Total",          pkr(d.total)],
        ].map(([lbl, val], i) => `
        <tr style="${i > 0 ? `border-top:1px solid ${BORDER};` : ""}">
          <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;width:120px;">${lbl}</td>
          <td style="padding:10px 16px;font-size:13px;color:${INK};font-weight:${lbl === "Total" ? "bold" : "normal"};">${val}</td>
        </tr>`).join("")}
      </table>

      <h2 style="margin:0 0 16px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">Order Items</h2>
      ${itemsTable(d.items)}

      <!-- Totals summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr>
          <td></td>
          <td width="260">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${GOLD_BG};border:1px solid ${BORDER};border-radius:6px;">
              <tr>
                <td style="padding:8px 14px;font-size:12px;color:${MUTED};">Subtotal</td>
                <td style="padding:8px 14px;font-size:12px;text-align:right;">${pkr(d.subtotal)}</td>
              </tr>
              <tr style="border-top:1px solid ${BORDER};">
                <td style="padding:8px 14px;font-size:12px;color:${MUTED};">Shipping</td>
                <td style="padding:8px 14px;font-size:12px;text-align:right;">${d.shipping === 0 ? "Free" : pkr(d.shipping)}</td>
              </tr>
              <tr style="border-top:2px solid ${GOLD};background:${INK};">
                <td style="padding:10px 14px;font-size:13px;font-weight:bold;color:${GOLD};border-radius:0 0 0 5px;">Total</td>
                <td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right;color:#fff;border-radius:0 0 5px 0;">${pkr(d.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return base(content, `New order ${d.orderNumber} — ${d.customerName} — ${pkr(d.total)}`);
}
