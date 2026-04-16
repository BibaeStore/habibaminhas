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

  return (
    <AdminShell title="Customers">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{s.label}</div>
                <div className="mt-1.5 font-display text-2xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input type="search" placeholder="Search by name, email, phone…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink sm:w-72" />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                    </th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Contact</th>
                    <th className="px-5 py-3 font-medium">City</th>
                    <th className="px-5 py-3 font-medium text-right">Orders</th>
                    <th className="px-5 py-3 font-medium text-right">Total spent</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Tier</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-14 text-center text-[12px] text-muted">Loading customers…</td>
                    </tr>
                  ) : filtered.map((c) => {
                    const s = tierStyle[c.tier] ?? tierStyle.New;
                    const joined = new Date(c.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" });
                    return (
                      <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-4">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-cream font-display text-[13px] italic text-gold-dark">
                              {c.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[12px] font-medium">{c.name}</div>
                              <div className="text-[11px] text-muted truncate max-w-[160px]">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                            <Mail className="h-3 w-3 text-muted" /> {c.email}
                          </div>
                          {c.phone && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
                              <Phone className="h-3 w-3 text-muted" /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{c.city ?? "—"}</td>
                        <td className="px-5 py-4 text-right text-[12px]">{c.total_orders}</td>
                        <td className="px-5 py-4 text-right text-[12px] font-medium">{formatPrice(c.total_spent)}</td>
                        <td className="px-5 py-4 text-[12px] text-ink-soft">{joined}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${s.bg} ${s.text}`}>
                            {c.tier}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openEdit(c)}
                              className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-gold-dark" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget(c)}
                              className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-sale" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-14 text-center text-[12px] text-muted">
                        {search ? "No customers match your search." : "No customers yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">Showing {filtered.length} of {customers.length} customers</span>
            </div>
          </div>
        </div>

      {/* Edit Customer Dialog */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-md bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
              <h2 className="font-display text-xl italic">Edit Customer</h2>
              <button onClick={() => setEditTarget(null)} className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Full Name</span>
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email</span>
                <input defaultValue={editTarget.email} readOnly
                  className="h-10 border border-border-soft bg-cream px-3 text-[13px] text-muted outline-none cursor-not-allowed" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Phone Number</span>
                <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setEditTarget(null)} className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="h-10 bg-ink px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60">
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
                <AlertTriangle className="h-6 w-6 text-sale" />
              </div>
              <h2 className="font-display text-xl italic">Delete account?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                This will permanently delete <strong>{deleteTarget.name}&apos;s</strong> account and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setDeleteTarget(null)} className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="h-10 bg-sale px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:opacity-90 disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
