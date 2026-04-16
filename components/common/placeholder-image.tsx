import { cn } from "@/lib/utils";

type Tone = readonly [string, string] | readonly [string, string, string];

type Props = {
  tone?: Tone;
  label?: string;
  motif?: "lattice" | "floral" | "ogee" | "stripes" | "arch" | "plain";
  aspect?: "3/4" | "4/5" | "1/1" | "16/9" | "21/9" | "2/3";
  rounded?: "none" | "sm" | "md" | "lg";
  overlay?: boolean;
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
};

const aspectMap: Record<NonNullable<Props["aspect"]>, string> = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
  "2/3": "aspect-[2/3]",
};

const roundedMap = { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export function PlaceholderImage({
  tone = ["#efe3d0", "#a8804b", "#2a1f17"],
  label,
  motif = "lattice",
  aspect = "3/4",
  rounded = "none",
  overlay = false,
  className,
  children,
  animate = false,
}: Props) {
  const [c1, c2, c3] = [tone[0], tone[1], tone[2] ?? tone[1]];
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-cream",
        aspectMap[aspect],
        roundedMap[rounded],
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          animate && "animate-slow-pan will-change-transform",
        )}
        style={{
          background: `radial-gradient(120% 80% at 20% 10%, ${c1} 0%, ${c2} 55%, ${c3} 100%)`,
        }}
      />
      <Motif kind={motif} ink={c3} />
      {overlay ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,22,18,0) 50%, rgba(26,22,18,0.45) 100%)",
          }}
        />
      ) : null}
      {label ? (
        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-ivory/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft backdrop-blur-sm">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: c3 }}
          />
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}

function Motif({ kind, ink }: { kind: NonNullable<Props["motif"]>; ink: string }) {
  if (kind === "plain") return null;
  if (kind === "lattice") {
    return (
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18] mix-blend-multiply"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="lattice" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12 L12 0 L24 12 L12 24 Z" fill="none" stroke={ink} strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1" fill={ink} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#lattice)" />
      </svg>
    );
  }
  if (kind === "floral") {
    return (
      <svg
        className="absolute inset-0 h-full w-full opacity-20 mix-blend-multiply"
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <g fill="none" stroke={ink} strokeWidth="0.6" strokeLinecap="round">
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(${30 + i * 28} ${40 + (i % 2) * 120})`}>
              <circle r="14" />
              <circle r="8" />
              <path d="M-14 0 L14 0 M0 -14 L0 14 M-10 -10 L10 10 M-10 10 L10 -10" />
            </g>
          ))}
        </g>
      </svg>
    );
  }
  if (kind === "ogee") {
    return (
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.15] mix-blend-multiply"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="ogee" width="40" height="56" patternUnits="userSpaceOnUse">
            <path
              d="M20 0 C40 14 40 42 20 56 C0 42 0 14 20 0 Z"
              fill="none"
              stroke={ink}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#ogee)" />
      </svg>
    );
  }
  if (kind === "stripes") {
    return (
      <div
        className="absolute inset-0 opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(12deg, transparent 0 14px, ${ink} 14px 15px)`,
        }}
      />
    );
  }
  if (kind === "arch") {
    return (
      <svg
        className="absolute inset-0 h-full w-full opacity-25 mix-blend-multiply"
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <path
          d="M20 280 L20 120 Q100 20 180 120 L180 280 Z"
          fill="none"
          stroke={ink}
          strokeWidth="0.8"
        />
        <path
          d="M40 280 L40 140 Q100 60 160 140 L160 280"
          fill="none"
          stroke={ink}
          strokeWidth="0.5"
        />
      </svg>
    );
  }
  return null;
}
