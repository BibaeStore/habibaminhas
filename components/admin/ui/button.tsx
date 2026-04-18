"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "outline" | "danger" | "ghost";
type Size = "md" | "sm";

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--admin-radius)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[15px]",
  sm: "h-9 px-3 text-sm",
};
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-hover)]",
  outline:
    "bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]",
  danger:
    "bg-[var(--admin-surface)] text-[var(--admin-danger)] border border-[var(--admin-border)] hover:bg-[var(--admin-danger-soft)] hover:border-[var(--admin-danger)]",
  ghost:
    "bg-transparent text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]",
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  function AdminButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      className = "",
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leadingIcon
        )}
        <span>{children}</span>
        {!loading && trailingIcon}
      </button>
    );
  },
);
