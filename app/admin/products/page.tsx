"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Plus, Search, Eye, Pencil, Trash2, X, Upload,
  ChevronLeft, ChevronRight, Check, AlertTriangle, Star,
} from "lucide-react";
import { Product } from "@/lib/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

// ─── Mock admin-only data ─────────────────────────────────────────────────────

const SKU_MAP: Record<string, string> = {
  "lad-1": "RWE-3PC-SS25-001", "lad-2": "IDR-3PC-SS25-002", "lad-3": "BRM-3PC-SS25-003",
  "lad-4": "PRD-3PC-SS25-004", "lad-5": "GAM-3PC-SS25-005", "lad-6": "RJW-3PC-SS25-006",
  "lad-7": "DRE-3PC-SS25-007", "lad-8": "RPL-3PC-SS25-008", "lad-9": "TEE-3PC-SS25-009",
  "lad-10": "MNV-3PC-SS25-010", "lad-11": "EMH-3PC-SS25-011", "lad-12": "FBL-3PC-SS25-012",
  "kid-1": "SBG-CS-FS25-013",  "kid-2": "BPC-GF-SS25-014",  "kid-3": "AMR-KS-SS25-015",
  "kid-4": "MGM-KS-SS25-016",  "kid-5": "MRC-KS-SS25-017",  "kid-6": "IVG-KS-SS25-018",
  "kid-7": "RAG-EG-SS25-019",  "kid-8": "MGC-FG-SS25-020",  "kid-9": "RSP-FG-SS25-021",
  "kid-10": "CRB-SH-SS25-022", "kid-11": "TTR-KS-SS25-023", "kid-12": "BGK-KS-SS25-024",
  "bby-1": "SNG-5P-NS25-025",  "bby-2": "SNS-6P-NS25-026",  "bby-3": "PDN-10P-NS25-027",
  "bby-4": "CRS-6P-NS25-028",  "bby-5": "LTA-7P-NS25-029",  "bby-6": "LEX-5P-NS25-030",
  "bby-7": "SWH-NP-NS25-031",  "bby-8": "DNR-NP-NS25-032",  "bby-9": "BTM-NP-NS25-033",
  "bby-10": "EFC-CC-NS25-034", "bby-11": "SWH-3P-NS25-035", "bby-12": "BTM-SW-NS25-036",
  "acc-1": "MOX-HB-AC25-037",  "acc-2": "GBR-HB-AC25-038",  "acc-3": "DRB-HB-AC25-039",
  "acc-4": "MRR-HB-AC25-040",  "acc-5": "PKB-HB-AC25-041",  "acc-6": "RPL-HB-AC25-042",
};

const STATUS_MAP: Record<string, "active" | "draft"> = {
  "lad-1": "active", "lad-2": "active", "lad-3": "active", "lad-4": "active",
  "lad-5": "active", "lad-6": "active", "lad-7": "active", "lad-8": "active",
  "lad-9": "active", "lad-10": "active", "lad-11": "draft", "lad-12": "active",
  "kid-1": "active", "kid-2": "active", "kid-3": "active", "kid-4": "active",
  "kid-5": "active", "kid-6": "active", "kid-7": "active", "kid-8": "active",
  "kid-9": "active", "kid-10": "active", "kid-11": "draft", "kid-12": "active",
  "bby-1": "active", "bby-2": "active", "bby-3": "active", "bby-4": "active",
  "bby-5": "active", "bby-6": "active", "bby-7": "active", "bby-8": "active",
  "bby-9": "active", "bby-10": "active", "bby-11": "draft", "bby-12": "active",
  "acc-1": "active", "acc-2": "active", "acc-3": "active", "acc-4": "active",
  "acc-5": "active", "acc-6": "draft",
};

const FEATURED = new Set(["lad-1", "lad-2", "kid-1", "kid-7", "bby-1", "bby-3"]);

const STOCK_MAP: Record<string, number> = {
  "lad-1": 12, "lad-2": 8,  "lad-3": 5,  "lad-4": 0,  "lad-5": 14,
  "lad-6": 3,  "lad-7": 7,  "lad-8": 6,  "lad-9": 9,  "lad-10": 4,
  "lad-11": 11, "lad-12": 2,
  "kid-1": 9,  "kid-2": 6,  "kid-3": 4,  "kid-4": 7,  "kid-5": 3,
  "kid-6": 8,  "kid-7": 2,  "kid-8": 5,  "kid-9": 11, "kid-10": 0,
  "kid-11": 6, "kid-12": 14,
  "bby-1": 6,  "bby-2": 8,  "bby-3": 11, "bby-4": 4,  "bby-5": 7,
  "bby-6": 3,  "bby-7": 9,  "bby-8": 5,  "bby-9": 2,  "bby-10": 13,
  "bby-11": 6, "bby-12": 8,
  "acc-1": 18, "acc-2": 24, "acc-3": 15, "acc-4": 12, "acc-5": 20, "acc-6": 9,
};

const CAT_LABEL: Record<string, string> = {
  "ladies-suits": "Stitched",
  "kids-formal":  "Girls",
  "baby-products": "Baby",
  "accessories":  "Accessories",
};

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const KIDS_SIZES  = ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"];
const PAGE_SIZE   = 15;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [page,        setPage]        = useState(1);
  const [showModal,   setShowModal]   = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct,setDeleteProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const sku    = SKU_MAP[p.id] ?? "";
      const status = STATUS_MAP[p.id] ?? "active";
      const stock  = STOCK_MAP[p.id] ?? 0;

      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (stockFilter === "in-stock"    && stock === 0) return false;
      if (stockFilter === "low-stock"   && (stock === 0 || stock > 5)) return false;
      if (stockFilter === "out-of-stock" && stock > 0) return false;
      if (priceFilter === "under-3000"  && p.price >= 3000) return false;
      if (priceFilter === "3000-6000"   && (p.price < 3000 || p.price > 6000)) return false;
      if (priceFilter === "over-6000"   && p.price <= 6000) return false;
      return true;
    });
  }, [search, catFilter, statusFilter, stockFilter, priceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <AdminShell title="Products">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">

          {/* Page header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl italic">Products</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Manage your inventory</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex h-11 items-center gap-2 bg-ink px-6 text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-gold-dark"
            >
              <Plus className="h-3.5 w-3.5" /> Add Product
            </button>
          </div>

          {/* Filter card */}
          <div className="mb-4 border border-border-soft bg-ivory p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-medium">All Products</span>
                <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                  {filtered.length} filtered out of {products.length} total
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <span>Page {safePage} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-7 w-7 items-center justify-center border border-border-soft transition-colors hover:bg-cream disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-7 w-7 items-center justify-center border border-border-soft transition-colors hover:bg-cream disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  placeholder="Search name or SKU…"
                  value={search}
                  onChange={(e) => handleFilter(setSearch)(e.target.value)}
                  className="h-9 w-full border border-border-soft bg-cream pl-9 pr-3 text-[12px] outline-none focus:border-ink"
                />
              </div>
              <select
                value={catFilter}
                onChange={(e) => handleFilter(setCatFilter)(e.target.value)}
                className="h-9 border border-border-soft bg-cream px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
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
                className="h-9 border border-border-soft bg-cream px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={stockFilter}
                onChange={(e) => handleFilter(setStockFilter)(e.target.value)}
                className="h-9 border border-border-soft bg-cream px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (≤5)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <select
                value={priceFilter}
                onChange={(e) => handleFilter(setPriceFilter)(e.target.value)}
                className="h-9 border border-border-soft bg-cream px-3 text-[12px] text-ink-soft outline-none focus:border-ink"
              >
                <option value="all">All Prices</option>
                <option value="under-3000">Under Rs. 3,000</option>
                <option value="3000-6000">Rs. 3,000 – 6,000</option>
                <option value="over-6000">Over Rs. 6,000</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border-soft bg-ivory">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream text-[10px] uppercase tracking-[0.22em] text-muted">
                  <tr>
                    <th className="w-14 px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 text-center font-medium">Stock</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {paginated.map((p) => {
                    const sku      = SKU_MAP[p.id]    ?? p.id.toUpperCase();
                    const status   = STATUS_MAP[p.id] ?? "active";
                    const stock    = STOCK_MAP[p.id]  ?? 0;
                    const featured = FEATURED.has(p.id);
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-4 py-3.5">
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-cream">
                            {p.image ? (
                              <Image src={p.image} alt={p.title} fill sizes="36px" className="object-cover object-top" />
                            ) : (
                              <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-[240px]">
                          <div className="line-clamp-2 text-[12px] font-medium leading-snug">{p.title}</div>
                          {featured && (
                            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-dark">Featured</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[10.5px] text-ink-soft">{sku}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="border border-border-soft bg-cream px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]">
                            {CAT_LABEL[p.category] ?? p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-[12px] font-medium">{formatPrice(p.price)}</div>
                          {p.compareAt && (
                            <div className="text-[11px] text-muted line-through">{formatPrice(p.compareAt)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[12px] font-medium tabular-nums ${
                            stock === 0 ? "text-sale" : stock <= 5 ? "text-gold-dark" : "text-sage"
                          }`}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                            status === "active"
                              ? "bg-sage/15 text-sage"
                              : "bg-border-soft text-ink-soft"
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setViewProduct(p)} className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink" title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setEditProduct(p)} className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-gold-dark" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteProduct(p)} className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-sale" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-14 text-center text-[12px] text-muted">
                        No products match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom pagination */}
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${
                      n === safePage ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      {showModal     && <AddProductModal    onClose={() => setShowModal(false)} />}
      {viewProduct   && <ViewProductModal   product={viewProduct}   onClose={() => setViewProduct(null)}    onEdit={() => { setEditProduct(viewProduct); setViewProduct(null); }} />}
      {editProduct   && <EditProductModal   product={editProduct}   onClose={() => setEditProduct(null)} />}
      {deleteProduct && <DeleteProductModal product={deleteProduct} onClose={() => setDeleteProduct(null)} />}
    </AdminShell>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

type SizeEntry = { enabled: boolean; stock: number };

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [sizeType, setSizeType] = useState<"adult" | "kids">("adult");
  const [adultSizes, setAdultSizes] = useState<Record<string, SizeEntry>>(
    Object.fromEntries(ADULT_SIZES.map((s) => [s, { enabled: false, stock: 0 }]))
  );
  const [kidsSizes, setKidsSizes] = useState<Record<string, SizeEntry>>(
    Object.fromEntries(KIDS_SIZES.map((s) => [s, { enabled: false, stock: 0 }]))
  );
  const [includeSizeGuide, setIncludeSizeGuide] = useState(false);
  const [featured, setFeatured] = useState(false);

  const sizes    = sizeType === "adult" ? adultSizes : kidsSizes;
  const setSizes = sizeType === "adult" ? setAdultSizes : setKidsSizes;
  const sizeLabels = sizeType === "adult" ? ADULT_SIZES : KIDS_SIZES;
  const anySizeEnabled = Object.values(sizes).some((v) => v.enabled);

  const toggleSize = (s: string) =>
    setSizes((prev) => ({ ...prev, [s]: { ...prev[s], enabled: !prev[s].enabled } }));

  const setStock = (s: string, val: number) =>
    setSizes((prev) => ({ ...prev, [s]: { ...prev[s], stock: val } }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-lg bg-ivory shadow-2xl md:max-w-2xl">

        {/* Modal header */}
        <div className="border-b border-border-soft px-6 py-5">
          <h2 className="font-display text-2xl italic">Create Product</h2>
          <p className="mt-0.5 text-[12px] text-gold-dark">Fill in the details to add a product.</p>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[76vh] space-y-5 overflow-y-auto px-6 py-5">

          {/* Name + SKU */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Product Name</span>
              <input placeholder="Classic T-Shirt" className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">SKU</span>
              <input placeholder="TSH-001" className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
            </label>
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Category</span>
              <select className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
                <option value="">Uncategorized</option>
                <option>Ladies Stitched Suits</option>
                <option>Kids Girls Wear</option>
                <option>Baby Products</option>
                <option>Accessories</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Status</span>
              <select className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink">
                <option>Draft</option>
                <option>Active</option>
              </select>
            </label>
          </div>

          {/* Product Images */}
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted">Product Images</div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border-soft bg-cream px-6 py-8 transition-colors hover:border-ink/30">
              <Upload className="h-6 w-6 text-muted" />
              <span className="text-[12px] text-ink-soft">Add Images</span>
              <span className="text-[11px] text-muted">PNG, JPG up to 10 MB each</span>
              <input type="file" accept="image/*" multiple className="sr-only" />
            </label>
          </div>

          {/* Price + Sale Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Price (Rs.)</span>
              <input type="number" defaultValue="0" className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Sale Price (Optional)</span>
              <input type="number" placeholder="" className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink" />
            </label>
          </div>

          {/* Sizes & Stock */}
          <div className="border border-border-soft bg-cream p-4">
            <div className="font-display text-[15px] italic">Sizes & Stock</div>
            <div className="mb-4 mt-0.5 text-[11px] text-gold-dark">
              Enable sizes and set stock per size. Total stock is auto-calculated.
            </div>

            {/* Type toggle */}
            <div className="mb-4 flex items-center gap-0">
              <span className="mr-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">Size Type:</span>
              {(["adult", "kids"] as const).map((t, i) => (
                <button
                  key={t}
                  onClick={() => setSizeType(t)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                    i === 1 ? "border-l-0" : ""
                  } ${
                    sizeType === t
                      ? "border-gold-dark bg-gold-dark text-ivory"
                      : "border-border-soft bg-ivory text-ink-soft hover:bg-cream"
                  }`}
                >
                  {t === "adult" ? "Adult Sizes" : "Kids / Baby Sizes"}
                </button>
              ))}
            </div>

            {/* Size grid */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sizeLabels.map((size) => {
                const s = sizes[size];
                return (
                  <div
                    key={size}
                    className={`flex items-center gap-2 border p-2.5 transition-colors ${
                      s.enabled ? "border-ink bg-ivory" : "border-border-soft bg-ivory/60"
                    }`}
                  >
                    <button
                      onClick={() => toggleSize(size)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                        s.enabled ? "border-ink bg-ink" : "border-muted"
                      }`}
                    >
                      {s.enabled && <Check className="h-2.5 w-2.5 text-ivory" />}
                    </button>
                    <span className={`w-8 text-[12px] uppercase tracking-[0.16em] ${s.enabled ? "text-ink" : "text-muted"}`}>
                      {size}
                    </span>
                    <input
                      type="number"
                      value={s.stock}
                      onChange={(e) => setStock(size, parseInt(e.target.value) || 0)}
                      disabled={!s.enabled}
                      className="w-0 flex-1 border-0 bg-transparent text-right text-[12px] outline-none disabled:text-muted"
                    />
                  </div>
                );
              })}
            </div>

            {/* Global stock */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Global Stock (no sizes enabled)</span>
              <input
                type="number"
                defaultValue="0"
                disabled={anySizeEnabled}
                className="h-10 border border-border-soft bg-ivory px-3 text-[13px] outline-none focus:border-ink disabled:opacity-40"
              />
            </label>
          </div>

          {/* Size Guide */}
          <div className="border border-border-soft bg-cream p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[15px] italic">Size Guide</div>
                <div className="mt-0.5 text-[11px] text-muted">
                  Add a measurement table customers can view on the product page.
                </div>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2">
                <button
                  onClick={() => setIncludeSizeGuide(!includeSizeGuide)}
                  className={`flex h-4 w-4 items-center justify-center border transition-colors ${
                    includeSizeGuide ? "border-ink bg-ink" : "border-muted"
                  }`}
                >
                  {includeSizeGuide && <Check className="h-2.5 w-2.5 text-ivory" />}
                </button>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Include Size Guide</span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Short Description</span>
            <textarea rows={2} placeholder="Brief summary…" className="resize-none border border-border-soft bg-cream px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>

          {/* Full Description */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Full Description</span>
            <textarea rows={4} placeholder="Detailed product information…" className="resize-none border border-border-soft bg-cream px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>

          {/* Featured */}
          <div className="border border-border-soft bg-cream p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <button
                onClick={() => setFeatured(!featured)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                  featured ? "border-ink bg-ink" : "border-muted"
                }`}
              >
                {featured && <Check className="h-2.5 w-2.5 text-ivory" />}
              </button>
              <div>
                <div className="font-display text-[15px] italic">Featured Product</div>
                <div className="mt-0.5 text-[11px] text-muted">This product will appear in featured sections.</div>
              </div>
            </label>
          </div>

          {/* SEO */}
          <div className="border border-border-soft bg-cream p-4 space-y-4">
            <div>
              <div className="font-display text-[15px] italic">SEO Configuration</div>
              <div className="mt-0.5 text-[11px] text-muted">Optimize this product for search engines.</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Slug (URL)</span>
                <input placeholder="Leave empty to auto-generate from name" className="h-10 border border-border-soft bg-ivory px-3 text-[12px] outline-none focus:border-ink" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Meta Title</span>
                <input placeholder="Browser Tab Title" className="h-10 border border-border-soft bg-ivory px-3 text-[12px] outline-none focus:border-ink" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Meta Description</span>
              <textarea rows={3} placeholder="Brief summary for search results…" className="resize-none border border-border-soft bg-ivory px-3 py-2.5 text-[12px] outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Keywords (Comma Separated)</span>
              <input placeholder="baby clothes, organic, cotton…" className="h-10 border border-border-soft bg-ivory px-3 text-[12px] outline-none focus:border-ink" />
            </label>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 border border-border-soft px-6 text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:bg-cream"
          >
            Cancel
          </button>
          <button className="h-10 bg-ink px-8 text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-gold-dark">
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Product Modal ───────────────────────────────────────────────────────

function ViewProductModal({
  product,
  onClose,
  onEdit,
}: {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}) {
  const sku      = SKU_MAP[product.id]    ?? product.id.toUpperCase();
  const status   = STATUS_MAP[product.id] ?? "active";
  const stock    = STOCK_MAP[product.id]  ?? 0;
  const featured = FEATURED.has(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-sm bg-ivory shadow-2xl md:max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div>
            <h2 className="font-display text-2xl italic">Product Details</h2>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted">{sku}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Image + name row */}
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-cream">
              {product.image ? (
                <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover object-top" />
              ) : (
                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }} />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-[12px] font-medium leading-snug">{product.title}</div>
                {featured && (
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-gold-dark">
                    <Star className="h-3 w-3 fill-gold-dark" /> Featured
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${status === "active" ? "bg-sage/15 text-sage" : "bg-border-soft text-ink-soft"}`}>
                  {status}
                </span>
                <span className="border border-border-soft bg-cream px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">
                  {CAT_LABEL[product.category] ?? product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Price row */}
          <div className="grid grid-cols-3 gap-3 border border-border-soft bg-cream p-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Price</div>
              <div className="mt-1 font-display text-xl italic">{formatPrice(product.price)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Sale Price</div>
              <div className="mt-1 font-display text-xl italic">
                {product.compareAt ? <span className="text-sale">{formatPrice(product.compareAt)}</span> : <span className="text-muted">—</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Stock</div>
              <div className={`mt-1 font-display text-xl italic tabular-nums ${stock === 0 ? "text-sale" : stock <= 5 ? "text-gold-dark" : "text-sage"}`}>
                {stock}
              </div>
            </div>
          </div>

          {/* Subcategory / slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Subcategory</div>
              <div className="mt-1 text-[12px]">{product.subcategory ?? "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Subtype</div>
              <div className="mt-1 text-[12px]">{product.subtype ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Close
          </button>
          <button onClick={onEdit} className="h-10 bg-ink px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold-dark">
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────

function EditProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const sku      = SKU_MAP[product.id]    ?? product.id.toUpperCase();
  const status   = STATUS_MAP[product.id] ?? "active";
  const stock    = STOCK_MAP[product.id]  ?? 0;
  const featured = FEATURED.has(product.id);

  const [name,        setName]        = useState(product.title);
  const [price,       setPrice]       = useState(String(product.price));
  const [compareAt,   setCompareAt]   = useState(product.compareAt ? String(product.compareAt) : "");
  const [stockVal,    setStockVal]    = useState(String(stock));
  const [statusVal,   setStatusVal]   = useState<"active" | "draft">(status);
  const [featuredVal, setFeaturedVal] = useState(featured);
  const [saved,       setSaved]       = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8">
      <div className="relative w-full max-w-sm bg-ivory shadow-2xl md:max-w-xl">
        {/* Header */}
        <div className="border-b border-border-soft px-6 py-5">
          <h2 className="font-display text-2xl italic">Edit Product</h2>
          <p className="mt-0.5 text-[12px] text-gold-dark">{sku}</p>
          <button onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Image preview */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream">
              {product.image ? (
                <Image src={product.image} alt={product.title} fill sizes="48px" className="object-cover object-top" />
              ) : (
                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }} />
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border-soft bg-cream px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink/40">
              <Upload className="h-3.5 w-3.5" /> Change Image
              <input type="file" accept="image/*" className="sr-only" />
            </label>
          </div>

          {/* Name */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Product Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
            />
          </label>

          {/* Price + Sale Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Price (Rs.)</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Sale Price (Optional)</span>
              <input
                type="number"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="—"
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
          </div>

          {/* Stock + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Stock</span>
              <input
                type="number"
                value={stockVal}
                onChange={(e) => setStockVal(e.target.value)}
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Status</span>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as "active" | "draft")}
                className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          {/* Category (read-only display) */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Category</div>
            <div className="mt-1.5 flex h-10 items-center border border-border-soft bg-cream/50 px-3 text-[13px] text-ink-soft">
              {CAT_LABEL[product.category] ?? product.category}
              <span className="ml-2 text-[10px] text-muted">(cannot change after creation)</span>
            </div>
          </div>

          {/* Featured */}
          <label className="flex cursor-pointer items-center gap-3">
            <button
              onClick={() => setFeaturedVal(!featuredVal)}
              className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${featuredVal ? "border-ink bg-ink" : "border-muted"}`}
            >
              {featuredVal && <Check className="h-2.5 w-2.5 text-ivory" />}
            </button>
            <span className="text-[12px]">Mark as <strong>Featured</strong> product</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`h-10 px-8 text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors ${saved ? "bg-sage" : "bg-ink hover:bg-gold-dark"}`}
          >
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Product Modal ─────────────────────────────────────────────────────

function DeleteProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const sku = SKU_MAP[product.id] ?? product.id.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4">
      <div className="w-full max-w-sm bg-ivory shadow-2xl">
        <div className="px-6 pt-6 pb-4">
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-sale/10">
            <AlertTriangle className="h-6 w-6 text-sale" />
          </div>
          <h2 className="font-display text-xl italic">Delete product?</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            <strong>{product.title}</strong> ({sku}) will be permanently removed from your catalog. This action cannot be undone.
          </p>
          {(STOCK_MAP[product.id] ?? 0) > 0 && (
            <div className="mt-3 flex items-start gap-2 border border-gold-dark/30 bg-gold/10 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
              <p className="text-[11px] leading-relaxed text-ink-soft">
                This product has <strong>{STOCK_MAP[product.id]} units</strong> in stock. Consider setting it to Draft instead.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button onClick={onClose} className="h-10 border border-border-soft px-5 text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-cream">
            Cancel
          </button>
          <button onClick={onClose} className="h-10 bg-sale px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:opacity-90">
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}
