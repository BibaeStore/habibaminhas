"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Plus, Search, Eye, Pencil, Trash2, X, Upload,
  ChevronLeft, ChevronRight, Check, AlertTriangle, Star,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getProducts, updateProduct, deleteProduct, createProduct, uploadProductImage } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;

const CAT_LABEL: Record<string, string> = {
  "ladies-suits":  "Ladies",
  "kids-formal":   "Kids",
  "baby-products": "Baby",
  "accessories":   "Accessories",
};

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const KIDS_SIZES  = ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"];
const PAGE_SIZE   = 15;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [catFilter,    setCatFilter]    = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter,  setStockFilter]  = useState("all");
  const [priceFilter,  setPriceFilter]  = useState("all");
  const [page,         setPage]         = useState(1);
  const [showModal,    setShowModal]    = useState(false);
  const [viewProduct,  setViewProduct]  = useState<Product | null>(null);
  const [editProduct,  setEditProduct]  = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    getProducts().then((data) => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !(p.sku ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (stockFilter === "in-stock"     && p.stock === 0) return false;
      if (stockFilter === "low-stock"    && (p.stock === 0 || p.stock > 5)) return false;
      if (stockFilter === "out-of-stock" && p.stock > 0) return false;
      if (priceFilter === "under-3000"   && p.price >= 3000) return false;
      if (priceFilter === "3000-6000"    && (p.price < 3000 || p.price > 6000)) return false;
      if (priceFilter === "over-6000"    && p.price <= 6000) return false;
      return true;
    });
  }, [products, search, catFilter, statusFilter, stockFilter, priceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  return (
    <AdminShell title="Products">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Page header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl italic">Products</h1>
              <p className="mt-0.5 text-sm tracking-[0.28em] text-muted">Manage your inventory</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex h-14 items-center gap-2 bg-ink px-6 text-sm tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark"
            >
              <Plus className="h-5 w-5" /> Add Product
            </button>
          </div>

          {/* Filter card */}
          <div className="mb-4 border border-border-soft bg-ivory p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-base font-medium">All Products</span>
                <span className="ml-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold-dark">
                  {filtered.length} filtered of {products.length} total
                </span>
              </div>
              <div className="flex items-center gap-2 text-base text-ink-soft">
                <span>Page {safePage} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="flex h-10 w-10 items-center justify-center border border-border-soft transition-colors hover:bg-cream disabled:opacity-30">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="flex h-10 w-10 items-center justify-center border border-border-soft transition-colors hover:bg-cream disabled:opacity-30">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input type="search" placeholder="Search name or SKU…" value={search}
                  onChange={(e) => handleFilter(setSearch)(e.target.value)}
                  className="h-12 w-full border border-border-soft bg-cream pl-9 pr-3 text-base outline-none focus:border-ink" />
              </div>
              <select value={catFilter} onChange={(e) => handleFilter(setCatFilter)(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base text-ink-soft outline-none focus:border-ink">
                <option value="all">All Categories</option>
                <option value="ladies-suits">Ladies Stitched</option>
                <option value="kids-formal">Kids Girls</option>
                <option value="baby-products">Baby Products</option>
                <option value="accessories">Accessories</option>
              </select>
              <select value={statusFilter} onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base text-ink-soft outline-none focus:border-ink">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <select value={stockFilter} onChange={(e) => handleFilter(setStockFilter)(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base text-ink-soft outline-none focus:border-ink">
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (≤5)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <select value={priceFilter} onChange={(e) => handleFilter(setPriceFilter)(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base text-ink-soft outline-none focus:border-ink">
                <option value="all">All Prices</option>
                <option value="under-3000">Under Rs. 3,000</option>
                <option value="3000-6000">Rs. 3,000 – 6,000</option>
                <option value="over-6000">Over Rs. 6,000</option>
              </select>
            </div>
          </div>

          {/* Bulk delete bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-4 border-2 border-sale/30 bg-sale/5 px-5 py-4">
              <span className="text-base font-semibold text-ink">
                {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={async () => {
                  if (!confirm(`Are you sure you want to delete ${selectedIds.size} product(s)? This cannot be undone.`)) return;
                  setBulkDeleting(true);
                  for (const id of selectedIds) {
                    await deleteProduct(id);
                  }
                  setSelectedIds(new Set());
                  setBulkDeleting(false);
                  loadProducts();
                }}
                disabled={bulkDeleting}
                className="flex h-12 items-center gap-2 bg-sale px-6 text-base font-semibold text-ivory hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" />
                {bulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto text-base text-ink-soft hover:text-ink"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div className="border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-sm font-semibold tracking-[0.22em] text-muted">
                  <tr>
                    <th className="w-14 px-5 py-4 font-medium">
                      <input type="checkbox"
                        className="h-5 w-5 accent-ink cursor-pointer"
                        checked={selectedIds.size === paginated.length && paginated.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginated.map(p => p.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="w-14 px-5 py-4 font-medium">Image</th>
                    <th className="px-5 py-4 font-medium">Name</th>
                    <th className="px-5 py-4 font-medium">SKU</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 text-center font-medium">Stock</th>
                    <th className="px-5 py-4 text-center font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-5"><div className="skeleton h-5 w-5" /></td>
                        <td className="px-5 py-5"><div className="skeleton h-14 w-11" /></td>
                        <td className="px-5 py-5"><div className="skeleton h-5 w-48" /><div className="skeleton mt-2 h-4 w-24" /></td>
                        <td className="px-5 py-5"><div className="skeleton h-5 w-20" /></td>
                        <td className="px-5 py-5"><div className="skeleton h-5 w-24" /></td>
                        <td className="px-5 py-5"><div className="skeleton h-5 w-20" /></td>
                        <td className="px-5 py-5 text-center"><div className="skeleton mx-auto h-5 w-10" /></td>
                        <td className="px-5 py-5 text-center"><div className="skeleton mx-auto h-5 w-16" /></td>
                        <td className="px-5 py-5"><div className="skeleton ml-auto h-10 w-40" /></td>
                      </tr>
                    ))
                  ) : paginated.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-5 py-5">
                        <input type="checkbox"
                          className="h-5 w-5 accent-ink cursor-pointer"
                          checked={selectedIds.has(p.id)}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(p.id);
                            else next.delete(p.id);
                            setSelectedIds(next);
                          }}
                        />
                      </td>
                      <td className="px-5 py-5">
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill sizes="48px" className="object-cover object-top" />
                          ) : (
                            <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0] ?? "#f0ece4"}, ${p.palette[1] ?? "#c9a96e"})` }} />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-5 max-w-[240px]">
                        <div className="line-clamp-2 text-base font-medium leading-snug">{p.title}</div>
                        {p.featured && (
                          <div className="mt-0.5 text-sm font-bold uppercase tracking-[0.18em] text-gold-dark">Featured</div>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <span className="font-mono text-sm text-ink-soft">{p.sku ?? "—"}</span>
                      </td>
                      <td className="px-5 py-5">
                        <span className="border border-border-soft bg-cream px-2.5 py-1 text-sm uppercase tracking-[0.18em]">
                          {CAT_LABEL[p.category] ?? p.category}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-base font-medium">{formatPrice(p.price)}</div>
                        {p.compare_at && (
                          <div className="text-sm text-muted line-through">{formatPrice(p.compare_at)}</div>
                        )}
                      </td>
                      <td className="px-5 py-5 text-center">
                        <span className={`text-base font-medium tabular-nums ${
                          p.stock === 0 ? "text-sale" : p.stock <= 5 ? "text-gold-dark" : "text-sage"
                        }`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <span className={`px-2.5 py-1 text-sm uppercase tracking-[0.16em] ${
                          p.status === "active" ? "bg-sage/15 text-sage" : "bg-border-soft text-ink-soft"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewProduct(p)} className="flex h-10 items-center gap-2 px-3 text-sm bg-cream text-ink transition-colors hover:bg-ink hover:text-ivory" title="View">
                            <Eye className="h-5 w-5" /> View
                          </button>
                          <button onClick={() => setEditProduct(p)} className="flex h-10 items-center gap-2 px-3 text-sm bg-gold/20 text-gold-dark transition-colors hover:bg-gold-dark hover:text-ivory" title="Edit">
                            <Pencil className="h-5 w-5" /> Edit
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="flex h-10 items-center gap-2 px-3 text-sm bg-sale/10 text-sale transition-colors hover:bg-sale hover:text-ivory" title="Delete">
                            <Trash2 className="h-5 w-5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && paginated.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-14 text-center text-base text-muted">
                        No products match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-base text-muted">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`flex h-10 w-10 items-center justify-center text-base transition-colors ${
                      n === safePage ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

      {showModal     && <AddProductModal    onClose={() => setShowModal(false)}   onSaved={loadProducts} />}
      {viewProduct   && <ViewProductModal   product={viewProduct}  onClose={() => setViewProduct(null)} onEdit={() => { setEditProduct(viewProduct); setViewProduct(null); }} />}
      {editProduct   && <EditProductModal   product={editProduct}  onClose={() => setEditProduct(null)} onSaved={loadProducts} />}
      {deleteTarget  && <DeleteProductModal product={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); loadProducts(); }} />}
    </AdminShell>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

type SizeEntry = { enabled: boolean; stock: number };

function AddProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [sizeType, setSizeType] = useState<"adult" | "kids">("adult");
  const [adultSizes, setAdultSizes] = useState<Record<string, SizeEntry>>(
    Object.fromEntries(ADULT_SIZES.map((s) => [s, { enabled: false, stock: 0 }]))
  );
  const [kidsSizes, setKidsSizes] = useState<Record<string, SizeEntry>>(
    Object.fromEntries(KIDS_SIZES.map((s) => [s, { enabled: false, stock: 0 }]))
  );
  const [includeSizeGuide, setIncludeSizeGuide] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [name,     setName]     = useState("");
  const [sku,      setSku]      = useState("");
  const [category, setCategory] = useState("ladies-suits");
  const [status,   setStatus]   = useState("draft");
  const [price,    setPrice]    = useState("0");
  const [salePrice,setSalePrice]= useState("");
  const [stock,    setStock]    = useState("0");
  const [images,   setImages]   = useState<string[]>([]);
  const [uploading,setUploading]= useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImage(fd);
      if (result.url) uploaded.push(result.url);
      else setError(`Upload failed: ${result.error}`);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const sizes    = sizeType === "adult" ? adultSizes : kidsSizes;
  const setSizes = sizeType === "adult" ? setAdultSizes : setKidsSizes;
  const sizeLabels = sizeType === "adult" ? ADULT_SIZES : KIDS_SIZES;
  const anySizeEnabled = Object.values(sizes).some((v) => v.enabled);

  const toggleSize = (s: string) =>
    setSizes((prev) => ({ ...prev, [s]: { ...prev[s], enabled: !prev[s].enabled } }));
  const setStockSize = (s: string, val: number) =>
    setSizes((prev) => ({ ...prev, [s]: { ...prev[s], stock: val } }));

  const handleCreate = async () => {
    if (!name.trim()) { setError("Product name is required."); return; }
    const parsedPrice    = parseInt(price) || 0;
    const parsedSalePrice = salePrice ? parseInt(salePrice) : null;
    if (parsedPrice <= 0) { setError("Price must be greater than 0."); return; }
    if (parsedSalePrice !== null && parsedSalePrice <= 0) { setError("Sale price must be greater than 0."); return; }
    if (parsedSalePrice !== null && parsedSalePrice >= parsedPrice) { setError("Sale price must be less than the regular price."); return; }

    setSaving(true); setError("");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 80) + "-" + Date.now();
    const totalStock = anySizeEnabled
      ? Object.values(sizes).filter((v) => v.enabled).reduce((s, v) => s + v.stock, 0)
      : parseInt(stock) || 0;

    const result = await createProduct({
      title: name.trim(),
      slug,
      sku: sku.trim() || null,
      category,
      status,
      price: parsedSalePrice ?? parsedPrice,
      compare_at: parsedSalePrice ? parsedPrice : null,
      stock: totalStock,
      featured,
      size_guide: includeSizeGuide,
      images,
      palette: ["#f2e0d8", "#c97a86", "#5a2030"],
    });

    setSaving(false);
    if (result.error) { setError(result.error); return; }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-lg bg-ivory shadow-2xl md:max-w-2xl">
        <div className="border-b border-border-soft px-6 py-5">
          <h2 className="font-display text-3xl italic">Create Product</h2>
          <p className="mt-0.5 text-base text-gold-dark">Fill in the details to add a product.</p>
          <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[76vh] space-y-5 overflow-y-auto px-6 py-5">
          {error && <div className="border border-sale/40 bg-sale/10 px-4 py-3 text-base text-sale">{error}</div>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Product Name *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Classic T-Shirt"
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">SKU</span>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="TSH-001"
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink">
                <option value="ladies-suits">Ladies Stitched Suits</option>
                <option value="kids-formal">Kids Girls Wear</option>
                <option value="baby-products">Baby Products</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-sm tracking-[0.22em] text-muted">Product Images</div>
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="group relative h-20 w-16 overflow-hidden bg-cream">
                    <Image src={url} alt="" fill sizes="64px" className="object-cover object-top" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-5 w-5 text-ivory" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-ink/60 py-0.5 text-center text-xs uppercase tracking-wide text-ivory">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border-soft bg-cream px-6 py-6 transition-colors hover:border-ink/30 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              <Upload className={`h-7 w-7 ${uploading ? "animate-bounce text-gold-dark" : "text-muted"}`} />
              <span className="text-base text-ink-soft">{uploading ? "Uploading…" : "Click to add images"}</span>
              <span className="text-sm text-muted">PNG, JPG, WEBP up to 10 MB each</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Price (Rs.)</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Sale Price (Optional)</span>
              <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="—"
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
          </div>

          <div className="border border-border-soft bg-cream p-4">
            <div className="font-display text-lg italic">Sizes & Stock</div>
            <div className="mb-4 mt-0.5 text-sm text-gold-dark">Enable sizes and set stock per size.</div>
            <div className="mb-4 flex items-center gap-0">
              <span className="mr-3 text-sm font-medium tracking-[0.2em] text-ink-soft">Size Type:</span>
              {(["adult", "kids"] as const).map((t, i) => (
                <button key={t} onClick={() => setSizeType(t)}
                  className={`px-4 py-2 text-sm tracking-[0.18em] border transition-colors ${i === 1 ? "border-l-0" : ""} ${
                    sizeType === t ? "border-gold-dark bg-gold-dark text-ivory" : "border-border-soft bg-ivory text-ink-soft hover:bg-cream"
                  }`}>
                  {t === "adult" ? "Adult Sizes" : "Kids / Baby Sizes"}
                </button>
              ))}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sizeLabels.map((size) => {
                const s = sizes[size];
                return (
                  <div key={size} className={`flex items-center gap-2 border p-2.5 transition-colors ${s.enabled ? "border-ink bg-ivory" : "border-border-soft bg-ivory/60"}`}>
                    <button onClick={() => toggleSize(size)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${s.enabled ? "border-ink bg-ink" : "border-muted"}`}>
                      {s.enabled && <Check className="h-4 w-4 text-ivory" />}
                    </button>
                    <span className={`w-8 text-base uppercase tracking-[0.16em] ${s.enabled ? "text-ink" : "text-muted"}`}>{size}</span>
                    <input type="number" value={s.stock} disabled={!s.enabled}
                      onChange={(e) => setStockSize(size, parseInt(e.target.value) || 0)}
                      className="w-0 flex-1 border-0 bg-transparent text-right text-base outline-none disabled:text-muted" />
                  </div>
                );
              })}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.2em] text-muted">Global Stock (no sizes)</span>
              <input type="number" value={stock} disabled={anySizeEnabled}
                onChange={(e) => setStock(e.target.value)}
                className="h-12 border border-border-soft bg-ivory px-3 text-base outline-none focus:border-ink disabled:opacity-40" />
            </label>
          </div>

          <div className="border border-border-soft bg-cream p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <button onClick={() => setIncludeSizeGuide(!includeSizeGuide)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${includeSizeGuide ? "border-ink bg-ink" : "border-muted"}`}>
                {includeSizeGuide && <Check className="h-4 w-4 text-ivory" />}
              </button>
              <div>
                <div className="font-display text-lg italic">Size Guide</div>
                <div className="mt-0.5 text-sm text-muted">Add a measurement table for this product.</div>
              </div>
            </label>
          </div>

          <div className="border border-border-soft bg-cream p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <button onClick={() => setFeatured(!featured)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${featured ? "border-ink bg-ink" : "border-muted"}`}>
                {featured && <Check className="h-4 w-4 text-ivory" />}
              </button>
              <div>
                <div className="font-display text-lg italic">Featured Product</div>
                <div className="mt-0.5 text-sm text-muted">Appears in featured sections on the site.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-12 border border-border-soft px-6 text-sm tracking-[0.22em] text-ink-soft transition-colors hover:bg-cream">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={saving}
            className="h-12 bg-ink px-8 text-sm tracking-[0.22em] text-ivory transition-colors hover:bg-gold-dark disabled:opacity-60">
            {saving ? "Creating…" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Product Modal ───────────────────────────────────────────────────────

function ViewProductModal({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-sm bg-ivory shadow-2xl md:max-w-xl">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div>
            <h2 className="font-display text-3xl italic">Product Details</h2>
            <p className="mt-0.5 text-sm tracking-[0.2em] text-muted">{product.sku ?? product.slug}</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-cream">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.title} fill sizes="80px" className="object-cover object-top" />
              ) : (
                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${product.palette[0] ?? "#f0ece4"}, ${product.palette[1] ?? "#c9a96e"})` }} />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-base font-medium leading-snug">{product.title}</div>
                {product.featured && (
                  <div className="mt-0.5 flex items-center gap-1 text-sm uppercase tracking-[0.18em] text-gold-dark">
                    <Star className="h-5 w-5 fill-gold-dark" /> Featured
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 text-sm uppercase tracking-[0.16em] ${product.status === "active" ? "bg-sage/15 text-sage" : "bg-border-soft text-ink-soft"}`}>
                  {product.status}
                </span>
                <span className="border border-border-soft bg-cream px-2.5 py-1 text-sm uppercase tracking-[0.16em]">
                  {CAT_LABEL[product.category] ?? product.category}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border border-border-soft bg-cream p-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted">Price</div>
              <div className="mt-1 font-display text-2xl italic">{formatPrice(product.price)}</div>
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted">Was</div>
              <div className="mt-1 font-display text-2xl italic">
                {product.compare_at ? <span className="text-sale">{formatPrice(product.compare_at)}</span> : <span className="text-muted">—</span>}
              </div>
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted">Stock</div>
              <div className={`mt-1 font-display text-2xl italic tabular-nums ${product.stock === 0 ? "text-sale" : product.stock <= 5 ? "text-gold-dark" : "text-sage"}`}>
                {product.stock}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted">Subcategory</div>
              <div className="mt-1 text-base">{product.subcategory ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted">Slug</div>
              <div className="mt-1 font-mono text-sm text-ink-soft">{product.slug}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-12 border border-border-soft px-5 text-sm tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Close
          </button>
          <button onClick={onEdit} className="h-12 bg-ink px-6 text-sm tracking-[0.2em] text-ivory transition-colors hover:bg-gold-dark">
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────

function EditProductModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [name,        setName]        = useState(product.title);
  const [price,       setPrice]       = useState(String(product.price));
  const [compareAt,   setCompareAt]   = useState(product.compare_at ? String(product.compare_at) : "");
  const [stockVal,    setStockVal]    = useState(String(product.stock));
  const [statusVal,   setStatusVal]   = useState(product.status);
  const [featuredVal, setFeaturedVal] = useState(product.featured);
  const [images,      setImages]      = useState<string[]>(product.images ?? []);
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImage(fd);
      if (result.url) uploaded.push(result.url);
      else setError(`Upload failed: ${result.error}`);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSave = async () => {
    const parsedPrice    = parseInt(price) || 0;
    const parsedCompare  = compareAt ? parseInt(compareAt) : null;
    if (parsedPrice <= 0) { setError("Price must be greater than 0."); return; }
    if (parsedCompare !== null && parsedCompare <= 0) { setError("Compare-at price must be greater than 0."); return; }

    setSaving(true); setError("");
    const result = await updateProduct(product.id, {
      title:      name.trim(),
      price:      parsedPrice,
      compare_at: parsedCompare,
      stock:      parseInt(stockVal) || 0,
      status:     statusVal,
      featured:   featuredVal,
      images,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setSaved(true);
    onSaved();
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-sm bg-ivory shadow-2xl md:max-w-xl">
        <div className="border-b border-border-soft px-6 py-5">
          <h2 className="font-display text-3xl italic">Edit Product</h2>
          <p className="mt-0.5 text-base text-gold-dark">{product.sku ?? product.slug}</p>
          <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && <div className="border border-sale/40 bg-sale/10 px-4 py-3 text-base text-sale">{error}</div>}

          <div>
            <div className="mb-2 text-sm tracking-[0.22em] text-muted">Product Images</div>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="group relative h-20 w-16 overflow-hidden bg-cream">
                  <Image src={url} alt="" fill sizes="64px" className="object-cover object-top" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-5 w-5 text-ivory" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-ink/60 py-0.5 text-center text-xs uppercase tracking-wide text-ivory">Main</span>
                  )}
                </div>
              ))}
              <label className={`flex h-20 w-16 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-border-soft bg-cream text-muted transition-colors hover:border-ink/40 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                <Upload className={`h-5 w-5 ${uploading ? "animate-bounce text-gold-dark" : ""}`} />
                <span className="text-xs uppercase tracking-wide">{uploading ? "…" : "Add"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm tracking-[0.22em] text-muted">Product Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Price (Rs.)</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Compare At (Optional)</span>
              <input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="—"
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Stock</span>
              <input type="number" value={stockVal} onChange={(e) => setStockVal(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm tracking-[0.22em] text-muted">Status</span>
              <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)}
                className="h-12 border border-border-soft bg-cream px-3 text-base outline-none focus:border-ink">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <div>
            <div className="text-sm tracking-[0.22em] text-muted">Category</div>
            <div className="mt-1.5 flex h-12 items-center border border-border-soft bg-cream/50 px-3 text-base text-ink-soft">
              {CAT_LABEL[product.category] ?? product.category}
              <span className="ml-2 text-sm text-muted">(cannot change)</span>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <button onClick={() => setFeaturedVal(!featuredVal)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${featuredVal ? "border-ink bg-ink" : "border-muted"}`}>
              {featuredVal && <Check className="h-4 w-4 text-ivory" />}
            </button>
            <span className="text-base">Mark as <strong>Featured</strong> product</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-12 border border-border-soft px-5 text-sm tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`h-12 px-8 text-sm tracking-[0.22em] text-ivory transition-colors disabled:opacity-60 ${saved ? "bg-sage" : "bg-ink hover:bg-gold-dark"}`}>
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Product Modal ─────────────────────────────────────────────────────

function DeleteProductModal({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  const handleDelete = async () => {
    setDeleting(true); setError("");
    try {
      await deleteProduct(product.id);
      onDeleted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4">
      <div className="w-full max-w-sm bg-ivory shadow-2xl">
        <div className="px-6 pt-6 pb-4">
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-sale/10">
            <AlertTriangle className="h-7 w-7 text-sale" />
          </div>
          <h2 className="font-display text-2xl italic">Delete product?</h2>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">
            <strong>{product.title}</strong> will be permanently removed. This cannot be undone.
          </p>
          {product.stock > 0 && (
            <div className="mt-3 flex items-start gap-2 border border-gold-dark/30 bg-gold/10 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
              <p className="text-sm leading-relaxed text-ink-soft">
                This product has <strong>{product.stock} units</strong> in stock. Consider setting it to Draft instead.
              </p>
            </div>
          )}
          {error && <p className="mt-3 text-base text-sale">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-12 border border-border-soft px-5 text-sm tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="h-12 bg-sale px-6 text-sm tracking-[0.2em] text-ivory transition-colors hover:opacity-90 disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
