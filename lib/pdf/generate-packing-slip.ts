/**
 * ✅ PHASE 3: Packing Slip PDF Generation
 * Generates packing slip for warehouse (NO PRICES, only quantities and items)
 * Using pdf-lib for better Next.js compatibility
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Tables } from "@/lib/supabase/types";
import { readFile } from "fs/promises";
import { join } from "path";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

interface PackingSlipData {
  order: Order;
  logoPath?: string;
}

export async function generatePackingSlipPDF(data: PackingSlipData): Promise<Buffer> {
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

    // Logo already contains "HABIBA MINHAS" text - only show subtitle
    page.drawText("Warehouse - Fulfillment Copy", {
      x: 50,
      y,
      size: 10,
      font: regularFont,
      color: gray,
    });

    y -= 30;
  } else {
    // Fallback to text if logo not available
    page.drawText("PACKING SLIP", {
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

    page.drawText("Warehouse - Fulfillment Copy", {
      x: 50,
      y,
      size: 10,
      font: regularFont,
      color: gray,
    });

    y -= 40;
  }

  // ── Order details ───────────────────────────────────────────────────
  const leftCol = 50;
  const rightCol = 350;
  let detailY = y;

  // Left column
  page.drawText("Order Number:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.order_number, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  const orderDate = new Date(order.created_at).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText("Order Date:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(orderDate, { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  page.drawText("Courier:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.courier || "-", { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  detailY -= 15;

  page.drawText("Tracking #:", { x: leftCol, y: detailY, size: 10, font: boldFont, color: black });
  page.drawText(order.tracking_number || "-", { x: leftCol + 100, y: detailY, size: 10, font: regularFont, color: black });

  // Right column: Customer & Shipping info - FIXED: Proper spacing
  detailY = y;

  page.drawText("Ship To:", { x: rightCol, y: detailY, size: 10, font: boldFont, color: black });
  detailY -= 13;

  page.drawText(order.customer_name, { x: rightCol, y: detailY, size: 10, font: regularFont, color: black, maxWidth: 195 });

  const addr = typeof order.address === "object" && !Array.isArray(order.address)
    ? (order.address as Record<string, string>)
    : {} as Record<string, string>;

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

  // Contact info
  detailY -= 5;
  page.drawText(`Phone: ${order.customer_phone}`, { x: rightCol, y: detailY, size: 9, font: regularFont, color: gray, maxWidth: 195 });

  y -= 140; // Increased spacing to accommodate all address lines

  // ── Items table (NO PRICES) ─────────────────────────────────────────
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
  page.drawText("SKU", { x: 260, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Size", { x: 400, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Qty", { x: 460, y: tableTop + 5, size: 10, font: boldFont, color: black });
  page.drawText("Done", { x: 515, y: tableTop + 5, size: 9, font: boldFont, color: black }); // Changed from ✓ to "Done"

  // Table rows
  let rowY = tableTop - 27;

  (order.order_items || []).forEach((item, i) => {
    // Alternate row background
    if (i % 2 === 1) {
      page.drawRectangle({
        x: 50,
        y: rowY - 3,
        width: 495,
        height: 22,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    const title = item.product_title || "-";
    const truncatedTitle = title.length > 35 ? title.substring(0, 32) + "..." : title;

    // Truncate SKU if too long to prevent overlap
    const sku = item.sku || "-";
    const truncatedSku = sku.length > 18 ? sku.substring(0, 15) + "..." : sku;

    page.drawText(truncatedTitle, { x: 55, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(truncatedSku, { x: 260, y: rowY, size: 8, font: regularFont, color: black }); // Smaller font for SKU
    page.drawText(item.size || "-", { x: 400, y: rowY, size: 9, font: regularFont, color: black });
    page.drawText(item.quantity.toString(), { x: 460, y: rowY, size: 9, font: regularFont, color: black });

    // Checkbox
    page.drawRectangle({
      x: 520,
      y: rowY - 2,
      width: 10,
      height: 10,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    rowY -= 22;
  });

  // ── Summary ─────────────────────────────────────────────────────────
  rowY -= 20;
  const totalItems = (order.order_items || []).reduce((sum, item) => sum + item.quantity, 0);

  page.drawText(`Total Items: ${totalItems}`, { x: 50, y: rowY, size: 11, font: boldFont, color: black });
  page.drawText(`Total Pieces: ${totalItems}`, { x: 250, y: rowY, size: 11, font: boldFont, color: black });

  // ── Notes section ───────────────────────────────────────────────────
  rowY -= 35;
  page.drawText("Packing Notes:", { x: 50, y: rowY, size: 10, font: boldFont, color: black });
  rowY -= 18;

  if (order.admin_note) {
    page.drawText(order.admin_note, { x: 50, y: rowY, size: 9, font: regularFont, color: gray, maxWidth: 495 });
  } else {
    // Empty box for warehouse to write notes
    page.drawRectangle({
      x: 50,
      y: rowY - 60,
      width: 495,
      height: 60,
      borderColor: borderGray,
      borderWidth: 1,
    });
  }

  // ── Footer ──────────────────────────────────────────────────────────
  const footerY = 50;
  page.drawText("WARNING: Packing slip only - NOT a customer invoice", {
    x: width / 2 - 135,
    y: footerY,
    size: 8,
    font: regularFont,
    color: gray,
  });
  page.drawText("Verify all items before sealing package", {
    x: width / 2 - 90,
    y: footerY - 12,
    size: 8,
    font: regularFont,
    color: gray,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
