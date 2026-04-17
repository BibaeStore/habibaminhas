"use client";

import Link from "next/link";

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/923120295812"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)]"
    >
      {/* WhatsApp SVG logo */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          d="M16 2C8.268 2 2 8.268 2 16c0 2.52.682 4.883 1.87 6.914L2 30l7.294-1.844A13.932 13.932 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z"
          fill="white"
        />
        <path
          d="M23.07 19.44c-.36-.18-2.124-1.048-2.453-1.167-.33-.12-.57-.18-.81.18-.24.36-.927 1.167-1.137 1.407-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.896-1.788-1.07-.954-1.793-2.132-2.003-2.492-.21-.36-.022-.554.158-.733.162-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.293-.7-.59-.605-.81-.616l-.69-.012a1.32 1.32 0 0 0-.96.45c-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.538 3.876 6.148 5.436.86.37 1.53.592 2.053.758.863.274 1.65.235 2.27.143.693-.102 2.133-.872 2.433-1.714.3-.843.3-1.565.21-1.714-.09-.15-.33-.24-.69-.42Z"
          fill="#25D366"
        />
      </svg>

      {/* Tooltip */}
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ivory opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
      </span>
    </Link>
  );
}
