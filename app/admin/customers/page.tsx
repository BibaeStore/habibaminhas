"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Mail, Phone, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCustomers, getCustomerStats, updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Customer = Tables<"customers">;

const tierStyle: Record<string, { bg: string; text: string }> = {
  VIP:     { bg: "bg-gold/30",   text: "text-gold-dark" },
  Regular: { bg: "bg-sage/15",   text: "text-sage" },
  New:     { bg: "bg-border-soft", text: "text-ink-soft" },
};

type Stats = { total: number; vip: number; newThisMonth: number; avgLifetimeValue: number };

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

  return (
    <AdminShell title="Customers">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-4">
                <div className="text-sm tracking-[0.22em] text-muted">{s.label}</div>
                <div className="mt-1.5 font-display text-3xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input type="search" placeholder="Search by name, email, phone…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full border border-border-soft bg-ivory pl-9 pr-3 text-base outline-none focus:border-ink sm:w-72" />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-12 items-center gap-2 border border-border-soft bg-ivory px-4 text-sm uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Filter className="h-5 w-5" /> Filter
              </button>
              <button className="flex h-12 items-center gap-2 border border-border-soft bg-ivory px-4 text-sm uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Download className="h-5 w-5" /> Export
              </button>
            </div>
          </div>

          {/* Bulk delete bar */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-4 border-2 border-sale/30 bg-sale/5 px-5 py-4">
              <span className="text-base font-semibold text-ink">
                {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <button onClick={async () => {
                if (!confirm(`Delete ${selectedIds.size} item(s)?`)) return;
                setBulkDeleting(true);
                for (const id of selectedIds) { await deleteCustomer(id); }
                setSelectedIds(new Set());
                setBulkDeleting(false);
                loadData();
              }} disabled={bulkDeleting}
                className="flex h-12 items-center gap-2 bg-sale px-6 text-base font-semibold text-ivory hover:opacity-90 disabled:opacity-60">
                <Trash2 className="h-5 w-5" /> {bulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-base text-ink-soft hover:text-ink">
                Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div className="mt-4 border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">
                      <input type="checkbox" className="h-5 w-5 accent-ink cursor-pointer"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll} />
                    </th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Contact</th>
                    <th className="px-5 py-4 font-medium">City</th>
                    <th className="px-5 py-4 font-medium text-right">Orders</th>
                    <th className="px-5 py-4 font-medium text-right">Total spent</th>
                    <th className="px-5 py-4 font-medium">Joined</th>
                    <th className="px-5 py-4 font-medium">Tier</th>
                    <th className="px-5 py-4 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
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
                    const s = tierStyle[c.tier] ?? tierStyle.New;
                    const joined = new Date(c.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" });
                    return (
                      <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-5">
                          <input type="checkbox" className="h-5 w-5 accent-ink cursor-pointer"
                            checked={selectedIds.has(c.id)}
                            onChange={() => toggleSelect(c.id)} />
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-cream font-display text-lg italic text-gold-dark">
                              {c.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-base font-medium">{c.name}</div>
                              <div className="text-sm text-muted truncate max-w-[160px]">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                            <Mail className="h-5 w-5 text-muted" /> {c.email}
                          </div>
                          {c.phone && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                              <Phone className="h-5 w-5 text-muted" /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-base text-ink-soft">{c.city ?? "—"}</td>
                        <td className="px-5 py-5 text-right text-base">{c.total_orders}</td>
                        <td className="px-5 py-5 text-right text-base font-medium">{formatPrice(c.total_spent)}</td>
                        <td className="px-5 py-5 text-base text-ink-soft">{joined}</td>
                        <td className="px-5 py-5">
                          <span className={`px-2.5 py-1 text-sm uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            {c.tier}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openEdit(c)}
                              className="flex h-10 items-center gap-2 px-3 text-sm bg-gold/20 text-gold-dark hover:bg-gold-dark hover:text-ivory transition-colors" title="Edit">
                              <Pencil className="h-5 w-5" /> Edit
                            </button>
                            <button onClick={() => setDeleteTarget(c)}
                              className="flex h-10 items-center gap-2 px-3 text-sm bg-sale/10 text-sale hover:bg-sale hover:text-ivory transition-colors" title="Delete">
                              <Trash2 className="h-5 w-5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-14 text-center text-base text-muted">
                        {search ? "No customers match your search." : "No customers yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-base text-muted">Showing {filtered.length} of {customers.length} customers</span>
            </div>
          </div>
        </div>

      {/* Edit Customer Dialog */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-md bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
              <h2 className="font-display text-2xl italic">Edit Customer</h2>
              <button onClick={() => setEditTarget(null)} className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm uppercase tracking-[0.22em] text-muted">Full Name</span>
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm uppercase tracking-[0.22em] text-muted">Email</span>
                <input defaultValue={editTarget.email} readOnly
                  className="h-12 border border-border-soft bg-cream px-3 text-base text-muted outline-none cursor-not-allowed" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm uppercase tracking-[0.22em] text-muted">Phone Number</span>
                <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setEditTarget(null)} className="h-12 border border-border-soft px-5 text-sm uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="h-12 bg-ink px-6 text-sm uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm bg-ivory shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-sale/10">
                <AlertTriangle className="h-7 w-7 text-sale" />
              </div>
              <h2 className="font-display text-2xl italic">Delete account?</h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                This will permanently delete <strong>{deleteTarget.name}&apos;s</strong> account and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setDeleteTarget(null)} className="h-12 border border-border-soft px-5 text-sm uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="h-12 bg-sale px-6 text-sm uppercase tracking-[0.2em] text-ivory transition-colors hover:opacity-90 disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
