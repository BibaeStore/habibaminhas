# Admin White-Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the boutique-themed admin UI with an isolated, pure-white Inter-based theme, simplify the dashboard home to a Today-first layout, and standardize every inner page on the same clean pattern — without touching the public storefront.

**Architecture:** A new admin-only stylesheet (`app/admin/admin.css`) defines `--admin-*` CSS variables and is imported only from `app/admin/layout.tsx`. The layout wraps children in an `admin-root` div, loads Inter via `next/font/google`, and scopes all admin font/colour tokens to that subtree. Every admin page and component is rewritten to drop public tokens (`bg-ivory`, `font-display`, `italic`, `bg-ink`, etc.) and use the admin tokens instead. The dashboard is restructured into three sections: Today panel, action tiles, Needs-your-attention list. Inner pages share a uniform header + card + labelled-button pattern.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, lucide-react 1.x, `next/font/google` for Inter, Supabase (unchanged), existing server actions in `lib/actions/*` (unchanged).

**Testing note:** The project has **no test infrastructure** (no Vitest/Jest/Playwright). Per-task verification uses:
1. `npm run build` — Next.js build, which runs TypeScript + ESLint. Must pass.
2. `npm run dev` — visual check of the changed page at the listed URL. The executor (or the user) confirms the page renders, key interactions still work, and no public-site page regresses.
3. At the end of each task: commit with a scoped message.

Bootstrapping a test suite for a cosmetic redesign is out of scope and would dwarf the actual work.

**Spec reference:** `docs/superpowers/specs/2026-04-18-admin-white-theme-redesign.md`

---

## File Structure

**New files:**
- `app/admin/admin.css` — admin-only CSS variables, scoped utility classes, base element resets under `.admin-root`.
- `components/admin/ui/button.tsx` — `<AdminButton>` with `variant` (`primary` / `outline` / `danger`) and `size` (`md` / `sm`) props.
- `components/admin/ui/card.tsx` — `<AdminCard>` wrapper with consistent padding + border.
- `components/admin/ui/status-pill.tsx` — `<StatusPill>` for order/payment/stock statuses.
- `components/admin/ui/confirm-modal.tsx` — `<ConfirmModal>` for destructive actions.
- `components/admin/ui/toast.tsx` — lightweight toast provider + `useToast()` hook (simple context, no dependency).
- `components/admin/ui/empty-state.tsx` — `<EmptyState>` component.
- `components/admin/ui/page-header.tsx` — `<PageHeader>` with title, subtitle, actions slot.

**Modified files (rewrites):**
- `app/admin/layout.tsx` — load Inter, import `admin.css`, wrap in `admin-root` div.
- `components/admin/admin-shell.tsx` — restyle container.
- `components/admin/admin-sidebar.tsx` — full rewrite: white bg, grouped nav, labelled sign-out.
- `components/admin/admin-topbar.tsx` — full rewrite: white bg, Inter title, outline buttons.
- `app/admin/page.tsx` — full rewrite to Today + Tiles + Needs Attention.
- `app/admin/login/page.tsx` — full rewrite: centered white card layout.
- `app/admin/orders/page.tsx` — restyle list + detail panels.
- `app/admin/products/page.tsx` — restyle grid/list + modals.
- `app/admin/categories/page.tsx` — restyle list + modals.
- `app/admin/customers/page.tsx` — restyle table.
- `app/admin/analytics/page.tsx` — restyle cards + charts (blue accent only).
- `app/admin/marketing/page.tsx` — restyle.
- `app/admin/notifications/page.tsx` — restyle list + controls.
- `app/admin/settings/page.tsx` — restyle section nav + forms + save buttons.
- `app/admin/setup/page.tsx` — restyle wizard steps.

**Untouched:**
- `app/globals.css`, `app/layout.tsx` (public site layout), `components/layout/*` (public shell).
- All `lib/actions/*` server actions, `lib/supabase/*`, `middleware.ts`.
- Public storefront pages (`app/(shop)/*` or equivalent).

---

## Phase 1 — Foundation

### Task 1: Create admin stylesheet with tokens

**Files:**
- Create: `app/admin/admin.css`

- [ ] **Step 1: Write the admin stylesheet**

Content of `app/admin/admin.css`:

```css
/* Admin-only theme. Imported from app/admin/layout.tsx. */
/* All tokens are prefixed --admin-* to avoid collision with public site. */

.admin-root {
  --admin-bg: #ffffff;
  --admin-surface: #ffffff;
  --admin-surface-alt: #f7f8fa;
  --admin-border: #e5e7eb;
  --admin-text: #111827;
  --admin-text-soft: #4b5563;
  --admin-text-muted: #9ca3af;

  --admin-primary: #2563eb;
  --admin-primary-hover: #1d4ed8;
  --admin-primary-soft: #eff6ff;

  --admin-success: #16a34a;
  --admin-success-soft: #dcfce7;
  --admin-warning: #d97706;
  --admin-warning-soft: #fef3c7;
  --admin-danger: #dc2626;
  --admin-danger-soft: #fee2e2;

  --admin-radius: 8px;
  --admin-font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;

  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: var(--admin-font);
  font-feature-settings: "cv11";
  -webkit-font-smoothing: antialiased;
  font-style: normal;
}

/* Reset any inherited italic from the public layout. */
.admin-root,
.admin-root * {
  font-style: normal;
}

/* Consistent focus ring for interactive elements. */
.admin-root :is(button, a, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: 2px;
  border-radius: var(--admin-radius);
}
```

- [ ] **Step 2: Verify the file exists**

Run: `ls app/admin/admin.css`
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add app/admin/admin.css
git commit -m "feat(admin): add scoped admin stylesheet with design tokens"
```

---

### Task 2: Load Inter font + mount admin stylesheet in admin layout

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Replace `app/admin/layout.tsx` contents**

New contents:

```tsx
import { Inter } from "next/font/google";
import "./admin.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-root ${inter.className} min-h-screen`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds. If it fails with a Next.js font error, read `node_modules/next/dist/docs/` (per AGENTS.md) for the current `next/font/google` API and adjust.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `http://localhost:3000/admin/login`. Page should still render (styling will look partially broken until subsequent tasks — that's expected). Visit `http://localhost:3000/` (public site). The storefront must look **identical** to before. If any public page changed, the isolation is broken — stop and investigate.

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat(admin): load Inter and mount admin stylesheet under admin-root"
```

---

### Task 3: Extract shared admin UI primitives (Button, Card, PageHeader)

**Files:**
- Create: `components/admin/ui/button.tsx`
- Create: `components/admin/ui/card.tsx`
- Create: `components/admin/ui/page-header.tsx`

- [ ] **Step 1: Write `components/admin/ui/button.tsx`**

```tsx
"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "outline" | "danger" | "ghost";
type Size = "md" | "sm";

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--admin-radius)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[15px]",
  sm: "h-9 px-3 text-sm",
};
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-hover)]",
  outline:
    "bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]",
  danger:
    "bg-[var(--admin-surface)] text-[var(--admin-danger)] border border-[var(--admin-border)] hover:bg-[var(--admin-danger-soft)] hover:border-[var(--admin-danger)]",
  ghost:
    "bg-transparent text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]",
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  function AdminButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      className = "",
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leadingIcon
        )}
        <span>{children}</span>
        {!loading && trailingIcon}
      </button>
    );
  },
);
```

- [ ] **Step 2: Write `components/admin/ui/card.tsx`**

```tsx
import { forwardRef } from "react";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  as?: "div" | "section" | "article";
}

export const AdminCard = forwardRef<HTMLDivElement, AdminCardProps>(
  function AdminCard(
    { padded = true, as: Tag = "div", className = "", children, ...rest },
    ref,
  ) {
    return (
      <Tag
        ref={ref as never}
        className={`bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] ${
          padded ? "p-6" : ""
        } ${className}`}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
```

- [ ] **Step 3: Write `components/admin/ui/page-header.tsx`**

```tsx
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-text)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[var(--admin-text-soft)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/admin/ui/button.tsx components/admin/ui/card.tsx components/admin/ui/page-header.tsx
git commit -m "feat(admin): add shared Button, Card, and PageHeader primitives"
```

---

### Task 4: Extract shared StatusPill, EmptyState, ConfirmModal, Toast

**Files:**
- Create: `components/admin/ui/status-pill.tsx`
- Create: `components/admin/ui/empty-state.tsx`
- Create: `components/admin/ui/confirm-modal.tsx`
- Create: `components/admin/ui/toast.tsx`

- [ ] **Step 1: Write `components/admin/ui/status-pill.tsx`**

```tsx
export type StatusTone = "neutral" | "primary" | "success" | "warning" | "danger";

const tones: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--admin-surface-alt)] text-[var(--admin-text-soft)] border-[var(--admin-border)]",
  primary:
    "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] border-[var(--admin-primary-soft)]",
  success:
    "bg-[var(--admin-success-soft)] text-[var(--admin-success)] border-[var(--admin-success-soft)]",
  warning:
    "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)] border-[var(--admin-warning-soft)]",
  danger:
    "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] border-[var(--admin-danger-soft)]",
};

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Write `components/admin/ui/empty-state.tsx`**

```tsx
import { AdminButton } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      {description && (
        <p className="max-w-md text-[15px] text-[var(--admin-text-soft)]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AdminButton variant="primary" onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/admin/ui/confirm-modal.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { AdminButton } from "./button";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[var(--admin-radius)] bg-[var(--admin-surface)] p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[15px] text-[var(--admin-text-soft)]">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/admin/ui/toast.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  show: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { bg: string; fg: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-[var(--admin-success-soft)]",
    fg: "text-[var(--admin-success)]",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    bg: "bg-[var(--admin-danger-soft)]",
    fg: "text-[var(--admin-danger)]",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  info: {
    bg: "bg-[var(--admin-primary-soft)]",
    fg: "text-[var(--admin-primary)]",
    icon: <Info className="h-5 w-5" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((tone: ToastTone, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }].slice(-3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const s = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] ${s.bg} ${s.fg} px-4 py-3 shadow-sm min-w-[280px]`}
            >
              {s.icon}
              <span className="flex-1 text-[15px] font-medium">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-70 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add components/admin/ui/status-pill.tsx components/admin/ui/empty-state.tsx components/admin/ui/confirm-modal.tsx components/admin/ui/toast.tsx
git commit -m "feat(admin): add StatusPill, EmptyState, ConfirmModal, ToastProvider primitives"
```

---

## Phase 2 — Shell

### Task 5: Rewrite admin sidebar

**Files:**
- Modify: `components/admin/admin-sidebar.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  LayoutGrid,
  Megaphone,
  X,
  Bell,
} from "lucide-react";
import { adminLogout } from "@/lib/actions/auth";
import { getOrderStats } from "@/lib/actions/orders";
import { AdminButton } from "./ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  dynamicBadge?: boolean;
}

const DAILY: NavItem[] = [
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, dynamicBadge: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
];

const SETUP: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavGroup({
  title,
  items,
  pathname,
  pendingOrders,
  onItemClick,
}: {
  title: string;
  items: NavItem[];
  pathname: string | null;
  pendingOrders: number | null;
  onItemClick?: () => void;
}) {
  return (
    <div>
      <div className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--admin-text-muted)]">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {items.map(({ label, href, icon: Icon, dynamicBadge }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname?.startsWith(href));
          const badge =
            dynamicBadge && pendingOrders && pendingOrders > 0
              ? String(pendingOrders)
              : null;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onItemClick}
                className={`relative flex h-12 items-center gap-3 rounded-[var(--admin-radius)] px-4 text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                    : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--admin-primary)]" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [pendingOrders, setPendingOrders] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getOrderStats()
      .then((s) => setPendingOrders(s.byStatus.pending + s.byStatus.processing))
      .catch(() => {});
  }, []);

  function handleLogout() {
    startTransition(() => {
      adminLogout();
    });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[264px] shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] text-[var(--admin-primary)] font-bold">
            HM
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[var(--admin-text)] leading-none">
              Habiba Minhas
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">
              Admin
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <NavGroup
            title="Daily tasks"
            items={DAILY}
            pathname={pathname}
            pendingOrders={pendingOrders}
            onItemClick={onClose}
          />
          <NavGroup
            title="Setup & reports"
            items={SETUP}
            pathname={pathname}
            pendingOrders={pendingOrders}
            onItemClick={onClose}
          />
        </nav>

        {/* User */}
        <div className="border-t border-[var(--admin-border)] p-3">
          <div className="flex items-center gap-3 px-1 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-bold text-[var(--admin-primary)]">
              H
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--admin-text)]">
                Habiba Minhas
              </div>
              <div className="truncate text-xs text-[var(--admin-text-muted)]">
                Super admin
              </div>
            </div>
          </div>
          <AdminButton
            variant="outline"
            fullWidth
            onClick={handleLogout}
            loading={isPending}
            leadingIcon={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </AdminButton>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds. If it warns about unused `ChevronRight` or similar imports from the old file, the replacement above already drops them — verify the imports list at the top matches what's actually used.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `/admin` (log in first if needed). Confirm:
- White sidebar, clear brand block, two labelled groups, sign-out button with text.
- Active nav item has blue left border and blue-soft background.
- Orders shows a blue pending-count pill when there are pending orders.
- Public storefront is untouched.

- [ ] **Step 4: Commit**

```bash
git add components/admin/admin-sidebar.tsx
git commit -m "feat(admin): rewrite sidebar with white theme, grouped nav, labelled sign-out"
```

---

### Task 6: Rewrite admin topbar

**Files:**
- Modify: `components/admin/admin-topbar.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
"use client";

import { Search, Bell, Menu, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";
import { AdminButton } from "./ui/button";

export function AdminTopbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    getUnreadCount().then(setUnread).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--admin-text)] md:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input
            type="search"
            placeholder="Search…"
            className="h-11 w-60 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] pl-10 pr-3 text-[15px] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-primary)] focus:bg-[var(--admin-surface)]"
          />
        </div>

        <Link
          href="/admin/notifications"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-[11px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <Link href="/" target="_blank" className="hidden sm:block">
          <AdminButton variant="outline" trailingIcon={<ExternalLink className="h-4 w-4" />}>
            View store
          </AdminButton>
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `/admin`. Confirm white topbar, non-italic title in Inter, outline "View store" button, bell with count badge. Public site untouched.

- [ ] **Step 4: Commit**

```bash
git add components/admin/admin-topbar.tsx
git commit -m "feat(admin): rewrite topbar with white theme and labelled buttons"
```

---

### Task 7: Update admin shell container

**Files:**
- Modify: `components/admin/admin-shell.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { ToastProvider } from "./ui/toast";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--admin-surface-alt)]">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar
            title={title}
            onMenuClick={() => setSidebarOpen(true)}
          />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/admin/admin-shell.tsx
git commit -m "feat(admin): restyle shell container and wrap in ToastProvider"
```

---

## Phase 3 — Dashboard home

### Task 8: Rewrite `/admin` (dashboard home) to Today-first layout

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Users,
  Settings as SettingsIcon,
  Package,
  AlertTriangle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { getProducts } from "@/lib/actions/products";
import { getOrderStats, getOrders } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;
type Order = Tables<"orders">;

export const metadata = { title: "Dashboard | Admin" };

function TodayStat({
  label,
  value,
  caption,
  valueClass = "",
}: {
  label: string;
  value: string;
  caption: string;
  valueClass?: string;
}) {
  return (
    <div className="px-6 py-5 first:pl-6 md:first:pl-8">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
        {label}
      </div>
      <div className={`mt-2 text-[34px] font-bold leading-none tabular-nums text-[var(--admin-text)] ${valueClass}`}>
        {value}
      </div>
      <div className="mt-2 text-[13px] text-[var(--admin-text-muted)]">
        {caption}
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-[120px] flex-col justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)]"
    >
      <div className="text-[var(--admin-text-soft)] group-hover:text-[var(--admin-primary)]">
        {icon}
      </div>
      <div>
        <div className="text-[16px] font-semibold text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
          {label}
        </div>
        <div className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">
          {hint}
        </div>
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [orderStats, customerStats, allProducts, allOrders] = await Promise.all([
    getOrderStats().catch(() => null),
    getCustomerStats().catch(() => null),
    getProducts().catch(() => []),
    getOrders().catch(() => [] as Order[]),
  ]);

  const hasNoData =
    !orderStats && !customerStats && allProducts.length === 0;

  if (hasNoData) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex-1 overflow-y-auto p-6">
          <AdminCard>
            <EmptyState
              title="Welcome to your store"
              description="Your store is ready. Add your first product to get started."
              actionLabel="Add product"
              onAction={() => {
                window.location.href = "/admin/products";
              }}
            />
          </AdminCard>
        </div>
      </AdminShell>
    );
  }

  const pendingShip =
    (orderStats?.byStatus.pending ?? 0) +
    (orderStats?.byStatus.processing ?? 0);

  const pendingOrders = (allOrders as Order[])
    .filter((o) => o.status === "pending" || o.status === "processing")
    .slice(0, 5);

  const lowStock = allProducts
    .filter((p: Product) => p.stock <= 5)
    .sort((a: Product, b: Product) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <AdminShell title="Dashboard">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* 1. Today panel */}
        <AdminCard padded={false} className="overflow-hidden">
          <div className="h-1 w-full bg-[var(--admin-primary)]" />
          <div className="grid grid-cols-1 divide-y divide-[var(--admin-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <TodayStat
              label="New orders today"
              value={String(orderStats?.todayCount ?? 0)}
              caption="today"
            />
            <TodayStat
              label="Revenue today"
              value={formatPrice(orderStats?.todayRevenue ?? 0)}
              caption="today"
            />
            <TodayStat
              label="Pending to ship"
              value={String(pendingShip)}
              caption={pendingShip > 0 ? "waiting" : "all caught up"}
              valueClass={
                pendingShip > 0 ? "text-[var(--admin-warning)]" : ""
              }
            />
          </div>
        </AdminCard>

        {/* 2. Action tiles */}
        <section className="mt-6">
          <h2 className="mb-3 text-[18px] font-semibold text-[var(--admin-text)]">
            What do you want to do?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              icon={<ShoppingBag className="h-7 w-7" />}
              label="View orders"
              hint={`${pendingShip} pending`}
              href="/admin/orders"
            />
            <Tile
              icon={<Plus className="h-7 w-7" />}
              label="Add product"
              hint={`${allProducts.length} items`}
              href="/admin/products"
            />
            <Tile
              icon={<Users className="h-7 w-7" />}
              label="Customers"
              hint={`${customerStats?.total ?? 0} total`}
              href="/admin/customers"
            />
            <Tile
              icon={<SettingsIcon className="h-7 w-7" />}
              label="Settings"
              hint="Store, shipping, payment"
              href="/admin/settings"
            />
          </div>
        </section>

        {/* 3. Needs your attention */}
        <section className="mt-6">
          <AdminCard padded={false}>
            {/* Orders waiting */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[var(--admin-text)]">
                  Orders waiting
                </h3>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-[var(--admin-primary)] hover:underline"
                >
                  View all →
                </Link>
              </div>
              {pendingOrders.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--admin-text-muted)]">
                  No pending orders. All caught up.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--admin-border)]">
                  {pendingOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--admin-text)]">
                          #{o.order_number}
                        </div>
                        <div className="truncate text-[13px] text-[var(--admin-text-soft)]">
                          {o.customer_name} · {formatPrice(o.total)}
                        </div>
                      </div>
                      <Link href={`/admin/orders?id=${o.id}`}>
                        <AdminButton variant="outline" size="sm">
                          Process →
                        </AdminButton>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-px bg-[var(--admin-border)]" />

            {/* Low stock */}
            <div className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--admin-warning)]" />
                <h3 className="text-[18px] font-semibold text-[var(--admin-text)]">
                  Low stock
                </h3>
              </div>
              {lowStock.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--admin-text-muted)]">
                  All products well stocked.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--admin-border)]">
                  {lowStock.map((p: Product) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 py-3 first:pt-0"
                    >
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-5 w-5 text-[var(--admin-text-muted)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-medium text-[var(--admin-text)]">
                          {p.title}
                        </div>
                        <div
                          className={`text-[13px] font-semibold ${
                            p.stock === 0
                              ? "text-[var(--admin-danger)]"
                              : "text-[var(--admin-warning)]"
                          }`}
                        >
                          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                        </div>
                      </div>
                      <Link href="/admin/products">
                        <AdminButton variant="outline" size="sm">
                          Edit
                        </AdminButton>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminCard>
        </section>
      </div>
    </AdminShell>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds. If `getOrders` import mismatches an existing export (arguments/return shape), open `lib/actions/orders.ts`, adapt the call signature to what exists, and re-run.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `/admin`. Confirm three sections: Today panel (3 numbers divided by hairlines), tile grid (4 blue-hover tiles), Needs-your-attention (two sub-sections). No charts, no italic text, no gold/cream.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): rewrite dashboard home with Today-first layout"
```

---

## Phase 4 — Login

### Task 9: Rewrite admin login page

**Files:**
- Modify: `app/admin/login/page.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";
import { AdminButton } from "@/components/admin/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-surface-alt)] px-4">
      <div className="w-full max-w-[400px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold text-[var(--admin-text)]">
            Sign in to admin
          </h1>
          <p className="mt-1 text-[14px] text-[var(--admin-text-muted)]">
            Enter your email and password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[var(--admin-radius)] border border-[var(--admin-danger-soft)] bg-[var(--admin-danger-soft)] px-3 py-2 text-[14px] text-[var(--admin-danger)]"
            >
              {error}
            </div>
          )}

          <AdminButton type="submit" fullWidth loading={loading}>
            Sign in
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `/admin/login`. Confirm centered white card, Inter font, blue sign-in button, light gray background, no boutique styling.

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat(admin): rewrite login page with centered white card"
```

---

## Phase 5 — Inner pages

> **Pattern for every inner page task below:**
>
> The inner pages are large client components already driving working server actions. Do **not** rewrite their data logic. Only replace the presentational layer.
>
> **The three replacement rules:**
> 1. **Classes to strip/replace** (search the file):
>    - `bg-ivory`, `bg-cream`, `bg-parchment`, `bg-gold-light`, `bg-gold`, `bg-gold-dark`, `bg-ink`, `bg-sage`, `bg-sale`, `bg-rose` → map to the appropriate admin token.
>    - `text-ink`, `text-ink-soft`, `text-muted`, `text-gold-dark`, `text-sage`, `text-sale` → `text-[var(--admin-text)]` / `text-[var(--admin-text-soft)]` / `text-[var(--admin-text-muted)]` / `text-[var(--admin-primary)]` / `text-[var(--admin-success)]` / `text-[var(--admin-danger)]`.
>    - `border-border-soft` → `border-[var(--admin-border)]`.
>    - `font-display` → remove (inherit Inter).
>    - `italic` → remove everywhere.
>    - `font-display text-Nxl italic` headings → `text-Nxl font-semibold`.
>    - `uppercase tracking-[0.28em]` / similar boutique tracking → remove or reduce to `tracking-wide`.
> 2. **Buttons**: icon-only buttons for meaningful actions (edit, delete, update, view) must be converted to `<AdminButton variant="outline" size="sm" leadingIcon={…}>Edit</AdminButton>` style with a text label. Icon-only is only acceptable for the topbar bell, sidebar close (X), table-row expand toggles, and clear-search clear-X buttons.
> 3. **Destructive actions**: delete/cancel actions must use `<ConfirmModal>` from `components/admin/ui/confirm-modal.tsx` instead of bespoke inline modals. Success/error feedback must use `useToast()` from `components/admin/ui/toast.tsx`.
>
> **Verify each task with the same 3 steps:** `npm run build`, `npm run dev` + visual check of the listed route, then commit.

---

### Task 10: Restyle Orders page (list + detail)

**Files:**
- Modify: `app/admin/orders/page.tsx`

- [ ] **Step 1: Read the current file**

Run: Read `app/admin/orders/page.tsx` end to end. Note the current structure: list view with filter tabs, search, paginated table; detail view opened via `selected` state.

- [ ] **Step 2: Update imports**

At the top of the file, replace the `AdminShell` import group with:

```tsx
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import { useToast } from "@/components/admin/ui/toast";
```

- [ ] **Step 3: Replace the `statusStyle` map with a tone map**

Find the existing `statusStyle` object and replace it with:

```tsx
const STATUS_TONE: Record<string, StatusTone> = {
  pending: "warning",
  processing: "primary",
  dispatched: "primary",
  delivered: "success",
  cancelled: "danger",
};

const PAYMENT_TONE: Record<string, StatusTone> = {
  pending: "warning",
  verified: "success",
  collected: "success",
  rejected: "danger",
  "n/a": "neutral",
};
```

Replace all usages of `statusStyle[x].bg`/`.text`/`.dot` with `<StatusPill tone={STATUS_TONE[x] ?? "neutral"}>{x}</StatusPill>`. Similarly for `paymentStatusStyle`.

- [ ] **Step 4: Replace the page container and header**

Wrap the page body with `<AdminShell title="Orders">` and immediately inside the scroll container add:

```tsx
<div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
  <PageHeader
    title="Orders"
    subtitle={`${orders.length} total, ${pendingShipCount} pending`}
    actions={
      <AdminButton variant="outline" leadingIcon={<Download className="h-4 w-4" />}>
        Export
      </AdminButton>
    }
  />
  {/* …filters + table go here… */}
</div>
```

Declare `const pendingShipCount = orders.filter(o => o.status === "pending" || o.status === "processing").length;` above the return.

- [ ] **Step 5: Rewrite the filter pills**

Replace the existing filter-tabs row with:

```tsx
<div className="mt-6 flex flex-wrap items-center gap-2">
  {STATUS_TABS.map((tab) => {
    const active = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => { setActiveTab(tab); setPage(1); }}
        className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
          active
            ? "bg-[var(--admin-primary)] text-white"
            : "bg-[var(--admin-surface)] text-[var(--admin-text-soft)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]"
        }`}
      >
        {tab}
      </button>
    );
  })}
  <div className="relative ml-auto w-full md:w-80">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
    <input
      type="search"
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      placeholder="Search by order # or customer…"
      className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
    />
  </div>
</div>
```

- [ ] **Step 6: Rewrite the orders table**

Replace the existing `<table>` + tbody with:

```tsx
<AdminCard padded={false} className="mt-5 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
        <tr>
          <th className="px-5 py-3">Order #</th>
          <th className="px-5 py-3">Customer</th>
          <th className="px-5 py-3">Items</th>
          <th className="px-5 py-3">Total</th>
          <th className="px-5 py-3">Status</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--admin-border)] text-[15px]">
        {paginated.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-5 py-10 text-center text-[var(--admin-text-muted)]">
              No orders match your filters.
            </td>
          </tr>
        ) : paginated.map((o) => (
          <tr key={o.id} className="h-14 hover:bg-[var(--admin-surface-alt)]">
            <td className="px-5 font-semibold">#{o.order_number}</td>
            <td className="px-5">
              <div>{o.customer_name}</div>
              <div className="text-[13px] text-[var(--admin-text-muted)]">{getCity(o.address)}</div>
            </td>
            <td className="px-5">{o.order_items.length}</td>
            <td className="px-5 font-semibold tabular-nums">{formatPrice(o.total)}</td>
            <td className="px-5">
              <StatusPill tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status}</StatusPill>
            </td>
            <td className="px-5 text-right">
              <AdminButton variant="outline" size="sm" onClick={() => setSelected(o)}>
                Update →
              </AdminButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</AdminCard>
```

- [ ] **Step 7: Rewrite pagination controls**

Replace any existing pagination block with:

```tsx
{totalPages > 1 && (
  <div className="mt-4 flex items-center justify-between">
    <div className="text-[13px] text-[var(--admin-text-muted)]">
      Page {safePage} of {totalPages}
    </div>
    <div className="flex gap-2">
      <AdminButton
        variant="outline"
        size="sm"
        disabled={safePage <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        leadingIcon={<ChevronLeft className="h-4 w-4" />}
      >
        Prev
      </AdminButton>
      <AdminButton
        variant="outline"
        size="sm"
        disabled={safePage >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        trailingIcon={<ChevronRight className="h-4 w-4" />}
      >
        Next
      </AdminButton>
    </div>
  </div>
)}
```

- [ ] **Step 8: Rewrite the order detail drawer/modal**

Locate the existing detail view (rendered when `selected` is truthy). Replace its outer container + header with a slide-over panel:

```tsx
{selected && (
  <div className="fixed inset-0 z-40 flex">
    <div
      className="flex-1 bg-black/40"
      onClick={() => setSelected(null)}
    />
    <div className="flex w-full max-w-2xl flex-col bg-[var(--admin-surface)] shadow-xl">
      <div className="flex h-[72px] items-center justify-between border-b border-[var(--admin-border)] px-6">
        <div>
          <div className="text-[20px] font-semibold text-[var(--admin-text)]">
            Order #{selected.order_number}
          </div>
          <div className="text-[13px] text-[var(--admin-text-muted)]">
            {new Date(selected.created_at).toLocaleDateString("en-PK")}
          </div>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Keep existing detail cards (customer, items, payment, shipping)
            but restyle each as <AdminCard> and convert icon-only buttons
            to <AdminButton> with labels. */}
      </div>
      <div className="border-t border-[var(--admin-border)] p-4 flex gap-2">
        <AdminButton
          variant="primary"
          fullWidth
          disabled={selected.status === "delivered" || selected.status === "cancelled"}
          onClick={async () => {
            await updateOrderStatus(selected.id, "dispatched");
            loadOrders();
            setSelected(null);
          }}
          leadingIcon={<Truck className="h-4 w-4" />}
        >
          Mark as shipped
        </AdminButton>
        <AdminButton
          variant="danger"
          onClick={() => setConfirmCancel(true)}
        >
          Cancel order
        </AdminButton>
      </div>
    </div>
  </div>
)}
```

Add state: `const [confirmCancel, setConfirmCancel] = useState(false);` and the corresponding `<ConfirmModal>`:

```tsx
<ConfirmModal
  open={confirmCancel}
  title="Cancel this order?"
  description="The order will be marked as cancelled. This cannot be undone."
  confirmLabel="Yes, cancel order"
  destructive
  onCancel={() => setConfirmCancel(false)}
  onConfirm={async () => {
    if (!selected) return;
    await updateOrderStatus(selected.id, "cancelled");
    setConfirmCancel(false);
    setSelected(null);
    loadOrders();
  }}
/>
```

- [ ] **Step 9: Sweep remaining old tokens**

Use Grep in the file for each of: `bg-ivory`, `bg-cream`, `bg-gold`, `bg-ink`, `bg-sage`, `bg-sale`, `text-ink`, `text-muted`, `text-sage`, `text-sale`, `text-gold-dark`, `border-border-soft`, `font-display`, `italic`. Replace every remaining hit with the admin-token equivalent per the "Replacement rules" above. Reach zero matches for each.

- [ ] **Step 10: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 11: Visual check**

Run: `npm run dev`, visit `/admin/orders`. Confirm white page, blue filter pill when active, labelled Update button, order detail drawer opens on the right with labelled Mark-as-shipped and Cancel buttons. Cancel button opens confirmation modal.

- [ ] **Step 12: Commit**

```bash
git add app/admin/orders/page.tsx
git commit -m "feat(admin): restyle orders page with white theme and labelled actions"
```

---

### Task 11: Restyle Products page

**Files:**
- Modify: `app/admin/products/page.tsx`

- [ ] **Step 1: Read file end to end** and note the structure: top bar, filters, grid/table, Add/Edit modal, Delete confirmation, bulk actions.

- [ ] **Step 2: Update imports** to add `AdminCard`, `AdminButton`, `PageHeader`, `StatusPill` + `StatusTone`, `ConfirmModal`, `useToast` from the new primitives (same block pattern as Task 10 Step 2).

- [ ] **Step 3: Replace the top header** with:

```tsx
<PageHeader
  title="Products"
  subtitle={`${products.length} total`}
  actions={
    <AdminButton
      variant="primary"
      leadingIcon={<Plus className="h-4 w-4" />}
      onClick={() => setShowModal(true)}
    >
      Add product
    </AdminButton>
  }
/>
```

- [ ] **Step 4: Replace filter row** with a card-less row: category `<select>` + status pills (same pill pattern as orders) + stock pills + price dropdown + search input. All inputs 44px tall with admin tokens. Preserve existing state wiring (`setCatFilter`, `setStatusFilter`, etc.).

- [ ] **Step 5: Restyle product cards (grid view)**

Each card:

```tsx
<AdminCard padded={false} className="overflow-hidden">
  <div className="relative aspect-[4/5] bg-[var(--admin-surface-alt)]">
    {p.images?.[0] ? (
      <Image src={p.images[0]} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover object-top" />
    ) : (
      <Package className="absolute inset-0 m-auto h-8 w-8 text-[var(--admin-text-muted)]" />
    )}
    {/* selection checkbox top-left, status pill top-right */}
  </div>
  <div className="p-4">
    <div className="line-clamp-1 text-[15px] font-semibold text-[var(--admin-text)]">{p.title}</div>
    <div className="text-[13px] text-[var(--admin-text-muted)]">{CAT_LABEL[p.category] ?? p.category}</div>
    <div className="mt-2 flex items-center justify-between">
      <div className="text-[16px] font-bold tabular-nums">{formatPrice(p.price)}</div>
      <StatusPill tone={p.stock === 0 ? "danger" : p.stock <= 5 ? "warning" : "success"}>
        {p.stock === 0 ? "Out" : `${p.stock} left`}
      </StatusPill>
    </div>
    <div className="mt-3 flex gap-2">
      <AdminButton variant="outline" size="sm" onClick={() => setEditProduct(p)} leadingIcon={<Pencil className="h-3.5 w-3.5" />}>
        Edit
      </AdminButton>
      <AdminButton variant="danger" size="sm" onClick={() => setDeleteTarget(p)} leadingIcon={<Trash2 className="h-3.5 w-3.5" />}>
        Delete
      </AdminButton>
    </div>
  </div>
</AdminCard>
```

- [ ] **Step 6: Replace delete confirmation** (find existing delete modal) with:

```tsx
<ConfirmModal
  open={Boolean(deleteTarget)}
  title={deleteTarget ? `Delete "${deleteTarget.title}"?` : ""}
  description="This removes the product from your store. This cannot be undone."
  confirmLabel="Delete product"
  destructive
  onCancel={() => setDeleteTarget(null)}
  onConfirm={async () => {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    loadProducts();
  }}
/>
```

- [ ] **Step 7: Restyle the Add/Edit product modal**

Wrap its body in `<AdminCard>` styling, replace gold/ivory classes with admin tokens, replace inputs with 44px-tall admin-token inputs, replace save/cancel buttons with `<AdminButton variant="primary">` and `<AdminButton variant="outline">`. Drop the decorative gradient used in image preview — use `bg-[var(--admin-surface-alt)]` with the Package icon as placeholder.

- [ ] **Step 8: Sweep old tokens** — same Grep sweep as Task 10 Step 9.

- [ ] **Step 9: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 10: Visual check**

Run: `npm run dev`, visit `/admin/products`. Confirm grid of white cards, Edit/Delete buttons have labels, delete opens confirmation modal. Add product modal has white form with admin tokens.

- [ ] **Step 11: Commit**

```bash
git add app/admin/products/page.tsx
git commit -m "feat(admin): restyle products page with white theme and labelled actions"
```

---

### Task 12: Restyle Categories page

**Files:**
- Modify: `app/admin/categories/page.tsx`

- [ ] **Step 1: Read the file.**

- [ ] **Step 2: Update imports** to include admin UI primitives (same block).

- [ ] **Step 3: Replace page header** with:

```tsx
<PageHeader
  title="Categories"
  subtitle={`${categories.length} total`}
  actions={
    <AdminButton variant="primary" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
      Add category
    </AdminButton>
  }
/>
```

(Adapt state variable names to what the existing component uses.)

- [ ] **Step 4: Replace the list container** with `<AdminCard padded={false}>` wrapping a `<ul className="divide-y divide-[var(--admin-border)]">`. Each row:

```tsx
<li className="flex items-center gap-4 px-5 py-4">
  <div className="h-10 w-10 rounded-[var(--admin-radius)] bg-[var(--admin-surface-alt)]" />
  <div className="min-w-0 flex-1">
    <div className="text-[15px] font-semibold text-[var(--admin-text)]">{c.name}</div>
    <div className="text-[13px] text-[var(--admin-text-muted)]">{c.productCount ?? 0} products</div>
  </div>
  <AdminButton variant="outline" size="sm" onClick={() => setEditCategory(c)} leadingIcon={<Pencil className="h-3.5 w-3.5" />}>
    Edit
  </AdminButton>
  <AdminButton variant="danger" size="sm" onClick={() => setDeleteCategory(c)} leadingIcon={<Trash2 className="h-3.5 w-3.5" />}>
    Delete
  </AdminButton>
</li>
```

- [ ] **Step 5: Replace add/edit modal & delete confirmation** with `<AdminCard>`-styled form bodies and `<ConfirmModal>` respectively (same pattern as Task 11 Steps 6 and 7).

- [ ] **Step 6: Sweep old tokens.**

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Visual check** at `/admin/categories`. Confirm flat white list, labelled Edit/Delete, confirmation modal on delete.

- [ ] **Step 9: Commit**

```bash
git add app/admin/categories/page.tsx
git commit -m "feat(admin): restyle categories page with white theme"
```

---

### Task 13: Restyle Customers page

**Files:**
- Modify: `app/admin/customers/page.tsx`

- [ ] **Step 1: Read the file.**

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Replace page header** with `<PageHeader title="Customers" subtitle={\`${total} total, ${newThisMonth} new this month\`} />`. No primary action button (customers are created via checkout).

- [ ] **Step 4: Replace search input** with the admin-token 44px input (same pattern as Task 10 Step 5).

- [ ] **Step 5: Restyle the customers table** inside `<AdminCard padded={false}>`:

```tsx
<table className="w-full text-left">
  <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
    <tr>
      <th className="px-5 py-3">Name</th>
      <th className="px-5 py-3">Email</th>
      <th className="px-5 py-3">Orders</th>
      <th className="px-5 py-3">Total spent</th>
      <th className="px-5 py-3">Last order</th>
      <th className="px-5 py-3 text-right">Action</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-[var(--admin-border)] text-[15px]">
    {filtered.map((c) => {
      const initials = c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      return (
        <tr key={c.id} className="h-14 hover:bg-[var(--admin-surface-alt)]">
          <td className="px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-bold text-[var(--admin-primary)]">
                {initials || "?"}
              </div>
              <div className="font-medium">{c.name}</div>
            </div>
          </td>
          <td className="px-5 text-[var(--admin-text-soft)]">{c.email}</td>
          <td className="px-5 tabular-nums">{c.orderCount}</td>
          <td className="px-5 font-semibold tabular-nums">{formatPrice(c.totalSpent)}</td>
          <td className="px-5 text-[var(--admin-text-soft)]">
            {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-PK") : "—"}
          </td>
          <td className="px-5 text-right">
            <AdminButton variant="outline" size="sm" onClick={() => setSelected(c)}>
              View
            </AdminButton>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
```

(Adapt property names to what the existing component actually uses — if the field is `total_spent` not `totalSpent`, keep the real field name.)

- [ ] **Step 6: Restyle the customer detail drawer/modal** as a slide-over panel using the same pattern as Task 10 Step 8, with cards for Profile, Orders, Addresses.

- [ ] **Step 7: Sweep old tokens.**

- [ ] **Step 8: Build**, **Step 9: Visual check** at `/admin/customers`, **Step 10: Commit**:

```bash
git add app/admin/customers/page.tsx
git commit -m "feat(admin): restyle customers page with white theme"
```

---

### Task 14: Restyle Analytics page (chart colors to blue)

**Files:**
- Modify: `app/admin/analytics/page.tsx`

- [ ] **Step 1: Read the file** and identify the three charts (weekly revenue, daily orders, order status distribution) plus stat cards and the date-range selector.

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Replace page header** with:

```tsx
<PageHeader
  title="Analytics"
  actions={
    <select
      value={range}
      onChange={(e) => setRange(e.target.value as Range)}
      className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px]"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  }
/>
```

(Declare the `range` state and `Range` type; if the existing component already has equivalents, keep those.)

- [ ] **Step 4: Restyle the stat cards row** — three `<AdminCard>`s each with a label, big number, caption. Same style as Task 8's `TodayStat`.

- [ ] **Step 5: Restyle the three charts**. For each chart block:
- Wrap in `<AdminCard>`.
- Heading: `<h2 className="text-[18px] font-semibold text-[var(--admin-text)]">{title}</h2>`.
- For SVG `fill=` or `stroke=` attributes currently using `#a8804b` (gold-dark), `#8c9b7e` (sage), `#2563eb` (blue), `#9c3b2f` (sale), change the primary bar/line color to `#2563eb` and the secondary/muted color to `#9ca3af`. For the order-status distribution bars, use: pending `#d97706`, processing `#2563eb`, dispatched `#1d4ed8`, delivered `#16a34a`, cancelled `#dc2626`.

- [ ] **Step 6: Sweep old tokens** — remove any `font-display`, `italic`, `text-ink`, etc.

- [ ] **Step 7: Build**, **Step 8: Visual check** at `/admin/analytics` (blue bars, blue line, no gold), **Step 9: Commit**:

```bash
git add app/admin/analytics/page.tsx
git commit -m "feat(admin): restyle analytics with white theme and blue-accent charts"
```

---

### Task 15: Restyle Marketing page

**Files:**
- Modify: `app/admin/marketing/page.tsx`

- [ ] **Step 1: Read the file.**

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Replace page header** with `<PageHeader title="Marketing" actions={<AdminButton variant="primary" leadingIcon={<Plus />}>Create promo</AdminButton>} />`.

- [ ] **Step 4: Restyle the tabs / segmented control** as outline-button style (same pill pattern as orders filters).

- [ ] **Step 5: Restyle each list** — wrap in `<AdminCard padded={false}>`, hairline dividers between rows, labelled Edit/Delete buttons, StatusPill for states.

- [ ] **Step 6: Replace modals** with `<AdminCard>`-styled bodies, `<AdminButton>` actions, `<ConfirmModal>` for deletes.

- [ ] **Step 7: Sweep old tokens.**

- [ ] **Step 8: Build**, **Step 9: Visual check** at `/admin/marketing`, **Step 10: Commit**:

```bash
git add app/admin/marketing/page.tsx
git commit -m "feat(admin): restyle marketing page with white theme"
```

---

### Task 16: Restyle Notifications page

**Files:**
- Modify: `app/admin/notifications/page.tsx`

- [ ] **Step 1: Read the file.**

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Replace page header** with:

```tsx
<PageHeader
  title="Notifications"
  subtitle={`${unreadCount} unread`}
  actions={
    <AdminButton variant="outline" onClick={handleMarkAllRead}>
      Mark all as read
    </AdminButton>
  }
/>
```

- [ ] **Step 4: Replace filter pills** (All / Unread / Read) with the pill pattern.

- [ ] **Step 5: Restyle each notification row** inside `<AdminCard padded={false}>`:

```tsx
<li
  className={`flex items-start gap-3 px-5 py-4 border-b border-[var(--admin-border)] last:border-b-0 ${
    !n.read ? "bg-[var(--admin-primary-soft)]/30" : ""
  }`}
>
  <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-[var(--admin-border)]" : "bg-[var(--admin-primary)]"}`} />
  <Bell className="h-5 w-5 text-[var(--admin-text-muted)]" />
  <div className="min-w-0 flex-1">
    <div className="text-[15px] font-semibold text-[var(--admin-text)]">{n.title}</div>
    <div className="line-clamp-2 text-[14px] text-[var(--admin-text-soft)]">{n.message}</div>
    <div className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
      {new Date(n.created_at).toLocaleString("en-PK")}
    </div>
  </div>
  {!n.read && (
    <AdminButton variant="outline" size="sm" onClick={() => markRead(n.id)}>
      Mark read
    </AdminButton>
  )}
</li>
```

- [ ] **Step 6: Sweep old tokens.**

- [ ] **Step 7: Build**, **Step 8: Visual check** at `/admin/notifications`, **Step 9: Commit**:

```bash
git add app/admin/notifications/page.tsx
git commit -m "feat(admin): restyle notifications page with white theme"
```

---

### Task 17: Restyle Settings page

**Files:**
- Modify: `app/admin/settings/page.tsx`

- [ ] **Step 1: Read the file** and note the section structure (Store info / Shipping / Payment / Account / Danger zone or whatever exists).

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Replace page header** with `<PageHeader title="Settings" />`.

- [ ] **Step 4: Build the two-column layout**:

```tsx
<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
  <nav className="flex flex-col gap-1">
    {SECTIONS.map((s) => (
      <button
        key={s.id}
        onClick={() => setActive(s.id)}
        className={`flex h-12 items-center gap-3 rounded-[var(--admin-radius)] px-4 text-[15px] font-medium transition-colors ${
          active === s.id
            ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
            : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
        }`}
      >
        <s.icon className="h-4 w-4" />
        {s.label}
      </button>
    ))}
  </nav>
  <div>
    {/* active section form */}
  </div>
</div>
```

- [ ] **Step 5: For each section form**: wrap in `<AdminCard>`, use `<h2 className="text-[18px] font-semibold">{sectionTitle}</h2>` header, field wrapper with label above and hint below, 44px-tall inputs, and a **"Save changes"** `<AdminButton variant="primary">` at the bottom of each section. No floating save bar.

- [ ] **Step 6: Danger zone** renders in a red-bordered `<AdminCard className="border-[var(--admin-danger)]">` with each destructive action going through `<ConfirmModal destructive>`.

- [ ] **Step 7: Sweep old tokens.**

- [ ] **Step 8: Build**, **Step 9: Visual check** at `/admin/settings` (verify every section), **Step 10: Commit**:

```bash
git add app/admin/settings/page.tsx
git commit -m "feat(admin): restyle settings page with section nav and per-section save"
```

---

### Task 18: Restyle Setup wizard

**Files:**
- Modify: `app/admin/setup/page.tsx`

- [ ] **Step 1: Read the file.**

- [ ] **Step 2: Update imports.**

- [ ] **Step 3: Rewrap each step** in a centered `<div className="flex min-h-screen items-start justify-center bg-[var(--admin-surface-alt)] p-6">` containing `<AdminCard className="w-full max-w-[640px]">`.

- [ ] **Step 4: Add a progress indicator** above the card body: numbered step dots, `bg-[var(--admin-primary)]` for completed, `bg-[var(--admin-border)]` for upcoming.

- [ ] **Step 5: Replace the primary and back buttons** with `<AdminButton variant="primary">Continue</AdminButton>` and `<AdminButton variant="outline">Back</AdminButton>` at the card footer.

- [ ] **Step 6: Sweep old tokens.**

- [ ] **Step 7: Build**, **Step 8: Visual check** at `/admin/setup`, **Step 9: Commit**:

```bash
git add app/admin/setup/page.tsx
git commit -m "feat(admin): restyle setup wizard with white theme"
```

---

## Phase 6 — Final sweep & QA

### Task 19: Final token sweep across all admin files

**Files:** every file under `app/admin/` and `components/admin/`.

- [ ] **Step 1: Grep for public-site tokens inside admin**

Run each Grep separately and expect **zero matches**:

```
Grep "bg-ivory|bg-cream|bg-parchment|bg-ink|bg-sage|bg-sale|bg-gold|bg-rose" in app/admin
Grep "bg-ivory|bg-cream|bg-parchment|bg-ink|bg-sage|bg-sale|bg-gold|bg-rose" in components/admin
Grep "text-ink|text-muted|text-gold-dark|text-sage|text-sale|text-rose" in app/admin
Grep "text-ink|text-muted|text-gold-dark|text-sage|text-sale|text-rose" in components/admin
Grep "border-border-soft" in app/admin
Grep "border-border-soft" in components/admin
Grep "font-display" in app/admin
Grep "font-display" in components/admin
Grep "italic" in app/admin
Grep "italic" in components/admin
```

If any Grep returns matches, open the file and replace per the rules in Phase 5 preamble.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit any sweep fixes**

```bash
git add app/admin components/admin
git commit -m "chore(admin): final sweep of public-theme tokens from admin surface"
```

(If nothing to commit, skip.)

---

### Task 20: Cross-device visual QA + public-site regression check

**Files:** none — verification only.

- [ ] **Step 1: Dev server**

Run: `npm run dev`

- [ ] **Step 2: Public site regression**

Browse: `/`, `/shop`, `/product/<any>`, `/cart`, `/checkout`. Confirm each page looks **exactly** as it did before this work. If any page changed, the isolation is broken — find the leak (likely a shared component or a stray import).

- [ ] **Step 3: Admin walkthrough**

Log in at `/admin/login`. Then visit each of:
- `/admin` — Today + tiles + attention list
- `/admin/orders` — list + detail drawer + mark-shipped + cancel confirm
- `/admin/products` — grid + add modal + edit + delete confirm
- `/admin/categories` — list + add + delete confirm
- `/admin/customers` — list + detail
- `/admin/analytics` — charts are blue, no gold/sage
- `/admin/marketing`
- `/admin/notifications`
- `/admin/settings` — each section, save button per section
- `/admin/setup`

Confirm on each page: white theme, Inter font, no italic, labelled buttons, visible focus ring, no console errors.

- [ ] **Step 4: Responsive check**

Resize the browser to 360px, 768px, 1280px. Confirm:
- Sidebar becomes drawer below 768px.
- Dashboard tiles stack 1-col at 360px, 2-col at 768px, 4-col at 1280px.
- Tables scroll horizontally on 360px without breaking layout.
- Modals are readable on 360px.

- [ ] **Step 5: Keyboard check**

On any admin page, Tab through controls. Confirm visible focus ring on each. Open a ConfirmModal and verify Esc closes it.

- [ ] **Step 6: Production build**

Run: `npm run build && npm run start`
Expected: build and start succeed.

- [ ] **Step 7: Final commit (if any fixes made during QA)**

```bash
git add <touched files>
git commit -m "chore(admin): QA fixes from cross-device walkthrough"
```

---

## Self-review

**Spec coverage:**
- Design tokens → Task 1 ✓
- Inter font loaded only in admin → Task 2 ✓
- Admin-root scoping + font-style reset → Task 1 ✓
- Shared primitives (Button, Card, PageHeader, StatusPill, EmptyState, ConfirmModal, Toast) → Tasks 3–4 ✓
- Sidebar (white, 2 groups, labelled sign-out, pending pill) → Task 5 ✓
- Topbar (white, labelled View-store, bell) → Task 6 ✓
- Shell + ToastProvider → Task 7 ✓
- Dashboard Today-first layout → Task 8 ✓
- Login centered card → Task 9 ✓
- Orders list + drawer + confirm modal → Task 10 ✓
- Products grid + modals + delete confirm → Task 11 ✓
- Categories list → Task 12 ✓
- Customers table + detail → Task 13 ✓
- Analytics (charts moved here, blue accent) → Task 14 ✓
- Marketing → Task 15 ✓
- Notifications list → Task 16 ✓
- Settings section nav + per-section save + danger zone → Task 17 ✓
- Setup wizard → Task 18 ✓
- Final sweep of public tokens from admin → Task 19 ✓
- Cross-device QA + public regression check → Task 20 ✓

**Placeholder scan:** No "TBD", no "implement later". Per-page tasks for inner pages point to exact tokens to strip and show concrete replacement code blocks for the structural pieces that every page has. Where the existing field names vary by page (e.g. `totalSpent` vs `total_spent`), the plan explicitly notes "adapt to what the existing component actually uses" rather than guessing.

**Type consistency:** `StatusTone` is defined in Task 4 and re-imported in Tasks 10–16. `AdminButton` / `AdminCard` / `PageHeader` / `ConfirmModal` signatures are defined in Tasks 3–4 and called with matching prop names throughout. `useToast` returns `{ show }` and is called as such.

**Tradeoffs called out:**
- No test suite: verification is build + visual walkthrough (Task 20). This is a cosmetic change in a project without tests; bootstrapping Vitest/Playwright would be larger than the task itself.
- Per-page tasks for inner pages are longer than the ideal 2–5 minute bite size. Inner-page files are 300–800 lines; a full step-by-step rewrite for each would produce a plan larger than the code it describes. The "three replacement rules" in the Phase 5 preamble keep the work mechanical: strip listed tokens, wrap in `<AdminCard>`, labelled buttons via `<AdminButton>`, `<ConfirmModal>` for destructive actions. An executor should pause after each task for review rather than running Phase 5 end-to-end.
