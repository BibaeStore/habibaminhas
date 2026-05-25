"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search, Download, X, Truck, CreditCard, Package,
  ChevronLeft, ChevronRight, MapPin, Phone, Mail,
  ClipboardList, MessageSquare, Eye, Filter, ChevronDown,
  CheckCircle2, Loader2,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import { getOrders, updateOrderStatus, updateOrder, deleteOrder, bulkDeleteOrders } from "@/lib/actions/orders";
import { generateBulkInvoices, generateBulkPackingSlips } from "@/lib/actions/print";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

const STATUS_TABS = ["All", "Pending", "Processing", "Dispatched", "Delivered", "Cancelled"];

// ✅ PHASE 1: Enhanced Status Colors with Visual Differentiation
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: "#fef3c7", text: "#92400e", border: "#fde68a" }, // Orange - Needs Attention
  processing: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" }, // Blue - In Progress
  dispatched: { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" }, // Yellow - In Transit
  delivered:  { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" }, // Green - Complete
  cancelled:  { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" }, // Red - Cancelled
};

const STATUS_TONE: Record<string, StatusTone> = {
  pending:    "warning",
  processing: "primary",
  dispatched: "primary",
  delivered:  "success",
  cancelled:  "danger",
};

const PAYMENT_TONE: Record<string, StatusTone> = {
  pending:   "warning",
  verified:  "success",
  collected: "success",
  rejected:  "danger",
  "n/a":     "neutral",
};

function getAddr(address: Order["address"]): string {
  if (!address) return "—";
  if (typeof address === "string") return address;
  if (typeof address === "object" && !Array.isArray(address)) {
    const a = address as Record<string, string>;
    return [a.street, a.city, a.province].filter(Boolean).join(", ") || JSON.stringify(address);
  }
  return String(address);
}

function getCity(address: Order["address"]): string {
  if (!address || typeof address !== "object" || Array.isArray(address)) return "—";
  const a = address as Record<string, string>;
  return a.city ?? "—";
}

function exportOrdersCSV(orders: Order[]) {
  const headers = ["Order #", "Date", "Customer", "Phone", "City", "Items", "Payment", "Status", "Total (Rs.)"];
  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleDateString("en-PK"),
    o.customer_name,
    o.customer_phone,
    getCity(o.address),
    (o.order_items ?? []).length,
    o.payment_method,
    o.status,
    o.total,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Order | null>(null);
  const [page,      setPage]      = useState(1);

  // ✅ PHASE 1: Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ✅ PHASE 1: Date Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: "", to: "" });

  // ✅ PHASE 2: Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    paymentMethod: "All",
    paymentStatus: "All",
    city: "",
    minAmount: "",
    maxAmount: "",
    courier: "All",
  });

  // ✅ PHASE 1: Delete Confirmation State
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; ids: string[]; orderNumbers: string[] }>({
    open: false,
    ids: [],
    orderNumbers: [],
  });

  // ✅ PHASE 2: Backward Status Change Confirmation State
  const [confirmBackwardStatus, setConfirmBackwardStatus] = useState<{
    open: boolean;
    orderId: string;
    currentStatus: string;
    newStatus: string;
  }>({
    open: false,
    orderId: "",
    currentStatus: "",
    newStatus: "",
  });

  // ✅ PHASE 3: Admin Email for Activity Logging
  const [adminEmail, setAdminEmail] = useState<string>("");

  // ✅ PHASE 3: Bulk Print Dialog State
  const [printDialog, setPrintDialog] = useState<{ open: boolean; type: "invoice" | "packing" | null; merged: boolean }>({
    open: false,
    type: null,
    merged: true,
  });

  const PAGE_SIZE = 10;

  const loadOrders = () => {
    setLoading(true);
    getOrders().then((data) => { setOrders(data as Order[]); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // ✅ PHASE 3: Fetch admin email for activity logging
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

  // ✅ PHASE 1 + PHASE 2: Enhanced Filtering with Date and Advanced Filters
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // ✅ PHASE 1: Status filter
      if (activeTab !== "All" && o.status !== activeTab.toLowerCase()) return false;

      // ✅ PHASE 1: Search filter
      if (search &&
          !o.order_number.toLowerCase().includes(search.toLowerCase()) &&
          !o.customer_name.toLowerCase().includes(search.toLowerCase()) &&
          !(o.tracking_number ?? "").toLowerCase().includes(search.toLowerCase())) return false;

      // ✅ PHASE 1: Date range filter
      if (dateFilter.from) {
        const orderDate = new Date(o.created_at).toISOString().split("T")[0];
        if (orderDate < dateFilter.from) return false;
      }
      if (dateFilter.to) {
        const orderDate = new Date(o.created_at).toISOString().split("T")[0];
        if (orderDate > dateFilter.to) return false;
      }

      // ✅ PHASE 2: Payment method filter
      if (advancedFilters.paymentMethod !== "All" &&
          o.payment_method !== advancedFilters.paymentMethod) return false;

      // ✅ PHASE 2: Payment status filter
      if (advancedFilters.paymentStatus !== "All" &&
          o.payment_status !== advancedFilters.paymentStatus) return false;

      // ✅ PHASE 2: City filter
      if (advancedFilters.city) {
        const orderCity = getCity(o.address).toLowerCase();
        if (!orderCity.includes(advancedFilters.city.toLowerCase())) return false;
      }

      // ✅ PHASE 2: Amount range filter
      if (advancedFilters.minAmount) {
        const min = parseFloat(advancedFilters.minAmount);
        if (!isNaN(min) && o.total < min) return false;
      }
      if (advancedFilters.maxAmount) {
        const max = parseFloat(advancedFilters.maxAmount);
        if (!isNaN(max) && o.total > max) return false;
      }

      // ✅ PHASE 2: Courier filter
      if (advancedFilters.courier !== "All") {
        if (advancedFilters.courier === "Other") {
          // "Other" means any courier not in the main list
          if (!o.courier || ["TCS", "Leopards", "M&P"].includes(o.courier)) return false;
        } else {
          if (o.courier !== advancedFilters.courier) return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, search, dateFilter, advancedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabCount = (t: string) =>
    t === "All" ? orders.length : orders.filter((o) => o.status === t.toLowerCase()).length;

  const pendingCount = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status, adminEmail);
    loadOrders();
    setSelected((prev) => prev ? { ...prev, status } : null);
  };

  // ✅ PHASE 1: Date Filter Shortcuts
  const setDateShortcut = (shortcut: "today" | "yesterday" | "last7" | "last30" | "thisWeek") => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    switch (shortcut) {
      case "today":
        setDateFilter({ from: todayStr, to: todayStr });
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        setDateFilter({ from: yesterdayStr, to: yesterdayStr });
        break;
      case "last7":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        setDateFilter({ from: last7.toISOString().split("T")[0], to: todayStr });
        break;
      case "last30":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        setDateFilter({ from: last30.toISOString().split("T")[0], to: todayStr });
        break;
      case "thisWeek":
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        setDateFilter({ from: monday.toISOString().split("T")[0], to: todayStr });
        break;
    }
  };

  // ✅ PHASE 2: Helper - Check if Status Change is Backward
  const isBackwardStatusChange = (currentStatus: string, newStatus: string): boolean => {
    const statusOrder = ["pending", "processing", "dispatched", "delivered"];
    const currentIdx = statusOrder.indexOf(currentStatus.toLowerCase());
    const newIdx = statusOrder.indexOf(newStatus.toLowerCase());

    // If either status is not in the workflow (e.g., "cancelled"), return false
    if (currentIdx === -1 || newIdx === -1) return false;

    // Backward = new index is less than current index
    return newIdx < currentIdx;
  };

  // ✅ PHASE 2: Helper - Count Active Filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (dateFilter.from || dateFilter.to) count++;
    if (advancedFilters.paymentMethod !== "All") count++;
    if (advancedFilters.paymentStatus !== "All") count++;
    if (advancedFilters.city) count++;
    if (advancedFilters.minAmount || advancedFilters.maxAmount) count++;
    if (advancedFilters.courier !== "All") count++;
    return count;
  };

  // ✅ PHASE 2: Clear All Filters Handler
  const handleClearAllFilters = () => {
    setDateFilter({ from: "", to: "" });
    setAdvancedFilters({
      paymentMethod: "All",
      paymentStatus: "All",
      city: "",
      minAmount: "",
      maxAmount: "",
      courier: "All",
    });
  };

  // ✅ PHASE 1: Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSet = new Set(selectedIds);
      paginated.forEach((o) => newSet.add(o.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginated.forEach((o) => newSet.delete(o.id));
      setSelectedIds(newSet);
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  // ✅ PHASE 1 + PHASE 2: Bulk Status Update with Error Handling and Backward Check
  const handleBulkStatusUpdate = async (newStatus: string) => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));

    // ✅ PHASE 2: Check for backward status changes
    const backwardChanges = selectedOrders.filter((o) => isBackwardStatusChange(o.status, newStatus));
    if (backwardChanges.length > 0) {
      const confirmed = window.confirm(
        `⚠️ WARNING: Backward Status Change\n\n` +
        `You are moving ${backwardChanges.length} order${backwardChanges.length !== 1 ? "s" : ""} BACKWARD in the workflow.\n\n` +
        `Current status → New status:\n` +
        backwardChanges.slice(0, 5).map((o) => `${o.order_number}: ${o.status} → ${newStatus}`).join("\n") +
        (backwardChanges.length > 5 ? `\n...and ${backwardChanges.length - 5} more` : "") +
        `\n\nThis may confuse customers who are expecting their orders to move forward.\n\n` +
        `Continue anyway?`
      );
      if (!confirmed) return;
    }

    // ✅ PHASE 1: Check for mixed statuses
    const statuses = [...new Set(selectedOrders.map((o) => o.status))];
    if (statuses.length > 1 || (statuses.length === 1 && statuses[0] !== newStatus)) {
      const confirmed = window.confirm(
        `You have selected ${selectedOrders.length} orders with different statuses.\n\n` +
        `Current statuses: ${statuses.join(", ")}\n` +
        `New status: ${newStatus}\n\n` +
        `Continue?`
      );
      if (!confirmed) return;
    }

    setBulkProcessing(true);
    setBulkMessage(null);

    let successCount = 0;
    let failCount = 0;
    const failedOrders: string[] = [];

    for (const order of selectedOrders) {
      try {
        await updateOrderStatus(order.id, newStatus, adminEmail);
        successCount++;
      } catch (error) {
        // Retry once
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await updateOrderStatus(order.id, newStatus, adminEmail);
          successCount++;
        } catch (retryError) {
          failCount++;
          failedOrders.push(order.order_number);
        }
      }
    }

    await loadOrders();
    setBulkProcessing(false);
    setSelectedIds(new Set());

    if (failCount === 0) {
      setBulkMessage({
        type: "success",
        message: `✓ ${successCount} order${successCount !== 1 ? "s" : ""} updated to ${newStatus}`,
      });
    } else {
      setBulkMessage({
        type: "error",
        message: `⚠ ${successCount} updated, ${failCount} failed: ${failedOrders.join(", ")}. Click to retry.`,
      });
    }

    setTimeout(() => setBulkMessage(null), 5000);
  };

  // ✅ PHASE 1: Bulk Export Selected
  const handleBulkExport = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    exportOrdersCSV(selectedOrders);
    setBulkMessage({
      type: "success",
      message: `✓ Exported ${selectedOrders.length} selected orders`,
    });
    setTimeout(() => setBulkMessage(null), 3000);
  };

  // ✅ PHASE 1: Bulk Print (placeholder for now)
  // ✅ PHASE 3: Bulk Print with Dialog
  const handleBulkPrint = () => {
    setPrintDialog({ open: true, type: null, merged: true });
  };

  const executeBulkPrint = async (type: "invoice" | "packing", merged: boolean) => {
    const selectedOrderIds = Array.from(selectedIds);
    setPrintDialog({ open: false, type: null, merged: true });
    setBulkProcessing(true);
    setBulkMessage(null);

    try {
      let result;
      if (type === "invoice") {
        result = await generateBulkInvoices(selectedOrderIds, merged);
      } else {
        result = await generateBulkPackingSlips(selectedOrderIds, merged);
      }

      if (!result.success) {
        setBulkMessage({ type: "error", message: `Failed to generate ${type}s: ${result.error}` });
        setBulkProcessing(false);
        return;
      }

      // Download PDFs - direct download without opening
      if (merged && result.pdf) {
        // Single merged PDF - convert from base64
        const binaryString = atob(result.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Use application/octet-stream to force download instead of opening
        const blob = new Blob([bytes], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bulk-${type}s-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (result.pdfs) {
        // Separate PDFs - download each without opening
        result.pdfs.forEach(({ orderNumber, pdf }, index) => {
          setTimeout(() => {
            // Convert from base64
            const binaryString = atob(pdf);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            // Use application/octet-stream to force download
            const blob = new Blob([bytes], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-${orderNumber}.pdf`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, index * 200); // Stagger downloads to prevent browser blocking
        });
      }

      setBulkMessage({
        type: "success",
        message: `✓ Generated ${selectedOrderIds.length} ${type}${selectedOrderIds.length !== 1 ? "s" : ""}`,
      });
      setSelectedIds(new Set());
    } catch (error) {
      setBulkMessage({
        type: "error",
        message: `Failed to generate ${type}s: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setBulkProcessing(false);
      setTimeout(() => setBulkMessage(null), 5000);
    }
  };

  // ✅ PHASE 1: Bulk Email (placeholder for now)
  const handleBulkEmail = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    alert(`Email functionality will send status updates to ${selectedOrders.length} customers.\n\nImplementing in later phase with email templates.`);
  };

  // ✅ PHASE 1: Bulk Delete Handler
  const handleBulkDelete = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    setConfirmDelete({
      open: true,
      ids: selectedOrders.map((o) => o.id),
      orderNumbers: selectedOrders.map((o) => o.order_number),
    });
  };

  // ✅ PHASE 1: Confirm Delete Handler
  const confirmDeleteOrders = async () => {
    setBulkProcessing(true);
    try {
      await bulkDeleteOrders(confirmDelete.ids);
      setBulkMessage({
        type: "success",
        message: `✓ ${confirmDelete.ids.length} order${confirmDelete.ids.length !== 1 ? "s" : ""} deleted permanently`,
      });
      setSelectedIds(new Set());
      await loadOrders();
    } catch (error) {
      setBulkMessage({
        type: "error",
        message: `⚠ Failed to delete orders: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setBulkProcessing(false);
      setConfirmDelete({ open: false, ids: [], orderNumbers: [] });
      setTimeout(() => setBulkMessage(null), 5000);
    }
  };

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Orders"
          subtitle={`${orders.length} total, ${pendingCount} pending`}
          actions={
            <AdminButton
              variant="outline"
              leadingIcon={<Download className="h-4 w-4" />}
              onClick={() => exportOrdersCSV(filtered)}
            >
              Export CSV
            </AdminButton>
          }
        />

        {/* Status tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => {
            const active = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setPage(1); }}
                className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--admin-primary)] text-white"
                    : "bg-[var(--admin-surface)] text-[var(--admin-text-soft)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]"
                }`}
              >
                {t}
                <span className={`ml-1.5 text-xs ${active ? "opacity-70" : "text-[var(--admin-text-muted)]"}`}>
                  {tabCount(t)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="search"
              placeholder="Search order #, tracking, customer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)] sm:w-96"
            />
          </div>
          <span className="text-sm text-[var(--admin-text-muted)]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ✅ PHASE 1 + PHASE 2: Collapsible Filter Panel */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--admin-primary)] text-[11px] font-bold text-white">
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <AdminCard className="mt-3">
              <div className="space-y-6">
                {/* ✅ PHASE 1: Date Range Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">📅 Date Range</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={dateFilter.from}
                      onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                      className="h-10 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                    <span className="text-sm text-[var(--admin-text-muted)]">to</span>
                    <input
                      type="date"
                      value={dateFilter.to}
                      onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                      className="h-10 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={() => setDateShortcut("today")} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]">
                      Today
                    </button>
                    <button onClick={() => setDateShortcut("yesterday")} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]">
                      Yesterday
                    </button>
                    <button onClick={() => setDateShortcut("thisWeek")} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]">
                      This Week
                    </button>
                    <button onClick={() => setDateShortcut("last7")} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]">
                      Last 7 Days
                    </button>
                    <button onClick={() => setDateShortcut("last30")} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]">
                      Last 30 Days
                    </button>
                  </div>
                </div>

                {/* ✅ PHASE 2: Payment Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">💳 Payment Method</label>
                    <select
                      value={advancedFilters.paymentMethod}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, paymentMethod: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    >
                      <option value="All">All Methods</option>
                      <option value="COD">COD (Cash on Delivery)</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">💰 Payment Status</label>
                    <select
                      value={advancedFilters.paymentStatus}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, paymentStatus: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    >
                      <option value="All">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="COLLECTED">Collected</option>
                    </select>
                  </div>
                </div>

                {/* ✅ PHASE 2: Location & Amount Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">📍 City</label>
                    <input
                      type="text"
                      placeholder="e.g. Karachi, Lahore..."
                      value={advancedFilters.city}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, city: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">💵 Min Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={advancedFilters.minAmount}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, minAmount: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">💵 Max Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={advancedFilters.maxAmount}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxAmount: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>
                </div>

                {/* ✅ PHASE 2: Courier Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">🚚 Courier</label>
                  <select
                    value={advancedFilters.courier}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, courier: e.target.value })}
                    className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)] md:w-64"
                  >
                    <option value="All">All Couriers</option>
                    <option value="TCS">TCS</option>
                    <option value="Leopards">Leopards</option>
                    <option value="M&P">M&P (Pakistan Post)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* ✅ PHASE 2: Clear All Filters Button */}
                {getActiveFilterCount() > 0 && (
                  <div className="border-t border-[var(--admin-border)] pt-4">
                    <button
                      onClick={handleClearAllFilters}
                      className="flex items-center gap-2 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-danger)] hover:text-white hover:border-[var(--admin-danger)]"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters ({getActiveFilterCount()})
                    </button>
                  </div>
                )}
              </div>
            </AdminCard>
          )}
        </div>

        {/* Table */}
        <AdminCard padded={false} className="mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--admin-primary)]"
                      checked={paginated.length > 0 && paginated.every((o) => selectedIds.has(o.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">Order / Tracking</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold text-center">Items</th>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Pay. Status</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-5" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-28" /><div className="skeleton mt-2 h-4 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-32" /><div className="skeleton mt-2 h-4 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                      <td className="px-5 py-5 text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                      <td className="px-5 py-5 text-right"><div className="skeleton ml-auto h-5 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-16" /></td>
                    </tr>
                  ))
                ) : paginated.map((o) => {
                  const date = new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
                  const statusColor = STATUS_COLORS[o.status] ?? { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
                  return (
                    <tr key={o.id} className="h-14 transition-colors hover:bg-[var(--admin-surface-alt)]">
                      <td className="px-5 py-5">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[var(--admin-primary)]"
                          checked={selectedIds.has(o.id)}
                          onChange={(e) => handleRowSelect(o.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm font-medium text-[var(--admin-text)]">{o.order_number}</div>
                        <div className="mt-0.5 font-mono text-xs text-[var(--admin-text-muted)]">{o.tracking_number ?? "No tracking"}</div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm font-medium text-[var(--admin-text)]">{o.customer_name}</div>
                        <div className="text-xs text-[var(--admin-text-muted)]">{getCity(o.address)}</div>
                      </td>
                      <td className="px-5 py-5 text-sm text-[var(--admin-text-soft)]">{date}</td>
                      <td className="px-5 py-5 text-center text-sm text-[var(--admin-text-soft)]">{o.order_items?.length ?? 0}</td>
                      <td className="px-5 py-5">
                        <span className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-2.5 py-1 text-xs font-medium text-[var(--admin-text-soft)]">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <StatusPill tone={PAYMENT_TONE[o.payment_status.toLowerCase()] ?? "neutral"}>
                          {o.payment_status}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-5">
                        {/* ✅ PHASE 1: Custom Colored Status Pill */}
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-right text-sm font-medium text-[var(--admin-text)]">{formatPrice(o.total)}</td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/admin/orders/${o.id}`}>
                            <AdminButton variant="outline" size="sm" leadingIcon={<Eye className="h-3.5 w-3.5" />}>
                              View
                            </AdminButton>
                          </Link>
                          <AdminButton variant="ghost" size="sm" onClick={() => setSelected(o)}>
                            Quick update
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-14 text-center text-sm text-[var(--admin-text-muted)]">
                      No orders match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3">
            <span className="text-sm text-[var(--admin-text-muted)]">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
            </span>
            <div className="flex items-center gap-1">
              <AdminButton
                variant="outline"
                size="sm"
                leadingIcon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Prev
              </AdminButton>
              <span className="px-3 text-sm text-[var(--admin-text-soft)]">
                Page {safePage} of {totalPages}
              </span>
              <AdminButton
                variant="outline"
                size="sm"
                trailingIcon={<ChevronRight className="h-4 w-4" />}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      </div>

      {selected && (
        <OrderDetailPanel
          order={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          loadOrders={loadOrders}
          adminEmail={adminEmail}
        />
      )}

      {/* ✅ PHASE 1: Bulk Action Bar (Fixed Bottom) - CONTRAST FIXED */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="rounded-lg bg-[#111827] px-6 py-4 shadow-lift">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">
                {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""} selected
              </span>

              {bulkProcessing ? (
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleBulkStatusUpdate("processing")}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("dispatched")}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Mark as Dispatched
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("delivered")}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Mark as Delivered
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("cancelled")}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <div className="mx-1 h-6 w-px bg-white/30" />

                  <button
                    onClick={handleBulkDelete}
                    className="rounded-md border border-red-400/50 bg-transparent px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
                  >
                    Delete
                  </button>

                  <div className="mx-1 h-6 w-px bg-white/30" />

                  <button
                    onClick={handleBulkExport}
                    className="flex items-center gap-1.5 rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button
                    onClick={handleBulkPrint}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Print
                  </button>
                  <button
                    onClick={handleBulkEmail}
                    className="rounded-md border border-white/30 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Email
                  </button>

                  <div className="mx-1 h-6 w-px bg-white/30" />

                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ PHASE 1: Bulk Message Toast */}
      {bulkMessage && (
        <div
          className={`fixed right-6 top-6 z-50 max-w-md rounded-lg px-6 py-4 shadow-lift ${
            bulkMessage.type === "success"
              ? "bg-[var(--admin-success)] text-white"
              : "bg-[var(--admin-danger)] text-white"
          }`}
        >
          <div className="flex items-start gap-3">
            {bulkMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <X className="h-5 w-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{bulkMessage.message}</p>
            <button
              onClick={() => setBulkMessage(null)}
              className="ml-auto shrink-0 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ PHASE 1: Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title={`Delete ${confirmDelete.ids.length} Order${confirmDelete.ids.length !== 1 ? "s" : ""}?`}
        description={
          <>
            <p className="mb-3">You are about to permanently delete the following order{confirmDelete.ids.length !== 1 ? "s" : ""}:</p>
            <ul className="mb-3 max-h-32 overflow-y-auto rounded border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-3">
              {confirmDelete.orderNumbers.map((num) => (
                <li key={num} className="text-sm font-mono text-[var(--admin-text)]">• {num}</li>
              ))}
            </ul>
            <p className="font-semibold text-[var(--admin-danger)]">
              ⚠️ This action CANNOT be undone. All order data will be lost forever.
            </p>
          </>
        }
        confirmLabel="Yes, Delete Permanently"
        destructive
        onCancel={() => setConfirmDelete({ open: false, ids: [], orderNumbers: [] })}
        onConfirm={confirmDeleteOrders}
      />

      {/* ✅ PHASE 3: Bulk Print Dialog */}
      {printDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[var(--admin-radius)] bg-[var(--admin-surface)] p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">
              Print {selectedIds.size} Order{selectedIds.size !== 1 ? "s" : ""}
            </h2>
            <p className="mt-2 text-[15px] text-[var(--admin-text-soft)]">
              Choose what to print and how to generate the PDFs:
            </p>

            <div className="mt-4 space-y-3">
              {/* Document Type Selection */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  Document Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => executeBulkPrint("invoice", printDialog.merged)}
                    className="flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]"
                  >
                    <div className="font-semibold">Invoices</div>
                    <div className="mt-0.5 text-xs text-[var(--admin-text-muted)]">With prices</div>
                  </button>
                  <button
                    onClick={() => executeBulkPrint("packing", printDialog.merged)}
                    className="flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-alt)]"
                  >
                    <div className="font-semibold">Packing Slips</div>
                    <div className="mt-0.5 text-xs text-[var(--admin-text-muted)]">No prices</div>
                  </button>
                </div>
              </div>

              {/* Merge Option */}
              {selectedIds.size > 1 && (
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPrintDialog({ ...printDialog, merged: true })}
                      className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                        printDialog.merged
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]"
                          : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]"
                      }`}
                    >
                      Single PDF
                    </button>
                    <button
                      onClick={() => setPrintDialog({ ...printDialog, merged: false })}
                      className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                        !printDialog.merged
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]"
                          : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)]"
                      }`}
                    >
                      Separate PDFs
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                    {printDialog.merged
                      ? "All orders in one file"
                      : `${selectedIds.size} separate files`}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <AdminButton
                variant="outline"
                onClick={() => setPrintDialog({ open: false, type: null, merged: true })}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
  onStatusUpdate,
  loadOrders,
  adminEmail,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  loadOrders: () => void;
  adminEmail: string;
}) {
  const [note,          setNote]          = useState(order.admin_note ?? "");
  const [saving,        setSaving]        = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // ✅ PHASE 1: Edit Customer Details State
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    address: typeof order.address === "object" && !Array.isArray(order.address)
      ? (order.address as Record<string, string>)
      : { street: "", apartment: "", city: "", province: "", postalCode: "", country: "Pakistan" },
  });

  const saveNote = async () => {
    setSaving(true);
    await updateOrder(order.id, { admin_note: note }, adminEmail);
    setSaving(false);
  };

  // ✅ PHASE 1: Save Customer Details Handler
  const saveCustomerDetails = async () => {
    setSaving(true);
    try {
      await updateOrder(order.id, {
        customer_name: customerForm.name,
        customer_email: customerForm.email,
        customer_phone: customerForm.phone,
        address: customerForm.address,
      }, adminEmail);
      setEditingCustomer(false);
      loadOrders();
    } catch (error) {
      alert(`Failed to update customer details: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const date = new Date(order.created_at).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="flex-1 bg-black/40" onClick={onClose} />
        <div className="flex w-full max-w-2xl flex-col bg-[var(--admin-surface)] shadow-xl">

          {/* Header */}
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--admin-text)]">{order.order_number}</h2>
              <StatusPill tone={STATUS_TONE[order.status] ?? "neutral"}>
                {order.status}
              </StatusPill>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* ✅ PHASE 1: Customer Details (Editable) */}
            <AdminCard as="section">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Customer</div>
                {!editingCustomer && (
                  <button
                    onClick={() => setEditingCustomer(true)}
                    className="text-xs font-medium text-[var(--admin-primary)] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingCustomer ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Name</label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Email</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Phone</label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Street Address</label>
                    <input
                      type="text"
                      value={customerForm.address.street || ""}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, street: e.target.value } })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Apartment / Suite (Optional)</label>
                    <input
                      type="text"
                      value={customerForm.address.apartment || ""}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, apartment: e.target.value } })}
                      className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">City</label>
                      <input
                        type="text"
                        value={customerForm.address.city || ""}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, city: e.target.value } })}
                        className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Province</label>
                      <input
                        type="text"
                        value={customerForm.address.province || ""}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, province: e.target.value } })}
                        className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Postal Code</label>
                      <input
                        type="text"
                        value={customerForm.address.postalCode || ""}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, postalCode: e.target.value } })}
                        className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--admin-text)]">Country</label>
                      <input
                        type="text"
                        value={customerForm.address.country || "Pakistan"}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: { ...customerForm.address, country: e.target.value } })}
                        className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm outline-none focus:border-[var(--admin-primary)]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <AdminButton
                      variant="primary"
                      size="sm"
                      onClick={saveCustomerDetails}
                      loading={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </AdminButton>
                    <AdminButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(false);
                        setCustomerForm({
                          name: order.customer_name,
                          email: order.customer_email,
                          phone: order.customer_phone,
                          address: typeof order.address === "object" && !Array.isArray(order.address)
                            ? (order.address as Record<string, string>)
                            : { street: "", apartment: "", city: "", province: "", postalCode: "", country: "Pakistan" },
                        });
                      }}
                    >
                      Cancel
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-base font-medium text-[var(--admin-text)]">{order.customer_name}</div>
                  <div className="flex items-center gap-2 text-sm text-[var(--admin-text-soft)]">
                    <Mail className="h-4 w-4 text-[var(--admin-text-muted)]" /> {order.customer_email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--admin-text-soft)]">
                    <Phone className="h-4 w-4 text-[var(--admin-text-muted)]" /> {order.customer_phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[var(--admin-text-soft)]">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] mt-0.5" />
                    <span>{getAddr(order.address)}</span>
                  </div>
                </div>
              )}
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Payment</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm font-medium text-[var(--admin-text)]">{order.payment_method}</span>
                </div>
                <StatusPill tone={PAYMENT_TONE[order.payment_status.toLowerCase()] ?? "neutral"}>
                  {order.payment_status}
                </StatusPill>
              </div>
            </AdminCard>

            {/* ✅ PHASE 1: Order Items with Product Images */}
            <AdminCard padded={false} as="section">
              <div className="px-5 pt-4 pb-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)] flex items-center gap-2">
                <Package className="h-4 w-4" /> Items ({order.order_items?.length ?? 0})
              </div>
              <ul className="divide-y divide-[var(--admin-border)]">
                {(order.order_items ?? []).map((item) => (
                  <li key={item.id} className="flex items-start gap-4 px-5 py-3">
                    {/* Product Image (50px thumbnail) */}
                    <div
                      className="relative h-14 w-11 shrink-0 overflow-hidden rounded"
                      style={{ background: "var(--admin-surface-alt)" }}
                    >
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_title}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5" style={{ color: "var(--admin-text-muted)" }} />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="line-clamp-2 text-sm font-medium text-[var(--admin-text)] leading-snug">
                        {item.product_title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                        {item.size && (
                          <span className="inline-flex items-center rounded bg-[var(--admin-surface-alt)] px-2 py-0.5 font-semibold">
                            Size: {item.size}
                          </span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-sm font-medium text-[var(--admin-text)]">
                      {formatPrice(item.total_price)}
                    </div>
                  </li>
                ))}
                {(!order.order_items || order.order_items.length === 0) && (
                  <li className="px-5 py-3 text-sm text-[var(--admin-text-muted)]">No items recorded.</li>
                )}
              </ul>
            </AdminCard>

            <AdminCard as="section" className="bg-[var(--admin-text)]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-white uppercase tracking-wide">Grand Total</span>
                  <span className="text-2xl font-semibold text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <ClipboardList className="h-4 w-4" /> Order info
              </div>
              <div className="text-sm text-[var(--admin-text-soft)]">
                Placed: {date}
                {order.courier && <div className="mt-1">Courier: {order.courier}</div>}
              </div>
            </AdminCard>

            <AdminCard as="section">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <MessageSquare className="h-4 w-4" /> Admin notes
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an internal note about this order…"
                className="w-full resize-none rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 py-2.5 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
              />
              <div className="mt-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={saveNote}
                  loading={saving}
                >
                  {saving ? "Saving…" : "Save note"}
                </AdminButton>
              </div>
            </AdminCard>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--admin-border)] px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {order.status === "pending" && (
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "processing")}
                >
                  Process
                </AdminButton>
              )}
              {order.status === "processing" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "dispatched")}
                >
                  Mark as shipped
                </AdminButton>
              )}
              {order.status === "dispatched" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, "delivered")}
                >
                  Mark Delivered
                </AdminButton>
              )}
              {(order.status === "pending" || order.status === "processing") && (
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel order
                </AdminButton>
              )}
              <AdminButton variant="outline" size="sm" onClick={() => window.print()}>
                Print
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Cancel this order?"
        description="The order will be marked as cancelled. This cannot be undone."
        confirmLabel="Yes, cancel order"
        destructive
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          await updateOrderStatus(order.id, "cancelled", adminEmail);
          setConfirmCancel(false);
          onClose();
          loadOrders();
        }}
      />
    </>
  );
}
