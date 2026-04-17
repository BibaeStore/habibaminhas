// Auth protection is handled by middleware.ts
// This layout just ensures the admin HTML shell is isolated from the public site layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
