/**
 * Product URL Redirects
 *
 * All old product URLs redirect to new SKU-based format
 * Final format: /product/{category}/{CATEGORY_CODE}-SKU-{SKU_VALUE}/
 * Example: /product/ladies-suits/ld-sku-tsh-002/
 */

// Since we haven't pushed to production, only active redirects are needed
// Old descriptive slugs → SKU format redirects
export const productRedirects = [
  // These redirects are only needed if old URLs were ever public
  // Currently all changes are local-only (not pushed to production)
];
