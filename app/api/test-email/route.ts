import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await sendOrderEmails({
      orderNumber:   "ORD-2026-TEST",
      orderDate:     new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }),
      customerName:  "Dilawar Khan",
      customerEmail: "dilawarkhandeveloper@gmail.com",
      customerPhone: "+92 312 0295812",
      address: {
        street:     "House 14, Street 7, DHA Phase 6",
        apartment:  "Floor 2",
        city:       "Islamabad",
        province:   "Islamabad Capital Territory",
        postalCode: "44000",
      },
      items: [
        {
          title:      "Rosewood Elegance — 3-Piece Formal Suit",
          size:       "M",
          sku:        "LAD-RWE-001",
          quantity:   1,
          unitPrice:  6000,
          totalPrice: 6000,
        },
        {
          title:      "Sandstone Gingham — 5-Piece Crib Bedding Set",
          size:       null,
          sku:        "BBY-SGH-005",
          quantity:   2,
          unitPrice:  6900,
          totalPrice: 13800,
        },
      ],
      subtotal:      19800,
      shipping:      250,
      total:         20050,
      paymentMethod: "Cash on Delivery",
      status:        "pending",
    });

    return NextResponse.json({ success: true, message: "Test emails sent to dilawarkhandeveloper@gmail.com and bibaestore@gmail.com" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
