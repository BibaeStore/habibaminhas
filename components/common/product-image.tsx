"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string | null | undefined;
  alt: string;
  palette?: string[];
  sizes?: string;
  className?: string;
}

export function ProductImage({ src, alt, palette = ["#f0ece4", "#c0b89a"], sizes = "56px", className = "" }: Props) {
  const [errored, setErrored] = useState(false);

  if (src && !errored) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover object-top ${className}`}
        onError={() => setErrored(true)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`h-full w-full ${className}`}
      style={{ background: `linear-gradient(160deg, ${palette[0] ?? "#f0ece4"} 0%, ${palette[1] ?? "#c0b89a"} 100%)` }}
    />
  );
}
