/**
 * SEO-Friendly Slug Generator for Products
 *
 * Format: [category-code]-[descriptive-name]-[sku-or-id]
 * Examples:
 *   - ld-embroidered-silk-suit-sku001
 *   - kd-festive-3piece-gown-sku045
 *   - bb-deluxe-crib-bedding-sku123
 *   - ac-floral-hair-clip-set-sku078
 */

// Category codes for slug prefixes
const CATEGORY_CODES: Record<string, string> = {
  "ladies-suits": "ld",
  "kids-formal": "kd",
  "baby-products": "bb",
  "accessories": "ac",
};

/**
 * Clean and normalize text for URL slugs
 */
function cleanForSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace special characters with spaces
    .replace(/[^\w\s-]/g, " ")
    // Replace multiple spaces with single hyphen
    .replace(/\s+/g, "-")
    // Remove multiple consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract key descriptive words from product title
 * Removes common filler words and keeps meaningful keywords
 */
function extractKeywords(title: string, maxWords: number = 5): string {
  // Common words to remove (not SEO valuable) + brand names to exclude
  const fillerWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "can", "will",
    "just", "should", "now",
    // Brand/store names to exclude from slugs
    "biba"
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !fillerWords.has(word))
    .slice(0, maxWords);

  return words.join("-");
}

/**
 * Generate SKU-based product slug
 * Format: {CATEGORY_CODE}-SKU-{SKU_VALUE}
 * Example: ld-sku-tsh-002
 */
export function generateProductSlug({
  title,
  category,
  sku,
  id,
}: {
  title: string;
  category: string;
  sku?: string | null;
  id?: string;
}): string {
  // Get category code (uppercase for consistency)
  const categoryCode = (CATEGORY_CODES[category] || category.substring(0, 2)).toUpperCase();

  // Use SKU if available, otherwise use ID
  let skuPart: string;
  if (sku && sku.trim()) {
    // Clean and remove BIBA- prefix if present
    skuPart = sku.trim().toUpperCase()
      .replace(/^BIBA-/, "")
      .replace(/\s+/g, "-");
  } else if (id) {
    // Use last 6 characters of ID for uniqueness
    skuPart = id.substring(id.length - 6).toUpperCase();
  } else {
    // Fallback to timestamp
    skuPart = Date.now().toString().substring(7);
  }

  // Format: {CATEGORY_CODE}-SKU-{SKU_VALUE}
  const slug = `${categoryCode}-SKU-${skuPart}`;

  // Return lowercase for URL consistency
  return slug.toLowerCase();
}

/**
 * Generate slug with subcategory info (optional enhancement)
 */
export function generateDetailedProductSlug({
  title,
  category,
  subcategory,
  sku,
  id,
}: {
  title: string;
  category: string;
  subcategory?: string[] | null;
  sku?: string | null;
  id?: string;
}): string {
  const categoryCode = CATEGORY_CODES[category] || category.substring(0, 2).toLowerCase();

  // Include first subcategory if available
  let prefix = categoryCode;
  if (subcategory && subcategory.length > 0) {
    const subCode = subcategory[0].substring(0, 3).toLowerCase();
    prefix = `${categoryCode}-${subCode}`;
  }

  const keywords = extractKeywords(title, 4); // Fewer keywords if we have subcategory

  let identifier: string;
  if (sku && sku.trim()) {
    identifier = cleanForSlug(sku);
  } else if (id) {
    identifier = id.substring(id.length - 6);
  } else {
    identifier = Date.now().toString().substring(7);
  }

  const slug = `${prefix}-${keywords}-${identifier}`;
  return cleanForSlug(slug).substring(0, 100);
}

/**
 * Validate if a slug is SEO-friendly
 */
export function isSlugValid(slug: string): boolean {
  // Check basic requirements
  if (!slug || slug.length < 10 || slug.length > 100) return false;

  // Should only contain lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) return false;

  // Should not start or end with hyphen
  if (slug.startsWith("-") || slug.endsWith("-")) return false;

  // Should not have consecutive hyphens
  if (slug.includes("--")) return false;

  return true;
}

/**
 * Test examples
 */
export function testSlugGenerator() {
  const examples = [
    {
      title: "Embroidered Silk 3-Piece Formal Suit with Gold Brocade",
      category: "ladies-suits",
      sku: "SKU001",
      id: "abc123def456",
    },
    {
      title: "Festive Co-Ord Gown Set for Girls - Eid Special",
      category: "kids-formal",
      sku: "KD-045",
      id: "xyz789ghi012",
    },
    {
      title: "Deluxe Padded Baby Crib Bedding Set - 7 Pieces",
      category: "baby-products",
      sku: null,
      id: "bed123set456",
    },
    {
      title: "Handcrafted Floral Hair Clip & Headband Set",
      category: "accessories",
      sku: "AC078",
      id: "clip123hair456",
    },
  ];

  console.log("=== SLUG GENERATOR TEST ===\n");

  examples.forEach((example, i) => {
    const slug = generateProductSlug(example);
    const valid = isSlugValid(slug);

    console.log(`Example ${i + 1}:`);
    console.log(`  Title:    ${example.title}`);
    console.log(`  Category: ${example.category}`);
    console.log(`  SKU:      ${example.sku || "(none)"}`);
    console.log(`  Generated Slug: ${slug}`);
    console.log(`  Valid:    ${valid ? "✅ YES" : "❌ NO"}`);
    console.log(`  URL:      /product/${example.category}/${slug}`);
    console.log("");
  });
}
