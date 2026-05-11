import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Review your shopping bag and proceed to checkout. Handcrafted fashion from Pakistan with flat Rs. 250 delivery.",
  alternates: {
    canonical: "/cart/",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
