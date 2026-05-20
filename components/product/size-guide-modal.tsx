"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export function SizeGuideModal({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto bg-ivory" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-lg hover:bg-ivory"
          aria-label="Close size guide"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-auto w-full">
          <Image
            src={imageUrl}
            alt="Size Guide"
            width={1200}
            height={800}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
