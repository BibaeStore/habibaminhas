import { AdminButton } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      {description && (
        <p className="max-w-md text-[15px] text-[var(--admin-text-soft)]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AdminButton variant="primary" onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}
