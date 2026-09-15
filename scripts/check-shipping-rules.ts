import { resolveShipping, allItemsShipFree, cartSubtotal } from "../lib/shipping";

const RATES = { standard: 250, express: 500, freeThreshold: 0 };
const WITH_THRESHOLD = { standard: 250, express: 500, freeThreshold: 5000 };

const free = (price: number, qty = 1) => ({ price, qty, free_delivery: true });
const paid = (price: number, qty = 1) => ({ price, qty, free_delivery: false });

let fail = 0;
const ok = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

// --- the ALL-or-nothing rule the owner chose --------------------------------
ok("all free -> free",        resolveShipping([free(2000), free(3000)], RATES).cost, 0);
ok("all free -> reason",      resolveShipping([free(2000), free(3000)], RATES).reason, "all-items");
ok("one paid item -> charged", resolveShipping([free(500), paid(7000)], RATES).cost, 250);
ok("THE EXPLOIT is blocked",  resolveShipping([free(500), paid(7000)], RATES).isFree, false);
ok("all paid -> charged",     resolveShipping([paid(2000), paid(3000)], RATES).cost, 250);

// --- empty cart must not claim free delivery --------------------------------
ok("empty cart not 'all free'", allItemsShipFree([]), false);
ok("empty cart still charged",  resolveShipping([], RATES).cost, 250);

// --- store-wide switch (Settings -> Standard = 0) ----------------------------
ok("rate 0 -> free",        resolveShipping([paid(2000)], { ...RATES, standard: 0 }).cost, 0);
ok("rate 0 -> reason",      resolveShipping([paid(2000)], { ...RATES, standard: 0 }).reason, "store-wide");

// --- the threshold that used to be dead -------------------------------------
ok("under threshold charged", resolveShipping([paid(3000)], WITH_THRESHOLD).cost, 250);
ok("at threshold free",       resolveShipping([paid(5000)], WITH_THRESHOLD).cost, 0);
ok("over threshold free",     resolveShipping([paid(7000)], WITH_THRESHOLD).cost, 0);
ok("nudge shows shortfall",   resolveShipping([paid(3000)], WITH_THRESHOLD).amountToThreshold, 2000);
ok("no nudge when threshold off", resolveShipping([paid(3000)], RATES).amountToThreshold, null);
ok("threshold counts qty",    resolveShipping([paid(2000, 3)], WITH_THRESHOLD).cost, 0);
ok("subtotal respects qty",   cartSubtotal([paid(2000, 3)]), 6000);

// --- express is never given away --------------------------------------------
ok("express not waived by items", resolveShipping([free(2000), free(3000)], RATES, "express").cost, 500);
ok("express not waived by threshold", resolveShipping([paid(9000)], WITH_THRESHOLD, "express").cost, 500);
ok("express IS free if rate is 0", resolveShipping([paid(2000)], { ...RATES, express: 0 }, "express").cost, 0);

// --- baseCost survives for "FREE (was Rs. 250)" -----------------------------
ok("baseCost kept when waived", resolveShipping([free(2000)], RATES).baseCost, 250);

// --- missing/undefined free_delivery is treated as NOT free -----------------
ok("undefined flag = paid", resolveShipping([{ price: 2000, qty: 1 }], RATES).cost, 250);
ok("null flag = paid", resolveShipping([{ price: 2000, qty: 1, free_delivery: null }], RATES).cost, 250);

console.log(fail === 0 ? "\nALL PASSED" : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
