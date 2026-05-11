import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Account",
  description: "View your order history, manage delivery addresses, and update your account settings at Habiba Minhas.",
  alternates: {
    canonical: "/account/",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
