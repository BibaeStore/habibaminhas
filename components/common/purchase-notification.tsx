"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, ShoppingBag, MapPin, Phone, User, Star, Zap, BadgeCheck } from "lucide-react";

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

  const { customer, product, review, status, badge } = current;

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

        {/* Product image */}
        <div
          className="relative w-[56px] flex-none self-stretch overflow-hidden bg-parchment"
          style={{ minHeight: 152 }}
        >
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
          {product.quantity > 1 && (
            <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-ivory">
              {product.quantity}
            </span>
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

          {/* Star rating + review quote */}
          <div className="mt-2 border-l-[2px] border-gold-dark/50 pl-2.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < review.rating
                      ? "fill-gold-dark text-gold-dark"
                      : "fill-border-soft text-border-soft"
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] font-semibold text-gold-dark">
                {review.rating}.0
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-[10px] italic leading-snug text-ink-soft">
              &ldquo;{review.comment}&rdquo;
            </p>
          </div>

          {/* Customer details — 3 rows with icons */}
          <div className="mt-2.5 flex flex-col gap-1">
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
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0 text-muted" />
              <span className="text-[10px] tracking-wide text-muted">{customer.phone}</span>
            </div>
          </div>

          {/* Status footer */}
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-gold-dark/15 pt-2">
            <Zap className="h-3 w-3 shrink-0 text-gold-dark" />
            <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-gold-dark">
              {status}
            </span>
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
