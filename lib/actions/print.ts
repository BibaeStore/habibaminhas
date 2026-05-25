"use server";

/**
 * ✅ PHASE 3: Bulk Printing Server Actions
 * Handles invoice and packing slip PDF generation
 * Using pdf-lib for all PDF operations
 */

import { createAdminClient } from "@/lib/supabase/server";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice";
import { generatePackingSlipPDF } from "@/lib/pdf/generate-packing-slip";
import { PDFDocument } from "pdf-lib";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

/**
 * Generate invoices for multiple orders
 * @param orderIds - Array of order IDs
 * @param merged - If true, returns single merged PDF. If false, returns array of PDFs
 */
export async function generateBulkInvoices(
  orderIds: string[],
  merged: boolean = true
): Promise<{ success: true; pdf?: string; pdfs?: { orderNumber: string; pdf: string }[] } | { success: false; error: string }> {
  try {
    const sb = createAdminClient();

    // Fetch all orders
    const { data: orders, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .in("id", orderIds)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    if (!orders || orders.length === 0) {
      return { success: false, error: "No orders found" };
    }

    // Generate individual PDFs
    const individualPdfs = await Promise.all(
      orders.map(async (order) => {
        const pdfBuffer = await generateInvoicePDF({ order: order as Order });
        return {
          orderNumber: order.order_number,
          buffer: pdfBuffer,
        };
      })
    );

    if (merged && individualPdfs.length > 1) {
      // Merge all PDFs into one
      const mergedPdf = await PDFDocument.create();

      for (const { buffer } of individualPdfs) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const base64 = Buffer.from(mergedBytes).toString("base64");

      return { success: true, pdf: base64 };
    } else {
      // Return separate PDFs
      const pdfs = individualPdfs.map(({ orderNumber, buffer }) => ({
        orderNumber,
        pdf: buffer.toString("base64"),
      }));

      return { success: true, pdfs };
    }
  } catch (error) {
    console.error("Error generating bulk invoices:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate packing slips for multiple orders
 * @param orderIds - Array of order IDs
 * @param merged - If true, returns single merged PDF. If false, returns array of PDFs
 */
export async function generateBulkPackingSlips(
  orderIds: string[],
  merged: boolean = true
): Promise<{ success: true; pdf?: string; pdfs?: { orderNumber: string; pdf: string }[] } | { success: false; error: string }> {
  try {
    const sb = createAdminClient();

    // Fetch all orders
    const { data: orders, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .in("id", orderIds)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    if (!orders || orders.length === 0) {
      return { success: false, error: "No orders found" };
    }

    // Generate individual PDFs
    const individualPdfs = await Promise.all(
      orders.map(async (order) => {
        const pdfBuffer = await generatePackingSlipPDF({ order: order as Order });
        return {
          orderNumber: order.order_number,
          buffer: pdfBuffer,
        };
      })
    );

    if (merged && individualPdfs.length > 1) {
      // Merge all PDFs into one
      const mergedPdf = await PDFDocument.create();

      for (const { buffer } of individualPdfs) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const base64 = Buffer.from(mergedBytes).toString("base64");

      return { success: true, pdf: base64 };
    } else {
      // Return separate PDFs
      const pdfs = individualPdfs.map(({ orderNumber, buffer }) => ({
        orderNumber,
        pdf: buffer.toString("base64"),
      }));

      return { success: true, pdfs };
    }
  } catch (error) {
    console.error("Error generating bulk packing slips:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate single invoice for an order
 */
export async function generateSingleInvoice(orderId: string): Promise<{ success: true; pdf: string } | { success: false; error: string }> {
  try {
    const sb = createAdminClient();

    const { data: order, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (error) throw new Error(error.message);
    if (!order) return { success: false, error: "Order not found" };

    const pdfBuffer = await generateInvoicePDF({ order: order as Order });

    return { success: true, pdf: pdfBuffer.toString("base64") };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate single packing slip for an order
 */
export async function generateSinglePackingSlip(orderId: string): Promise<{ success: true; pdf: string } | { success: false; error: string }> {
  try {
    const sb = createAdminClient();

    const { data: order, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (error) throw new Error(error.message);
    if (!order) return { success: false, error: "Order not found" };

    const pdfBuffer = await generatePackingSlipPDF({ order: order as Order });

    return { success: true, pdf: pdfBuffer.toString("base64") };
  } catch (error) {
    console.error("Error generating packing slip:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
