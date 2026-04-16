"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  GripVertical, Eye, EyeOff, ExternalLink, X, Check,
  FolderOpen, Folder,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type SubCategory = {
  id: string;
  label: string;
  href: string;
  badge?: string;
  productCount: number;
  visible: boolean;
};

type CategoryGroup = {
  heading: string;
  items: SubCategory[];
};

type TopCategory = {
  id: string;
  label: string;
  href: string;
  image: string;
  description: string;
  productCount: number;
  visible: boolean;
  featured: boolean;
  groups: CategoryGroup[];
};

const initialCategories: TopCategory[] = [
  {
    id: "ladies",
    label: "Ladies",
    href: "/ladies",
    image: "/editorial/ladies-collection.webp",
    description: "Premium ladies stitched suits, formal wear, and occasion dressing.",
    productCount: 12,
    visible: true,
    featured: true,
    groups: [
      {
        heading: "Stitched Suits",
        items: [
          { id: "l-1", label: "All Ladies Suits", href: "/ladies/suits", badge: "New", productCount: 12, visible: true },
          { id: "l-2", label: "3-Piece Formal Suits", href: "/ladies/suits/formal-3-piece", productCount: 5, visible: true },
          { id: "l-3", label: "Silk Suits", href: "/ladies/suits/silk", productCount: 4, visible: true },
          { id: "l-4", label: "Embroidered Suits", href: "/ladies/suits/embroidered", productCount: 6, visible: true },
          { id: "l-5", label: "Gold Brocade", href: "/ladies/suits/gold-brocade", productCount: 3, visible: true },
          { id: "l-6", label: "Mirror-Work Collection", href: "/ladies/suits/mirror-work", productCount: 2, visible: true },
        ],
      },
      {
        heading: "By Occasion",
        items: [
          { id: "l-7", label: "Formal & Party Wear", href: "/ladies/occasion/formal", productCount: 7, visible: true },
          { id: "l-8", label: "Wedding Guest", href: "/ladies/occasion/wedding", productCount: 4, visible: true },
          { id: "l-9", label: "Eid Collection", href: "/ladies/occasion/eid", productCount: 5, visible: true },
          { id: "l-10", label: "Daily Wear", href: "/ladies/occasion/daily", productCount: 3, visible: true },
        ],
      },
      {
        heading: "By Style",
        items: [
          { id: "l-11", label: "Classic Elegance", href: "/ladies/style/classic", productCount: 6, visible: true },
          { id: "l-12", label: "Contemporary Chic", href: "/ladies/style/contemporary", productCount: 4, visible: true },
          { id: "l-13", label: "Heritage Craft", href: "/ladies/style/heritage", productCount: 3, visible: true },
          { id: "l-14", label: "New Arrivals", href: "/ladies/new", badge: "Fresh", productCount: 4, visible: true },
        ],
      },
    ],
  },
  {
    id: "kids",
    label: "Kids",
    href: "/kids",
    image: "/editorial/kids-festive.webp",
    description: "Festive and formal wear for girls — gowns, co-ord sets, and silk suits.",
    productCount: 12,
    visible: true,
    featured: true,
    groups: [
      {
        heading: "Girls Formal Wear",
        items: [
          { id: "k-1", label: "All Girls Wear", href: "/kids/girls", productCount: 12, visible: true },
          { id: "k-2", label: "Festive Co-Ord Sets", href: "/kids/girls/co-ord", productCount: 4, visible: true },
          { id: "k-3", label: "Formal Gowns", href: "/kids/girls/gowns", productCount: 3, visible: true },
          { id: "k-4", label: "Embroidered Gowns", href: "/kids/girls/embroidered", productCount: 3, visible: true },
          { id: "k-5", label: "3-Piece Silk Suits", href: "/kids/girls/silk-suits", productCount: 5, visible: true },
          { id: "k-6", label: "Sharara Sets", href: "/kids/girls/sharara", productCount: 2, visible: true },
        ],
      },
      {
        heading: "By Age",
        items: [
          { id: "k-7", label: "Newborn – 2 Years", href: "/kids/age/newborn", productCount: 3, visible: true },
          { id: "k-8", label: "3 – 6 Years", href: "/kids/age/toddler", productCount: 5, visible: true },
          { id: "k-9", label: "7 – 12 Years", href: "/kids/age/junior", productCount: 7, visible: true },
        ],
      },
      {
        heading: "Collections",
        items: [
          { id: "k-10", label: "Eid Special", href: "/kids/eid", badge: "New", productCount: 4, visible: true },
          { id: "k-11", label: "Party Wear", href: "/kids/party", productCount: 6, visible: true },
          { id: "k-12", label: "Kurtis & Shalwar", href: "/kids/kurtis", productCount: 3, visible: true },
        ],
      },
    ],
  },
  {
    id: "baby",
    label: "Baby Products",
    href: "/baby",
    image: "/editorial/baby-nursery.webp",
    description: "Handcrafted nursery bedding sets, baby nests, swaddle wraps, and essentials.",
    productCount: 12,
    visible: true,
    featured: true,
    groups: [
      {
        heading: "Nursery Bedding",
        items: [
          { id: "b-1", label: "All Bedding Sets", href: "/baby/bedding", productCount: 6, visible: true },
          { id: "b-2", label: "5-Piece Crib Sets", href: "/baby/bedding/5-piece", productCount: 2, visible: true },
          { id: "b-3", label: "6-Piece Bumper Sets", href: "/baby/bedding/6-piece", productCount: 2, visible: true },
          { id: "b-4", label: "Deluxe 10-Piece Sets", href: "/baby/bedding/10-piece", productCount: 2, visible: true },
          { id: "b-5", label: "Character Themes", href: "/baby/bedding/character", productCount: 3, visible: true },
        ],
      },
      {
        heading: "Nests & Loungers",
        items: [
          { id: "b-6", label: "Baby Nest Pods", href: "/baby/nests", productCount: 3, visible: true },
          { id: "b-7", label: "Swaddle Wraps", href: "/baby/swaddles", productCount: 2, visible: true },
          { id: "b-8", label: "Nursing Pillows", href: "/baby/nursing", productCount: 1, visible: true },
          { id: "b-9", label: "Carrier Covers", href: "/baby/carrier", productCount: 1, visible: false },
        ],
      },
      {
        heading: "Essentials",
        items: [
          { id: "b-10", label: "Diaper Totes", href: "/baby/diaper-bags", productCount: 2, visible: true },
          { id: "b-11", label: "Mattress & Pillow Sets", href: "/baby/mattress", productCount: 2, visible: true },
          { id: "b-12", label: "Gift Sets", href: "/baby/gifts", badge: "Popular", productCount: 3, visible: true },
        ],
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    href: "/accessories",
    image: "/editorial/accessories.webp",
    description: "Handcrafted silk headbands, floral hair clips, and curated gift sets.",
    productCount: 6,
    visible: true,
    featured: false,
    groups: [
      {
        heading: "Hair Accessories",
        items: [
          { id: "a-1", label: "All Hair Accessories", href: "/accessories/hair", productCount: 6, visible: true },
          { id: "a-2", label: "Silk Headbands", href: "/accessories/hair/headbands", productCount: 3, visible: true },
          { id: "a-3", label: "Floral Hair Clips", href: "/accessories/hair/clips", productCount: 3, visible: true },
          { id: "a-4", label: "Headband & Clip Sets", href: "/accessories/hair/sets", productCount: 4, visible: true },
        ],
      },
      {
        heading: "Gift Ideas",
        items: [
          { id: "a-5", label: "Under Rs. 1,000", href: "/accessories/gifts/under-1000", productCount: 6, visible: true },
          { id: "a-6", label: "Gift Wrapping", href: "/accessories/gifts/wrap", productCount: 0, visible: false },
        ],
      },
    ],
  },
];

const palette: Record<string, { light: string; accent: string }> = {
  ladies:      { light: "#fdf5f0", accent: "#c97a86" },
  kids:        { light: "#fffbec", accent: "#c8900c" },
  baby:        { light: "#f3faf5", accent: "#507848" },
  accessories: { light: "#fdf8ee", accent: "#b08040" },
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ ladies: true });
  const [editing, setEditing] = useState<TopCategory | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const toggleExpanded = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const toggleCatVisible = (id: string) =>
    setCategories((cats) => cats.map((c) => c.id === id ? { ...c, visible: !c.visible } : c));

  const toggleSubVisible = (catId: string, subId: string) =>
    setCategories((cats) => cats.map((c) =>
      c.id !== catId ? c : {
        ...c,
        groups: c.groups.map((g) => ({
          ...g,
          items: g.items.map((it) => it.id === subId ? { ...it, visible: !it.visible } : it),
        })),
      }
    ));

  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0);
  const totalSubs = categories.reduce((s, c) => s + c.groups.reduce((ss, g) => ss + g.items.length, 0), 0);
  const hiddenCount = categories.reduce((s, c) => s + c.groups.reduce((ss, g) => ss + g.items.filter(i => !i.visible).length, 0), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title="Categories" />
        <div className="flex flex-1 overflow-hidden">

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
              {[
                { label: "Top-level categories", value: categories.length },
                { label: "Sub-categories", value: totalSubs },
                { label: "Total products", value: totalProducts },
                { label: "Hidden items", value: hiddenCount },
              ].map((s) => (
                <div key={s.label} className="border border-border-soft bg-ivory p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{s.label}</div>
                  <div className="mt-1.5 font-display text-2xl italic">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-ink-soft">
                Manage the category tree shown in the navigation and storefront.
              </p>
              <button className="flex h-9 items-center gap-2 bg-ink px-5 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-gold-dark transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add category
              </button>
            </div>

            {/* Category cards */}
            <div className="flex flex-col gap-4">
              {categories.map((cat) => {
                const isExpanded = !!expanded[cat.id];
                const colors = palette[cat.id] ?? { light: "#faf7f1", accent: "#b89464" };
                const allSubCount = cat.groups.reduce((s, g) => s + g.items.length, 0);
                const hiddenSubs = cat.groups.reduce((s, g) => s + g.items.filter(i => !i.visible).length, 0);

                return (
                  <div key={cat.id} className="border border-border-soft bg-ivory overflow-hidden">
                    {/* Category header */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-cream/50 transition-colors"
                      onClick={() => toggleExpanded(cat.id)}
                    >
                      <GripVertical className="h-4 w-4 text-muted shrink-0 cursor-grab" />

                      {/* Image */}
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-cream">
                        <Image src={cat.image} alt={cat.label} fill sizes="44px" className="object-cover object-top" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-xl italic leading-none">{cat.label}</span>
                          {cat.featured && (
                            <span className="border border-gold/40 bg-gold/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-gold-dark">
                              Featured
                            </span>
                          )}
                          {!cat.visible && (
                            <span className="border border-sale/30 bg-sale/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-sale">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-[11px] text-muted">
                          <span>{cat.productCount} products</span>
                          <span>{allSubCount} sub-categories</span>
                          {hiddenSubs > 0 && <span className="text-gold-dark">{hiddenSubs} hidden</span>}
                          <span className="font-mono">{cat.href}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={cat.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center text-muted hover:bg-cream hover:text-ink transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => toggleCatVisible(cat.id)}
                          className={`flex h-8 w-8 items-center justify-center transition-colors ${
                            cat.visible ? "text-muted hover:bg-cream hover:text-ink" : "text-sale hover:bg-cream"
                          }`}
                          title={cat.visible ? "Hide category" : "Show category"}
                        >
                          {cat.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setEditing(cat)}
                          className="flex h-8 w-8 items-center justify-center text-muted hover:bg-cream hover:text-gold-dark transition-colors"
                          title="Edit category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-muted hover:bg-cream hover:text-sale transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center text-muted transition-colors">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {isExpanded && (
                      <div className="border-t border-border-soft" style={{ background: colors.light }}>
                        {cat.groups.map((group) => (
                          <div key={group.heading} className="border-b border-border-soft/60 last:border-b-0">
                            {/* Group heading */}
                            <div className="flex items-center justify-between px-6 py-2.5">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-3.5 w-3.5" style={{ color: colors.accent }} />
                                <span className="text-[11px] uppercase tracking-[0.26em]" style={{ color: colors.accent }}>
                                  {group.heading}
                                </span>
                                <span className="text-[10px] text-muted">({group.items.length})</span>
                              </div>
                              <button className="flex h-7 items-center gap-1.5 px-3 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors border border-transparent hover:border-border-soft">
                                <Plus className="h-3 w-3" /> Add sub
                              </button>
                            </div>

                            {/* Sub-category rows */}
                            <div className="flex flex-col">
                              {group.items.map((sub) => (
                                <div
                                  key={sub.id}
                                  className={`flex items-center gap-3 px-6 py-2.5 border-t border-border-soft/40 transition-colors ${
                                    !sub.visible ? "opacity-50" : ""
                                  } hover:bg-white/60`}
                                >
                                  <GripVertical className="h-3.5 w-3.5 text-muted/40 cursor-grab shrink-0" />

                                  <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[13px] font-medium truncate">{sub.label}</span>
                                      {sub.badge && (
                                        <span className="shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em]"
                                          style={{ borderColor: colors.accent + "50", color: colors.accent }}>
                                          {sub.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-muted font-mono hidden sm:inline truncate">{sub.href}</span>
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-[11px] text-muted hidden md:inline">
                                      {sub.productCount} products
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => toggleSubVisible(cat.id, sub.id)}
                                        className={`flex h-7 w-7 items-center justify-center transition-colors ${
                                          sub.visible ? "text-muted hover:text-ink" : "text-sale"
                                        }`}
                                        title={sub.visible ? "Hide" : "Show"}
                                      >
                                        {sub.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => setEditingSubId(sub.id)}
                                        className="flex h-7 w-7 items-center justify-center text-muted hover:text-gold-dark transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        className="flex h-7 w-7 items-center justify-center text-muted hover:text-sale transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Add group */}
                        <div className="px-6 py-3">
                          <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] transition-colors hover:opacity-80" style={{ color: colors.accent }}>
                            <Plus className="h-3.5 w-3.5" /> Add category group
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit panel */}
          {editing && (
            <div className="w-80 shrink-0 border-l border-border-soft bg-ivory flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
                <h2 className="font-display text-xl italic">Edit category</h2>
                <button onClick={() => setEditing(null)} className="text-muted hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-5 p-5">
                {/* Image preview */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
                  <Image src={editing.image} alt={editing.label} fill sizes="320px" className="object-cover object-top" />
                  <button className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 hover:opacity-100 transition-opacity text-[11px] uppercase tracking-[0.24em] text-ivory">
                    Change image
                  </button>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Category name</span>
                  <input
                    defaultValue={editing.label}
                    className="h-10 border border-border-soft bg-cream px-3 text-[13px] outline-none focus:border-ink"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">URL slug</span>
                  <input
                    defaultValue={editing.href}
                    className="h-10 border border-border-soft bg-cream px-3 font-mono text-[12px] outline-none focus:border-ink"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Description</span>
                  <textarea
                    rows={3}
                    defaultValue={editing.description}
                    className="border border-border-soft bg-cream px-3 py-2 text-[13px] outline-none focus:border-ink resize-none"
                  />
                </label>

                <div className="flex flex-col gap-3 border-t border-border-soft pt-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[12px] text-ink-soft">Visible on storefront</span>
                    <button
                      onClick={() => setEditing({ ...editing, visible: !editing.visible })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${editing.visible ? "bg-ink" : "bg-border-soft"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${editing.visible ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[12px] text-ink-soft">Show in featured tiles</span>
                    <button
                      onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${editing.featured ? "bg-ink" : "bg-border-soft"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${editing.featured ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </label>
                </div>

                <div className="flex gap-3 border-t border-border-soft pt-4">
                  <button
                    onClick={() => setEditing(null)}
                    className="flex-1 h-10 border border-border-soft text-[11px] uppercase tracking-[0.22em] text-ink-soft hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCategories((cats) => cats.map((c) => c.id === editing.id ? editing : c));
                      setEditing(null);
                    }}
                    className="flex-1 h-10 bg-ink text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-gold-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
