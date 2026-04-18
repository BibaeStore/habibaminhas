export type StatusTone = "neutral" | "primary" | "success" | "warning" | "danger";

const tones: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--admin-surface-alt)] text-[var(--admin-text-soft)] border-[var(--admin-border)]",
  primary:
    "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] border-[var(--admin-primary-soft)]",
  success:
    "bg-[var(--admin-success-soft)] text-[var(--admin-success)] border-[var(--admin-success-soft)]",
  warning:
    "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)] border-[var(--admin-warning-soft)]",
  danger:
    "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] border-[var(--admin-danger-soft)]",
};

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
