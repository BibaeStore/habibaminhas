import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/actions/orders";
import { generateInvoicePDF, type InvoiceData } from "@/lib/email/pdf";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Params = { orderNumber: string };

function parseAddress(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return { street: "", apartment: "", city: "", province: "", postalCode: "" };
  }
  const a = address as Record<string, string>;
  return {
    street: a.street ?? "",
    apartment: a.apartment,
    city: a.city ?? "",
    province: a.province ?? "",
    postalCode: a.postalCode,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { orderNumber } = await context.params;

    // Fetch order data
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const addr = parseAddress(order.address);
    const items = (order.order_items ?? []).map((item: any) => ({
      title: item.product_title,
      size: item.size,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    }));

    const orderDate = new Date(order.created_at).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderNumber: order.order_number,
      orderDate,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      address: addr,
      items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.payment_method,
      status: order.status,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HabibaMinhas-Invoice-${order.order_number}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
