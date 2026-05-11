"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/lib/supabase/types";

export async function getSettings() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSettings(payload: TablesUpdate<"settings">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("settings")
    .update(payload)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  return data;
}

export type ShippingConfig = {
  standard: number;
  express: number;
  freeThreshold: number;
  estimatedStd: string;
  estimatedExp: string;
  carrier: string;
  codEnabled: boolean;
};

export type PaymentMethodsConfig = {
  cod: boolean;
  bank: boolean;
  jazzcash: boolean;
  easypaisa: boolean;
};

export type SeoConfig = {
  ga4_id: string;
  fb_pixel: string;
  site_title: string;
  meta_description: string;
};

export type StorefrontSettings = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  shipping: ShippingConfig;
  payment: PaymentMethodsConfig;
  seo: SeoConfig;
};

const DEFAULTS: StorefrontSettings = {
  storeName: "Habiba Minhas",
  storeEmail: "info@habibaminhas.com",
  storePhone: "+92 312 0295812",
  currency: "PKR",
  shipping: {
    standard: 250,
    express: 500,
    freeThreshold: 3500,
    estimatedStd: "3–5",
    estimatedExp: "1–2",
    carrier: "TCS",
    codEnabled: true,
  },
  payment: { cod: true, bank: false, jazzcash: false, easypaisa: false },
  seo: { ga4_id: "", fb_pixel: "", site_title: "Habiba Minhas", meta_description: "" },
};

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function asNumber(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asString(v: unknown, fallback: string) {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}

/**
 * Returns the storefront-facing settings with safe defaults applied. Use this
 * from public pages so a missing or malformed JSON column never breaks the UI.
 */
export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const raw = await getSettings();
    const ship = asObject(raw.shipping_rates);
    const pay  = asObject(raw.payment_methods);
    const seo  = asObject(raw.seo_settings);
    return {
      storeName:  raw.store_name  ?? DEFAULTS.storeName,
      storeEmail: raw.store_email ?? DEFAULTS.storeEmail,
      storePhone: raw.store_phone ?? DEFAULTS.storePhone,
      currency:   raw.currency    ?? DEFAULTS.currency,
      shipping: {
        standard:      asNumber(ship.standard,      DEFAULTS.shipping.standard),
        express:       asNumber(ship.express,       DEFAULTS.shipping.express),
        freeThreshold: asNumber(ship.freeThreshold, DEFAULTS.shipping.freeThreshold),
        estimatedStd:  asString(ship.estimatedStd,  DEFAULTS.shipping.estimatedStd),
        estimatedExp:  asString(ship.estimatedExp,  DEFAULTS.shipping.estimatedExp),
        carrier:       asString(ship.carrier,       DEFAULTS.shipping.carrier),
        codEnabled:    asBool  (ship.codEnabled,    DEFAULTS.shipping.codEnabled),
      },
      payment: {
        cod:       asBool(pay.cod,       DEFAULTS.payment.cod),
        bank:      asBool(pay.bank,      DEFAULTS.payment.bank),
        jazzcash:  asBool(pay.jazzcash,  DEFAULTS.payment.jazzcash),
        easypaisa: asBool(pay.easypaisa, DEFAULTS.payment.easypaisa),
      },
      seo: {
        ga4_id:           asString(seo.ga4_id,           DEFAULTS.seo.ga4_id),
        fb_pixel:         asString(seo.fb_pixel,         DEFAULTS.seo.fb_pixel),
        site_title:       asString(seo.site_title,       DEFAULTS.seo.site_title),
        meta_description: asString(seo.meta_description, DEFAULTS.seo.meta_description),
      },
    };
  } catch {
    return DEFAULTS;
  }
}
