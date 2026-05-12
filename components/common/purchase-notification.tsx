"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, ShoppingBag, MapPin, User, BadgeCheck } from "lucide-react";

/* ── Timing ─────────────────────────────────────────────────── */
const DISPLAY_MS     = 8_000;  // visible duration per card
const INTERVAL_MS    = 60_000; // 60 seconds between notifications
const FIRST_DELAY_MS = 8_000;  // wait before very first card

/* ── Types matching sold.json ───────────────────────────────── */
type SoldCustomer = {
  firstName: string;
  city:      string;
  province:  string;
  phone:     string;
  email:     string;
};

type SoldProduct = {
  title:    string;
  image:    string;
  price:    number;
  quantity: number;
};

type SoldReview = {
  rating:  number;
  comment: string;
};

type SoldEntry = {
  id:       number;
  customer: SoldCustomer;
  product:  SoldProduct;
  review:   SoldReview;
  status:   string;
  badge:    string;
};

/* ── Shuffle helper ─────────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PurchaseNotification() {
  const [items, setItems]     = useState<SoldEntry[]>([]);
  const [current, setCurrent] = useState<SoldEntry | null>(null);
  const [visible, setVisible] = useState(false);

  const indexRef   = useRef(0);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Fetch sold.json once on mount */
  useEffect(() => {
    fetch("/data/sold.json")
      .then((r) => r.json())
      .then((data: { notifications: SoldEntry[] }) => {
        setItems(shuffle(data.notifications));
      })
      .catch(() => {});
  }, []);

  const showNext = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[indexRef.current % prev.length];
      indexRef.current += 1;
      setCurrent(entry);
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), DISPLAY_MS);
      return prev;
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    firstTimer.current = setTimeout(showNext, FIRST_DELAY_MS);
    loopTimer.current  = setInterval(showNext, INTERVAL_MS);
    return () => {
      if (firstTimer.current) clearTimeout(firstTimer.current);
      if (loopTimer.current)  clearInterval(loopTimer.current);
      if (hideTimer.current)  clearTimeout(hideTimer.current);
    };
  }, [items, showNext]);

  const dismiss = () => {
    setVisible(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  if (!current) return null;

  const { customer, product, badge } = current;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed bottom-6 left-4 z-[60]
        w-[calc(100vw-2rem)] max-w-[384px]
        overflow-hidden
        border border-gold-dark/25
        bg-ivory
        shadow-[0_16px_56px_rgba(184,148,100,0.28),0_4px_16px_rgba(26,22,18,0.12)]
        transition-all duration-500 ease-[cubic-bezier(0.34,1.26,0.64,1)]
        ${visible ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"}
      `}
    >
      {/* Brand gradient bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#9a7b38] via-[#b89464] to-[#d4b87a]" />

      <div className="flex items-stretch">

        {/* Product image — fills full card height */}
        <div className="relative w-[88px] flex-none self-stretch overflow-hidden bg-parchment">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gold-light">
              <ShoppingBag className="h-6 w-6 text-gold-dark" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 min-w-0 flex-col gap-0 border-l border-gold-dark/15 px-4 py-3">

          {/* Header: live badge + dismiss */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold-dark" />
              <span className="text-[8px] font-bold uppercase tracking-[0.36em] text-gold-dark">
                {badge}
              </span>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="flex-none rounded-full p-0.5 text-muted transition-colors hover:bg-cream hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Product title */}
          <p className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-snug text-ink">
            {product.title}
          </p>

          {/* Customer details */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 shrink-0 text-gold-dark" />
              <span className="text-[11px] font-semibold text-ink">{customer.firstName}</span>
              <BadgeCheck className="h-3 w-3 text-sage" />
              <span className="text-[9px] uppercase tracking-[0.18em] text-sage">Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-gold-dark" />
              <span className="text-[11px] text-ink-soft">
                {customer.city}, {customer.province}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full overflow-hidden bg-border-soft">
        <div
          className={`h-full bg-gradient-to-r from-gold-dark to-gold transition-all ease-linear ${
            visible ? "w-0" : "w-full"
          }`}
          style={{ transitionDuration: visible ? `${DISPLAY_MS}ms` : "0ms" }}
        />
      </div>
    </div>
  );
}
