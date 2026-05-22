import type { Metadata } from "next";

// SEO Focus Keyword: "contact Habiba Minhas Pakistan"
// Target: Customers looking to reach customer support in Pakistan
export const metadata: Metadata = {
  title: "Contact Us — Habiba Minhas Pakistan | Order Queries & Customer Support",
  description: "Contact Habiba Minhas Pakistan for order queries, returns & customer support in Karachi. WhatsApp +92 312 0295812, email & phone available. Response within 24 hours across Pakistan.",
  alternates: {
    canonical: "/contact/",
  },
  keywords: "contact Habiba Minhas Pakistan, Karachi fashion brand contact, Pakistani fashion customer support, WhatsApp Pakistan fashion, Habiba Minhas phone number",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
