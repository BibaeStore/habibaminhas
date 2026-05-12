"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, Eye, X, Check, Upload,
  Search, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
import {
  getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage,
} from "@/lib/actions/categories";
import type { Tables } from "@/lib/supabase/types";

type Category = Tables<"categories">;

const PAGE_SIZE = 15;

type FormState = {
  name: string; slug: string; color: string | null;
  type: string; parent_id: string | null;
  status: string; sort_order: number;
  nav_href: string | null;
  seo_title: string | null; seo_desc: string | null;
  image: string | null;
};

const BLANK: FormState = {
  name: "", slug: "", color: "#f0ece4", type: "sub",
  parent_id: null, status: "active", sort_order: 1,
  nav_href: "",
  seo_title: "", seo_desc: "", image: null,
};

export default function AdminCategoriesPage() {
  const [cats,         setCats]         = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState<"all" | "main" | "sub" | "featured">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page,         setPage]         = useState(1);
  const [viewCat,      setViewCat]      = useState<Category | null>(null);
  const [editCat,      setEditCat]      = useState<Category | null>(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form,         setForm]         = useState<FormState>(BLANK);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadCats = () => {
    setLoading(true);
    getCategories().then((data) => { setCats(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadCats(); }, []);

  const filtered = useMemo(() => cats.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.slug.includes(search.toLowerCase())) return false;
    if (typeFilter   !== "all" && c.type   !== typeFilter)   return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  }), [cats, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openAdd = () => { setForm({ ...BLANK }); setAddOpen(true); };
  const openEdit = (c: Category) => {
    setForm({
      name: c.name, slug: c.slug, color: c.color,
      type: c.type, parent_id: c.parent_id,
      status: c.status, sort_order: c.sort_order,
      nav_href: c.nav_href ?? "",
      seo_title: c.seo_title ?? "", seo_desc: c.seo_desc ?? "",
      image: c.image,
    });
    setEditCat(c);
  };

  const handleSaveAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createCategory({
        name: form.name.trim(), slug, color: form.color, type: form.type,
        parent_id: form.parent_id || null, status: form.status,
        sort_order: form.sort_order, nav_href: form.nav_href || null,
        seo_title: form.seo_title || null,
        seo_desc: form.seo_desc || null, image: form.image,
      });
      loadCats();
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCat) return;
    setSaving(true);
    try {
      await updateCategory(editCat.id, {
        name: form.name.trim(), slug: form.slug.trim(), color: form.color,
        type: form.type, parent_id: form.parent_id || null, status: form.status,
        sort_order: form.sort_order, nav_href: form.nav_href || null,
        seo_title: form.seo_title || null,
        seo_desc: form.seo_desc || null, image: form.image,
      });
      loadCats();
      setEditCat(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      loadCats();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (c: Category) => {
    const newStatus = c.status === "active" ? "inactive" : "active";
    await updateCategory(c.id, { status: newStatus });
    setCats((prev) => prev.map((x) => x.id === c.id ? { ...x, status: newStatus } : x));
  };

  const parentName = (parentId: string | null) => {
    if (!parentId) return "—";
    return cats.find((c) => c.id === parentId)?.name ?? "—";
  };

  const allPagedSelected = paged.length > 0 && paged.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allPagedSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((c) => c.id)));
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
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        <PageHeader
          title="Categories"
          subtitle={`${cats.length} total`}
          actions={
            <AdminButton
              variant="primary"
              leadingIcon={<Plus className="h-4 w-4" />}
              onClick={openAdd}
            >
              Add category
            </AdminButton>
          }
        />

        {/* Summary tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total categories", value: cats.length },
            { label: "Main categories",  value: cats.filter((c) => c.type === "main").length },
            { label: "Featured tiles",   value: cats.filter((c) => c.type === "featured").length },
            { label: "Inactive",         value: cats.filter((c) => c.status === "inactive").length },
          ].map((s) => (
            <AdminCard key={s.label} padded={false} className="p-4">
              <div className="text-[13px] text-[var(--admin-text-muted)]">{s.label}</div>
              <div className="mt-1 text-3xl font-semibold text-[var(--admin-text)]">{s.value}</div>
            </AdminCard>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-5 mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-9 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)] sm:w-56"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
            className="h-10 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
          >
            <option value="all">All Types</option>
            <option value="main">Main Category</option>
            <option value="sub">Subcategory</option>
            <option value="featured">Featured Tiles</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="h-10 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="ml-auto text-[14px] text-[var(--admin-text-muted)]">{filtered.length} categories</span>
        </div>

        {/* Bulk delete bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-5 py-3">
            <span className="text-[15px] font-semibold text-[var(--admin-text)]">
              {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <AdminButton
              variant="danger"
              size="sm"
              leadingIcon={<Trash2 className="h-4 w-4" />}
              disabled={bulkDeleting}
              loading={bulkDeleting}
              onClick={async () => {
                if (!confirm(`Delete ${selectedIds.size} item(s)?`)) return;
                setBulkDeleting(true);
                for (const id of selectedIds) { await deleteCategory(id); }
                setSelectedIds(new Set());
                setBulkDeleting(false);
                loadCats();
              }}
            >
              {bulkDeleting ? "Deleting..." : "Delete Selected"}
            </AdminButton>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-[14px] text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        <AdminCard padded={false} className="mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--admin-surface-alt)] text-[13px] font-semibold text-[var(--admin-text-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[var(--admin-primary)]"
                      checked={allPagedSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="w-14 px-5 py-3 font-medium">Image</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-center font-medium">Sort</th>
                  <th className="px-5 py-3 font-medium">Parent</th>
                  <th className="px-5 py-3 text-center font-medium">Products</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-4" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-14 w-14" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-28" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-16" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-10 mx-auto" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-20" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-10 mx-auto" /></td>
                      <td className="px-5 py-5"><div className="skeleton h-4 w-32 ml-auto" /></td>
                    </tr>
                  ))
                ) : paged.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[var(--admin-surface-alt)]">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-[var(--admin-primary)]"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface-alt)]">
                        {c.image ? (
                          <Image src={c.image} alt={c.name} fill sizes="56px" className="object-cover object-center" />
                        ) : (
                          <div className="h-full w-full" style={{ background: c.color ?? "#f0ece4" }} />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[15px] font-medium text-[var(--admin-text)]">{c.name}</div>
                      <div className="mt-0.5 font-mono text-[13px] text-[var(--admin-text-muted)]">/{c.slug}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                        c.type === "main"     ? "bg-[var(--admin-primary)] text-white" :
                        c.type === "featured" ? "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]" :
                        "border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] text-[var(--admin-text-soft)]"
                      }`}>
                        {c.type === "main" ? "Main" : c.type === "featured" ? "Featured" : "Sub"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium transition-colors ${
                          c.status === "active"
                            ? "bg-[var(--admin-success-soft)] text-[var(--admin-success)] hover:opacity-80"
                            : "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] hover:opacity-80"
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center text-[15px] tabular-nums text-[var(--admin-text-soft)]">{c.sort_order}</td>
                    <td className="px-5 py-4 text-[15px] text-[var(--admin-text-soft)]">{parentName(c.parent_id)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-[15px] font-medium tabular-nums ${c.product_count === 0 ? "text-[var(--admin-text-muted)]" : "text-[var(--admin-text)]"}`}>
                        {c.product_count}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminButton variant="ghost" size="sm" onClick={() => setViewCat(c)} title="View" leadingIcon={<Eye className="h-3.5 w-3.5" />}>
                          View
                        </AdminButton>
                        <AdminButton variant="outline" size="sm" onClick={() => openEdit(c)} title="Edit" leadingIcon={<Pencil className="h-3.5 w-3.5" />}>
                          Edit
                        </AdminButton>
                        <AdminButton variant="danger" size="sm" onClick={() => setDeleteTarget(c)} title="Delete" leadingIcon={<Trash2 className="h-3.5 w-3.5" />}>
                          Delete
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && paged.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-[15px] text-[var(--admin-text-muted)]">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3">
            <span className="text-[14px] text-[var(--admin-text-muted)]">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[14px] transition-colors ${
                    n === safePage
                      ? "bg-[var(--admin-primary)] text-white"
                      : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* View modal */}
      {viewCat && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="relative w-full max-w-lg rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Category Details</h2>
              <button
                onClick={() => setViewCat(null)}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="relative h-32 w-full overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface-alt)]">
                {viewCat.image
                  ? <Image src={viewCat.image} alt={viewCat.name} fill sizes="100%" className="object-cover object-center" />
                  : <div className="h-full w-full" style={{ background: viewCat.color ?? "#f0ece4" }} />
                }
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-[var(--admin-text)] flex-1">{viewCat.name}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${viewCat.type === "main" ? "bg-[var(--admin-primary)] text-white" : "border border-[var(--admin-border)] text-[var(--admin-text-soft)]"}`}>
                  {viewCat.type === "main" ? "Main" : "Sub"}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${viewCat.status === "active" ? "bg-[var(--admin-success-soft)] text-[var(--admin-success)]" : "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]"}`}>
                  {viewCat.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[15px]">
                {[
                  { label: "Slug",       val: `/${viewCat.slug}` },
                  { label: "Sort Order", val: String(viewCat.sort_order) },
                  { label: "Parent",     val: parentName(viewCat.parent_id) },
                  { label: "Products",   val: String(viewCat.product_count) },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-3">
                    <div className="text-[12px] font-semibold text-[var(--admin-text-muted)] mb-1">{label}</div>
                    <div className="font-mono text-[var(--admin-text)]">{val}</div>
                  </div>
                ))}
              </div>
              {viewCat.seo_title && (
                <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-3 text-[15px]">
                  <div className="text-[12px] font-semibold text-[var(--admin-text-muted)] mb-1">SEO Title</div>
                  <div className="text-[var(--admin-text)]">{viewCat.seo_title}</div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <AdminButton variant="outline" onClick={() => { setViewCat(null); openEdit(viewCat); }}>
                  Edit
                </AdminButton>
                <AdminButton variant="primary" onClick={() => setViewCat(null)}>
                  Close
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {(addOpen || editCat) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="relative w-full max-w-lg rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">{addOpen ? "Add Category" : "Edit Category"}</h2>
              <button
                onClick={() => { setAddOpen(false); setEditCat(null); }}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              <CategoryForm
                form={form}
                setForm={setForm}
                allCats={cats}
                saving={saving}
                onSave={addOpen ? handleSaveAdd : handleSaveEdit}
                onCancel={() => { setAddOpen(false); setEditCat(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        description="Products in this category will become uncategorized. This cannot be undone."
        confirmLabel="Delete category"
        destructive
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}

// ─── Category form ────────────────────────────────────────────────────────────

function CategoryForm({
  form, setForm, allCats, saving, onSave, onCancel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  allCats: Category[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", files[0]);
    const result = await uploadCategoryImage(fd);
    if (result.url) {
      set("image", result.url);
    } else {
      setUploadError(result.error ?? "Upload failed");
    }
    setUploading(false);
  };

  const isFeatured = form.type === "featured";

  const inputCls = "h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]";
  const labelCls = "mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Silk Suits"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug (URL identifier)</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="ladies-suits"
            className={`${inputCls} font-mono`}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Nav Link URL
          <span className="ml-2 font-normal text-[var(--admin-text-soft)] text-[13px]">
            — the page this item links to in the navbar
          </span>
        </label>
        <input
          value={form.nav_href ?? ""}
          onChange={(e) => set("nav_href", e.target.value || null)}
          placeholder="/ladies"
          className={`${inputCls} font-mono`}
        />
        <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
          e.g. <code>/ladies</code>, <code>/kids</code>, <code>/baby</code>. Leave blank to hide from nav.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className={inputCls}
          >
            <option value="main">Main Category</option>
            <option value="sub">Subcategory</option>
            <option value="featured">Featured (Homepage Tile)</option>
          </select>
        </div>
        {isFeatured ? (
          <div>
            <label className={labelCls}>Link URL</label>
            <input
              value={form.seo_desc ?? ""}
              onChange={(e) => set("seo_desc", e.target.value || null)}
              placeholder="/ladies"
              className={`${inputCls} font-mono`}
            />
          </div>
        ) : (
          <div>
            <label className={labelCls}>Parent Category</label>
            <select
              value={form.parent_id ?? ""}
              onChange={(e) => set("parent_id", e.target.value || null)}
              className={inputCls}
            >
              <option value="">— None (top level) —</option>
              {allCats.filter((c) => c.type !== "featured").map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Image upload */}
      <div>
        <div className="mb-1.5 text-[14px] font-semibold text-[var(--admin-text)]">
          Category Image {isFeatured && <span className="ml-1 font-normal text-[var(--admin-text-soft)]">(required for homepage tile)</span>}
        </div>
        {uploadError && <p className="mb-2 text-[13px] text-[var(--admin-danger)]">{uploadError}</p>}
        {form.image ? (
          <div className="group relative h-32 overflow-hidden rounded-[var(--admin-radius)] bg-[var(--admin-surface-alt)]">
            <Image src={form.image} alt="Preview" fill sizes="100%" className="object-cover object-center" />
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-[var(--admin-radius)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)] transition-colors">
                <Upload className="h-4 w-4" /> Replace
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => handleImageUpload(e.target.files)} />
              </label>
              <button
                type="button"
                onClick={() => set("image", null)}
                className="flex items-center gap-1.5 rounded-[var(--admin-radius)] bg-[var(--admin-danger)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-6 transition-colors hover:border-[var(--admin-primary)] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
            <Upload className={`h-5 w-5 ${uploading ? "animate-bounce text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]"}`} />
            <span className="text-[15px] text-[var(--admin-text-soft)]">{uploading ? "Uploading…" : "Click to upload image"}</span>
            <span className="text-[13px] text-[var(--admin-text-muted)]">PNG, JPG, WebP · recommended 3:4 ratio</span>
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => handleImageUpload(e.target.files)} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputCls}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            min={1}
            onChange={(e) => set("sort_order", parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </div>
      </div>

      {!isFeatured && (
        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--admin-text-muted)]" />
            <span className="text-[14px] font-semibold text-[var(--admin-text-muted)]">SEO</span>
          </div>
          <div>
            <label className={labelCls}>Meta Title</label>
            <input
              value={form.seo_title ?? ""}
              onChange={(e) => set("seo_title", e.target.value || null)}
              placeholder="Ladies Silk Suits | Habiba Minhas"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea
              rows={2}
              value={form.seo_desc ?? ""}
              onChange={(e) => set("seo_desc", e.target.value || null)}
              placeholder="Shop premium silk suits…"
              className="w-full resize-none rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <AdminButton variant="outline" onClick={onCancel} disabled={saving || uploading}>
          Cancel
        </AdminButton>
        <AdminButton
          variant="primary"
          onClick={onSave}
          disabled={saving || uploading}
          loading={saving}
          leadingIcon={<Check className="h-4 w-4" />}
        >
          {saving ? "Saving…" : "Save Category"}
        </AdminButton>
      </div>
    </div>
  );
}
