import { Suspense } from "react";
import { TrackForm } from "./track-form";

export const metadata = {
  title: "Track Your Order — Habiba Minhas",
  description: "Enter your order number and phone number to check your order status.",
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
