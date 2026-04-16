"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, Eye, X, Check, Upload,
  Search, ChevronLeft, ChevronRight, AlertTriangle, Layers,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  color: string;
  type: "main" | "sub";
  parentId?: string;
  parentName?: string;
  status: "active" | "inactive";
  sortOrder: number;
  productCount: number;
  seoTitle?: string;
  seoDesc?: string;
};

// ─── Initial data ──────────────────────────────────────────────────────────────

const INITIAL: Category[] = [
  // ── Main ──
  { id: "ladies",       name: "Ladies",               slug: "ladies",                    image: "/editorial/ladies-collection.webp", color: "#f2e0d8", type: "main", status: "active",   sortOrder: 1, productCount: 12, seoTitle: "Ladies Stitched Suits | Habiba Minhas", seoDesc: "Shop premium handcrafted ladies stitched suits online." },
  { id: "kids",         name: "Kids",                  slug: "kids",                      image: "/products/royal-amethyst-gown.webp",color: "#f5e8c0", type: "main", status: "active",   sortOrder: 2, productCount: 12 },
  { id: "baby",         name: "Baby Products",         slug: "baby",                      image: "/products/pastel-dream-nursery.webp",color: "#d4e8d0",type: "main", status: "active",   sortOrder: 3, productCount: 12 },
  { id: "accessories",  name: "Accessories",           slug: "accessories",               color: "#eedbc4",                           type: "main", status: "active",   sortOrder: 4, productCount: 6  },
  // ── Ladies subs ──
  { id: "ladies-suits",        name: "Ladies Suits",          slug: "ladies/suits",              color: "#f2e0d8", type: "sub", parentId: "ladies",       parentName: "Ladies",          status: "active",   sortOrder: 1, productCount: 12 },
  { id: "formal-3-piece",      name: "3-Piece Formal Suits",  slug: "ladies/suits/formal-3-piece",color: "#f2e0d8",type: "sub", parentId: "ladies-suits", parentName: "Ladies Suits",    status: "active",   sortOrder: 1, productCount: 1  },
  { id: "silk-ladies",         name: "Silk Suits",            slug: "ladies/suits/silk",          color: "#f2e0d8",type: "sub", parentId: "ladies-suits", parentName: "Ladies Suits",    status: "active",   sortOrder: 2, productCount: 6  },
  { id: "embroidered-ladies",  name: "Embroidered Suits",     slug: "ladies/suits/embroidered",   color: "#f2e0d8",type: "sub", parentId: "ladies-suits", parentName: "Ladies Suits",    status: "active",   sortOrder: 3, productCount: 3  },
  { id: "gold-brocade",        name: "Gold Brocade",          slug: "ladies/suits/gold-brocade",  color: "#f5e8c0",type: "sub", parentId: "ladies-suits", parentName: "Ladies Suits",    status: "active",   sortOrder: 4, productCount: 1  },
  { id: "mirror-work",         name: "Mirror-Work Collection",slug: "ladies/suits/mirror-work",   color: "#f2e0d8",type: "sub", parentId: "ladies-suits", parentName: "Ladies Suits",    status: "active",   sortOrder: 5, productCount: 1  },
  // ── Kids subs ──
  { id: "kids-girls",          name: "Girls Formal Wear",     slug: "kids/girls",                 color: "#f5e8c0",type: "sub", parentId: "kids",         parentName: "Kids",            status: "active",   sortOrder: 1, productCount: 11 },
  { id: "kids-kurtis",         name: "Kurtis & Shalwar",      slug: "kids/kurtis",                color: "#f5e8c0",type: "sub", parentId: "kids",         parentName: "Kids",            status: "active",   sortOrder: 2, productCount: 1  },
  { id: "co-ord",              name: "Festive Co-Ord Sets",   slug: "kids/girls/co-ord",          color: "#f5e8c0",type: "sub", parentId: "kids-girls",   parentName: "Girls Formal Wear",status: "active",  sortOrder: 1, productCount: 1  },
  { id: "gowns",               name: "Formal Gowns",          slug: "kids/girls/gowns",           color: "#f5e8c0",type: "sub", parentId: "kids-girls",   parentName: "Girls Formal Wear",status: "active",  sortOrder: 2, productCount: 3  },
  { id: "embroidered-gowns",   name: "Embroidered Gowns",     slug: "kids/girls/embroidered",     color: "#f5e8c0",type: "sub", parentId: "kids-girls",   parentName: "Girls Formal Wear",status: "active",  sortOrder: 3, productCount: 1  },
  { id: "silk-suits-kids",     name: "3-Piece Silk Suits",    slug: "kids/girls/silk-suits",      color: "#f5e8c0",type: "sub", parentId: "kids-girls",   parentName: "Girls Formal Wear",status: "active",  sortOrder: 4, productCount: 4  },
  { id: "sharara",             name: "Sharara Sets",          slug: "kids/girls/sharara",         color: "#f5e8c0",type: "sub", parentId: "kids-girls",   parentName: "Girls Formal Wear",status: "active",  sortOrder: 5, productCount: 1  },
  // ── Baby subs ──
  { id: "bedding",             name: "Nursery Bedding",       slug: "baby/bedding",               color: "#d4e8d0",type: "sub", parentId: "baby",         parentName: "Baby Products",   status: "active",   sortOrder: 1, productCount: 8  },
  { id: "nests",               name: "Baby Nests & Loungers", slug: "baby/nests",                 color: "#f0e0f0",type: "sub", parentId: "baby",         parentName: "Baby Products",   status: "active",   sortOrder: 2, productCount: 3  },
  { id: "swaddles",            name: "Swaddle Wraps",         slug: "baby/swaddles",              color: "#d4e8d0",type: "sub", parentId: "baby",         parentName: "Baby Products",   status: "active",   sortOrder: 3, productCount: 1  },
  { id: "carrier",             name: "Carrier Covers",        slug: "baby/carrier",               color: "#d4e8d0",type: "sub", parentId: "baby",         parentName: "Baby Products",   status: "active",   sortOrder: 4, productCount: 1  },
  { id: "bedding-5piece",      name: "5-Piece Crib Sets",     slug: "baby/bedding/5-piece",       color: "#d4e8d0",type: "sub", parentId: "bedding",      parentName: "Nursery Bedding", status: "active",   sortOrder: 1, productCount: 1  },
  { id: "bedding-6piece",      name: "6-Piece Bumper Sets",   slug: "baby/bedding/6-piece",       color: "#d4e8d0",type: "sub", parentId: "bedding",      parentName: "Nursery Bedding", status: "active",   sortOrder: 2, productCount: 2  },
  { id: "bedding-10piece",     name: "Deluxe 10-Piece Sets",  slug: "baby/bedding/10-piece",      color: "#d4e8d0",type: "sub", parentId: "bedding",      parentName: "Nursery Bedding", status: "active",   sortOrder: 3, productCount: 1  },
  { id: "bedding-character",   name: "Character Themes",      slug: "baby/bedding/character",     color: "#d4e8d0",type: "sub", parentId: "bedding",      parentName: "Nursery Bedding", status: "active",   sortOrder: 4, productCount: 4  },
  // ── Accessories subs ──
  { id: "hair",                name: "Hair Accessories",      slug: "accessories/hair",           color: "#eedbc4",type: "sub", parentId: "accessories",  parentName: "Accessories",     status: "active",   sortOrder: 1, productCount: 6  },
  { id: "headbands",           name: "Silk Headbands",        slug: "accessories/hair/headbands", color: "#eedbc4",type: "sub", parentId: "hair",         parentName: "Hair Accessories",status: "active",   sortOrder: 1, productCount: 0  },
  { id: "clips",               name: "Floral Hair Clips",     slug: "accessories/hair/clips",     color: "#eedbc4",type: "sub", parentId: "hair",         parentName: "Hair Accessories",status: "inactive", sortOrder: 2, productCount: 0  },
  { id: "sets",                name: "Headband & Clip Sets",  slug: "accessories/hair/sets",      color: "#eedbc4",type: "sub", parentId: "hair",         parentName: "Hair Accessories",status: "active",   sortOrder: 3, productCount: 6  },
];

const PAGE_SIZE = 15;

// ─── Blank form ────────────────────────────────────────────────────────────────

const BLANK: Omit<Category, "id"> = {
  name: "", slug: "", color: "#f0ece4", type: "sub",
  parentId: undefined, parentName: undefined,
  status: "active", sortOrder: 1, productCount: 0,
  seoTitle: "", seoDesc: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [cats,        setCats]        = useState<Category[]>(INITIAL);
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<"all" | "main" | "sub">("all");
  const [statusFilter,setStatusFilter]= useState<"all" | "active" | "inactive">("all");
  const [page,        setPage]        = useState(1);
  const [viewCat,     setViewCat]     = useState<Category | null>(null);
  const [editCat,     setEditCat]     = useState<Category | null>(null);
  const [addOpen,     setAddOpen]     = useState(false);
  const [deleteTarget,setDeleteTarget]= useState<Category | null>(null);
  const [form,        setForm]        = useState<Omit<Category, "id">>(BLANK);

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
    setForm({ name: c.name, slug: c.slug, color: c.color, type: c.type, parentId: c.parentId, parentName: c.parentName, status: c.status, sortOrder: c.sortOrder, productCount: c.productCount, seoTitle: c.seoTitle ?? "", seoDesc: c.seoDesc ?? "", image: c.image });
    setEditCat(c);
  };

  const handleSaveAdd = () => {
    const newCat: Category = { ...form, id: `cat-${Date.now()}`, name: form.name || "New Category", slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    setCats((prev) => [...prev, newCat]);
    setAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editCat) return;
    setCats((prev) => prev.map((c) => c.id === editCat.id ? { ...c, ...form } : c));
    setEditCat(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setCats((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleStatus = (id: string) => {
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  const mainCats = cats.filter((c) => c.type === "main");

  return (
    <AdminShell title="Categories">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Categories</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Manage store hierarchy</p>
            </div>
            <button
              onClick={openAdd}
              className="flex h-11 items-center gap-2 bg-ink px-6 text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark"
            >
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
              <input
                type="search"
                placeholder="Search categories…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink sm:w-56"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
              className="h-9 border border-border-soft bg-ivory px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
            >
              <option value="all">All Types</option>
              <option value="main">Main Category</option>
              <option value="sub">Subcategory</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
              className="h-9 border border-border-soft bg-ivory px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
            >
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
                  {paged.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-4 py-3.5">
                        <div className="relative h-10 w-10 overflow-hidden bg-cream">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover object-center" />
                          ) : (
                            <div className="h-full w-full" style={{ background: c.color }} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[13px] font-medium">{c.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted">/{c.slug}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          c.type === "main"
                            ? "bg-ink text-ivory"
                            : "border border-border-soft bg-cream text-ink-soft"
                        }`}>
                          {c.type === "main" ? "Main Category" : "Subcategory"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleStatus(c.id)}
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                            c.status === "active"
                              ? "bg-sage/15 text-sage hover:bg-sage/25"
                              : "bg-sale/10 text-sale hover:bg-sale/20"
                          }`}
                        >
                          {c.status}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center text-[12px] tabular-nums text-ink-soft">{c.sortOrder}</td>
                      <td className="px-4 py-3.5 text-[12px] text-ink-soft">{c.parentName ?? "—"}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[12px] font-medium tabular-nums ${c.productCount === 0 ? "text-muted" : "text-ink"}`}>
                          {c.productCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewCat(c)}
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-gold-dark"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-sale"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[12px] text-muted">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* ── View modal ── */}
      {viewCat && (
        <Modal title="Category Details" onClose={() => setViewCat(null)}>
          <div className="space-y-4">
            <div className="relative h-32 w-full overflow-hidden bg-cream">
              {viewCat.image
                ? <Image src={viewCat.image} alt={viewCat.name} fill sizes="100%" className="object-cover object-center" />
                : <div className="h-full w-full" style={{ background: viewCat.color }} />
              }
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl italic flex-1">{viewCat.name}</h3>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${viewCat.type === "main" ? "bg-ink text-ivory" : "border border-border-soft text-ink-soft"}`}>
                {viewCat.type === "main" ? "Main Category" : "Subcategory"}
              </span>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${viewCat.status === "active" ? "bg-sage/15 text-sage" : "bg-sale/10 text-sale"}`}>
                {viewCat.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="border border-border-soft bg-cream p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Slug</div>
                <div className="font-mono">/{viewCat.slug}</div>
              </div>
              <div className="border border-border-soft bg-cream p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Sort Order</div>
                <div>{viewCat.sortOrder}</div>
              </div>
              <div className="border border-border-soft bg-cream p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Parent</div>
                <div>{viewCat.parentName ?? "—"}</div>
              </div>
              <div className="border border-border-soft bg-cream p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Products</div>
                <div>{viewCat.productCount}</div>
              </div>
            </div>
            {viewCat.seoTitle && (
              <div className="border border-border-soft bg-cream p-3 text-[12px]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">SEO Title</div>
                <div>{viewCat.seoTitle}</div>
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

      {/* ── Add / Edit modal ── */}
      {(addOpen || editCat) && (
        <Modal
          title={addOpen ? "Add Category" : "Edit Category"}
          onClose={() => { setAddOpen(false); setEditCat(null); }}
        >
          <CategoryForm
            form={form}
            setForm={setForm}
            mainCats={mainCats}
            allCats={cats}
            onSave={addOpen ? handleSaveAdd : handleSaveEdit}
            onCancel={() => { setAddOpen(false); setEditCat(null); }}
          />
        </Modal>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm bg-ivory shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-sale/10">
                <AlertTriangle className="h-6 w-6 text-sale" />
              </div>
              <h2 className="font-display text-xl italic">Delete category?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                Permanently delete <strong>{deleteTarget.name}</strong>? Any subcategories or
                products linked to it will need to be reassigned.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
              <button onClick={() => setDeleteTarget(null)}
                className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="h-10 bg-sale px-6 text-[11px] uppercase tracking-[0.2em] text-ivory hover:opacity-90 transition-opacity">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

// ─── Reusable modal wrapper ────────────────────────────────────────────────────

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

// ─── Category form ─────────────────────────────────────────────────────────────

function CategoryForm({
  form, setForm, mainCats, allCats, onSave, onCancel,
}: {
  form: Omit<Category, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Category, "id">>>;
  mainCats: Category[];
  allCats: Category[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (k: keyof Omit<Category, "id">, v: string | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const parentOptions = allCats.filter((c) => c.id !== (form as Category & {id?: string}).id);

  return (
    <div className="space-y-4">
      {/* Name + Slug */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Name *</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Silk Suits"
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Slug (URL)</span>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
            placeholder="ladies/suits/silk"
            className="h-10 border border-border-soft bg-cream px-3 text-[12px] font-mono outline-none focus:border-ink" />
        </label>
      </div>

      {/* Type + Parent */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Type</span>
          <select value={form.type} onChange={(e) => set("type", e.target.value as "main" | "sub")}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
            <option value="main">Main Category</option>
            <option value="sub">Subcategory</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Parent Category</span>
          <select
            value={form.parentId ?? ""}
            onChange={(e) => {
              const parent = allCats.find((c) => c.id === e.target.value);
              setForm((f) => ({ ...f, parentId: parent?.id, parentName: parent?.name }));
            }}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
          >
            <option value="">— None (top level) —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Image upload */}
      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-muted">Category Image</div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border-soft bg-cream p-5 transition-colors hover:border-ink/30">
          <Upload className="h-5 w-5 text-muted" />
          <span className="text-[12px] text-ink-soft">Upload image</span>
          <span className="text-[11px] text-muted">PNG, JPG, WebP · recommended 800×600</span>
          <input type="file" accept="image/*" className="sr-only" />
        </label>
      </div>

      {/* Status + Sort Order */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value as "active" | "inactive")}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Sort Order</span>
          <input type="number" value={form.sortOrder} min={1}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 1)}
            className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
        </label>
      </div>

      {/* SEO */}
      <div className="border border-border-soft bg-cream p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">SEO</span>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Meta Title</span>
          <input value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)}
            placeholder="Ladies Silk Suits | Habiba Minhas"
            className="h-9 border border-border-soft bg-ivory px-3 text-[12px] outline-none focus:border-ink" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Meta Description</span>
          <textarea rows={2} value={form.seoDesc ?? ""} onChange={(e) => set("seoDesc", e.target.value)}
            placeholder="Shop premium silk suits…"
            className="resize-none border border-border-soft bg-ivory px-3 py-2 text-[12px] outline-none focus:border-ink" />
        </label>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button onClick={onCancel}
          className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream transition-colors">
          Cancel
        </button>
        <button onClick={onSave}
          className="h-10 bg-ink px-7 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors flex items-center gap-2">
          <Check className="h-3.5 w-3.5" /> Save Category
        </button>
      </div>
    </div>
  );
}
