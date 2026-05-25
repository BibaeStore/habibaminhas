import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import { join } from "path";

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

// Brand colors
const GOLD   = rgb(0.60, 0.48, 0.22);  // #9a7b38
const INK    = rgb(0.10, 0.09, 0.07);  // #1a1612
const MUTED  = rgb(0.54, 0.51, 0.47);  // #8a8179
const WHITE  = rgb(1, 1, 1);
const GOLD_LIGHT = rgb(0.78, 0.66, 0.47); // #c8a978
const BG     = rgb(0.98, 0.96, 0.94);  // #f9f6f0

function formatPKR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load and embed logo
  let logoImage;
  try {
    const logoPath = join(process.cwd(), "public", "logo", "habiba-minhas-logo-t.png");
    const logoBytes = await readFile(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (error) {
    console.warn("Logo not found for email invoice, using text fallback");
  }

  const L = 55;
  const R = width - 55;

  // ── Header background ───────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 110, width, height: 110, color: INK });

  // Logo (if available) - bigger and more prominent
  if (logoImage) {
    const logoHeight = 50; // Increased from 35 to 50
    const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
    page.drawImage(logoImage, {
      x: L,
      y: height - 80,
      width: logoWidth,
      height: logoHeight,
    });

    // Logo already contains "HABIBA MINHAS" text - only show tagline
    page.drawText("Handcrafted with Love in Pakistan", {
      x: L,
      y: height - 95,
      size: 9,
      font: regularFont,
      color: GOLD_LIGHT,
    });
  } else {
    // Fallback if logo not available
    page.drawText("HABIBA MINHAS", {
      x: L,
      y: height - 60,
      size: 22,
      font: boldFont,
      color: WHITE,
    });

    page.drawText("Handcrafted with Love in Pakistan", {
      x: L,
      y: height - 84,
      size: 9,
      font: regularFont,
      color: GOLD_LIGHT,
    });
  }

  // Invoice label top-right
  page.drawText("INVOICE", {
    x: R - 120,
    y: height - 58,
    size: 28,
    font: boldFont,
    color: WHITE,
  });

  page.drawText(`#${data.orderNumber}`, {
    x: R - 120,
    y: height - 88,
    size: 9,
    font: regularFont,
    color: GOLD_LIGHT,
  });

  // ── Gold accent bar ─────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 114, width, height: 4, color: GOLD });

  let y = height - 130;

  // ── Order meta ──────────────────────────────────────────────────
  page.drawText("ORDER DETAILS", { x: L, y: y - 16, size: 10, font: boldFont, color: GOLD });
  y -= 32;

  const metaData = [
    ["Order Number",   data.orderNumber],
    ["Order Date",     data.orderDate],
    ["Payment Method", data.paymentMethod],
    ["Status",         data.status.toUpperCase()],
  ];

  for (const [label, val] of metaData) {
    page.drawText(label + ":", { x: L, y, size: 9, font: regularFont, color: MUTED });
    page.drawText(val, { x: L + 115, y, size: 9, font: boldFont, color: INK });
    y -= 14;
  }

  // ── Two columns: Bill To + Ship To ─────────────────────────────
  y -= 12;
  const colW = (R - L - 20) / 2;
  const boxHeight = 105; // Increased from 90 to 105 for proper spacing

  // Bill To box
  page.drawRectangle({
    x: L,
    y: y - boxHeight,
    width: colW,
    height: boxHeight,
    color: BG,
    borderColor: rgb(0.91, 0.89, 0.85),
    borderWidth: 1,
  });

  page.drawText("BILL TO", { x: L + 10, y: y - 18, size: 8, font: boldFont, color: GOLD });
  page.drawText(data.customerName, { x: L + 10, y: y - 32, size: 10, font: boldFont, color: INK, maxWidth: colW - 20 });
  page.drawText(data.customerEmail, { x: L + 10, y: y - 47, size: 8, font: regularFont, color: MUTED, maxWidth: colW - 20 });
  page.drawText(data.customerPhone, { x: L + 10, y: y - 60, size: 8, font: regularFont, color: MUTED, maxWidth: colW - 20 });

  // Ship To box
  const shipX = L + colW + 20;
  page.drawRectangle({
    x: shipX,
    y: y - boxHeight,
    width: colW,
    height: boxHeight,
    color: BG,
    borderColor: rgb(0.91, 0.89, 0.85),
    borderWidth: 1,
  });

  const addr = data.address;
  page.drawText("SHIP TO", { x: shipX + 10, y: y - 18, size: 8, font: boldFont, color: GOLD });
  page.drawText(data.customerName, { x: shipX + 10, y: y - 32, size: 10, font: boldFont, color: INK, maxWidth: colW - 20 });

  const streetText = addr.street + (addr.apartment ? `, ${addr.apartment}` : "");
  page.drawText(streetText, { x: shipX + 10, y: y - 47, size: 8, font: regularFont, color: MUTED, maxWidth: colW - 20 });

  const cityText = `${addr.city}, ${addr.province}${addr.postalCode ? " " + addr.postalCode : ""}`;
  page.drawText(cityText, { x: shipX + 10, y: y - 60, size: 8, font: regularFont, color: MUTED, maxWidth: colW - 20 });

  y -= 120; // Adjusted to match new box height

  // ── Items table header ──────────────────────────────────────────
  page.drawRectangle({ x: L, y: y - 22, width: R - L, height: 22, color: INK });

  page.drawText("ITEM DESCRIPTION", { x: L + 10, y: y - 15, size: 9, font: boldFont, color: WHITE });
  page.drawText("QTY", { x: R - 160, y: y - 15, size: 9, font: boldFont, color: WHITE });
  page.drawText("UNIT PRICE", { x: R - 115, y: y - 15, size: 9, font: boldFont, color: WHITE });
  page.drawText("TOTAL", { x: R - 55, y: y - 15, size: 9, font: boldFont, color: WHITE });

  y -= 22;

  // Items rows
  let altRow = false;
  for (const item of data.items) {
    const rowH = item.size || item.sku ? 34 : 24;

    const rowColor = altRow ? rgb(0.95, 0.93, 0.89) : WHITE;
    page.drawRectangle({
      x: L,
      y: y - rowH,
      width: R - L,
      height: rowH,
      color: rowColor,
      borderColor: rgb(0.91, 0.89, 0.85),
      borderWidth: 1,
    });
    altRow = !altRow;

    const title = item.title.length > 45 ? item.title.substring(0, 42) + "..." : item.title;
    page.drawText(title, { x: L + 10, y: y - 18, size: 9, font: boldFont, color: INK, maxWidth: R - L - 180 });

    if (item.size || item.sku) {
      const meta = [item.size && `Size: ${item.size}`, item.sku && `SKU: ${item.sku}`]
        .filter(Boolean).join("  ·  ");
      page.drawText(meta, { x: L + 10, y: y - 29, size: 7.5, font: regularFont, color: MUTED, maxWidth: R - L - 180 });
    }

    page.drawText(String(item.quantity), { x: R - 155, y: y - 17, size: 9, font: regularFont, color: INK });
    page.drawText(formatPKR(item.unitPrice), { x: R - 115, y: y - 17, size: 9, font: regularFont, color: INK });
    page.drawText(formatPKR(item.totalPrice), { x: R - 90, y: y - 17, size: 9, font: boldFont, color: INK });

    y -= rowH;
  }

  // ── Totals block ────────────────────────────────────────────────
  y -= 20; // Increased spacing before totals
  const totW = 230;
  const totX = R - totW;

  const totals = [
    ["Subtotal",  formatPKR(data.subtotal)],
    ["Shipping",  data.shipping === 0 ? "Free" : formatPKR(data.shipping)],
  ];

  for (const [label, val] of totals) {
    page.drawText(label, { x: totX, y, size: 9, font: regularFont, color: MUTED });
    page.drawText(val, { x: R - 60, y, size: 9, font: regularFont, color: INK });
    y -= 20; // Increased from 16 to 20 for better spacing
  }

  // Total line
  page.drawLine({
    start: { x: totX, y: y + 10 },
    end: { x: R, y: y + 10 },
    color: GOLD,
    thickness: 1.5,
  });

  y -= 10;
  page.drawRectangle({ x: totX, y: y - 28, width: totW, height: 28, color: INK });
  page.drawText("TOTAL", { x: totX + 10, y: y - 20, size: 11, font: boldFont, color: GOLD });
  page.drawText(formatPKR(data.total), { x: R - 60, y: y - 20, size: 11, font: boldFont, color: WHITE });

  // ── Footer ──────────────────────────────────────────────────────
  const footY = 80;
  page.drawRectangle({ x: 0, y: 0, width, height: footY, color: INK });

  page.drawText("HABIBA MINHAS", { x: L, y: footY - 26, size: 9, font: boldFont, color: GOLD });
  page.drawText("Handcrafted with Love in Pakistan", { x: L, y: footY - 42, size: 8, font: regularFont, color: GOLD_LIGHT });
  page.drawText("info@habibaminhas.com  |  +92 312 0295812", { x: L, y: footY - 58, size: 8, font: regularFont, color: GOLD_LIGHT });
  page.drawText("14-Day Easy Returns  |  Cash on Delivery Available Nationwide", { x: L, y: footY - 72, size: 8, font: regularFont, color: GOLD_LIGHT });

  page.drawText("Thank you for your order!", { x: R - 150, y: footY - 26, size: 7.5, font: regularFont, color: GOLD_LIGHT });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
