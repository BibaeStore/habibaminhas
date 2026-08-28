import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import type { ProductCandidate } from "./select";

/**
 * Captions written by a model instead of assembled from database fields.
 *
 * The deterministic builder in `caption.ts` is not being replaced. It stays as the fallback,
 * and that is the whole safety design: **the caption engine must never be able to stop the
 * account posting.** Every failure path here returns null, and the caller then publishes the
 * assembled caption exactly as it has for the last eleven days. A missing API key, a bad model
 * id, a rate limit, malformed JSON, a duplicate — all of them degrade to "yesterday's
 * behaviour", none of them to silence.
 *
 * Two layers stop repetition, because one is not enough:
 *
 *   1. The prompt is *told* the last 30 hooks and angles for this stream and instructed to
 *      avoid them.
 *   2. The result is *checked* against stored hashes before it is used.
 *
 * Prompting alone drifts — asked forty times not to repeat itself, a model eventually repeats
 * itself. The check is what makes "captions will not repeat" a property rather than a hope.
 */

/** Balanced tier of the current family. Sol is 2.5x the price for copy this short. */
const DEFAULT_MODEL = "gpt-5.6-terra";

/** Published rates per million tokens for the default model, for the cost column. */
const RATE_IN_PER_M = 2.0;
const RATE_OUT_PER_M = 12.0;

const RECENT_WINDOW = 30;
const REQUEST_TIMEOUT_MS = 45_000;

export type CaptionStream = "carousel" | "static" | "reel";

export type AiCaption = {
  hook: string;
  body: string;
  faqLine: string;
  faqTopic: string;
  hashtags: string[];
  altText: string;
  angle: string;
};

/**
 * Price is never allowed through, per the owner's instruction on 2026-08-28.
 *
 * Belt and braces against the prompt: the live deterministic caption prints "Rs. 5,500", so a
 * model shown examples of this brand's own voice has every reason to imitate it.
 */
const PRICE_PATTERNS = [
  /\bRs\.?\s*[\d,]+/gi,
  /\b(price|priced|pricing|cost)\b/gi,
  /\b\d+\s*%\s*off\b/gi,
];

/**
 * Inventory and origin, banned on every caption regardless of stock.
 *
 * Standing owner instruction, 2026-08-09, recorded in `caption.ts`: a caption must never
 * disclose which sizes are left, how many pieces remain, or where the garment is made.
 * Inventory detail belongs on the product page where it is always current — a caption is
 * permanent and goes stale the moment something sells.
 *
 * This is enforced here as well as in the prompt because the first live test broke it twice in
 * one caption: the model wrote "available in Small, Medium, and Large" and "Stitched in small
 * runs in Karachi". It had been told the sizes and it used them, which is exactly what a
 * helpful model does. Instruction alone is not a control.
 */
const INVENTORY_PATTERNS = [
  // The word itself.
  /\bsizes?\b/gi,
  // A size list: "Small, Medium and Large" / "S / M / L".
  /\b(small|medium|large|x-?large|xl|xxl)\b\s*(?:,|and|&|\/|\+)\s*\b(small|medium|large|x-?large|xl|xxl)\b/gi,
  // "available in Medium", "comes in Large", "fits Small".
  /\b(available|comes|offered|stocked|fits)\s+in\s+(small|medium|large|x-?large|s|m|l|xl)\b/gi,
  // How many are left.
  /\bonly\s+\w+\s+(left|remaining|available)\b/gi,
  /\b(pieces?|units?)\s+(left|remaining|available)\b/gi,
  /\b(limited|small)\s+(run|runs|batch|quantity|quantities|numbers)\b/gi,
  /\b(aik|do|teen)\s+piece\b/gi,
  /\b(in stock|out of stock)\b/gi,
  // Where it was made — the place, not the poetry. "crafted in rich emerald tones" is fine;
  // "stitched in Karachi" and "made in our studio" are not.
  /\b(made|stitched|sewn|tailored|produced|handmade)\s+(in|at)\s+(our|the|a|karachi|lahore|islamabad|pakistan)\b/gi,
];

/** Additionally banned when the garment is sold out — claiming availability then is a lie. */
const AVAILABILITY_PATTERNS = [
  /\b(available now|order now|buy now|shop now|grab it|get yours)\b/gi,
];

function violates(text: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => {
    re.lastIndex = 0;
    return re.test(text);
  });
}

/** Normalised so trivial whitespace differences do not read as a fresh caption. */
export function captionHash(text: string): string {
  return createHash("sha256")
    .update(text.toLowerCase().replace(/\s+/g, " ").trim())
    .digest("hex");
}

// ─── Recent memory ────────────────────────────────────────────────────────────

type Recent = { hooks: string[]; angles: string[]; faqTopics: string[]; hashes: Set<string> };

async function loadRecent(stream: CaptionStream): Promise<Recent> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_generation_log")
    .select("hook, angle, faq_topic, caption_hash")
    .eq("stream", stream)
    .eq("ok", true)
    .order("created_at", { ascending: false })
    .limit(RECENT_WINDOW);

  const rows = data ?? [];
  return {
    hooks: rows.map((r) => r.hook as string).filter(Boolean),
    angles: rows.map((r) => r.angle as string).filter(Boolean),
    faqTopics: rows.map((r) => r.faq_topic as string).filter(Boolean),
    hashes: new Set(rows.map((r) => r.caption_hash as string).filter(Boolean)),
  };
}

// ─── The prompt ───────────────────────────────────────────────────────────────

/**
 * Everything the model is given about the garment.
 *
 * Deliberately the product's own words. The descriptions, FAQs and keywords were written for
 * the website and are unusually detailed, so the caption is assembled from fact rather than
 * invented — which is also why the model is told it may not add a fabric or technique that is
 * not present here.
 */
function productBrief(product: ProductCandidate, soldOut: boolean): string {
  const faqs = ((product.faqs as Array<{ q?: string; a?: string }> | null) ?? [])
    .slice(0, 4)
    .map((f) => `  Q: ${f.q ?? ""}\n  A: ${f.a ?? ""}`)
    .join("\n");

  return [
    `TITLE: ${product.title}`,
    `CATEGORY: ${product.category}${product.subtype ? ` / ${product.subtype}` : ""}${
      product.subcategory?.length ? ` (${product.subcategory.join(", ")})` : ""
    }`,
    `SPECS:\n${product.short_description ?? "(none)"}`,
    `DESCRIPTION:\n${(product.description ?? "").slice(0, 1200)}`,
    `SEO KEYWORDS: ${product.seo_keywords ?? "(none)"}`,
    // Sizes are deliberately NOT sent. A model given a size list writes a size list, and the
    // owner's standing instruction forbids it. The only availability fact it needs is the
    // boolean, so that a sold-out garment is not written up as though it can be bought.
    `AVAILABILITY: ${soldOut ? "SOLD OUT" : "available"}`,
    faqs ? `CUSTOMER QUESTIONS:\n${faqs}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Per-stream shape.
 *
 * The voice and every hard rule are shared; what differs is who is reading. A carousel reader
 * is swiping through detail and will read four lines. A reel viewer is watching, sound on, and
 * the caption is a caption — the video is doing the work, so the words get out of the way.
 */
const STREAM_SHAPE: Record<CaptionStream, { hookMax: number; tags: number; brief: string }> = {
  carousel: {
    hookMax: 125,
    tags: 15,
    brief: `This is a CAROUSEL. The reader is swiping through several photographs.
- body: 3 to 4 short lines drawn from SPECS. Fabric, technique, how it is cut, how it wears.`,
  },
  reel: {
    hookMax: 60,
    tags: 10,
    brief: `This is a REEL — a short video of the garment. The video is doing the work, so the caption stays out of its way.
- body: ONE short line. Two at the very most. Do not describe what is visible on screen; add the thing the video cannot say.`,
  },
  static: {
    hookMax: 80,
    tags: 12,
    brief: `This is a SINGLE IMAGE post. One photograph has to stop the scroll on its own.
- body: 1 to 2 lines, atmospheric rather than a spec list.`,
  },
};

function buildPrompt(
  product: ProductCandidate,
  recent: Recent,
  soldOut: boolean,
  retry: boolean,
  stream: CaptionStream,
): string {
  const shape = STREAM_SHAPE[stream];
  return `You write Instagram captions for Habiba Minhas, a small women's clothing studio in Karachi, Pakistan. Every garment is stitched in small runs.

VOICE
- English-dominant with Roman Urdu mixed in, roughly 80/20.
- Never Urdu script. Never machine-translate a whole line.
- One natural Roman Urdu phrase, near the end. Good: "Dekhtay hi pasand aa jaye ga." "Rozana pehnne ke liye bilkul perfect." "Halka aur aaram dayak."
- Warm, specific, unhurried. Never salesy, never breathless.

STRUCTURE — ${shape.brief}
- hook: max ${shape.hookMax} characters. All most people ever see. Lead with the most distinctive CONCRETE fact — colour, fabric, technique, a real size range. Never a brand adjective. Never "Elevate your...". No emoji in the hook.
- faqLine: one concrete sentence that answers something a real buyer wonders. Draw it from CUSTOMER QUESTIONS where one fits; where none does, write your own from the fabric, the cut or how the garment wears. This is what gets surfaced by search and AI assistants, so name concrete nouns. Give the ANSWER only — never restate the question. Skip anything about sizes, availability, delivery or price. NEVER leave this empty.
- faqTopic: one or two words naming what that answer was about, e.g. "care", "fabric feel", "fit", "styling", "dupatta", "technique".
- hashtags: exactly ${shape.tags}, tiered — 2-3 broad, 4-5 niche, 3-4 local/Karachi, 2-3 brand (#HabibaMinhas), 1-2 occasion only if genuinely true. Derive from SEO KEYWORDS, category, subtype and colour. A recycled block across posts is itself a spam signal.
- altText: one plain sentence describing the garment for a screen reader.
- angle: three words labelling the angle you took, e.g. "fabric in light" or "real size range".

HARD RULES — a caption breaking any of these is discarded and the post falls back.
- NEVER state or imply a price. No Rs, no numbers with currency, no "affordable", no discounts.
- NEVER mention sizes. Not "Small, Medium, Large", not "S/M/L", not "a good size range", not the word "sizes" at all. Sizing lives on the product page where it is always current; a caption is permanent and goes stale the moment something sells.
- NEVER mention how many pieces exist or remain. No "only one left", no "small runs", no "limited pieces", no "sirf aik piece".
- NEVER say where the garment is made or stitched. No "made in Karachi", no "stitched in our studio".
- NEVER invent a fabric, technique or colour that is not in the input above.
- At most two emoji in the whole caption, none in the hook.
- Do not write the call to action — it is added afterwards.
${
  soldOut
    ? `- THIS GARMENT IS SOLD OUT. Do not say it is available or to order it now. Write it as a piece that has already gone — "this one found its owner", "similar pieces on the site" — honestly and without disappointment.`
    : ""
}

ANTI-REPETITION — this is the part that matters most.
Hooks used recently (DO NOT reuse the opening words, the sentence shape, or the central image of any of these):
${recent.hooks.length ? recent.hooks.map((h) => `- ${h}`).join("\n") : "- (none yet)"}

Angles used recently (take a different one):
${recent.angles.length ? recent.angles.map((a) => `- ${a}`).join("\n") : "- (none yet)"}

Question topics answered recently. Do not repeat the most recent one, and use "care" at most once in every four posts — washing instructions are the safest answer in every product's FAQ list and therefore the easiest rut to fall into. Fabric feel, cut and fit, styling and occasion, the dupatta, and the technique all make better answers:
${recent.faqTopics.length ? recent.faqTopics.map((t) => `- ${t}`).join("\n") : "- (none yet)"}

If this garment has appeared before, find a genuinely different way in — a different detail, a different question, a different moment to wear it.${
    retry
      ? `\n\nYOUR PREVIOUS ATTEMPT WAS REJECTED AS TOO SIMILAR TO AN EARLIER CAPTION. Change the opening image completely and take a different angle.`
      : ""
  }

THE GARMENT
${productBrief(product, soldOut)}

Reply with JSON only, no prose and no code fence:
{"hook":"...","body":"...","faqLine":"...","faqTopic":"...","hashtags":["..."],"altText":"...","angle":"..."}`;
}

// ─── The call ─────────────────────────────────────────────────────────────────

type OpenAiResponse = {
  output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
  usage?: { input_tokens?: number; output_tokens?: number };
};

/** Pulls the JSON object out of whatever the model wrapped it in. */
function extractJson(text: string): unknown | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function coerce(raw: unknown): AiCaption | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const hook = str(o.hook);
  const body = str(o.body);
  if (hook.length < 10 || body.length < 20) return null;

  const hashtags = Array.isArray(o.hashtags)
    ? o.hashtags
        .filter((h): h is string => typeof h === "string")
        .map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, ""))
        .filter((h) => h.length > 1)
        .slice(0, 15)
    : [];
  if (hashtags.length < 5) return null;

  return {
    hook,
    body,
    faqLine: str(o.faqLine),
    faqTopic: str(o.faqTopic) || "unlabelled",
    hashtags,
    altText: str(o.altText) || hook,
    angle: str(o.angle) || "unlabelled",
  };
}

async function callModel(prompt: string, model: string, key: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, input: prompt }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { text: "", usage: undefined, error: `OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    const body = (await res.json()) as OpenAiResponse;
    const text = (body.output ?? [])
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text" && c.text)
      .map((c) => c.text as string)
      .join("")
      .trim();
    return { text, usage: body.usage, error: undefined };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Writes one carousel caption, or returns null so the caller falls back.
 *
 * Never throws. Every outcome — success, refusal, duplicate, API failure — is written to
 * `social_generation_log`, because a silent fallback is exactly how "the AI captions stopped
 * working" goes unnoticed for a fortnight.
 */
export async function writeCaption(
  product: ProductCandidate,
  stream: CaptionStream,
  options?: { soldOut?: boolean; dryRun?: boolean },
): Promise<AiCaption | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  /*
   * A preview must not write to the log.
   *
   * The log is the anti-repetition memory: if a preview stored its hash and its hook, the
   * real post minutes later would be rejected as a duplicate of a caption that was never
   * published, and the owner would see the fallback with no explanation.
   */
  const dryRun = options?.dryRun ?? false;

  const model = process.env.OPENAI_CAPTION_MODEL?.trim() || DEFAULT_MODEL;
  const soldOut = options?.soldOut ?? (product.stock ?? 0) <= 0;

  const log = async (row: Record<string, unknown>) => {
    /*
     * A dry run skips the *success* row, because that is the one carrying `caption_hash` and
     * the hook — the anti-repetition memory. Failures are still recorded: they hold no hash,
     * `loadRecent` filters on `ok = true` so they can never be fed back, and "why did the
     * preview fall back?" is precisely the question the log exists to answer.
     */
    if (dryRun && row.ok !== false) return;
    try {
      await createAdminClient().from("social_generation_log").insert({
        stream,
        product_id: product.id,
        product_slug: product.slug,
        model,
        ...row,
      });
    } catch {
      /* logging must never break publishing */
    }
  };

  let recent: Recent;
  try {
    recent = await loadRecent(stream);
  } catch {
    recent = { hooks: [], angles: [], faqTopics: [], hashes: new Set() };
  }

  for (const attempt of [0, 1]) {
    try {
      const prompt = buildPrompt(product, recent, soldOut, attempt > 0, stream);
      const { text, usage, error } = await callModel(prompt, model, key);

      if (error || !text) {
        await log({ ok: false, error: error ?? "empty response" });
        return null;
      }

      const caption = coerce(extractJson(text));
      if (!caption) {
        await log({ ok: false, error: "unparseable or incomplete JSON" });
        return null;
      }

      const whole = `${caption.hook}\n${caption.body}\n${caption.faqLine}`;

      // The model was told all of this. Told is not the same as did — the first live test
      // produced a caption that listed sizes and named the city in the same breath.
      if (violates(whole, PRICE_PATTERNS)) {
        await log({ ok: false, error: "price leaked into caption", hook: caption.hook });
        return null;
      }
      if (violates(whole, INVENTORY_PATTERNS)) {
        await log({ ok: false, error: "sizes, stock or origin leaked into caption", hook: caption.hook });
        if (attempt === 0) continue;
        return null;
      }
      if (soldOut && violates(whole, AVAILABILITY_PATTERNS)) {
        await log({ ok: false, error: "availability claimed for a sold-out garment", hook: caption.hook });
        return null;
      }

      const hash = captionHash(whole);
      if (recent.hashes.has(hash)) {
        // First time round, tell it and try again. Second time, give up and fall back —
        // the deterministic caption is never a duplicate of an AI one.
        if (attempt === 0) continue;
        await log({ ok: false, error: "duplicate caption after retry", hook: caption.hook });
        return null;
      }

      const inTok = usage?.input_tokens ?? 0;
      const outTok = usage?.output_tokens ?? 0;
      await log({
        ok: true,
        hook: caption.hook,
        angle: caption.angle,
        faq_topic: caption.faqTopic,
        caption_hash: hash,
        input_tokens: inTok,
        output_tokens: outTok,
        cost_cents: ((inTok / 1e6) * RATE_IN_PER_M + (outTok / 1e6) * RATE_OUT_PER_M) * 100,
      });

      return caption;
    } catch (e) {
      await log({ ok: false, error: (e as Error).message.slice(0, 300) });
      return null;
    }
  }

  return null;
}


/** Carousel captions. Thin wrapper so call sites read as intent rather than configuration. */
export function writeCarouselCaption(
  product: ProductCandidate,
  options?: { soldOut?: boolean; dryRun?: boolean },
): Promise<AiCaption | null> {
  return writeCaption(product, "carousel", options);
}

/**
 * Reel captions.
 *
 * Its own stream, so its own hooks, angles and topics — a reel and a carousel of the same
 * garment on the same day should not open the same way, and sharing one memory would make
 * them fight for it.
 */
export function writeReelCaption(
  product: ProductCandidate,
  options?: { soldOut?: boolean; dryRun?: boolean },
): Promise<AiCaption | null> {
  return writeCaption(product, "reel", options);
}
