import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "View and manage your saved items. Save your favorite pieces from Habiba Minhas for later.",
  alternates: {
    canonical: "/wishlist/",
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
