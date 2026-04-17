"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, ShoppingBag, RefreshCw, MessageSquare, CheckCheck, Trash2, Package } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/actions/notifications";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  new_order:    { icon: ShoppingBag,   color: "text-gold-dark", bg: "bg-gold-dark/10",  label: "New Order"     },
  order_updated:{ icon: RefreshCw,     color: "text-blue-600",  bg: "bg-blue-50",       label: "Order Updated" },
  contact_form: { icon: MessageSquare, color: "text-sage",      bg: "bg-sage/10",       label: "Contact Form"  },
  low_stock:    { icon: Package,       color: "text-sale",      bg: "bg-sale/10",       label: "Low Stock"     },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

type FilterType = "all" | "new_order" | "order_updated" | "contact_form" | "unread";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    getNotifications(100)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all")    return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: "all",           label: "All"           },
    { key: "unread",        label: `Unread (${unreadCount})` },
    { key: "new_order",     label: "New Orders"    },
    { key: "order_updated", label: "Order Updates" },
    { key: "contact_form",  label: "Contact Forms" },
  ];

  return (
    <AdminShell title="Notifications">
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl italic">Notifications</h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex h-9 items-center gap-2 border border-border-soft bg-cream px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-ink hover:text-ivory transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isPending}
                className="flex h-9 items-center gap-2 bg-ink px-4 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-0">
          {filters.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`h-9 px-4 text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                f.key === filter
                  ? "bg-ink border-ink text-ivory"
                  : "border-border-soft text-ink-soft hover:bg-cream"
              } ${i > 0 ? "border-l-0" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="border border-border-soft bg-ivory">
          {loading ? (
            <div className="flex flex-col divide-y divide-border-soft">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="h-9 w-9 shrink-0 bg-cream animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-cream animate-pulse" />
                    <div className="h-3 w-2/3 bg-cream animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <Bell className="h-10 w-10 text-muted/40" />
              <p className="text-[13px] text-muted">No notifications here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-soft">
              {filtered.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.new_order;
                const Icon = cfg.icon;
                const orderNum = (n.data as { order_number?: string }).order_number;
                const contactId = (n.data as { contact_id?: string }).contact_id;

                return (
                  <li
                    key={n.id}
                    className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
                      n.read ? "bg-ivory" : "bg-gold-dark/5"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!n.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-gold-dark" />
                            )}
                            <span className="text-[13px] font-medium text-ink">{n.title}</span>
                            <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] ${cfg.color} border-current/30`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-ink-soft leading-relaxed line-clamp-2">{n.message}</p>
                          {orderNum && (
                            <Link
                              href={`/admin/orders`}
                              className="mt-1 inline-block text-[11px] text-gold-dark hover:text-ink uppercase tracking-[0.16em]"
                            >
                              View order {orderNum} →
                            </Link>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] text-muted whitespace-nowrap">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={() => handleRead(n.id)}
                          title="Mark as read"
                          className="flex h-7 w-7 items-center justify-center text-muted hover:text-ink transition-colors"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        title="Delete"
                        className="flex h-7 w-7 items-center justify-center text-muted hover:text-sale transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </AdminShell>
  );
}
