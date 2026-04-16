import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-4xl md:text-[44px]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[15px]",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
