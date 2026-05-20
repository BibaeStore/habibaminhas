import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PlaceholderImage } from "@/components/common/placeholder-image";

export type EditorialLink = { label: string; href: string };
export type EditorialBlockProps = {
  eyebrow: string;
  title: string;
  body: string;
  links: EditorialLink[];
  tone: [string, string, string];
  motif?: "lattice" | "floral" | "ogee" | "stripes" | "arch";
  orientation?: "left" | "right";
  image?: string;
  imagePosition?: "left" | "center" | "right";
};

export function EditorialBlock({
  eyebrow,
  title,
  body,
  links,
  tone,
  motif = "floral",
  orientation = "left",
  image,
  imagePosition = "center",
}: EditorialBlockProps) {
  const reversed = orientation === "right";
  const desktopPositionClass = {
    left: "lg:object-left",
    center: "lg:object-center",
    right: "lg:object-right",
  }[imagePosition];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div
        className={`grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="lg:col-span-5">
          {image ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className={`object-cover object-right ${desktopPositionClass}`}
              />
            </div>
          ) : (
            <PlaceholderImage
              tone={tone}
              motif={motif}
              aspect="4/5"
              animate
              className="h-full"
            />
          )}
        </div>
        <div className="flex flex-col justify-center lg:col-span-7 lg:px-8">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-dark">
            {eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-light italic leading-[1.05] text-ink sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-soft">
            {body}
          </p>
          <ul className="mt-8 flex flex-col divide-y divide-border-soft border-y border-border-soft">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between py-4 text-[13px] uppercase tracking-[0.26em] text-ink"
                >
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-gold-dark transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
