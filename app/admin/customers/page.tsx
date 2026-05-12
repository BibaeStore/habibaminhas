"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Download, Mail, Phone, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusPill, type StatusTone } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import { getCustomers, getCustomerStats, updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Customer = Tables<"customers">;

const TIER_TONE: Record<string, StatusTone> = {
  VIP:     "warning",
  Regular: "success",
  New:     "neutral",
};

type Stats = { total: number; vip: number; newThisMonth: number; avgLifetimeValue: number };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function AdminCustomersPage() {
  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [editTarget,   setEditTarget]   = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [editForm,     setEditForm]     = useState({ name: "", phone: "" });
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([getCustomers(), getCustomerStats()])
      .then(([custs, s]) => { setCustomers(custs); setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() =>
    customers.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.email.toLowerCase().includes(q) ||
             (c.phone ?? "").toLowerCase().includes(q);
    }),
    [customers, search]
  );

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setEditForm({ name: c.name, phone: c.phone ?? "" });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    await updateCustomer(editTarget.id, { name: editForm.name.trim(), phone: editForm.phone.trim() || null });
    setSaving(false);
    setEditTarget(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteCustomer(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    loadData();
  };

  const statCards = [
    { label: "Total customers",    value: stats ? String(stats.total)                  : "—" },
    { label: "VIP customers",      value: stats ? String(stats.vip)                    : "—" },
    { label: "New this month",     value: stats ? String(stats.newThisMonth)            : "—" },
    { label: "Avg. lifetime value",value: stats ? formatPrice(stats.avgLifetimeValue)   : "—" },
  ];

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const newThisMonth = stats?.newThisMonth ?? 0;

  return (
    <AdminShell title="Customers">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Customers"
          subtitle={`${customers.length} total${newThisMonth ? `, ${newThisMonth} new this month` : ""}`}
        />

        {/* Summary stat tiles */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <AdminCard key={s.label}>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">{s.label}</div>
              <div className="mt-1.5 text-3xl font-semibold text-[var(--admin-text)]">{s.value}</div>
            </AdminCard>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="search"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)] sm:w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="outline"
              leadingIcon={<Download className="h-4 w-4" />}
              onClick={() => {
                const headers = ["Name", "Email", "Phone", "City", "Orders", "Total Spent", "Tier", "Joined"];
                const rows = filtered.map((c) => [
                  c.name, c.email, c.phone ?? "", c.city ?? "",
                  c.total_orders, c.total_spent,
                  c.tier, new Date(c.created_at).toLocaleDateString("en-PK"),
                ]);
                const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </AdminButton>
          </div>
        </div>

        {/* Bulk delete bar */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-4 rounded-[var(--admin-radius)] border border-red-200 bg-red-50 px-5 py-3">
            <span className="text-sm font-semibold text-[var(--admin-text)]">
              {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <AdminButton
              variant="danger"
              size="sm"
              leadingIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmBulkDelete(true)}
              disabled={bulkDeleting}
              loading={bulkDeleting}
            >
              {bulkDeleting ? "Deleting..." : "Delete Selected"}
            </AdminButton>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        <AdminCard padded={false} className="mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--admin-primary)] cursor-pointer"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">City</th>
                  <th className="px-5 py-4 font-semibold text-right">Orders</th>
                  <th className="px-5 py-4 font-semibold text-right">Total spent</th>
                  <th className="px-5 py-4 font-semibold">Joined</th>
                  <th className="px-5 py-4 font-semibold">Tier</th>
                  <th className="px-5 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-5" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-32" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-40" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-10 ml-auto" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-20 ml-auto" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-14" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.map((c) => {
                  const tone = TIER_TONE[c.tier] ?? "neutral";
                  const joined = new Date(c.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" });
                  return (
                    <tr key={c.id} className="h-14 transition-colors hover:bg-[var(--admin-surface-alt)]">
                      <td className="px-5">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[var(--admin-primary)] cursor-pointer"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </td>
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-bold text-[var(--admin-primary)]">
                            {initials(c.name)}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--admin-text)]">{c.name}</div>
                            <div className="text-xs text-[var(--admin-text-muted)] truncate max-w-[160px]">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5">
                        <div className="flex items-center gap-1.5 text-sm text-[var(--admin-text-soft)]">
                          <Mail className="h-4 w-4 text-[var(--admin-text-muted)]" /> {c.email}
                        </div>
                        {c.phone && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--admin-text-soft)]">
                            <Phone className="h-4 w-4 text-[var(--admin-text-muted)]" /> {c.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-5 text-sm text-[var(--admin-text-soft)]">{c.city ?? "—"}</td>
                      <td className="px-5 text-right text-sm text-[var(--admin-text)]">{c.total_orders}</td>
                      <td className="px-5 text-right text-sm font-medium text-[var(--admin-text)]">{formatPrice(c.total_spent)}</td>
                      <td className="px-5 text-sm text-[var(--admin-text-soft)]">{joined}</td>
                      <td className="px-5">
                        <StatusPill tone={tone}>{c.tier}</StatusPill>
                      </td>
                      <td className="px-5">
                        <div className="flex items-center gap-1.5">
                          <AdminButton
                            variant="outline"
                            size="sm"
                            leadingIcon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => openEdit(c)}
                          >
                            Edit
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            size="sm"
                            leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setDeleteTarget(c)}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-sm text-[var(--admin-text-muted)]">
                      {search ? "No customers match your search." : "No customers yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3">
            <span className="text-sm text-[var(--admin-text-muted)]">
              Showing {filtered.length} of {customers.length} customers
            </span>
          </div>
        </AdminCard>
      </div>

      {/* Edit Customer Dialog */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-[var(--admin-surface)] shadow-xl rounded-[var(--admin-radius)]">
            <div className="flex h-[72px] items-center justify-between border-b border-[var(--admin-border)] px-6">
              <h2 className="text-xl font-semibold text-[var(--admin-text)]">Edit Customer</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Full Name</span>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Email</span>
                <input
                  defaultValue={editTarget.email}
                  readOnly
                  className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 text-sm text-[var(--admin-text-muted)] outline-none cursor-not-allowed"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Phone Number</span>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[var(--admin-border)] px-6 py-4">
              <AdminButton variant="outline" size="sm" onClick={() => setEditTarget(null)}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" size="sm" onClick={handleSaveEdit} disabled={saving} loading={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete account?"
        description={deleteTarget ? `This will permanently delete ${deleteTarget.name}'s account and all associated data. This action cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting…" : "Delete Account"}
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        open={confirmBulkDelete}
        title={`Delete ${selectedIds.size} customer${selectedIds.size > 1 ? "s" : ""}?`}
        description="This will permanently delete the selected accounts and all associated data. This action cannot be undone."
        confirmLabel={bulkDeleting ? "Deleting..." : "Delete Selected"}
        destructive
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={async () => {
          setBulkDeleting(true);
          setConfirmBulkDelete(false);
          for (const id of selectedIds) { await deleteCustomer(id); }
          setSelectedIds(new Set());
          setBulkDeleting(false);
          loadData();
        }}
      />
    </AdminShell>
  );
}
