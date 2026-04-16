import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-11 w-full bg-transparent border-b border-ink/25 px-0 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
