import { Inter } from "next/font/google";
import { AdminQueryProvider } from "@/components/admin/query-provider";
import { RealtimeSync } from "@/components/admin/realtime-sync";
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
      <AdminQueryProvider>
        <RealtimeSync />
        {children}
      </AdminQueryProvider>
    </div>
  );
}
