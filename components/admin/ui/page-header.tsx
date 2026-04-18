export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-text)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[var(--admin-text-soft)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
