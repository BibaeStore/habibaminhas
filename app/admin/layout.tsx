import { Inter } from "next/font/google";
import "./admin.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-root ${inter.className} min-h-screen`}>
      {children}
    </div>
  );
}
