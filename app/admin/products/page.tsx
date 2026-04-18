"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Plus, Search, Eye, Pencil, Trash2, X, Upload,
  ChevronLeft, ChevronRight, Check, AlertTriangle, Star, Package,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusPill } from "@/components/admin/ui/status-pill";
import { ConfirmModal } from "@/components/admin/ui/confirm-modal";
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        {/* Page header */}
        <div className="mb-6">
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
        </div>

        {/* Filter card */}
        <AdminCard padded={false} className="mb-4 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-[15px] font-medium text-[var(--admin-text)]">All Products</span>
              <span className="ml-2 text-sm font-semibold text-[var(--admin-text-muted)]">
                {filtered.length} filtered of {products.length} total
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--admin-text-soft)]">
              <span>Page {safePage} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] transition-colors hover:bg-[var(--admin-surface-alt)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] transition-colors hover:bg-[var(--admin-surface-alt)] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <input
                type="search"
                placeholder="Search name or SKU…"
                value={search}
                onChange={(e) => handleFilter(setSearch)(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-10 pr-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => handleFilter(setCatFilter)(e.target.value)}
              className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            >
              <option value="all">All Categories</option>
              <option value="ladies-suits">Ladies Stitched</option>
              <option value="kids-formal">Kids Girls</option>
              <option value="baby-products">Baby Products</option>
              <option value="accessories">Accessories</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
              className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => handleFilter(setStockFilter)(e.target.value)}
              className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤5)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select
              value={priceFilter}
              onChange={(e) => handleFilter(setPriceFilter)(e.target.value)}
              className="h-11 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            >
              <option value="all">All Prices</option>
              <option value="under-3000">Under Rs. 3,000</option>
              <option value="3000-6000">Rs. 3,000 – 6,000</option>
              <option value="over-6000">Over Rs. 6,000</option>
            </select>
          </div>
        </AdminCard>

        {/* Bulk delete bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-5 py-4">
            <span className="text-[15px] font-semibold text-[var(--admin-text)]">
              {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <AdminButton
              variant="danger"
              size="sm"
              leadingIcon={<Trash2 className="h-4 w-4" />}
              loading={bulkDeleting}
              onClick={() => setConfirmBulkDelete(true)}
            >
              {bulkDeleting ? "Deleting..." : "Delete Selected"}
            </AdminButton>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-sm text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        <AdminCard padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--admin-surface-alt)] text-sm font-semibold text-[var(--admin-text-muted)]">
                <tr>
                  <th className="w-14 px-5 py-4 font-medium">
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer accent-[var(--admin-primary)]"
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
              <tbody className="divide-y divide-[var(--admin-border)]">
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
                  <tr key={p.id} className="transition-colors hover:bg-[var(--admin-surface-alt)]">
                    <td className="px-5 py-5">
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer accent-[var(--admin-primary)]"
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
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.title} fill sizes="40px" className="object-cover object-top" />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-5 w-5 text-[var(--admin-text-muted)]" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-5 max-w-[240px]">
                      <div className="line-clamp-2 text-[15px] font-medium leading-snug text-[var(--admin-text)]">{p.title}</div>
                      {p.featured && (
                        <div className="mt-0.5 text-xs font-bold text-[var(--admin-primary)]">Featured</div>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <span className="font-mono text-sm text-[var(--admin-text-soft)]">{p.sku ?? "—"}</span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-2.5 py-1 text-sm text-[var(--admin-text-soft)]">
                        {CAT_LABEL[p.category] ?? p.category}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="text-[15px] font-medium text-[var(--admin-text)]">{formatPrice(p.price)}</div>
                      {p.compare_at && (
                        <div className="text-sm text-[var(--admin-text-muted)] line-through">{formatPrice(p.compare_at)}</div>
                      )}
                    </td>
                    <td className="px-5 py-5 text-center">
                      <StatusPill tone={p.stock === 0 ? "danger" : p.stock <= 5 ? "warning" : "success"}>
                        {p.stock === 0 ? "Out" : `${p.stock} left`}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <StatusPill tone={p.status === "active" ? "success" : "neutral"}>
                        {p.status}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewProduct(p)}
                          leadingIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View
                        </AdminButton>
                        <AdminButton
                          variant="outline"
                          size="sm"
                          onClick={() => setEditProduct(p)}
                          leadingIcon={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(p)}
                          leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-[15px] text-[var(--admin-text-muted)]">
                      No products match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3">
            <span className="text-sm text-[var(--admin-text-muted)]">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-sm transition-colors ${
                    n === safePage
                      ? "bg-[var(--admin-primary)] text-white"
                      : "text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      {showModal    && <AddProductModal    onClose={() => setShowModal(false)}   onSaved={loadProducts} />}
      {viewProduct  && <ViewProductModal   product={viewProduct}  onClose={() => setViewProduct(null)} onEdit={() => { setEditProduct(viewProduct); setViewProduct(null); }} />}
      {editProduct  && <EditProductModal   product={editProduct}  onClose={() => setEditProduct(null)} onSaved={loadProducts} />}

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

      <ConfirmModal
        open={confirmBulkDelete}
        title={`Delete ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}?`}
        description="The selected products will be permanently removed from your store. This cannot be undone."
        confirmLabel="Delete all selected"
        destructive
        loading={bulkDeleting}
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={async () => {
          setBulkDeleting(true);
          for (const id of selectedIds) {
            await deleteProduct(id);
          }
          setSelectedIds(new Set());
          setBulkDeleting(false);
          setConfirmBulkDelete(false);
          loadProducts();
        }}
      />
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="relative w-full max-w-lg rounded-[var(--admin-radius)] bg-[var(--admin-surface)] shadow-lg md:max-w-2xl">
        <div className="border-b border-[var(--admin-border)] px-6 py-5">
          <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Create Product</h2>
          <p className="mt-0.5 text-[14px] text-[var(--admin-text-soft)]">Fill in the details to add a product.</p>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[76vh] space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-4 py-3 text-[15px] text-[var(--admin-danger)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Product Name *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Classic T-Shirt"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">SKU</span>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="TSH-001"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              >
                <option value="ladies-suits">Ladies Stitched Suits</option>
                <option value="kids-formal">Kids Girls Wear</option>
                <option value="baby-products">Baby Products</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-[14px] font-semibold text-[var(--admin-text)]">Product Images</div>
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="group relative h-20 w-16 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
                    <Image src={url} alt="" fill sizes="64px" className="object-cover object-top" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-xs text-white">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-6 py-6 transition-colors hover:border-[var(--admin-primary)] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
              <Upload className={`h-7 w-7 ${uploading ? "animate-bounce text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]"}`} />
              <span className="text-[15px] text-[var(--admin-text-soft)]">{uploading ? "Uploading…" : "Click to add images"}</span>
              <span className="text-sm text-[var(--admin-text-muted)]">PNG, JPG, WEBP up to 10 MB each</span>
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
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Price (Rs.)</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Sale Price (Optional)</span>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="—"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
          </div>

          <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
            <div className="text-[18px] font-semibold text-[var(--admin-text)]">Sizes &amp; Stock</div>
            <div className="mb-4 mt-0.5 text-sm text-[var(--admin-text-soft)]">Enable sizes and set stock per size.</div>
            <div className="mb-4 flex items-center gap-0">
              <span className="mr-3 text-sm font-medium text-[var(--admin-text-soft)]">Size Type:</span>
              {(["adult", "kids"] as const).map((t, i) => (
                <button
                  key={t}
                  onClick={() => setSizeType(t)}
                  className={`px-4 py-2 text-sm border transition-colors ${i === 1 ? "border-l-0 rounded-r-[var(--admin-radius)]" : "rounded-l-[var(--admin-radius)]"} ${
                    sizeType === t
                      ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                      : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-alt)]"
                  }`}
                >
                  {t === "adult" ? "Adult Sizes" : "Kids / Baby Sizes"}
                </button>
              ))}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sizeLabels.map((size) => {
                const s = sizes[size];
                return (
                  <div
                    key={size}
                    className={`flex items-center gap-2 rounded-[var(--admin-radius)] border p-2.5 transition-colors ${
                      s.enabled
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
                        : "border-[var(--admin-border)] bg-[var(--admin-surface)]"
                    }`}
                  >
                    <button
                      onClick={() => toggleSize(size)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
                        s.enabled
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]"
                          : "border-[var(--admin-border)]"
                      }`}
                    >
                      {s.enabled && <Check className="h-4 w-4 text-white" />}
                    </button>
                    <span className={`w-8 text-sm font-medium ${s.enabled ? "text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]"}`}>{size}</span>
                    <input
                      type="number"
                      value={s.stock}
                      disabled={!s.enabled}
                      onChange={(e) => setStockSize(size, parseInt(e.target.value) || 0)}
                      className="w-0 flex-1 border-0 bg-transparent text-right text-sm outline-none disabled:text-[var(--admin-text-muted)]"
                    />
                  </div>
                );
              })}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Global Stock (no sizes)</span>
              <input
                type="number"
                value={stock}
                disabled={anySizeEnabled}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)] disabled:opacity-40"
              />
            </label>
          </div>

          <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <button
                onClick={() => setIncludeSizeGuide(!includeSizeGuide)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
                  includeSizeGuide
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]"
                    : "border-[var(--admin-border)]"
                }`}
              >
                {includeSizeGuide && <Check className="h-4 w-4 text-white" />}
              </button>
              <div>
                <div className="text-[18px] font-semibold text-[var(--admin-text)]">Size Guide</div>
                <div className="mt-0.5 text-sm text-[var(--admin-text-muted)]">Add a measurement table for this product.</div>
              </div>
            </label>
          </div>

          <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <button
                onClick={() => setFeatured(!featured)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
                  featured
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]"
                    : "border-[var(--admin-border)]"
                }`}
              >
                {featured && <Check className="h-4 w-4 text-white" />}
              </button>
              <div>
                <div className="text-[18px] font-semibold text-[var(--admin-text)]">Featured Product</div>
                <div className="mt-0.5 text-sm text-[var(--admin-text-muted)]">Appears in featured sections on the site.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--admin-border)] px-6 py-4">
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" loading={saving} onClick={handleCreate}>
            {saving ? "Creating…" : "Create Product"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

// ─── View Product Modal ───────────────────────────────────────────────────────

function ViewProductModal({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm rounded-[var(--admin-radius)] bg-[var(--admin-surface)] p-6 shadow-lg md:max-w-xl">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-5 mb-5">
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Product Details</h2>
            <p className="mt-0.5 text-sm text-[var(--admin-text-muted)]">{product.sku ?? product.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.title} fill sizes="80px" className="object-cover object-top" />
              ) : (
                <Package className="absolute inset-0 m-auto h-8 w-8 text-[var(--admin-text-muted)]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-[15px] font-medium leading-snug text-[var(--admin-text)]">{product.title}</div>
                {product.featured && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-[var(--admin-primary)]">
                    <Star className="h-4 w-4 fill-[var(--admin-primary)]" /> Featured
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={product.status === "active" ? "success" : "neutral"}>
                  {product.status}
                </StatusPill>
                <StatusPill tone="neutral">
                  {CAT_LABEL[product.category] ?? product.category}
                </StatusPill>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] p-4">
            <div>
              <div className="text-xs font-semibold text-[var(--admin-text-muted)]">Price</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-[var(--admin-text)]">{formatPrice(product.price)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--admin-text-muted)]">Was</div>
              <div className="mt-1 text-xl font-bold tabular-nums">
                {product.compare_at
                  ? <span className="text-[var(--admin-danger)]">{formatPrice(product.compare_at)}</span>
                  : <span className="text-[var(--admin-text-muted)]">—</span>
                }
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--admin-text-muted)]">Stock</div>
              <div className="mt-1">
                <StatusPill tone={product.stock === 0 ? "danger" : product.stock <= 5 ? "warning" : "success"}>
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </StatusPill>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-[var(--admin-text-muted)]">Subcategory</div>
              <div className="mt-1 text-[15px] text-[var(--admin-text)]">{product.subcategory ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--admin-text-muted)]">Slug</div>
              <div className="mt-1 font-mono text-sm text-[var(--admin-text-soft)]">{product.slug}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--admin-border)] pt-5 mt-5">
          <AdminButton variant="outline" onClick={onClose}>Close</AdminButton>
          <AdminButton variant="primary" onClick={onEdit}>Edit Product</AdminButton>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm rounded-[var(--admin-radius)] bg-[var(--admin-surface)] p-6 shadow-lg md:max-w-xl">
        <div className="border-b border-[var(--admin-border)] pb-5 mb-5">
          <h2 className="text-[18px] font-semibold text-[var(--admin-text)]">Edit Product</h2>
          <p className="mt-0.5 text-[14px] text-[var(--admin-text-soft)]">{product.sku ?? product.slug}</p>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-alt)] hover:text-[var(--admin-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-4 py-3 text-[15px] text-[var(--admin-danger)]">
              {error}
            </div>
          )}

          <div>
            <div className="mb-2 text-[14px] font-semibold text-[var(--admin-text)]">Product Images</div>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="group relative h-20 w-16 overflow-hidden rounded bg-[var(--admin-surface-alt)]">
                  <Image src={url} alt="" fill sizes="64px" className="object-cover object-top" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-xs text-white">Main</span>
                  )}
                </div>
              ))}
              <label className={`flex h-20 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-primary)] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                <Upload className={`h-5 w-5 ${uploading ? "animate-bounce text-[var(--admin-primary)]" : ""}`} />
                <span className="text-xs">{uploading ? "…" : "Add"}</span>
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
            <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Product Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Price (Rs.)</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Compare At (Optional)</span>
              <input
                type="number"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="—"
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Stock</span>
              <input
                type="number"
                value={stockVal}
                onChange={(e) => setStockVal(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="mb-1.5 block text-[14px] font-semibold text-[var(--admin-text)]">Status</span>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="h-11 w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[15px] outline-none focus:border-[var(--admin-primary)]"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[var(--admin-text)]">Category</div>
            <div className="mt-1.5 flex h-11 items-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-alt)] px-3 text-[15px] text-[var(--admin-text-soft)]">
              {CAT_LABEL[product.category] ?? product.category}
              <span className="ml-2 text-sm text-[var(--admin-text-muted)]">(cannot change)</span>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <button
              onClick={() => setFeaturedVal(!featuredVal)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
                featuredVal
                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]"
                  : "border-[var(--admin-border)]"
              }`}
            >
              {featuredVal && <Check className="h-4 w-4 text-white" />}
            </button>
            <span className="text-[15px] text-[var(--admin-text)]">Mark as <strong>Featured</strong> product</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--admin-border)] pt-5 mt-5">
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            variant={saved ? "primary" : "primary"}
            loading={saving}
            onClick={handleSave}
          >
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
