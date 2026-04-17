"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, Eye, X, Check, Upload,
  Search, ChevronLeft, ChevronRight, AlertTriangle, Layers,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
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
  seo_title: string | null; seo_desc: string | null;
  image: string | null;
};

const BLANK: FormState = {
  name: "", slug: "", color: "#f0ece4", type: "sub",
  parent_id: null, status: "active", sort_order: 1,
  seo_title: "", seo_desc: "", image: null,
};

export default function AdminCategoriesPage() {
  const [cats,         setCats]         = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState<"all" | "main" | "sub">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page,         setPage]         = useState(1);
  const [viewCat,      setViewCat]      = useState<Category | null>(null);
  const [editCat,      setEditCat]      = useState<Category | null>(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form,         setForm]         = useState<FormState>(BLANK);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

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
        sort_order: form.sort_order, seo_title: form.seo_title || null,
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
        sort_order: form.sort_order, seo_title: form.seo_title || null,
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

  return (
    <AdminShell title="Categories">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Categories</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Manage store hierarchy</p>
            </div>
            <button onClick={openAdd}
              className="flex h-11 items-center gap-2 bg-ink px-6 text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark">
              <Plus className="h-3.5 w-3.5" /> Add Category
            </button>
          </div>

          {/* Summary tiles */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total categories", value: cats.length },
              { label: "Main categories",  value: cats.filter((c) => c.type === "main").length },
              { label: "Subcategories",    value: cats.filter((c) => c.type === "sub").length },
              { label: "Inactive",         value: cats.filter((c) => c.status === "inactive").length },
            ].map((s) => (
              <div key={s.label} className="border border-border-soft bg-ivory p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted">{s.label}</div>
                <div className="mt-1 font-display text-2xl italic">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input type="search" placeholder="Search categories…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink sm:w-56" />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
              className="h-9 border border-border-soft bg-ivory px-3 text-[12px] text-ink-soft outline-none focus:border-ink">
              <option value="all">All Types</option>
              <option value="main">Main Category</option>
              <option value="sub">Subcategory</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
              className="h-9 border border-border-soft bg-ivory px-3 text-[12px] text-ink-soft outline-none focus:border-ink">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-[12px] text-muted">{filtered.length} categories</span>
          </div>

          {/* Table */}
          <div className="border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="w-14 px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-center font-medium">Sort</th>
                    <th className="px-4 py-3 font-medium">Parent</th>
                    <th className="px-4 py-3 text-center font-medium">Products</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-14 text-center text-[12px] text-muted">Loading categories…</td>
                    </tr>
                  ) : paged.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-4 py-3.5">
                        <div className="relative h-10 w-10 overflow-hidden bg-cream">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover object-center" />
                          ) : (
                            <div className="h-full w-full" style={{ background: c.color ?? "#f0ece4" }} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[13px] font-medium">{c.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted">/{c.slug}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          c.type === "main" ? "bg-ink text-ivory" : "border border-border-soft bg-cream text-ink-soft"
                        }`}>
                          {c.type === "main" ? "Main Category" : "Subcategory"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleStatus(c)}
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                            c.status === "active"
                              ? "bg-sage/15 text-sage hover:bg-sage/25"
                              : "bg-sale/10 text-sale hover:bg-sale/20"
                          }`}>
                          {c.status}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center text-[12px] tabular-nums text-ink-soft">{c.sort_order}</td>
                      <td className="px-4 py-3.5 text-[12px] text-ink-soft">{parentName(c.parent_id)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[12px] font-medium tabular-nums ${c.product_count === 0 ? "text-muted" : "text-ink"}`}>
                          {c.product_count}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewCat(c)} title="View"
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => openEdit(c)} title="Edit"
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-gold-dark">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(c)} title="Delete"
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-sale">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && paged.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[12px] text-muted">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft hover:bg-cream disabled:opacity-30">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${n === safePage ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center border border-border-soft text-ink-soft hover:bg-cream disabled:opacity-30">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* View modal */}
      {viewCat && (
        <Modal title="Category Details" onClose={() => setViewCat(null)}>
          <div className="space-y-4">
            <div className="relative h-32 w-full overflow-hidden bg-cream">
              {viewCat.image
                ? <Image src={viewCat.image} alt={viewCat.name} fill sizes="100%" className="object-cover object-center" />
                : <div className="h-full w-full" style={{ background: viewCat.color ?? "#f0ece4" }} />
              }
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl italic flex-1">{viewCat.name}</h3>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${viewCat.type === "main" ? "bg-ink text-ivory" : "border border-border-soft text-ink-soft"}`}>
                {viewCat.type === "main" ? "Main" : "Sub"}
              </span>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${viewCat.status === "active" ? "bg-sage/15 text-sage" : "bg-sale/10 text-sale"}`}>
                {viewCat.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              {[
                { label: "Slug",       val: `/${viewCat.slug}` },
                { label: "Sort Order", val: String(viewCat.sort_order) },
                { label: "Parent",     val: parentName(viewCat.parent_id) },
                { label: "Products",   val: String(viewCat.product_count) },
              ].map(({ label, val }) => (
                <div key={label} className="border border-border-soft bg-cream p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">{label}</div>
                  <div className="font-mono">{val}</div>
                </div>
              ))}
            </div>
            {viewCat.seo_title && (
              <div className="border border-border-soft bg-cream p-3 text-[12px]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">SEO Title</div>
                <div>{viewCat.seo_title}</div>
              </div>
            )}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => { setViewCat(null); openEdit(viewCat); }}
              className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
              Edit
            </button>
            <button onClick={() => setViewCat(null)}
              className="h-10 bg-ink px-6 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Add / Edit modal */}
      {(addOpen || editCat) && (
        <Modal title={addOpen ? "Add Category" : "Edit Category"}
          onClose={() => { setAddOpen(false); setEditCat(null); }}>
          <CategoryForm form={form} setForm={setForm} allCats={cats}
            saving={saving}
            onSave={addOpen ? handleSaveAdd : handleSaveEdit}
            onCancel={() => { setAddOpen(false); setEditCat(null); }} />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm bg-ivory shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-sale/10">
                <AlertTriangle className="h-6 w-6 text-sale" />
              </div>
              <h2 className="font-display text-xl italic">Delete category?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                Permanently delete <strong>{deleteTarget.name}</strong>? Subcategories or products linked to it will need to be reassigned.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setDeleteTarget(null)}
                className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="h-10 bg-sale px-6 text-[11px] uppercase tracking-[0.2em] text-ivory hover:opacity-90 transition-opacity disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-4 py-8">
      <div className="relative w-full max-w-lg bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <h2 className="font-display text-xl italic">{title}</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center text-muted hover:bg-cream hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
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
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Name *</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Silk Suits"
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Slug (URL)</span>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="ladies/suits/silk"
            className="h-10 border border-border-soft bg-cream px-3 text-[12px] font-mono outline-none focus:border-ink" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Type</span>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
            <option value="main">Main Category</option>
            <option value="sub">Subcategory</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Parent Category</span>
          <select value={form.parent_id ?? ""}
            onChange={(e) => set("parent_id", e.target.value || null)}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
            <option value="">— None (top level) —</option>
            {allCats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-muted">Category Image</div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border-soft bg-cream p-5 transition-colors hover:border-ink/30">
          <Upload className="h-5 w-5 text-muted" />
          <span className="text-[12px] text-ink-soft">Upload image</span>
          <span className="text-[11px] text-muted">PNG, JPG, WebP · recommended 800×600</span>
          <input type="file" accept="image/*" className="sr-only" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Sort Order</span>
          <input type="number" value={form.sort_order} min={1}
            onChange={(e) => set("sort_order", parseInt(e.target.value) || 1)}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
        </label>
      </div>

      <div className="border border-border-soft bg-cream p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">SEO</span>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Meta Title</span>
          <input value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value || null)}
            placeholder="Ladies Silk Suits | Habiba Minhas"
            className="h-9 border border-border-soft bg-ivory px-3 text-[12px] outline-none focus:border-ink" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Meta Description</span>
          <textarea rows={2} value={form.seo_desc ?? ""} onChange={(e) => set("seo_desc", e.target.value || null)}
            placeholder="Shop premium silk suits…"
            className="resize-none border border-border-soft bg-ivory px-3 py-2 text-[12px] outline-none focus:border-ink" />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button onClick={onCancel}
          className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
          Cancel
        </button>
        <button onClick={onSave} disabled={saving}
          className="h-10 bg-ink px-7 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors flex items-center gap-2 disabled:opacity-60">
          <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Category"}
        </button>
      </div>
    </div>
  );
}
