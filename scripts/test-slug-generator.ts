import { generateProductSlug, isSlugValid } from "../lib/slug-generator";

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
  {
    title: "Traditional 2-Piece Party Wear Suit",
    category: "ladies-suits",
    sku: "LD-999",
    id: "party123suit456",
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
  console.log(`  OLD URL:  /product/biba-something-${Date.now()}`);
  console.log(`  NEW SLUG: ${slug}`);
  console.log(`  NEW URL:  /product/${example.category}/${slug}`);
  console.log(`  Valid:    ${valid ? "✅ YES" : "❌ NO"}`);
  console.log("");
});
