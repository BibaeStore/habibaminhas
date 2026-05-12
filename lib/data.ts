// Navigation types
export type NavChild = { label: string; href: string; badge?: string };
export type NavGroup = { title: string; items: NavChild[] };
export type NavColumn = { heading?: string; groups?: NavGroup[]; items?: NavChild[] };

export type MegaMenu = {
  label: string;
  href: string;
  columns: NavColumn[];
  feature?: { title: string; subtitle: string; href: string; tone: "rose" | "sage" | "gold" | "ink"; image?: string };
};

// ─── Navbar fallback (used when DB categories are unavailable) ────────────────
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
      image: "/HeroSection/ladies-suits.webp",
    },
  },
  {
    label: "Kids",
    href: "/kids",
    columns: [
      {
        heading: "Stitched Suits",
        items: [
          { label: "All Kids Wear",          href: "/kids", badge: "New" },
          { label: "3-Piece Stitched Suits", href: "/kids" },
          { label: "Festive Co-Ord Sets",    href: "/kids" },
          { label: "Embroidered Gowns",      href: "/kids" },
          { label: "Eid Special Collection", href: "/kids", badge: "New" },
          { label: "Kurtis & Shalwar",       href: "/kids" },
        ],
      },
    ],
    feature: {
      title: "Sunset Bloom",
      subtitle: "Festive co-ord sets for little girls — embroidered, silk-lined, celebration-ready.",
      href: "/kids",
      tone: "gold",
      image: "/HeroSection/kids-formal.webp",
    },
  },
  {
    label: "Baby Products",
    href: "/baby",
    columns: [
      {
        heading: "Nursery Bedding",
        items: [
          { label: "All Bedding Sets",        href: "/baby" },
          { label: "5-Piece Crib Sets",       href: "/baby" },
          { label: "6-Piece Bumper Sets",     href: "/baby" },
          { label: "Deluxe 10-Piece Sets",    href: "/baby" },
          { label: "Character Themes",        href: "/baby" },
        ],
      },
      {
        heading: "Nests & Loungers",
        items: [
          { label: "Baby Nest Pods",   href: "/baby" },
          { label: "Swaddle Wraps",    href: "/baby" },
          { label: "Nursing Pillows",  href: "/baby" },
          { label: "Carrier Covers",   href: "/baby" },
        ],
      },
      {
        heading: "Essentials",
        items: [
          { label: "Diaper Totes",            href: "/baby" },
          { label: "Mattress & Pillow Sets",  href: "/baby" },
          { label: "Gift Sets",               href: "/baby", badge: "Popular" },
        ],
      },
    ],
    feature: {
      title: "Pastel Dream",
      subtitle: "10-piece deluxe plush nursery set — the complete starter for your nursery.",
      href: "/baby",
      tone: "sage",
      image: "/HeroSection/baby-bedding.webp",
    },
  },
  {
    label: "Accessories",
    href: "/accessories",
    columns: [
      {
        heading: "Hair Clips",
        items: [
          { label: "All Hair Clips",       href: "/accessories" },
          { label: "Floral Hair Clips",    href: "/accessories" },
          { label: "Silk Headbands",       href: "/accessories" },
          { label: "Clip & Headband Sets", href: "/accessories" },
        ],
      },
    ],
    feature: {
      title: "Handcrafted Silk",
      subtitle: "3-piece headband & floral clip sets — made by hand, gifted with love.",
      href: "/accessories",
      tone: "ink",
      image: "/HeroSection/accessories.webp",
    },
  },
];

export const flatNav = [
  { label: "Ladies",      href: "/ladies"      },
  { label: "Kids",        href: "/kids"        },
  { label: "Baby Products", href: "/baby"      },
  { label: "Accessories", href: "/accessories" },
  { label: "New Arrivals", href: "/new"        },
  { label: "About",       href: "/about"       },
];

// ─── Homepage hero carousel ───────────────────────────────────────────────────
export const heroSlides = [
  {
    eyebrow: "Ladies Collection 2026",
    title: "Elegance Redefined",
    body: "Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — curated for the modern Pakistani woman.",
    cta: { label: "Shop Ladies", href: "/ladies" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/ladies-suits.webp",
    tone: { from: "#f2e0d8", via: "#c97a86", to: "#5a2030" },
  },
  {
    eyebrow: "Kids Festive Wear",
    title: "Little Stars, Big Moments",
    body: "Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration worth dressing up for.",
    cta: { label: "Shop Kids", href: "/kids" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/kids-formal.webp",
    tone: { from: "#f5e8c0", via: "#c8900c", to: "#5a3800" },
  },
  {
    eyebrow: "Baby & Nursery",
    title: "Soft from the Start",
    body: "Deluxe padded crib bedding sets, baby nest pods, swaddle wraps — everything your nursery needs, made with love in Pakistan.",
    cta: { label: "Shop Baby Bedding", href: "/baby" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/baby-bedding.webp",
    tone: { from: "#f0e0f0", via: "#c090c0", to: "#401840" },
  },
  {
    eyebrow: "Baby Nests",
    title: "Cosy from Day One",
    body: "Soft, padded baby nest pods designed for comfort and peaceful sleep — handcrafted with the finest materials.",
    cta: { label: "Shop Baby Nests", href: "/baby" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/baby-nests.webp",
    tone: { from: "#d0e8f0", via: "#70b0c8", to: "#204050" },
  },
  {
    eyebrow: "Handcrafted Accessories",
    title: "Finished by Hand",
    body: "3-piece handcrafted silk headband & floral clip sets — made with the same care as our fashion pieces, gifted with love.",
    cta: { label: "Shop Accessories", href: "/accessories" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/accessories.webp",
    tone: { from: "#eedbc4", via: "#b08040", to: "#3a2010" },
  },
  {
    eyebrow: "New Arrivals",
    title: "Just In",
    body: "The latest additions to the Habiba Minhas collection — bold prints, refined silhouettes, and fabrics that move with you.",
    cta: { label: "Shop New Arrivals", href: "/new" },
    second: { label: "View All Collections", href: "/shop" },
    image: "/HeroSection/new-arrivals.webp",
    tone: { from: "#dde0f0", via: "#5c6dab", to: "#1e2a5a" },
  },
];

// ─── Homepage category tiles (fallback if DB categories unavailable) ──────────
export const categoryTiles = [
  { label: "Ladies Suits",  href: "/ladies",      image: "/categories/ladies-suits.webp",  tone: ["#f2e0d8", "#c97a86"] as const },
  { label: "Kids Formal",   href: "/kids",        image: "/categories/kids-formal.webp",   tone: ["#f5e8c0", "#c8900c"] as const },
  { label: "Baby Bedding",  href: "/baby",        image: "/categories/baby-bedding.webp",  tone: ["#d4e8d0", "#507848"] as const },
  { label: "Baby Nests",    href: "/baby",        image: "/categories/baby-nests.webp",    tone: ["#f0e0f0", "#c090c0"] as const },
  { label: "Accessories",   href: "/accessories", image: "/categories/accessories.webp",   tone: ["#eedbc4", "#b08040"] as const },
  { label: "New Arrivals",  href: "/new",         image: "/categories/new-arrivals.webp",  tone: ["#dde0f0", "#5c6dab"] as const },
];

// ─── Homepage trend tiles ─────────────────────────────────────────────────────
export const trendTiles = [
  { label: "Floral Lawn",        href: "/ladies", image: "/trending/floral-lawn.webp",        tone: ["#c8ede4", "#e87aaa"] as const },
  { label: "Emerald Embroidery", href: "/ladies", image: "/trending/emerald-embroidery.webp", tone: ["#1a3a30", "#c8a84b"] as const },
  { label: "Sage & Bloom",       href: "/ladies", image: "/trending/sage-bloom.webp",         tone: ["#c8d8b0", "#9090d0"] as const },
  { label: "Pink Blossom",       href: "/ladies", image: "/trending/pink-blossom.webp",       tone: ["#f8e0e8", "#e07898"] as const },
];

// ─── Promo bar messages ───────────────────────────────────────────────────────
export const promoMessages = [
  "Premium Quality — Handcrafted with Love in Pakistan",
  "14-Day Easy Return Policy",
  "Cash on Delivery Available Nationwide",
  "WhatsApp Support: +92 312 0295812",
  "Email: info@habibaminhas.com",
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export type Testimonial = { quote: string; name: string; city: string; avatar: string; rating: number };
export const testimonials: Testimonial[] = [
  {
    quote: "The quality of the silk suit is beyond what I expected at this price. The embroidery is absolutely beautiful — I wore it to a wedding and got so many compliments.",
    name: "Fatima R.",
    city: "Karachi",
    avatar: "/profiles/fatima-r.webp",
    rating: 5,
  },
  {
    quote: "Ordered the Pastel Dream nursery set for my baby — the padding is so thick and the fabric is incredibly soft. Fast delivery, beautifully packaged.",
    name: "Sara A.",
    city: "Lahore",
    avatar: "/profiles/sara-a.webp",
    rating: 5,
  },
  {
    quote: "The kids festive gown was perfect for Eid! Great stitching and my daughter loved the embellished bodice. Will definitely order again.",
    name: "Nadia K.",
    city: "Islamabad",
    avatar: "/profiles/nadia-k.webp",
    rating: 5,
  },
];
