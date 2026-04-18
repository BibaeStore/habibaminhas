import { forwardRef } from "react";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  as?: "div" | "section" | "article";
}

export const AdminCard = forwardRef<HTMLDivElement, AdminCardProps>(
  function AdminCard(
    { padded = true, as: Tag = "div", className = "", children, ...rest },
    ref,
  ) {
    return (
      <Tag
        ref={ref as never}
        className={`bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] ${
          padded ? "p-6" : ""
        } ${className}`}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
