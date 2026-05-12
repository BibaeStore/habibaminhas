"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, ShoppingBag, RefreshCw, MessageSquare, CheckCheck, Trash2, Package } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/actions/notifications";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  new_order:    { icon: ShoppingBag,   color: "text-[var(--admin-primary)]",    bg: "bg-[var(--admin-primary-soft)]",  label: "New Order"     },
  order_updated:{ icon: RefreshCw,     color: "text-blue-600",                  bg: "bg-blue-50",                      label: "Order Updated" },
  contact_form: { icon: MessageSquare, color: "text-[var(--admin-text-soft)]",  bg: "bg-[var(--admin-surface-alt)]",   label: "Contact Form"  },
  low_stock:    { icon: Package,       color: "text-amber-600",                 bg: "bg-amber-50",                     label: "Low Stock"     },
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

/* order_updated notifications are intentionally excluded — too noisy */
const IMPORTANT_TYPES = ["new_order", "low_stock", "contact_form"];

type FilterType = "all" | "new_order" | "low_stock" | "contact_form" | "unread";

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

  /* Always hide order_updated — only surface important notification types */
  const important = notifications.filter((n) => IMPORTANT_TYPES.includes(n.type));

  const filtered = important.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all")    return true;
    return n.type === filter;
  });

  const unreadCount = important.filter((n) => !n.read).length;

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
    { key: "all",          label: "All"                      },
    { key: "unread",       label: `Unread (${unreadCount})`  },
    { key: "new_order",    label: "New Orders"               },
    { key: "low_stock",    label: "Low Stock"                },
    { key: "contact_form", label: "Contact Forms"            },
  ];

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          actions={
            <div className="flex gap-2">
              <AdminButton
                variant="outline"
                leadingIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
                onClick={load}
                disabled={loading}
              >
                Refresh
              </AdminButton>
              {unreadCount > 0 && (
                <AdminButton
                  variant="primary"
                  leadingIcon={<CheckCheck className="h-4 w-4" />}
                  onClick={handleMarkAll}
                  disabled={isPending}
                >
                  Mark all read
                </AdminButton>
              )}
            </div>
          }
        />

        {/* Filter pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--admin-primary)] text-white"
                    : "bg-[var(--admin-surface)] text-[var(--admin-text-soft)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="mt-5">
          {loading ? (
            <AdminCard padded={false}>
              <ul className="divide-y divide-[var(--admin-border)]">
                {[...Array(5)].map((_, i) => (
                  <li key={i} className="flex items-start gap-4 px-5 py-4">
                    <div className="h-9 w-9 shrink-0 rounded bg-[var(--admin-surface-alt)] animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-[var(--admin-surface-alt)] animate-pulse" />
                      <div className="h-3 w-2/3 rounded bg-[var(--admin-surface-alt)] animate-pulse" />
                    </div>
                  </li>
                ))}
              </ul>
            </AdminCard>
          ) : filtered.length === 0 ? (
            <AdminCard>
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Bell className="h-10 w-10 text-[var(--admin-text-muted)]" />
                <p className="text-[13px] text-[var(--admin-text-muted)]">No notifications yet.</p>
              </div>
            </AdminCard>
          ) : (
            <AdminCard padded={false}>
              <ul>
                {filtered.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.new_order;
                  const Icon = cfg.icon;
                  const orderNum = (n.data as { order_number?: string }).order_number;

                  return (
                    <li
                      key={n.id}
                      className={`group flex items-start gap-4 px-5 py-4 border-b border-[var(--admin-border)] last:border-b-0 transition-colors ${
                        n.read ? "" : "bg-[var(--admin-primary-soft)]/30"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {!n.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                              )}
                              <span className="text-[13px] font-medium text-[var(--admin-text)]">{n.title}</span>
                              <span className="shrink-0 rounded border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--admin-text-muted)]">
                                {cfg.label}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[12px] text-[var(--admin-text-soft)] leading-relaxed line-clamp-2">{n.message}</p>
                            {orderNum && (
                              <Link
                                href={`/admin/orders`}
                                className="mt-1 inline-block text-[11px] text-[var(--admin-primary)] hover:text-[var(--admin-text)] font-medium"
                              >
                                View order {orderNum} →
                              </Link>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] text-[var(--admin-text-muted)] whitespace-nowrap">{timeAgo(n.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button
                            onClick={() => handleRead(n.id)}
                            title="Mark as read"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)] transition-colors"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          title="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded text-[var(--admin-text-muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </AdminCard>
          )}
        </div>

      </div>
    </AdminShell>
  );
}
