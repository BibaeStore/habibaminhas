import Image from "next/image";
import { Plus, Search, Filter, Download, Pencil, Trash2, Eye } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Products | Admin" };

const stockMap: Record<string, number> = {
  "lad-1": 12, "lad-2": 8, "lad-3": 5, "lad-4": 0, "lad-5": 14,
  "lad-6": 3, "lad-7": 7, "kid-1": 9, "kid-7": 2, "bby-1": 6,
  "bby-3": 11, "bby-7": 4,
};

const categories = ["All", "Ladies", "Kids", "Baby", "Accessories"];

export default function AdminProductsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Products" />
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border-soft pb-4">
            {categories.map((c) => (
              <button
                key={c}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  c === "All"
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search products…"
                className="h-9 w-64 border border-border-soft bg-ivory pl-9 pr-3 text-[12px] outline-none focus:border-ink"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="flex h-9 items-center gap-2 border border-border-soft bg-ivory px-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:bg-cream">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button className="flex h-9 items-center gap-2 bg-ink px-5 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add product
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
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Badge</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {products.map((p) => {
                    const stock = stockMap[p.id] ?? Math.floor(Math.random() * 20) + 1;
                    return (
                      <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-cream">
                              {p.image ? (
                                <Image src={p.image} alt={p.title} fill sizes="36px" className="object-cover object-top" />
                              ) : (
                                <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                              )}
                            </div>
                            <div>
                              <div className="line-clamp-1 text-[12px] font-medium max-w-[220px]">{p.title}</div>
                              <div className="text-[11px] text-muted">{p.id} · {p.collection}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-ink-soft">{p.category}</td>
                        <td className="px-5 py-3.5">
                          <div className="text-[12px] font-medium">{formatPrice(p.price)}</div>
                          {p.compareAt && (
                            <div className="text-[11px] text-muted line-through">{formatPrice(p.compareAt)}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[12px] font-medium ${
                            stock === 0 ? "text-sale" : stock <= 3 ? "text-gold-dark" : "text-sage"
                          }`}>
                            {stock === 0 ? "Out of stock" : `${stock} units`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.badge ? (
                            <span className="border border-border-soft bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button className="flex h-7 w-7 items-center justify-center text-muted hover:bg-cream hover:text-ink transition-colors" title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center text-muted hover:bg-cream hover:text-gold-dark transition-colors" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center text-muted hover:bg-cream hover:text-sale transition-colors" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3">
              <span className="text-[12px] text-muted">{products.length} products total</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button key={p} className={`flex h-8 w-8 items-center justify-center text-[12px] transition-colors ${p === 1 ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
