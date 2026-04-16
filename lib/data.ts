export type NavChild = { label: string; href: string; badge?: string };
export type NavGroup = { title: string; items: NavChild[] };
export type NavColumn = { heading?: string; groups?: NavGroup[]; items?: NavChild[] };

export type MegaMenu = {
  label: string;
  href: string;
  columns: NavColumn[];
  feature?: { title: string; subtitle: string; href: string; tone: "rose" | "sage" | "gold" | "ink" };
};

export const megaMenus: MegaMenu[] = [
  {
    label: "Ladies",
    href: "/ladies",
    columns: [
      {
        heading: "Stitched Suits",
        items: [
          { label: "All Ladies Suits", href: "/ladies/suits", badge: "New" },
          { label: "3-Piece Formal Suits", href: "/ladies/suits/formal-3-piece" },
          { label: "Silk Suits", href: "/ladies/suits/silk" },
          { label: "Embroidered Suits", href: "/ladies/suits/embroidered" },
          { label: "Gold Brocade", href: "/ladies/suits/gold-brocade" },
          { label: "Mirror-Work Collection", href: "/ladies/suits/mirror-work" },
        ],
      },
      {
        heading: "By Occasion",
        items: [
          { label: "Formal & Party Wear", href: "/ladies/occasion/formal" },
          { label: "Wedding Guest", href: "/ladies/occasion/wedding" },
          { label: "Eid Collection", href: "/ladies/occasion/eid" },
          { label: "Daily Wear", href: "/ladies/occasion/daily" },
        ],
      },
      {
        heading: "By Style",
        items: [
          { label: "Classic Elegance", href: "/ladies/style/classic" },
          { label: "Contemporary Chic", href: "/ladies/style/contemporary" },
          { label: "Heritage Craft", href: "/ladies/style/heritage" },
          { label: "New Arrivals", href: "/ladies/new", badge: "Fresh" },
        ],
      },
    ],
    feature: {
      title: "Rosewood Elegance",
      subtitle: "3-piece formal suits handcrafted with silk and artisan embroidery.",
      href: "/ladies/suits/formal-3-piece",
      tone: "rose",
    },
  },
  {
    label: "Kids",
    href: "/kids",
    columns: [
      {
        heading: "Girls Formal Wear",
        items: [
          { label: "All Girls Wear", href: "/kids/girls" },
          { label: "Festive Co-Ord Sets", href: "/kids/girls/co-ord" },
          { label: "Formal Gowns", href: "/kids/girls/gowns" },
          { label: "Embroidered Gowns", href: "/kids/girls/embroidered" },
          { label: "3-Piece Silk Suits", href: "/kids/girls/silk-suits" },
          { label: "Sharara Sets", href: "/kids/girls/sharara" },
        ],
      },
      {
        heading: "By Age",
        items: [
          { label: "Newborn – 2 Years", href: "/kids/age/newborn" },
          { label: "3 – 6 Years", href: "/kids/age/toddler" },
          { label: "7 – 12 Years", href: "/kids/age/junior" },
        ],
      },
      {
        heading: "Collections",
        items: [
          { label: "Eid Special", href: "/kids/eid", badge: "New" },
          { label: "Party Wear", href: "/kids/party" },
          { label: "Kurtis & Shalwar", href: "/kids/kurtis" },
        ],
      },
    ],
    feature: {
      title: "Sunset Bloom",
      subtitle: "Festive co-ord sets for little girls — embroidered, silk-lined, celebration-ready.",
      href: "/kids/girls/co-ord",
      tone: "gold",
    },
  },
  {
    label: "Baby Products",
    href: "/baby",
    columns: [
      {
        heading: "Nursery Bedding",
        items: [
          { label: "All Bedding Sets", href: "/baby/bedding" },
          { label: "5-Piece Crib Sets", href: "/baby/bedding/5-piece" },
          { label: "6-Piece Bumper Sets", href: "/baby/bedding/6-piece" },
          { label: "Deluxe 10-Piece Sets", href: "/baby/bedding/10-piece" },
          { label: "Character Themes", href: "/baby/bedding/character" },
        ],
      },
      {
        heading: "Nests & Loungers",
        items: [
          { label: "Baby Nest Pods", href: "/baby/nests" },
          { label: "Swaddle Wraps", href: "/baby/swaddles" },
          { label: "Nursing Pillows", href: "/baby/nursing" },
          { label: "Carrier Covers", href: "/baby/carrier" },
        ],
      },
      {
        heading: "Essentials",
        items: [
          { label: "Diaper Totes", href: "/baby/diaper-bags" },
          { label: "Mattress & Pillow Sets", href: "/baby/mattress" },
          { label: "Gift Sets", href: "/baby/gifts", badge: "Popular" },
        ],
      },
    ],
    feature: {
      title: "Pastel Dream",
      subtitle: "10-piece deluxe plush nursery set — the complete starter for your nursery.",
      href: "/baby/bedding/10-piece",
      tone: "sage",
    },
  },
  {
    label: "Accessories",
    href: "/accessories",
    columns: [
      {
        heading: "Hair Accessories",
        items: [
          { label: "All Hair Accessories", href: "/accessories/hair" },
          { label: "Silk Headbands", href: "/accessories/hair/headbands" },
          { label: "Floral Hair Clips", href: "/accessories/hair/clips" },
          { label: "Headband & Clip Sets", href: "/accessories/hair/sets" },
        ],
      },
      {
        heading: "Gift Ideas",
        items: [
          { label: "Under Rs. 1,000", href: "/accessories/gifts/under-1000" },
          { label: "Gift Wrapping", href: "/accessories/gifts/wrap" },
        ],
      },
    ],
    feature: {
      title: "Handcrafted Silk",
      subtitle: "3-piece headband & floral clip sets — made by hand, gifted with love.",
      href: "/accessories/hair/sets",
      tone: "ink",
    },
  },
];

export const flatNav = [
  { label: "Ladies", href: "/ladies" },
  { label: "Kids", href: "/kids" },
  { label: "Baby Products", href: "/baby" },
  { label: "Accessories", href: "/accessories" },
  { label: "New Arrivals", href: "/new" },
  { label: "About", href: "/about" },
];

export type Product = {
  id: string;
  slug: string;
  title: string;
  collection: string;
  price: number;
  compareAt?: number;
  badge?: "New In" | "Bestseller" | "Limited" | "Restock";
  palette: [string, string, string];
  category: string;
  pieces?: string;
  image?: string;
};

const palettes: Array<Product["palette"]> = [
  ["#f2e0d8", "#c97a86", "#5a2030"],   // rosewood
  ["#dde0f0", "#5c6dab", "#1e2a5a"],   // indigo
  ["#eedbc4", "#b08040", "#3a2010"],   // bronze mocha
  ["#f0eae0", "#b0a890", "#3c3828"],   // pearl
  ["#f5e8c0", "#c8900c", "#5a3800"],   // golden amber
  ["#f8dce4", "#c0607a", "#4a1828"],   // rose jewel
  ["#e8d0c0", "#b07050", "#3c1a08"],   // dusty rose
  ["#e0d8e8", "#8878a8", "#2c2040"],   // royal plum
  ["#d0e4e0", "#507870", "#182c28"],   // teal
  ["#f4f0e8", "#989070", "#302c20"],   // ivory grace
  ["#e8d0d8", "#987090", "#301828"],   // magenta muse
  ["#f0c8c0", "#c04040", "#480808"],   // maroon charm
  ["#d4e8d0", "#507848", "#182810"],   // sandstone gingham (earthy green)
  ["#fff8e0", "#e8c840", "#5a4800"],   // sunny street (yellow)
  ["#f0e0f0", "#c090c0", "#401840"],   // pastel dream (lavender)
  ["#f8e0d8", "#e07858", "#582808"],   // coral stripe
];

// ─── Ladies Formal Suits ──────────────────────────────────────────────────
const ladiesSuits: (Pick<Product, "id" | "title" | "price" | "palette" | "badge" | "compareAt"> & { image?: string })[] = [
  { id: "lad-1", title: "Rosewood Elegance — 3-Piece Formal Suit", price: 6000, palette: palettes[0], badge: "Bestseller", image: "/products/indigo-floral.webp" },
  { id: "lad-2", title: "Indigo Radiance — 3-Piece Stitched Silk Suit with Gold Brocade Trim", price: 5000, palette: palettes[1], image: "/products/sage-chiffon.webp" },
  { id: "lad-3", title: "Bronze Mocha — 3-Piece Stitched Silk Suit with Sequin Artistry", price: 5000, palette: palettes[2], image: "/products/slate-printed.webp" },
  { id: "lad-4", title: "Pearl Radiance — 3-Piece Stitched Silk Suit with Silver Mirror-Work Trim", price: 5000, palette: palettes[3], badge: "New In", image: "/products/ivory-floral.webp" },
  { id: "lad-5", title: "Golden Amber — 3-Piece Stitched Silk Suit with Embroidered Neckline", price: 5000, palette: palettes[4], image: "/products/sky-embroidered.webp" },
  { id: "lad-6", title: "Rose Jewel — 3-Piece Stitched Silk Suit with Silver Metallic Trim", price: 5000, palette: palettes[5], image: "/products/blush-embroidered.webp" },
  { id: "lad-7", title: "Dusty Rose Elegance — 3-Piece Stitched Silk Suit with Antique Gold Gota", price: 5000, palette: palettes[6], image: "/products/pistachio-floral.webp" },
  { id: "lad-8", title: "Royal Plum — 3-Piece Stitched Silk Suit with Antique Gold Trim", price: 5000, palette: palettes[7] },
  { id: "lad-9", title: "Teal Enchantment — 3-Piece Stitched Silk Suit with Intricate Lace Work", price: 5000, palette: palettes[8] },
  { id: "lad-10", title: "Midnight Navy — 3-Piece Stitched Silk Suit with Silver V-Neck Detail", price: 4500, palette: palettes[1], compareAt: 5000 },
  { id: "lad-11", title: "Emerald Horizon — 3-Piece Stitched Raw Silk Suit", price: 5000, palette: palettes[8] },
  { id: "lad-12", title: "Fuchsia Bloom — 3-Piece Stitched Silk Suit with Silver Metallic Trim", price: 5000, palette: palettes[5], badge: "Limited" },
];

// ─── Kids Formal Wear ─────────────────────────────────────────────────────
const kidsFormal: Pick<Product, "id" | "title" | "price" | "palette" | "badge">[] = [
  { id: "kid-1", title: "Sunset Bloom — Girls Festive Co-Ord Set", price: 6000, palette: palettes[4], badge: "New In" },
  { id: "kid-2", title: "Blush Petal — Cape Style Girls Formal Set", price: 4000, palette: palettes[5] },
  { id: "kid-3", title: "Amber Radiance — Kids 3-Piece Stitched Silk Suit with Gold Foil Detailing", price: 3000, palette: palettes[4] },
  { id: "kid-4", title: "Magenta Muse — Kids 3-Piece Stitched Silk Suit with Silver Foil Accents", price: 3000, palette: palettes[10] },
  { id: "kid-5", title: "Maroon Charm — Kids 3-Piece Stitched Silk Suit with Gold Border", price: 3000, palette: palettes[11] },
  { id: "kid-6", title: "Ivory Grace — Kids 3-Piece Stitched Silk Suit with Net Dupatta", price: 3000, palette: palettes[9] },
  { id: "kid-7", title: "Royal Amethyst — Kids Two-Tone Embroidered Formal Gown", price: 3000, palette: palettes[7], badge: "Bestseller" },
  { id: "kid-8", title: "Marigold & Crimson — Kids Dual-Tone Embroidered Festive Gown", price: 3000, palette: palettes[4] },
  { id: "kid-9", title: "Rose Sparkle — Kids Long-Flare Festive Gown with Embellished Bodice", price: 3000, palette: palettes[5] },
  { id: "kid-10", title: "Crimson Bloom — Kids 3-Piece Stitched Silk Sharara Set", price: 3000, palette: palettes[11] },
  { id: "kid-11", title: "Teal Treasure — Kids 3-Piece Stitched Silk Suit with Silver Trim", price: 3000, palette: palettes[8] },
  { id: "kid-12", title: "Baby Girls Kurti & Shalwar — Embroidered Cotton", price: 3000, palette: palettes[0] },
];

// ─── Baby Bedding & Nursery ───────────────────────────────────────────────
const babyBedding: Pick<Product, "id" | "title" | "price" | "palette" | "badge">[] = [
  { id: "bby-1", title: "Sandstone Gingham — 5-Piece Deluxe Padded Crib Bedding Set", price: 6900, palette: palettes[12], badge: "Bestseller" },
  { id: "bby-2", title: "Sunny Street — 6-Piece Character-Themed Nursery Bedding & Bumper Set", price: 6500, palette: palettes[13] },
  { id: "bby-3", title: "Pastel Dream — Deluxe 10-Piece Plush Bumper & Travel Set", price: 9000, palette: palettes[14], badge: "New In" },
  { id: "bby-4", title: "Coral Stripe — 6-Piece Modern Nursery Bedding & Bumper Set", price: 8500, palette: palettes[15] },
  { id: "bby-5", title: "Little Athlete — 7-Piece Sports-Themed Nursery Bedding & Bumper Set", price: 8500, palette: palettes[1] },
  { id: "bby-6", title: "Little Explorer — 5-Piece Safari Nursery Bedding & Bumper Set", price: 7500, palette: palettes[12] },
  { id: "bby-7", title: "Sweet Hearts — Padded Baby Nest & Lounger Pod", price: 5500, palette: palettes[5], badge: "Bestseller" },
  { id: "bby-8", title: "Dino-Roar — Circular Padded Baby Nest & Lounger Pod", price: 6000, palette: palettes[8] },
  { id: "bby-9", title: "Butterfly Meadow — 4-Piece Padded Baby Nest & Pillow Set", price: 5500, palette: palettes[14] },
  { id: "bby-10", title: "Enchanted Forest — Padded Infant Car Seat & Carrier Cover", price: 2500, palette: palettes[12] },
  { id: "bby-11", title: "Sweet Hearts — 3-Piece Quilted Bedding Set with Matching Tote Bag", price: 7000, palette: palettes[5] },
  { id: "bby-12", title: "Butterfly Meadow — Padded Baby Swaddle Wrap with Oversized Bow", price: 3500, palette: palettes[14], badge: "New In" },
];

// ─── Accessories ──────────────────────────────────────────────────────────
const hairAccessories: Pick<Product, "id" | "title" | "price" | "palette" | "badge">[] = [
  { id: "acc-1", title: "Midnight Onyx — 3-Piece Handcrafted Silk Headband & Floral Clip Set", price: 500, palette: palettes[1] },
  { id: "acc-2", title: "Gilded Bronze — 3-Piece Handcrafted Silk Headband & Floral Clip Set", price: 500, palette: palettes[2], badge: "Bestseller" },
  { id: "acc-3", title: "Dusty Rose Blossom — 3-Piece Handcrafted Silk Headband & Hair Clip Set", price: 500, palette: palettes[6] },
  { id: "acc-4", title: "Maroon Radiance — 3-Piece Handcrafted Silk Headband & Hair Clip Set", price: 500, palette: palettes[11] },
  { id: "acc-5", title: "Pink Bloom — 3-Piece Handcrafted Silk Headband & Hair Clip Set", price: 500, palette: palettes[5] },
  { id: "acc-6", title: "Royal Plum — 3-Piece Handcrafted Silk Headband & Floral Clip Set", price: 500, palette: palettes[7], badge: "Limited" },
];

function makeProduct(
  base: Pick<Product, "id" | "title" | "price" | "palette"> & Partial<Product>,
  collection: string,
  category: string,
  extras: Partial<Product> = {},
): Product {
  return {
    slug: base.id,
    collection,
    category,
    compareAt: undefined,
    pieces: undefined,
    image: undefined,
    ...base,
    ...extras,
  };
}

export const products: Product[] = [
  ...ladiesSuits.map((p) => makeProduct(p, "Ladies Stitched Collection", "ladies-suits", { pieces: "3-piece" })),
  ...kidsFormal.map((p) => makeProduct(p, "Kids Festive Wear", "kids-formal")),
  ...babyBedding.map((p) => makeProduct(p, "Baby & Nursery Essentials", "baby-products")),
  ...hairAccessories.map((p) => makeProduct(p, "Handcrafted Accessories", "accessories")),
];

export const heroSlides = [
  {
    eyebrow: "Ladies Collection 2026",
    title: "Elegance Redefined",
    body:
      "Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — curated for the modern Pakistani woman.",
    cta: { label: "Shop Ladies", href: "/ladies/suits" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/hero-1.webp",
    tone: { from: "#f2e0d8", via: "#c97a86", to: "#5a2030" },
  },
  {
    eyebrow: "New Arrivals",
    title: "Crafted for Her",
    body:
      "Bold prints, refined silhouettes, and fabrics that move with you — the latest additions to the Habiba Minhas collection.",
    cta: { label: "Shop New Arrivals", href: "/new" },
    second: { label: "View All", href: "/shop" },
    image: "/hero-2.webp",
    tone: { from: "#eedbc4", via: "#b08040", to: "#3a2010" },
  },
  {
    eyebrow: "Summer Collection",
    title: "Dressed with Ease",
    body:
      "Light florals, easy silhouettes, and colours that bloom — summer fashion crafted with love in Pakistan.",
    cta: { label: "Shop Summer", href: "/ladies/suits" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/hero-3.webp",
    tone: { from: "#d0e8f0", via: "#70b0c8", to: "#204050" },
  },
];

export const categoryTiles = [
  { label: "Ladies Suits", href: "/ladies/suits", image: "/categories/ladies-suits.webp", tone: ["#f2e0d8", "#c97a86"] as const },
  { label: "Kids Formal", href: "/kids/girls", image: "/categories/kids-formal.webp", tone: ["#f5e8c0", "#c8900c"] as const },
  { label: "Baby Bedding", href: "/baby/bedding", image: "/categories/baby-bedding.webp", tone: ["#d4e8d0", "#507848"] as const },
  { label: "Baby Nests", href: "/baby/nests", image: "/categories/baby-nests.webp", tone: ["#f0e0f0", "#c090c0"] as const },
  { label: "Accessories", href: "/accessories/hair", image: "/categories/accessories.webp", tone: ["#eedbc4", "#b08040"] as const },
  { label: "New Arrivals", href: "/new", image: "/categories/new-arrivals.webp", tone: ["#dde0f0", "#5c6dab"] as const },
];

export const trendTiles = [
  { label: "Floral Lawn", href: "/ladies/suits", image: "/trending/floral-lawn.webp", tone: ["#c8ede4", "#e87aaa"] as const },
  { label: "Emerald Embroidery", href: "/ladies/suits/gold-brocade", image: "/trending/emerald-embroidery.webp", tone: ["#1a3a30", "#c8a84b"] as const },
  { label: "Sage & Bloom", href: "/ladies/suits", image: "/trending/sage-bloom.webp", tone: ["#c8d8b0", "#9090d0"] as const },
  { label: "Pink Blossom", href: "/ladies/suits", image: "/trending/pink-blossom.webp", tone: ["#f8e0e8", "#e07898"] as const },
];

export const promoMessages = [
  "Flat Rs. 200 Delivery Nationwide",
  "Premium Quality — Handcrafted with Love in Pakistan",
  "14-Day Easy Return Policy",
  "Free Shipping on Orders Over Rs. 5,000",
  "WhatsApp Support: +92 312 0295812",
];

export type Testimonial = { quote: string; name: string; city: string };
export const testimonials: Testimonial[] = [
  {
    quote:
      "The quality of the silk suit is beyond what I expected at this price. The embroidery is absolutely beautiful — I wore it to a wedding and got so many compliments.",
    name: "Fatima R.",
    city: "Karachi",
  },
  {
    quote:
      "Ordered the Pastel Dream nursery set for my baby — the padding is so thick and the fabric is incredibly soft. Fast delivery, beautifully packaged.",
    name: "Sara A.",
    city: "Lahore",
  },
  {
    quote:
      "The kids festive gown was perfect for Eid! Great stitching and my daughter loved the embellished bodice. Will definitely order again.",
    name: "Nadia K.",
    city: "Islamabad",
  },
];
