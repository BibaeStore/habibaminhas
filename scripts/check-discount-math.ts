import {
  originalPriceOf, isDiscounted, discountPercentOf,
  priceAfterDiscount, previewDiscount, amountSavedOf,
} from "../lib/discount";

let fail = 0;
const ok = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

// --- basic 20% off 5000 -------------------------------------------------------
const fresh = { price: 5000, compare_at: null };
ok("fresh: not discounted", isDiscounted(fresh), false);
ok("fresh: original is price", originalPriceOf(fresh), 5000);
ok("fresh: 20% -> 4000", priceAfterDiscount(5000, 20), 4000);

// after applying, the row looks like this:
const sale20 = { price: 4000, compare_at: 5000 };
ok("sale20: is discounted", isDiscounted(sale20), true);
ok("sale20: percent", discountPercentOf(sale20), 20);
ok("sale20: saved", amountSavedOf(sale20), 1000);

// --- THE critical case: re-applying must not compound -------------------------
ok("re-apply 30% works off ORIGINAL 5000", previewDiscount(sale20, 30), { original: 5000, next: 3500, saved: 1500 });
// a naive implementation would give 4000*0.7 = 2800. Assert it does not:
ok("re-apply is NOT 2800", previewDiscount(sale20, 30).next !== 2800, true);

// applying the same 20% twice is idempotent
ok("re-apply same 20% is idempotent", previewDiscount(sale20, 20).next, 4000);

// --- ending a campaign restores exactly --------------------------------------
ok("restore returns 5000", originalPriceOf(sale20), 5000);

// --- rounding stays truthful --------------------------------------------------
const odd = priceAfterDiscount(4550, 20); // 3640
ok("4550 @20% -> 3640", odd, 3640);
ok("badge recomputes to 20", discountPercentOf({ price: odd, compare_at: 4550 }), 20);

// --- bad data is treated as not-on-sale --------------------------------------
ok("inverted row not on sale", isDiscounted({ price: 5000, compare_at: 4000 }), false);
ok("equal row not on sale", isDiscounted({ price: 5000, compare_at: 5000 }), false);
ok("inverted row percent null", discountPercentOf({ price: 5000, compare_at: 4000 }), null);
// ...and originalPriceOf falls back to price so restoring cannot raise the price
ok("inverted row restores to price", originalPriceOf({ price: 5000, compare_at: 4000 }), 5000);

// --- never free ---------------------------------------------------------------
ok("90% off Rs.5 clamps to 1", priceAfterDiscount(5, 90), 1);

// --- real catalogue prices (min 500, max 9000) -------------------------------
ok("500 @20%", priceAfterDiscount(500, 20), 400);
ok("9000 @20%", priceAfterDiscount(9000, 20), 7200);

console.log(fail === 0 ? "\nALL PASSED" : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
