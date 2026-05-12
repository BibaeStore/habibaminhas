import { getTransporter } from "./mailer";
import { buildCustomerEmail, buildAdminEmail, type OrderEmailData } from "./templates";
import { generateInvoicePDF, type InvoiceData } from "./pdf";

export type { OrderEmailData };

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const from     = process.env.EMAIL_FROM     ?? "Habiba Minhas <no-reply@habibaminhas.com>";
  const replyTo  = process.env.EMAIL_REPLY_TO ?? "Habiba Minhas <info@habibaminhas.com>";
  const adminTo  = process.env.ADMIN_EMAIL    ?? "info@habibaminhas.com";
  const teamCC   = process.env.EMAIL_TEAM     ?? "";

  // Generate PDF invoice (non-blocking — email still sends without it if PDF fails)
  let pdfBuffer: Buffer | null = null;
  try {
    const invoiceData: InvoiceData = {
      orderNumber:   data.orderNumber,
      orderDate:     data.orderDate,
      customerName:  data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address:       data.address,
      items:         data.items,
      subtotal:      data.subtotal,
      shipping:      data.shipping,
      total:         data.total,
      paymentMethod: data.paymentMethod,
      status:        data.status,
    };
    pdfBuffer = await generateInvoicePDF(invoiceData);
  } catch (e) {
    console.error("[Email] PDF generation failed:", e);
  }

  const pdfAttachment = pdfBuffer
    ? [{
        filename:    `HabibaMinhas-Invoice-${data.orderNumber}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      }]
    : [];

  const transport = getTransporter();

  // ── 1. Customer order confirmation ────────────────────────────────
  await transport.sendMail({
    from,
    replyTo,
    to:          data.customerEmail,
    subject:     `✅ Order Confirmed — ${data.orderNumber} | Habiba Minhas`,
    html:        buildCustomerEmail(data),
    attachments: pdfAttachment,
  });

  // ── 2. Admin new-order notification (with optional team CC) ───────
  await transport.sendMail({
    from,
    replyTo,
    to:          adminTo,
    cc:          teamCC || undefined,
    subject:     `🛍 New Order: ${data.orderNumber} — ${data.customerName} — Rs. ${data.total.toLocaleString("en-PK")}`,
    html:        buildAdminEmail(data),
    attachments: pdfAttachment,
  });
}
