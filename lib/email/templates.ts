const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://habibaminhas.com";
const GOLD   = "#9a7b38";
const GOLD_LIGHT = "#e5cb94"; // Light gold for admin headers/buttons
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
  <!-- Sleek Alert Header with Light Gold -->
  <tr>
    <td style="background:${GOLD_LIGHT};padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:${INK};font-weight:bold;">🛍 New Order Received</p>
          </td>
          <td align="right">
            <a href="${SITE}/admin/orders"
               style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:12px 24px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:bold;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              View in Admin →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Order Number Banner -->
  <tr>
    <td style="background:${CARD};padding:28px 32px 20px;border-bottom:3px solid ${GOLD_LIGHT};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Order Number</p>
            <h1 style="margin:0;font-size:28px;font-weight:bold;color:${INK};font-family:Georgia,serif;">${d.orderNumber}</h1>
          </td>
          <td align="right">
            <div style="text-align:right;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Total Amount</p>
              <p style="margin:0;font-size:24px;font-weight:bold;color:${GOLD};">${pkr(d.total)}</p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Customer Details Card -->
  <tr>
    <td style="background:${BG};padding:24px 32px;">
      <div style="background:${CARD};border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <!-- Customer Name -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Customer</span>
              </td>
              <td>
                <span style="font-size:16px;color:${INK};font-weight:bold;">${d.customerName}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Email -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};background:${GOLD_BG};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Email</span>
              </td>
              <td>
                <a href="mailto:${d.customerEmail}" style="font-size:14px;color:${GOLD};text-decoration:none;font-weight:bold;">${d.customerEmail}</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Phone with WhatsApp -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Phone</span>
              </td>
              <td>
                <span style="font-size:14px;color:${INK};font-weight:bold;">${d.customerPhone}</span>
              </td>
              <td align="right">
                <a href="https://wa.me/${d.customerPhone.replace(/\D/g, "")}"
                   style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:8px 16px;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:bold;border-radius:4px;">
                  📱 WhatsApp
                </a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Address -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};background:${GOLD_BG};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140" style="vertical-align:top;">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Address</span>
              </td>
              <td>
                <span style="font-size:13px;color:${INK};line-height:1.6;">${addrStr}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Payment & Date -->
        <div style="padding:18px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Payment</span>
              </td>
              <td>
                <span style="font-size:14px;color:${INK};font-weight:bold;">${d.paymentMethod}</span>
              </td>
              <td align="right" width="200">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Date: </span>
                <span style="font-size:13px;color:${INK};">${d.orderDate}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </td>
  </tr>

  <!-- Order Items Section -->
  <tr>
    <td style="background:${BG};padding:0 32px 24px;">
      <h2 style="margin:0 0 16px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};font-weight:bold;">📦 Order Items</h2>
      ${itemsTable(d.items)}

      <!-- Totals Summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td></td>
          <td width="300">
            <div style="background:${CARD};border-radius:6px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:${GOLD_BG};">
                  <td style="padding:12px 18px;font-size:13px;color:${MUTED};">Subtotal</td>
                  <td style="padding:12px 18px;font-size:14px;text-align:right;font-weight:bold;color:${INK};">${pkr(d.subtotal)}</td>
                </tr>
                <tr style="border-top:1px solid ${BORDER};background:${GOLD_BG};">
                  <td style="padding:12px 18px;font-size:13px;color:${MUTED};">Shipping</td>
                  <td style="padding:12px 18px;font-size:14px;text-align:right;font-weight:bold;color:${INK};">${d.shipping === 0 ? "Free" : pkr(d.shipping)}</td>
                </tr>
                <tr style="border-top:3px solid ${GOLD_LIGHT};background:${INK};">
                  <td style="padding:16px 18px;font-size:14px;font-weight:bold;color:${GOLD_LIGHT};text-transform:uppercase;letter-spacing:0.12em;">Total</td>
                  <td style="padding:16px 18px;font-size:20px;font-weight:bold;text-align:right;color:#ffffff;">${pkr(d.total)}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Action Banner -->
  <tr>
    <td style="background:${GOLD_LIGHT};padding:20px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:${INK};font-weight:bold;">📋 Process This Order</p>
      <p style="margin:0;font-size:12px;color:${MUTED};">
        Verify payment • Prepare items • Arrange PostEx pickup • Update order status
      </p>
    </td>
  </tr>`;

  return base(content, `New order ${d.orderNumber} — ${d.customerName} — ${pkr(d.total)}`);
}

// ─── Contact Form Emails ──────────────────────────────────────────────────────
export type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string; // ISO date string
};

export function buildContactClientEmail(d: ContactFormData): string {
  const firstName = d.name.split(" ")[0];

  const content = `
  <!-- Hero message -->
  <tr>
    <td style="background:${CARD};padding:36px 32px 24px;text-align:center;">
      <div style="display:inline-block;background:${GOLD_BG};border:1px solid ${GOLD};border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:16px;">✓</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:bold;color:${INK};font-family:Georgia,serif;">
        Thank you for contacting us, ${firstName}!
      </h1>
      <p style="margin:0;font-size:14px;color:${MUTED};">
        We have received your query and our team will contact you within 24 hours.
      </p>
    </td>
  </tr>

  <!-- Message details -->
  <tr>
    <td style="background:${GOLD_BG};padding:24px 32px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">Your Message Details</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:6px;">
        <tr>
          <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;width:110px;">Subject</td>
          <td style="padding:12px 16px;font-size:13px;color:${INK};font-weight:bold;">${d.subject}</td>
        </tr>
        <tr style="border-top:1px solid ${BORDER};">
          <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">Date</td>
          <td style="padding:12px 16px;font-size:13px;color:${INK};">${new Date(d.submittedAt).toLocaleString("en-PK", { dateStyle: "long", timeStyle: "short" })}</td>
        </tr>
        <tr style="border-top:1px solid ${BORDER};">
          <td style="padding:12px 16px;font-size:12px;font-weight:bold;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Message</td>
          <td style="padding:12px 16px;font-size:13px;color:${INK};line-height:1.6;">${d.message.replace(/\n/g, "<br/>")}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- What happens next -->
  <tr>
    <td style="background:${CARD};padding:28px 32px;border-top:1px solid ${BORDER};">
      <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">What Happens Next?</h2>
      <p style="margin:0 0 12px;font-size:13px;color:${INK};line-height:1.7;">
        Our customer service team is reviewing your message and will respond to you at <strong>${d.email}</strong> within 24 hours during business hours (Monday-Saturday, 10:00 AM - 6:00 PM PKT).
      </p>
      <p style="margin:0;font-size:13px;color:${INK};line-height:1.7;">
        For urgent matters, you can reach us directly on WhatsApp at <a href="https://wa.me/923120295812" style="color:${GOLD};text-decoration:none;font-weight:bold;">+92 312 0295812</a> for faster assistance.
      </p>
    </td>
  </tr>

  <!-- Footer info -->
  <tr>
    <td style="background:${GOLD_BG};padding:24px 32px;text-align:center;border-top:1px solid ${BORDER};">
      <p style="margin:0 0 16px;font-size:14px;color:${INK};font-weight:bold;">
        In the meantime, explore our collections
      </p>
      <div style="text-align:center;margin-bottom:20px;">
        <a href="${SITE}/shop" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:13px 28px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:bold;border-radius:3px;margin:0 6px 8px;">
          Browse Collections
        </a>
        <a href="${SITE}/track" style="display:inline-block;background:transparent;color:${INK};text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:bold;border:1px solid ${BORDER};border-radius:3px;margin:0 6px 8px;">
          Track Your Order
        </a>
      </div>
      <p style="margin:0;font-size:11px;color:${MUTED};line-height:1.7;">
        <strong style="color:${INK};">Email:</strong> <a href="mailto:info@habibaminhas.com" style="color:${GOLD};text-decoration:none;">info@habibaminhas.com</a>
        &nbsp;·&nbsp;
        <strong style="color:${INK};">WhatsApp:</strong> <a href="https://wa.me/923120295812" style="color:${GOLD};text-decoration:none;">+92 312 0295812</a>
        <br/>
        <strong style="color:${INK};">Website:</strong> <a href="${SITE}" style="color:${GOLD};text-decoration:none;">habibaminhas.com</a>
        &nbsp;·&nbsp;
        <strong style="color:${INK};">Location:</strong> Karachi, Pakistan
      </p>
    </td>
  </tr>`;

  return base(content, `We received your message — Our team will respond within 24 hours`);
}

export function buildContactAdminEmail(d: ContactFormData): string {
  const submittedDate = new Date(d.submittedAt);
  const dateStr = submittedDate.toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Asia/Karachi"
  });

  const content = `
  <!-- Sleek Alert Header with Light Gold -->
  <tr>
    <td style="background:${GOLD_LIGHT};padding:24px 32px;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:${INK};font-weight:bold;">💬 New Contact Form Submission</p>
          </td>
          <td align="right">
            <a href="mailto:${d.email}"
               style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:12px 24px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:bold;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              Reply to Customer →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Subject Banner -->
  <tr>
    <td style="background:${CARD};padding:28px 32px 20px;border-bottom:3px solid ${GOLD_LIGHT};">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">Subject</p>
      <h1 style="margin:0;font-size:24px;font-weight:bold;color:${INK};font-family:Georgia,serif;line-height:1.3;">${d.subject}</h1>
    </td>
  </tr>

  <!-- Customer Details Card -->
  <tr>
    <td style="background:${BG};padding:24px 32px;">
      <div style="background:${CARD};border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <!-- Customer Name Row -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Customer</span>
              </td>
              <td>
                <span style="font-size:16px;color:${INK};font-weight:bold;">${d.name}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Email Row -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};background:${GOLD_BG};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Email</span>
              </td>
              <td>
                <a href="mailto:${d.email}" style="font-size:14px;color:${GOLD};text-decoration:none;font-weight:bold;">${d.email}</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Phone Row with WhatsApp Button -->
        <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Phone</span>
              </td>
              <td>
                <span style="font-size:14px;color:${INK};font-weight:bold;">${d.phone}</span>
              </td>
              <td align="right">
                <a href="https://wa.me/${d.phone.replace(/\D/g, "")}"
                   style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:8px 16px;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:bold;border-radius:4px;">
                  📱 WhatsApp
                </a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Date/Time Row -->
        <div style="padding:18px 24px;background:${GOLD_BG};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="140">
                <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};font-weight:bold;">Submitted</span>
              </td>
              <td>
                <span style="font-size:13px;color:${INK};">${dateStr}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </td>
  </tr>

  <!-- Message Content -->
  <tr>
    <td style="background:${BG};padding:0 32px 24px;">
      <div style="background:${CARD};border-radius:8px;padding:28px;border-left:4px solid ${GOLD_LIGHT};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="margin:0 0 16px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};font-weight:bold;">
          📝 Customer Message
        </h2>
        <div style="font-size:15px;color:${INK};line-height:1.8;white-space:pre-wrap;font-family:Georgia,serif;">
${d.message}
        </div>
      </div>
    </td>
  </tr>

  <!-- Action Reminder Banner -->
  <tr>
    <td style="background:${GOLD_LIGHT};padding:20px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:${INK};font-weight:bold;">⏱️ Response Expected Within 24 Hours</p>
      <p style="margin:0;font-size:12px;color:${MUTED};">
        Reply via <a href="mailto:${d.email}" style="color:${INK};text-decoration:underline;font-weight:bold;">${d.email}</a>
        or <a href="https://wa.me/${d.phone.replace(/\D/g, "")}" style="color:${INK};text-decoration:underline;font-weight:bold;">WhatsApp</a>
      </p>
    </td>
  </tr>`;

  return base(content, `New contact: ${d.name} — ${d.subject}`);
}
