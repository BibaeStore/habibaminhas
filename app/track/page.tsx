import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackForm } from "./track-form";

// SEO Focus Keyword: "track order Pakistan"
// Target: Customers tracking shipments across Pakistan
export const metadata: Metadata = {
  title: "Track Your Order Pakistan — Habiba Minhas Order Tracking",
  description: "Track your Habiba Minhas order in Pakistan. Real-time shipping updates across Karachi, Lahore, Islamabad & nationwide. Enter your order number for instant tracking.",
  alternates: {
    canonical: "/track/",
  },
  keywords: "track order Pakistan, Pakistan order tracking, Habiba Minhas tracking, shipping status Pakistan, track parcel Pakistan, order status Karachi",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <Suspense fallback={null}>
      <TrackForm initialOrder={order ?? ""} />
    </Suspense>
  );
}
