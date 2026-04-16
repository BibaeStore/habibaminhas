import { cn } from "@/lib/utils";

type Variant = "default" | "sale" | "new" | "gold" | "outline";

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    default: "bg-ink text-ivory",
    sale: "bg-sale text-ivory",
    new: "bg-ivory text-ink border border-ink/15",
    gold: "bg-gold text-ivory",
    outline: "border border-ink/20 text-ink-soft bg-ivory/60 backdrop-blur-sm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.22em]",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
