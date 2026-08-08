"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, X, Volume2, VolumeX, BellRing } from "lucide-react";
import { getNewOrderAlertsSince } from "@/lib/actions/notifications";
import {
  NOTIFICATIONS_UNREAD_KEY,
  NOTIFICATIONS_LIST_KEY,
} from "@/lib/notifications-shared";

/*
 * New-order alert: sound + on-screen card + desktop notification.
 *
 * The owner runs the shop from this dashboard and has no phone app yet, so a new order
 * needs to physically get their attention — the same way WhatsApp Web does.
 *
 * How it works end to end:
 *
 *   order placed → `on_new_order` trigger on `orders` inserts a `new_order` notification
 *   → this component picks it up within POLL_MS → sound + card + desktop notification
 *
 * The trigger is what makes this reliable: an order physically cannot be created without a
 * notification row, so no order can slip through unannounced.
 *
 * Why polling and not Supabase Realtime: admin auth here is a custom JWT, not Supabase Auth,
 * so the browser client is the `anon` role. Realtime enforces RLS and the notifications
 * policies grant `authenticated` only, so a postgres_changes subscription would receive
 * nothing at all — silently. Granting `anon` read access would publish every order number,
 * customer name and total to anyone holding the public anon key. Polling a server action
 * keeps the data server-side and needs no auth or policy changes. See
 * getNewOrderAlertsSince().
 *
 * Deliberately self-contained. It does not use the admin ToastProvider (top-right, and only
 * mounted on some pages) so it cannot interfere with form feedback toasts, and it renders
 * its own fixed card at bottom-right.
 *
 * ── Browser constraints worth knowing ────────────────────────────────────────────────
 *
 * Autoplay: browsers refuse to play audio until the user has interacted with the page. We
 * "unlock" the audio element on the first click/keypress after load, which is the standard
 * workaround. Until then `soundReady` is false and the UI offers an Enable-sound button.
 *
 * Desktop notifications: require explicit permission, and reach the user when the tab is in
 * the background or behind another window — but only while the tab is still open. Alerts
 * with the browser fully closed need a Service Worker with Web Push, which is a separate
 * piece of work (and the same groundwork a future mobile app would use).
 */

const SOUND_SRC = "/sounds/new-order.wav";
const MUTE_KEY = "hm_admin_order_sound_muted";
/** Cursor persisted so a refresh does not replay alerts for orders already announced. */
const CURSOR_KEY = "hm_admin_last_order_alert_at";
const AUTO_HIDE_MS = 12_000;
const POLL_MS = 10_000;

type OrderAlert = {
  id: string;
  title: string;
  message: string;
  orderNumber: string | null;
  at: number;
};

export function NewOrderAlert() {
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [muted, setMuted] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const [canAskDesktop, setCanAskDesktop] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);

  /* ── Preferences + audio element ──────────────────────────────────── */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MUTE_KEY) === "1";
      setMuted(stored);
      mutedRef.current = stored;
    } catch {
      /* storage blocked — default to unmuted */
    }

    const audio = new Audio(SOUND_SRC);
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      setCanAskDesktop(true);
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /*
   * Unlock audio on the first real user gesture. Playing muted at zero volume satisfies the
   * browser's autoplay policy without the owner hearing anything, so the first genuine order
   * alert is audible rather than silently blocked.
   */
  useEffect(() => {
    if (soundReady) return;

    const unlock = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const previousVolume = audio.volume;
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = previousVolume;
          setSoundReady(true);
        })
        .catch(() => {
          audio.volume = previousVolume;
        });
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [soundReady]);

  const playSound = useCallback(() => {
    if (mutedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    // Rejects when the tab has never been interacted with. Nothing to do but stay silent —
    // the on-screen card and the desktop notification still fire.
    void audio.play().catch(() => {});
  }, []);

  const showDesktopNotification = useCallback((alert: OrderAlert) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      const n = new Notification("New order received", {
        body: alert.message,
        icon: "/favicon.ico",
        // Same tag ⇒ a burst of orders replaces rather than stacks into a wall of popups.
        tag: "hm-new-order",
        renotify: true,
      } as NotificationOptions);
      n.onclick = () => {
        window.focus();
        window.location.href = "/admin/orders";
        n.close();
      };
    } catch {
      /* some browsers throw when constructing Notification outside a service worker */
    }
  }, []);

  /* ── Poll for new orders ──────────────────────────────────────────── */
  useEffect(() => {
    /*
     * The cursor is the created_at of the newest order already announced. Persisting it
     * means a page refresh, or moving between admin pages, never replays an alert you have
     * already seen and heard.
     *
     * On a first-ever load it starts at "now", so opening the dashboard does not fire a
     * burst of alerts for historical orders.
     */
    let cursor: string;
    try {
      cursor = window.localStorage.getItem(CURSOR_KEY) ?? new Date().toISOString();
    } catch {
      cursor = new Date().toISOString();
    }

    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const rows = await getNewOrderAlertsSince(cursor);
        if (stopped || rows.length === 0) return;

        // Advance the cursor first, so a render error below cannot cause a repeat alert.
        cursor = rows[rows.length - 1].created_at;
        try {
          window.localStorage.setItem(CURSOR_KEY, cursor);
        } catch {
          /* storage blocked — cursor is per-session only */
        }

        const fresh: OrderAlert[] = rows.map((r) => ({
          id: r.id,
          title: r.title || "New order received",
          message: r.message || "A new order has been placed.",
          orderNumber:
            typeof r.data?.order_number === "string" ? (r.data.order_number as string) : null,
          at: Date.now(),
        }));

        setAlerts((prev) => [...fresh.reverse(), ...prev].slice(0, 3));

        // One sound for a batch, not one per order — several orders landing together should
        // not produce a burst of overlapping chimes.
        playSound();
        showDesktopNotification(fresh[0]);

        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_KEY });
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_KEY });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      } catch {
        /* transient network or deploy blip — the next tick retries */
      }
    };

    void poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [playSound, showDesktopNotification, queryClient]);

  /* Auto-dismiss each card on its own timer. */
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - AUTO_HIDE_MS;
      setAlerts((prev) => prev.filter((a) => a.at > cutoff));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [alerts.length]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* storage blocked — mute stays for this session only */
    }
    if (!next) playSound(); // preview when unmuting
  };

  const askDesktopPermission = async () => {
    if (typeof Notification === "undefined") return;
    try {
      await Notification.requestPermission();
    } finally {
      setCanAskDesktop(Notification.permission === "default");
    }
  };

  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {/* One-time setup prompt: only while something still needs enabling. */}
      {(canAskDesktop || !soundReady) && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 shadow-sm">
          <BellRing className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
          <span className="flex-1 text-[12px] leading-snug text-[var(--admin-text-soft)]">
            {canAskDesktop
              ? "Allow desktop alerts to be notified while on another tab."
              : "Click anywhere once to enable the order sound."}
          </span>
          {canAskDesktop && (
            <button
              onClick={askDesktopPermission}
              className="shrink-0 rounded-full bg-[var(--admin-primary)] px-3 py-1 text-[11px] font-semibold text-white"
            >
              Allow
            </button>
          )}
        </div>
      )}

      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className="pointer-events-auto flex items-start gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-primary)] bg-[var(--admin-surface)] p-3.5 shadow-lg"
          style={{ animation: "hm-alert-in 220ms ease-out" }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)]">
            <ShoppingBag className="h-4 w-4 text-[var(--admin-primary)]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--admin-text)]">
              {alert.title}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-[var(--admin-text-soft)]">
              {alert.message}
            </div>
            <Link
              href={alert.orderNumber ? `/admin/orders?q=${alert.orderNumber}` : "/admin/orders"}
              className="mt-1.5 inline-block text-[11px] font-semibold text-[var(--admin-primary)] hover:underline"
            >
              View order →
            </Link>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            <button
              onClick={() => dismiss(alert.id)}
              aria-label="Dismiss"
              className="text-[var(--admin-text-soft)] opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute order sound" : "Mute order sound"}
              title={muted ? "Sound is off" : "Sound is on"}
              className="text-[var(--admin-text-soft)] opacity-60 transition-opacity hover:opacity-100"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes hm-alert-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
