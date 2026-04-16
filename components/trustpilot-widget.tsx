"use client";

import { useEffect, useRef } from "react";

export function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-initialize Trustpilot widget on client-side navigation
    if (typeof window !== "undefined" && (window as Window & { Trustpilot?: { loadFromElement: (el: HTMLElement) => void } }).Trustpilot && ref.current) {
      (window as Window & { Trustpilot?: { loadFromElement: (el: HTMLElement) => void } }).Trustpilot!.loadFromElement(ref.current);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-US"
      data-template-id="56278e9abfbbba0bdcd568bc"
      data-businessunit-id="69e07ba091aa504bd55af706"
      data-style-height="52px"
      data-style-width="100%"
      data-token="d1721e83-1838-4f18-be4f-3cd3b00293f8"
    >
      <a href="https://www.trustpilot.com/review/habibaminhas.com" target="_blank" rel="noopener">
        Trustpilot
      </a>
    </div>
  );
}
