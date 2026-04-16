import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-ivory hover:bg-gold-dark",
        gold: "bg-gold text-ink hover:bg-gold-dark hover:text-ivory",
        outline:
          "border border-ink text-ink hover:bg-ink hover:text-ivory",
        ghost: "text-ink hover:text-gold-dark",
        soft: "bg-cream text-ink hover:bg-parchment",
      },
      size: {
        sm: "h-9 px-4 text-[11px] uppercase tracking-[0.22em]",
        md: "h-11 px-6 text-[12px] uppercase tracking-[0.24em]",
        lg: "h-14 px-9 text-[13px] uppercase tracking-[0.28em]",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "square" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size, shape }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { button as buttonStyles };
