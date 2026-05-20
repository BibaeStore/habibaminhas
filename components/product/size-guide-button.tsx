"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { SizeGuideModal } from "./size-guide-modal";

export function SizeGuideButton({ sizeGuideUrl }: { sizeGuideUrl: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sizeGuideUrl) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-gold-dark hover:text-gold-dark-dark"
      >
        <Ruler className="h-3 w-3" /> Size guide
      </button>
      <SizeGuideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageUrl={sizeGuideUrl}
      />
    </>
  );
}
