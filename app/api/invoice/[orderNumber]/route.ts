import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  console.log("=== INVOICE API ROUTE HIT ===");

  try {
    const { orderNumber } = await params;
    console.log("Order number:", orderNumber);

    // Test response - just return JSON first
    return NextResponse.json({
      message: "Invoice API route is working!",
      orderNumber,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
