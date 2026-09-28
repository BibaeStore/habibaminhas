"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Size chart pop-up. Renders nothing until opened, so it is never in the server HTML.
 *
 * Portalled to <body> and centred in the viewport: the button lives inside the product page's
 * sticky info panel, and a fixed overlay nested there can be clipped or offset. The chart is
 * scaled to fit inside the screen (height-limited on phones and laptops alike) so the whole
 * image is visible at once without scrolling or cropping.
 */
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
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/95 text-ink shadow-lg hover:bg-ivory"
          aria-label="Close size guide"
        >
          <X className="h-5 w-5" />
        </button>
        <Image
          src={imageUrl}
          alt="Habiba Minhas size guide — shirt and trouser measurements in inches for Small, Medium and Large"
          width={1024}
          height={1536}
          priority
          sizes="(max-width: 640px) 94vw, 640px"
          className="block h-auto max-h-[calc(100dvh-1.5rem)] w-auto max-w-[calc(100vw-1.5rem)] shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
        />
      </div>
    </div>,
    document.body,
  );
}
