import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Habiba Minhas. Order queries, return requests, or general inquiries — we respond within 24 hours.",
  alternates: {
    canonical: "/contact/",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
