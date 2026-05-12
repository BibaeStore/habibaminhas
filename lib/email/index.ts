import { getTransporter } from "./mailer";
import { buildCustomerEmail, buildAdminEmail, type OrderEmailData } from "./templates";
import { generateInvoicePDF, type InvoiceData } from "./pdf";

export type { OrderEmailData };

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const from    = process.env.EMAIL_FROM  ?? "Habiba Minhas <bibaestore@gmail.com>";
  const adminTo = process.env.ADMIN_EMAIL ?? "bibaestore@gmail.com";

  let pdfBuffer: Buffer | null = null;
  try {
    const invoiceData: InvoiceData = {
      orderNumber:    data.orderNumber,
      orderDate:      data.orderDate,
      customerName:   data.customerName,
      customerEmail:  data.customerEmail,
      customerPhone:  data.customerPhone,
      address:        data.address,
      items:          data.items,
      subtotal:       data.subtotal,
      shipping:       data.shipping,
      total:          data.total,
      paymentMethod:  data.paymentMethod,
      status:         data.status,
    };
    pdfBuffer = await generateInvoicePDF(invoiceData);
  } catch (e) {
    console.error("[Email] PDF generation failed:", e);
  }

  const pdfAttachment = pdfBuffer
    ? [{ filename: `HabibaMinhas-Invoice-${data.orderNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
    : [];

  const transport = getTransporter();

  // ── Customer email ────────────────────────────────────────────────
  await transport.sendMail({
    from,
    to:          data.customerEmail,
    subject:     `✅ Order Confirmed — ${data.orderNumber} | Habiba Minhas`,
    html:        buildCustomerEmail(data),
    attachments: pdfAttachment,
  });

  // ── Admin notification ────────────────────────────────────────────
  await transport.sendMail({
    from,
    to:          adminTo,
    subject:     `🛍 New Order: ${data.orderNumber} — ${data.customerName} — Rs. ${data.total.toLocaleString("en-PK")}`,
    html:        buildAdminEmail(data),
    attachments: pdfAttachment,
  });
}
