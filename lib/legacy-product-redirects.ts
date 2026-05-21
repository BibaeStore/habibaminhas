/**
 * Legacy product URL redirects
 * Maps old /shop/[sku] URLs to new /product/[category]/[slug] structure
 */

export const legacyProductRedirects = [
  // Baby Products (old SKU format without BIBA- prefix)
  { source: "/shop/NUR-SPT-GRY-036/:path*", destination: "/product/baby-products/bb-sku-nur-spt-gry-036/", permanent: true },
  { source: "/shop/NUR-BUN-PM-047/:path*", destination: "/product/baby-products/bb-sku-nur-bun-pm-047/", permanent: true },
  { source: "/shop/NUR-SAF-GRY-029/:path*", destination: "/product/baby-products/bb-sku-nur-saf-gry-029/", permanent: true },
  { source: "/shop/NUR-NST-BUT-039/:path*", destination: "/product/baby-products/bb-sku-nur-nst-but-039/", permanent: true },
  { source: "/shop/NUR-ACC-MSH-050/:path*", destination: "/product/baby-products/bb-sku-nur-acc-msh-050/", permanent: true },
  { source: "/shop/NUR-BED-HRT-035/:path*", destination: "/product/baby-products/bb-sku-nur-bed-hrt-035/", permanent: true },
  { source: "/shop/NUR-ACC-HRT-046/:path*", destination: "/product/baby-products/bb-sku-nur-acc-hrt-046/", permanent: true },

  // Draft products - redirect to category page
  { source: "/shop/NUR-NST-MNT-031/:path*", destination: "/baby/", permanent: true },
  { source: "/shop/NUR-NST-PCH-030/:path*", destination: "/baby/", permanent: true },
  { source: "/shop/NUR-BED-DINO-041/:path*", destination: "/product/baby-products/bb-sku-nur-bed-dino-041/", permanent: true },
  { source: "/shop/NUR-PLW-SPT-043/:path*", destination: "/product/baby-products/bb-sku-nur-plw-spt-043/", permanent: true },
  { source: "/shop/NUR-NST-HRT-044/:path*", destination: "/product/baby-products/bb-sku-nur-nst-hrt-044/", permanent: true },
  { source: "/shop/NUR-NST-PCH-030/:path*", destination: "/product/baby-products/bb-sku-nur-nst-pch-030/", permanent: true },
  { source: "/shop/NUR-SWD-SPT-037/:path*", destination: "/product/baby-products/bb-sku-nur-swd-spt-037/", permanent: true },
  { source: "/shop/NUR-SWD-BUT-033/:path*", destination: "/product/baby-products/bb-sku-nur-swd-but-033/", permanent: true },

  // Ladies Suits
  { source: "/shop/BZ-SLK-M-016/:path*", destination: "/product/ladies-suits/ld-sku-bz-slk-m-016/", permanent: true },
  { source: "/shop/WHT-SLK-M-014/:path*", destination: "/product/ladies-suits/ld-sku-wht-slk-m-014/", permanent: true },

  // Ladies Suits - Title-based URLs (descriptive names)
  { source: "/shop/rose-jewel-3-piece-stitched-silk-suit-with-silver-metallic-trim/:path*", destination: "/product/ladies-suits/ld-sku-rwe-3pc-ss25-014/", permanent: true },
  { source: "/shop/emerald-horizon-3-piece-stitched-raw-silk-suit/:path*", destination: "/ladies/", permanent: true },
  { source: "/shop/Desert-Rose-3-Pieces-Stitched-Suite/:path*", destination: "/ladies/", permanent: true },
  { source: "/shop/royal-plum-3-piece-stitched-silk-suit-with-antique-gold-trim/:path*", destination: "/ladies/", permanent: true },
  { source: "/shop/midnight-navy-3-piece-stitched-silk-suit-with-silver-v-neck-detail/:path*", destination: "/product/ladies-suits/ld-sku-nvy-slk-m-029/", permanent: true },
  { source: "/shop/teal-enchantment-3-piece-stitched-silk-suit-with-intricate-lace-work/:path*", destination: "/product/ladies-suits/ld-sku-tel-slk-m-008/", permanent: true },
  { source: "/shop/fuchsia-bloom-3-piece-stitched-silk-suit-with-silver-metallic-trim/:path*", destination: "/ladies/", permanent: true },
  { source: "/shop/cocoa-essence-3-piece-stitched-silk-suit-with-contrast-organza/:path*", destination: "/product/ladies-suits/ld-sku-tau-slk-m-013/", permanent: true },

  // Kids Formal
  { source: "/shop/MRN-KDS-S-017/:path*", destination: "/product/kids-formal/kd-sku-mrn-kds-s-017/", permanent: true },
  { source: "/shop/BLK-KDS-S-018/:path*", destination: "/product/kids-formal/kd-sku-blk-kds-s-018/", permanent: true },
  { source: "/shop/TEL-KDS-S-019/:path*", destination: "/product/kids-formal/kd-sku-tel-kds-s-019/", permanent: true },
  { source: "/shop/BZ-KDS-S-027/:path*", destination: "/product/kids-formal/kd-sku-bz-kds-s-027/", permanent: true },
  { source: "/shop/MAG-KDS-S-026/:path*", destination: "/product/kids-formal/kd-sku-mag-kds-s-026/", permanent: true },
  { source: "/shop/PNK-KDS-GN-021/:path*", destination: "/product/kids-formal/kd-sku-pnk-kds-gn-021/", permanent: true },

  // Kids - Title-based URLs
  { source: "/shop/ivory-grace-kids-3-piece-stitched-silk-suit-with-net-dupatta/:path*", destination: "/product/kids-formal/kd-sku-ivy-kds-s-010/", permanent: true },

  // Category redirects
  { source: "/shop/category/baby-products/:path*", destination: "/baby/", permanent: true },
  { source: "/shop/category/kids/boys/:path*", destination: "/kids/", permanent: true },
  { source: "/shop/category/kids-boys/:path*", destination: "/kids/", permanent: true },
  { source: "/shop/category/baby-products-baby-pillow/:path*", destination: "/baby/baby-pillows/", permanent: true },
  { source: "/shop/category/baby-products-baby-nest/:path*", destination: "/baby/baby-nest/", permanent: true },
  { source: "/shop/category/gents/:path*", destination: "/ladies/", permanent: true },
  { source: "/baby-products/:path*", destination: "/baby/", permanent: true },

  // Old product ID format (UUID and short IDs)
  { source: "/shop/7f6b92ff-98cb-4024-a7f8-6c12e53bcf8f/:path*", destination: "/shop/", permanent: true },
  { source: "/shop/ee46d4ed-76fb-47ca-9025-b69efc1c5fee/:path*", destination: "/shop/", permanent: true },
  { source: "/product/lad-1/:path*", destination: "/ladies/", permanent: true },
  { source: "/product/lad-4/:path*", destination: "/ladies/", permanent: true },
  { source: "/product/lad-7/:path*", destination: "/ladies/", permanent: true },
  { source: "/product/lad-10/:path*", destination: "/ladies/", permanent: true },
  { source: "/product/kid-1/:path*", destination: "/kids/", permanent: true },
  { source: "/product/kid-4/:path*", destination: "/kids/", permanent: true },
  { source: "/product/kid-7/:path*", destination: "/kids/", permanent: true },
  { source: "/product/kid-10/:path*", destination: "/kids/", permanent: true },

  // Journal entries that don't exist
  { source: "/journal/modest-dressing/:path*", destination: "/journal/", permanent: true },

  // Misc invalid URLs
  { source: "/unstitched%20Suit/:path*", destination: "/ladies/", permanent: true },

  // Missing assets redirects
  { source: "/habiba-minhas-logo.jpeg", destination: "/logo/habiba-minhas-logo.png", permanent: true },
  { source: "/assets/icon.png", destination: "/logo/habiba-minhas-logo.png", permanent: true },
];
