export type NavChild = { label: string; href: string; badge?: string };
export type NavGroup = { title: string; items: NavChild[] };
export type NavColumn = { heading?: string; groups?: NavGroup[]; items?: NavChild[] };

export type MegaMenu = {
  label: string;
  href: string;
  columns: NavColumn[];
  feature?: { title: string; subtitle: string; href: string; tone: "rose" | "sage" | "gold" | "ink"; image?: string };
};

export const megaMenus: MegaMenu[] = [
  {
    label: "Ladies",
    href: "/ladies",
    columns: [
      {
        heading: "Stitched Suits",
        items: [
          { label: "All Ladies Suits", href: "/ladies", badge: "New" },
          { label: "3-Piece Formal Suits", href: "/ladies" },
          { label: "Silk Suits", href: "/ladies" },
          { label: "Embroidered Suits", href: "/ladies" },
          { label: "Gold Brocade", href: "/ladies" },
          { label: "Mirror-Work Collection", href: "/ladies" },
        ],
      },
      {
        heading: "By Occasion",
        items: [
          { label: "Formal & Party Wear", href: "/ladies" },
          { label: "Wedding Guest", href: "/ladies" },
          { label: "Eid Collection", href: "/ladies" },
          { label: "Daily Wear", href: "/ladies" },
        ],
      },
      {
        heading: "By Style",
        items: [
          { label: "Classic Elegance", href: "/ladies" },
          { label: "Contemporary Chic", href: "/ladies" },
          { label: "Heritage Craft", href: "/ladies" },
          { label: "New Arrivals", href: "/new", badge: "Fresh" },
        ],
      },
    ],
    feature: {
      title: "Rosewood Elegance",
      subtitle: "3-piece formal suits handcrafted with silk and artisan embroidery.",
      href: "/ladies",
      tone: "rose",
      image: "/editorial/ladies-collection.webp",
    },
  },
  {
    label: "Kids",
    href: "/kids",
    columns: [
      {
        heading: "Girls Formal Wear",
        items: [
          { label: "All Girls Wear", href: "/kids" },
          { label: "Festive Co-Ord Sets", href: "/kids" },
          { label: "Formal Gowns", href: "/kids" },
          { label: "Embroidered Gowns", href: "/kids" },
          { label: "3-Piece Silk Suits", href: "/kids" },
          { label: "Sharara Sets", href: "/kids" },
        ],
      },
      {
        heading: "By Age",
        items: [
          { label: "Newborn – 2 Years", href: "/kids" },
          { label: "3 – 6 Years", href: "/kids" },
          { label: "7 – 12 Years", href: "/kids" },
        ],
      },
      {
        heading: "Collections",
        items: [
          { label: "Eid Special", href: "/kids", badge: "New" },
          { label: "Party Wear", href: "/kids" },
          { label: "Kurtis & Shalwar", href: "/kids" },
        ],
      },
    ],
    feature: {
      title: "Sunset Bloom",
      subtitle: "Festive co-ord sets for little girls — embroidered, silk-lined, celebration-ready.",
      href: "/kids",
      tone: "gold",
      image: "/products/royal-amethyst-gown.webp",
    },
  },
  {
    label: "Baby Products",
    href: "/baby",
    columns: [
      {
        heading: "Nursery Bedding",
        items: [
          { label: "All Bedding Sets", href: "/baby" },
          { label: "5-Piece Crib Sets", href: "/baby" },
          { label: "6-Piece Bumper Sets", href: "/baby" },
          { label: "Deluxe 10-Piece Sets", href: "/baby" },
          { label: "Character Themes", href: "/baby" },
        ],
      },
      {
        heading: "Nests & Loungers",
        items: [
          { label: "Baby Nest Pods", href: "/baby" },
          { label: "Swaddle Wraps", href: "/baby" },
          { label: "Nursing Pillows", href: "/baby" },
          { label: "Carrier Covers", href: "/baby" },
        ],
      },
      {
        heading: "Essentials",
        items: [
          { label: "Diaper Totes", href: "/baby" },
          { label: "Mattress & Pillow Sets", href: "/baby" },
          { label: "Gift Sets", href: "/baby", badge: "Popular" },
        ],
      },
    ],
    feature: {
      title: "Pastel Dream",
      subtitle: "10-piece deluxe plush nursery set — the complete starter for your nursery.",
      href: "/baby",
      tone: "sage",
      image: "/products/pastel-dream-nursery.webp",
    },
  },
  {
    label: "Accessories",
    href: "/accessories",
    columns: [
      {
        heading: "Hair Accessories",
        items: [
          { label: "All Hair Accessories", href: "/accessories" },
          { label: "Silk Headbands", href: "/accessories" },
          { label: "Floral Hair Clips", href: "/accessories" },
          { label: "Headband & Clip Sets", href: "/accessories" },
        ],
      },
      {
        heading: "Gift Ideas",
        items: [
          { label: "Under Rs. 1,000", href: "/accessories" },
          { label: "Gift Wrapping", href: "/accessories" },
        ],
      },
    ],
    feature: {
      title: "Handcrafted Silk",
      subtitle: "3-piece headband & floral clip sets — made by hand, gifted with love.",
      href: "/accessories",
      tone: "ink",
      image: "/editorial/accessories.webp",
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
  subcategory?: string;
  subtype?: string;
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
const kidsFormal: (Pick<Product, "id" | "title" | "price" | "palette" | "badge"> & { image?: string })[] = [
  { id: "kid-1", title: "Sunset Bloom — Girls Festive Co-Ord Set", price: 6000, palette: palettes[4], badge: "New In", image: "/products/sunset-bloom-festive.webp" },
  { id: "kid-2", title: "Blush Petal — Cape Style Girls Formal Set", price: 4000, palette: palettes[5] },
  { id: "kid-3", title: "Amber Radiance — Kids 3-Piece Stitched Silk Suit with Gold Foil Detailing", price: 3000, palette: palettes[4] },
  { id: "kid-4", title: "Magenta Muse — Kids 3-Piece Stitched Silk Suit with Silver Foil Accents", price: 3000, palette: palettes[10] },
  { id: "kid-5", title: "Maroon Charm — Kids 3-Piece Stitched Silk Suit with Gold Border", price: 3000, palette: palettes[11] },
  { id: "kid-6", title: "Ivory Grace — Kids 3-Piece Stitched Silk Suit with Net Dupatta", price: 3000, palette: palettes[9] },
  { id: "kid-7", title: "Royal Amethyst — Kids Two-Tone Embroidered Formal Gown", price: 3000, palette: palettes[7], badge: "Bestseller", image: "/products/royal-amethyst-gown.webp" },
  { id: "kid-8", title: "Marigold & Crimson — Kids Dual-Tone Embroidered Festive Gown", price: 3000, palette: palettes[4] },
  { id: "kid-9", title: "Rose Sparkle — Kids Long-Flare Festive Gown with Embellished Bodice", price: 3000, palette: palettes[5] },
  { id: "kid-10", title: "Crimson Bloom — Kids 3-Piece Stitched Silk Sharara Set", price: 3000, palette: palettes[11] },
  { id: "kid-11", title: "Teal Treasure — Kids 3-Piece Stitched Silk Suit with Silver Trim", price: 3000, palette: palettes[8] },
  { id: "kid-12", title: "Baby Girls Kurti & Shalwar — Embroidered Cotton", price: 3000, palette: palettes[0] },
];

// ─── Baby Bedding & Nursery ───────────────────────────────────────────────
const babyBedding: (Pick<Product, "id" | "title" | "price" | "palette" | "badge"> & { image?: string })[] = [
  { id: "bby-1", title: "Sandstone Gingham — 5-Piece Deluxe Padded Crib Bedding Set", price: 6900, palette: palettes[12], badge: "Bestseller", image: "/products/sandstone-gingham-bedding.webp" },
  { id: "bby-2", title: "Sunny Street — 6-Piece Character-Themed Nursery Bedding & Bumper Set", price: 6500, palette: palettes[13] },
  { id: "bby-3", title: "Pastel Dream — Deluxe 10-Piece Plush Bumper & Travel Set", price: 9000, palette: palettes[14], badge: "New In", image: "/products/pastel-dream-nursery.webp" },
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
    subcategory: undefined,
    subtype: undefined,
    ...base,
    ...extras,
  };
}

const ladiesSubtypes: Record<string, string> = {
  "lad-1": "formal-3-piece",
  "lad-2": "gold-brocade",
  "lad-3": "embroidered",
  "lad-4": "mirror-work",
  "lad-5": "embroidered",
  "lad-6": "silk",
  "lad-7": "embroidered",
  "lad-8": "silk",
  "lad-9": "embroidered",
  "lad-10": "silk",
  "lad-11": "silk",
  "lad-12": "silk",
};

const kidsData: Record<string, { subcategory: string; subtype?: string }> = {
  "kid-1":  { subcategory: "girls", subtype: "co-ord" },
  "kid-2":  { subcategory: "girls", subtype: "gowns" },
  "kid-3":  { subcategory: "girls", subtype: "silk-suits" },
  "kid-4":  { subcategory: "girls", subtype: "silk-suits" },
  "kid-5":  { subcategory: "girls", subtype: "silk-suits" },
  "kid-6":  { subcategory: "girls", subtype: "silk-suits" },
  "kid-7":  { subcategory: "girls", subtype: "embroidered" },
  "kid-8":  { subcategory: "girls", subtype: "gowns" },
  "kid-9":  { subcategory: "girls", subtype: "gowns" },
  "kid-10": { subcategory: "girls", subtype: "sharara" },
  "kid-11": { subcategory: "girls", subtype: "silk-suits" },
  "kid-12": { subcategory: "kurtis" },
};

const babyData: Record<string, { subcategory: string; subtype?: string }> = {
  "bby-1":  { subcategory: "bedding", subtype: "5-piece" },
  "bby-2":  { subcategory: "bedding", subtype: "character" },
  "bby-3":  { subcategory: "bedding", subtype: "10-piece" },
  "bby-4":  { subcategory: "bedding", subtype: "6-piece" },
  "bby-5":  { subcategory: "bedding", subtype: "character" },
  "bby-6":  { subcategory: "bedding", subtype: "character" },
  "bby-7":  { subcategory: "nests" },
  "bby-8":  { subcategory: "nests" },
  "bby-9":  { subcategory: "nests" },
  "bby-10": { subcategory: "carrier" },
  "bby-11": { subcategory: "bedding", subtype: "character" },
  "bby-12": { subcategory: "swaddles" },
};

export const products: Product[] = [
  ...ladiesSuits.map((p) =>
    makeProduct(p, "Ladies Stitched Collection", "ladies-suits", {
      pieces: "3-piece",
      subcategory: "suits",
      subtype: ladiesSubtypes[p.id],
    })
  ),
  ...kidsFormal.map((p) =>
    makeProduct(p, "Kids Festive Wear", "kids-formal", kidsData[p.id] ?? {})
  ),
  ...babyBedding.map((p) =>
    makeProduct(p, "Baby & Nursery Essentials", "baby-products", babyData[p.id] ?? {})
  ),
  ...hairAccessories.map((p) =>
    makeProduct(p, "Handcrafted Accessories", "accessories", {
      subcategory: "hair",
      subtype: "sets",
    })
  ),
];

export const heroSlides = [
  {
    eyebrow: "Ladies Collection 2026",
    title: "Elegance Redefined",
    body:
      "Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — curated for the modern Pakistani woman.",
    cta: { label: "Shop Ladies", href: "/ladies" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/ladies-suits.webp",
    tone: { from: "#f2e0d8", via: "#c97a86", to: "#5a2030" },
  },
  {
    eyebrow: "Kids Festive Wear",
    title: "Little Stars, Big Moments",
    body:
      "Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration worth dressing up for.",
    cta: { label: "Shop Kids", href: "/kids" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/kids-formal.webp",
    tone: { from: "#f5e8c0", via: "#c8900c", to: "#5a3800" },
  },
  {
    eyebrow: "Baby & Nursery",
    title: "Soft from the Start",
    body:
      "Deluxe padded crib bedding sets, baby nest pods, swaddle wraps — everything your nursery needs, made with love in Pakistan.",
    cta: { label: "Shop Baby Bedding", href: "/baby" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/baby-bedding.webp",
    tone: { from: "#f0e0f0", via: "#c090c0", to: "#401840" },
  },
  {
    eyebrow: "Baby Nests",
    title: "Cosy from Day One",
    body:
      "Soft, padded baby nest pods designed for comfort and peaceful sleep — handcrafted with the finest materials.",
    cta: { label: "Shop Baby Nests", href: "/baby" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/baby-nests.webp",
    tone: { from: "#d0e8f0", via: "#70b0c8", to: "#204050" },
  },
  {
    eyebrow: "Handcrafted Accessories",
    title: "Finished by Hand",
    body:
      "3-piece handcrafted silk headband & floral clip sets — made with the same care as our fashion pieces, gifted with love.",
    cta: { label: "Shop Accessories", href: "/accessories" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/accessories.webp",
    tone: { from: "#eedbc4", via: "#b08040", to: "#3a2010" },
  },
  {
    eyebrow: "New Arrivals",
    title: "Just In",
    body:
      "The latest additions to the Habiba Minhas collection — bold prints, refined silhouettes, and fabrics that move with you.",
    cta: { label: "Shop New Arrivals", href: "/new" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/new-arrivals.webp",
    tone: { from: "#dde0f0", via: "#5c6dab", to: "#1e2a5a" },
  },
];

export const categoryTiles = [
  { label: "Ladies Suits", href: "/ladies", image: "/categories/ladies-suits.webp", tone: ["#f2e0d8", "#c97a86"] as const },
  { label: "Kids Formal", href: "/kids", image: "/categories/kids-formal.webp", tone: ["#f5e8c0", "#c8900c"] as const },
  { label: "Baby Bedding", href: "/baby", image: "/categories/baby-bedding.webp", tone: ["#d4e8d0", "#507848"] as const },
  { label: "Baby Nests", href: "/baby", image: "/categories/baby-nests.webp", tone: ["#f0e0f0", "#c090c0"] as const },
  { label: "Accessories", href: "/accessories", image: "/categories/accessories.webp", tone: ["#eedbc4", "#b08040"] as const },
  { label: "New Arrivals", href: "/new", image: "/categories/new-arrivals.webp", tone: ["#dde0f0", "#5c6dab"] as const },
];

export const trendTiles = [
  { label: "Floral Lawn", href: "/ladies", image: "/trending/floral-lawn.webp", tone: ["#c8ede4", "#e87aaa"] as const },
  { label: "Emerald Embroidery", href: "/ladies", image: "/trending/emerald-embroidery.webp", tone: ["#1a3a30", "#c8a84b"] as const },
  { label: "Sage & Bloom", href: "/ladies", image: "/trending/sage-bloom.webp", tone: ["#c8d8b0", "#9090d0"] as const },
  { label: "Pink Blossom", href: "/ladies", image: "/trending/pink-blossom.webp", tone: ["#f8e0e8", "#e07898"] as const },
];

export const promoMessages = [
  "Flat Rs. 200 Delivery Nationwide",
  "Premium Quality — Handcrafted with Love in Pakistan",
  "14-Day Easy Return Policy",
  "Cash on Delivery Available Nationwide",
  "WhatsApp Support: +92 312 0295812",
];

export type Testimonial = { quote: string; name: string; city: string; avatar: string; rating: number };
export const testimonials: Testimonial[] = [
  {
    quote:
      "The quality of the silk suit is beyond what I expected at this price. The embroidery is absolutely beautiful — I wore it to a wedding and got so many compliments.",
    name: "Fatima R.",
    city: "Karachi",
    avatar: "/profiles/fatima-r.webp",
    rating: 5,
  },
  {
    quote:
      "Ordered the Pastel Dream nursery set for my baby — the padding is so thick and the fabric is incredibly soft. Fast delivery, beautifully packaged.",
    name: "Sara A.",
    city: "Lahore",
    avatar: "/profiles/sara-a.webp",
    rating: 5,
  },
  {
    quote:
      "The kids festive gown was perfect for Eid! Great stitching and my daughter loved the embellished bodice. Will definitely order again.",
    name: "Nadia K.",
    city: "Islamabad",
    avatar: "/profiles/nadia-k.webp",
    rating: 5,
  },
];
