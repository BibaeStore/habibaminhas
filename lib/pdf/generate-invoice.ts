/**
 * ✅ PHASE 3: Professional Invoice PDF Generation
 * Generates invoice PDF with company logo and complete order details
 * Using pdf-lib for better Next.js compatibility
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Tables } from "@/lib/supabase/types";
import { readFile } from "fs/promises";
import { join } from "path";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

interface InvoiceData {
  order: Order;
  logoPath?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const { order } = data;

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load and embed logo
  let logoImage;
  try {
    const logoPath = join(process.cwd(), "public", "logo", "habiba-minhas-logo-t.png");
    const logoBytes = await readFile(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (error) {
    console.warn("Logo not found, using text fallback");
  }

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.95, 0.96, 0.97);
  const green = rgb(0.09, 0.64, 0.29);
  const borderGray = rgb(0.9, 0.91, 0.93);

  let y = height - 50;

  // ── Header with Logo ────────────────────────────────────────────────
  if (logoImage) {
    // Bigger logo for prominence
    const logoHeight = 60; // Increased from 40 to 60
    const logoWidth = (logoImage.width / logoImage.height) * logoHeight;

    page.drawImage(logoImage, {
      x: 50,
      y: y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    y -= logoHeight + 5;

    // Logo already contains "HABIBA MINHAS" text - only show tagline
    page.drawText("Premium Fashion & Apparel", {
      x: 50,
      y,
      size: 10,
      font: regularFont,
      color: gray,
    });

    y -= 30;
  } else {
    // Fallback to text if logo not available
    page.drawText("INVOICE", {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: black,
    });
    y -= 30;

    page.drawText("Habiba Minhas", {
      x: 50,
      y,
      size: 18,
      font: boldFont,
      color: black,
    });

    y -= 18;

    page.drawText("Premium Fashion & Apparel", {
      x: 50,
      y,
      size: 10,
      font: regularFont,
      color: gray,
    });

    y -= 40;
  }

  // ── Invoice details ─────────────────────────────────────────────────
  const leftCol = 50;
  const rightCol = 350;
  let detailY = y;

  // Left column: Invoice info
  page.drawText("Invoice Number:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.order_number, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText("Invoice Date:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(invoiceDate, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  page.drawText("Payment Method:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.payment_method, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  page.drawText("Payment Status:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.payment_status, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  // Right column: Customer info
  detailY = y;

  page.drawText("Bill To:", { x: rightCol, y: detailY, size: 10, font: boldFont, color: black });
  detailY -= 15;
  page.drawText(order.customer_name, { x: rightCol, y: detailY, size: 10, font: regularFont, color: black });
  detailY -= 13;
  page.drawText(order.customer_email, { x: rightCol, y: detailY, size: 10, font: regularFont, color: black });
  detailY -= 13;
  page.drawText(order.customer_phone, { x: rightCol, y: detailY, size: 10, font: regularFont, color: black });

  // Shipping address - FIXED: Proper spacing to prevent overlap
  const addr = typeof order.address === "object" && !Array.isArray(order.address)
    ? (order.address as Record<string, string>)
    : {} as Record<string, string>;

  if (addr.street) {
    detailY -= 18; // Extra space before Ship To section
    page.drawText("Ship To:", { x: rightCol, y: detailY, size: 10, font: boldFont, color: black });
    detailY -= 13;

    if (addr.street) {
      const streetText = addr.apartment ? `${addr.street}, ${addr.apartment}` : addr.street;
      page.drawText(streetText, { x: rightCol, y: detailY, size: 9, font: regularFont, color: black, maxWidth: 195 });
      detailY -= 11;
    }

    const cityLine = [addr.city, addr.province, addr.postalCode].filter(Boolean).join(", ");
    if (cityLine) {
      page.drawText(cityLine, { x: rightCol, y: detailY, size: 9, font: regularFont, color: black, maxWidth: 195 });
      detailY -= 11;
    }

    if (addr.country) {
      page.drawText(addr.country, { x: rightCol, y: detailY, size: 9, font: regularFont, color: black });
      detailY -= 11;
    }
  }

  y -= 140; // Increased spacing to accommodate all address lines

  // ── Items table ─────────────────────────────────────────────────────
  const tableTop = y;

  // Table header background
  page.drawRectangle({
    x: 50,
    y: tableTop - 5,
    width: 495,
    height: 25,
    color: lightGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Table headers
  page.drawText("Item", { x: 55, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Size", { x: 250, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Qty", { x: 320, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Price", { x: 380, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Total", { x: 480, y: tableTop + 5, size: 10, font: boldFont, color: black });

  // Table rows
  let rowY = tableTop - 25;

  (order.order_items || []).forEach((item, i) => {
    // Alternate row background
    if (i % 2 === 1) {
      page.drawRectangle({
        x: 50,
        y: rowY - 3,
        width: 495,
        height: 20,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    const title = item.product_title || "-";
    const truncated = title.length > 35 ? title.substring(0, 32) + "..." : title;

    page.drawText(truncated, { x: 55, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(item.size || "-", { x: 250, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(item.quantity.toString(), { x: 320, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(`Rs. ${item.unit_price.toLocaleString()}`, { x: 380, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(`Rs. ${item.total_price.toLocaleString()}`, { x: 480, y: rowY, size: 9, font: regularFont, color: black });

    rowY -= 20;
  });

  // ── Totals - FIXED: Proper spacing ─────────────────────────────────
  rowY -= 20; // Extra space before totals

  page.drawText("Subtotal:", { x: 380, y: rowY, size: 10, font: regularFont, color: black });
  page.drawText(`Rs. ${order.subtotal.toLocaleString()}`, { x: 480, y: rowY, size: 10, font: boldFont, color: black });

  rowY -= 20; // Proper spacing between lines

  page.drawText("Shipping:", { x: 380, y: rowY, size: 10, font: regularFont, color: black });
  page.drawText(`Rs. ${order.shipping.toLocaleString()}`, { x: 480, y: rowY, size: 10, font: boldFont, color: black });

  rowY -= 25; // Extra space before total

  // Total with highlight
  page.drawRectangle({
    x: 370,
    y: rowY - 3,
    width: 175,
    height: 25,
    color: lightGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("TOTAL:", { x: 380, y: rowY + 3, size: 12, font: boldFont, color: black });
  page.drawText(`Rs. ${order.total.toLocaleString()}`, { x: 480, y: rowY + 3, size: 12, font: boldFont, color: green });

  // ── Footer ──────────────────────────────────────────────────────────
  const footerY = 50;
  page.drawText("Thank you for your business!", {
    x: width / 2 - 70,
    y: footerY,
    size: 8,
    font: regularFont,
    color: gray,
  });
  page.drawText("For inquiries, contact: info@habibaminhas.com", {
    x: width / 2 - 100,
    y: footerY - 12,
    size: 8,
    font: regularFont,
    color: gray,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
