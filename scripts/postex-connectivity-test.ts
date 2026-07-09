/**
 * PostEx Phase 0 connectivity test (READ-ONLY).
 *
 * Proves the token works and the client module can talk to PostEx.
 * Makes NO writes: only reference/read endpoints are called.
 *
 * Run:  npx tsx scripts/postex-connectivity-test.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv(); // fall back to .env for anything not in .env.local

import { isPostexEnabled, getPostexConfig } from "../lib/courier/postex/config";
import {
  getDeliveryCities,
  getMerchantAddresses,
  getOrderTypes,
} from "../lib/courier/postex/client";

async function main() {
  console.log("========================================");
  console.log("  PostEx Phase 0 — Connectivity Test");
  console.log("========================================\n");

  if (!isPostexEnabled()) {
    console.error("❌ POSTEX_API_TOKEN not found. Add it to .env.local.");
    process.exit(1);
  }
  const cfg = getPostexConfig()!;
  console.log(`Base URL: ${cfg.baseUrl}`);
  console.log(`Pickup addressCode (env): ${cfg.pickupAddressCode || "(not set)"}\n`);

  try {
    // 1) Order types
    const types = await getOrderTypes();
    console.log(`✅ Order Types (${types.length}): ${types.join(", ")}`);

    // 2) Pickup address(es)
    const addresses = await getMerchantAddresses();
    console.log(`✅ Pickup addresses (${addresses.length}):`);
    for (const a of addresses) {
      console.log(
        `   • code=${a.addressCode} · ${a.contactPersonName?.trim()} · ${a.cityName} · ${a.address} · ${a.phone1}`
      );
    }
    const match = addresses.find((a) => a.addressCode === cfg.pickupAddressCode);
    console.log(
      match
        ? `   → env POSTEX_PICKUP_ADDRESS_CODE=${cfg.pickupAddressCode} resolves to: ${match.cityName} ✅`
        : `   ⚠️  env pickup code "${cfg.pickupAddressCode}" not found among returned addresses`
    );

    // 3) Delivery cities
    const cities = await getDeliveryCities();
    const hasKarachi = cities.some((c) => c.operationalCityName.toLowerCase() === "karachi");
    console.log(`✅ Delivery cities: ${cities.length} (Karachi present: ${hasKarachi})`);
    console.log(
      `   sample: ${cities
        .slice(0, 8)
        .map((c) => c.operationalCityName)
        .join(", ")} ...`
    );

    console.log("\n🎉 Connectivity OK — token valid, client module working, no writes made.");
  } catch (err) {
    console.error("\n❌ Connectivity test failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
