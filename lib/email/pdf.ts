import PDFDocument from "pdfkit";

export type InvoiceData = {
  orderNumber:    string;
  orderDate:      string;
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string;
  address: {
    street:     string;
    apartment?: string;
    city:       string;
    province:   string;
    postalCode?: string;
  };
  items: Array<{
    title:      string;
    size:       string | null;
    sku:        string | null;
    quantity:   number;
    unitPrice:  number;
    totalPrice: number;
  }>;
  subtotal:      number;
  shipping:      number;
  total:         number;
  paymentMethod: string;
  status:        string;
};

const GOLD   = "#9a7b38";
const INK    = "#1a1612";
const MUTED  = "#8a8179";
const BORDER = "#e8e2d8";
const BG     = "#f9f6f0";

function formatPKR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
    });

    const chunks: Buffer[] = [];
    doc.on("data",  (c) => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { width } = doc.page;
    const L = 55;
    const R = width - 55;

    // ── Header background ───────────────────────────────────────────
    doc.rect(0, 0, width, 110).fill(INK);

    // Brand name (logo placeholder — text-based)
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#ffffff")
      .text("HABIBA MINHAS", L, 30);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#c8a978")
      .text("Handcrafted with Love in Pakistan", L, 56);

    // Invoice label top-right
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#ffffff")
      .text("INVOICE", 0, 28, { align: "right", width: R })
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#c8a978")
      .text(`#${data.orderNumber}`, 0, 62, { align: "right", width: R });

    // ── Gold accent bar ─────────────────────────────────────────────
    doc.rect(0, 110, width, 4).fill(GOLD);

    let y = 130;

    // ── Order meta ──────────────────────────────────────────────────
    doc
      .font("Helvetica-Bold").fontSize(10).fillColor(GOLD)
      .text("ORDER DETAILS", L, y);
    y += 16;

    const metaData = [
      ["Order Number",   data.orderNumber],
      ["Order Date",     data.orderDate],
      ["Payment Method", data.paymentMethod],
      ["Status",         data.status.toUpperCase()],
    ];

    for (const [label, val] of metaData) {
      doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(label + ":", L, y, { continued: false });
      doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(val, L + 115, y - 9);
      y += 14;
    }

    // ── Two columns: Bill To + Ship To ─────────────────────────────
    y += 12;
    const colW = (R - L - 20) / 2;

    doc.rect(L, y, colW, 90).fill(BG).stroke(BORDER);
    doc.rect(L + colW + 20, y, colW, 90).fill(BG).stroke(BORDER);

    // Bill To
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD)
      .text("BILL TO", L + 10, y + 10);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK)
      .text(data.customerName, L + 10, y + 24, { width: colW - 20 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text(data.customerEmail, L + 10, y + 40, { width: colW - 20 })
      .text(data.customerPhone, L + 10, y + 54, { width: colW - 20 });

    // Ship To
    const shipX = L + colW + 30;
    const addr = data.address;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD)
      .text("SHIP TO", shipX, y + 10);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK)
      .text(data.customerName, shipX, y + 24, { width: colW - 20 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text(addr.street + (addr.apartment ? `, ${addr.apartment}` : ""), shipX, y + 40, { width: colW - 20 })
      .text(`${addr.city}, ${addr.province}${addr.postalCode ? " " + addr.postalCode : ""}`, shipX, y + 54, { width: colW - 20 });

    y += 110;

    // ── Items table header ──────────────────────────────────────────
    doc.rect(L, y, R - L, 22).fill(INK);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
    doc.text("ITEM DESCRIPTION",  L + 10, y + 7);
    doc.text("QTY",   R - 160, y + 7, { width: 40, align: "right" });
    doc.text("UNIT PRICE", R - 115, y + 7, { width: 55, align: "right" });
    doc.text("TOTAL",  R - 55, y + 7, { width: 55, align: "right" });
    y += 22;

    // Items rows
    let altRow = false;
    for (const item of data.items) {
      const rowH = item.size || item.sku ? 34 : 24;
      if (altRow) doc.rect(L, y, R - L, rowH).fill("#f3ede4").stroke(BORDER);
      else        doc.rect(L, y, R - L, rowH).fill("#ffffff").stroke(BORDER);
      altRow = !altRow;

      doc.font("Helvetica-Bold").fontSize(9).fillColor(INK)
        .text(item.title, L + 10, y + 6, { width: R - L - 180, ellipsis: true });
      if (item.size || item.sku) {
        const meta = [item.size && `Size: ${item.size}`, item.sku && `SKU: ${item.sku}`]
          .filter(Boolean).join("  ·  ");
        doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
          .text(meta, L + 10, y + 19, { width: R - L - 180 });
      }

      doc.font("Helvetica").fontSize(9).fillColor(INK);
      doc.text(String(item.quantity), R - 160, y + 7, { width: 40, align: "right" });
      doc.text(formatPKR(item.unitPrice),  R - 115, y + 7, { width: 55, align: "right" });
      doc.font("Helvetica-Bold")
        .text(formatPKR(item.totalPrice), R - 55, y + 7, { width: 55, align: "right" });

      y += rowH;
    }

    // ── Totals block ────────────────────────────────────────────────
    y += 10;
    const totW = 230;
    const totX = R - totW;

    const totals = [
      ["Subtotal",  formatPKR(data.subtotal)],
      ["Shipping",  data.shipping === 0 ? "Free" : formatPKR(data.shipping)],
    ];

    for (const [label, val] of totals) {
      doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(label, totX, y);
      doc.font("Helvetica").fontSize(9).fillColor(INK).text(val, totX, y, { width: totW, align: "right" });
      y += 16;
    }

    // Total line
    doc.moveTo(totX, y).lineTo(R, y).strokeColor(GOLD).lineWidth(1.5).stroke();
    y += 8;
    doc.rect(totX, y, totW, 28).fill(INK);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD)
      .text("TOTAL",  totX + 10, y + 8);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff")
      .text(formatPKR(data.total), totX, y + 8, { width: totW - 10, align: "right" });
    y += 40;

    // ── Footer ──────────────────────────────────────────────────────
    const footY = doc.page.height - 80;
    doc.rect(0, footY, width, 80).fill(INK);

    doc
      .font("Helvetica-Bold").fontSize(9).fillColor(GOLD)
      .text("HABIBA MINHAS", L, footY + 14);
    doc
      .font("Helvetica").fontSize(8).fillColor("#c8a978")
      .text("Handcrafted with Love in Pakistan", L, footY + 28)
      .text("info@habibaminhas.com  |  +92 312 0295812", L, footY + 42)
      .text("14-Day Easy Returns  ·  Cash on Delivery Available Nationwide", L, footY + 56);

    doc.font("Helvetica").fontSize(7.5).fillColor("#c8a978")
      .text("Thank you for your order!", 0, footY + 14, { width: R + 55, align: "right" });

    doc.end();
  });
}
