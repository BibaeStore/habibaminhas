/**
 * Builds the occasion image: a generated themed backdrop, the logo large, the greeting, and a
 * dua or quote worth reading. No product — see `composeOccasionImage`.
 *
 * The one rule worth stating loudly: **the image model never renders text.** It is asked
 * for a textless backdrop, and every word is drawn afterwards with sharp from strings held
 * in `social_occasions`. Image models still misspell, and "JUMMA MUBRAK" on a brand
 * account is not something you can quietly fix after the fact. Keeping type out of the
 * model's hands makes that failure impossible rather than unlikely.
 *
 * The art direction is written fresh for every poster by `art-direction.ts` rather than read
 * from a fixed column, which is what stopped consecutive Jumma cards looking identical.
 */
import sharp from "sharp";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/server";
import { renderArabic, wrapArabic } from "./arabic";

const W = 1080;
const H = 1080;           // Square, matching the reference the owner approved 2026-08-28
const BUCKET = "social-media";

const INK = "#3a3226";     // warm charcoal, matches the logo
const GOLD = "#b08d57";
const MUTED = "#6b5f4d";

/** SVG is XML: an unescaped `&` or `'` in "Women's Day" silently breaks the whole overlay. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Largest font size at which `text` still fits `maxWidth`.
 *
 * Greetings vary from "EID MUBARAK" to "JASHN-E-AZADI MUBARAK"; a fixed size would either
 * overflow the frame or leave the short ones looking timid. 0.62em per character is a
 * deliberate over-estimate for letterspaced Georgia caps, so this errs towards too small.
 */
function fitFontSize(text: string, maxWidth: number, max: number, min: number, tracking: number): number {
  for (let size = max; size > min; size -= 2) {
    const width = text.length * (size * 0.62 + tracking);
    if (width <= maxWidth) return size;
  }
  return min;
}

/** Greedy wrap to at most `maxLines`; the last line takes an ellipsis if anything is left. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (!line) line = w;
    else if ((line + " " + w).length <= maxChars) line += " " + w;
    else { lines.push(line); line = w; }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) lines[lines.length - 1] += "…";
  return lines;
}

/**
 * Asks the image model for a textless backdrop in the occasion's palette.
 *
 * "No text" is repeated several ways because a single mention is not reliably obeyed, and
 * a stray glyph behind the real greeting looks like a printing fault.
 */
export async function generateBackground(theme: string): Promise<{ buffer: Buffer; prompt: string }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const prompt = `An elegant, minimal greeting-card backdrop for a high-end Pakistani women's fashion boutique.

Art direction: ${theme}

Composition: an ornamental border framing a LARGE EMPTY CENTRE. Generous negative space in the middle and upper third. Flat editorial graphic design, refined and airy.

Strictly forbidden: no text, no lettering, no letters, no words, no numbers, no calligraphy, no signatures, no watermark. No people, no faces, no clothing, no fabric, no mannequins. No photography.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", quality: "high", n: 1 }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Image generation failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const body = (await res.json()) as { data: Array<{ b64_json: string }> };
  return { buffer: Buffer.from(body.data[0].b64_json, "base64"), prompt };
}

export type ComposeInput = {
  background: Buffer;
  greeting: string;
  /** The English meaning. Always present. */
  message: string;
  /** Roman transliteration, set small beneath the Arabic. Empty when there is none. */
  attribution: string;
  /** The dua in Arabic script. Empty for non-Islamic occasions. */
  arabic?: string;
  /** "Dua for Forgiveness", "For mothers", and so on. Heads the card. */
  cardTitle?: string;
};

/**
 * Lays the scene, the logo, the greeting and one dua card into a 1080x1080 JPEG.
 *
 * Composition follows the reference the owner approved on 2026-08-28: the generated scene
 * occupies the right of the frame, type occupies the left, and a single rounded card carries
 * the dua. Three rules came with it and all three are enforced here rather than requested of
 * a model:
 *
 * **Exactly one dua.** The reference the owner liked showed four, and their own brief said
 * one. A list turns a greeting into a leaflet.
 *
 * **No invented references.** The reference image attributed a well-known istighfar to Surah
 * An-Nur 24:31, which is wrong. Nothing here prints a surah or hadith reference at all — the
 * only attribution shown is the transliteration, which cannot be wrong in that way.
 *
 * **The image model never renders text.** Unchanged, and now doubly true: the Arabic is
 * rendered by resvg from a vetted string, so the model is not trusted with Latin *or* Arabic
 * script. See arabic.ts for why sharp cannot do this part.
 */
export async function composeOccasionImage(input: ComposeInput): Promise<Buffer> {
  const PAD = 62;
  const COL = 600;                 // left type column, ~56% of the frame
  const CX = PAD + COL / 2;        // its centre

  const greeting = input.greeting.toUpperCase();
  const gSize = fitFontSize(greeting, COL - 20, 74, 34, 8);

  const introLines = wrap(
    "May this blessed day bring peace, barakah and countless blessings to you and your family.",
    38,
    3,
  );

  // ── the dua card ──────────────────────────────────────────────────────────
  const hasArabic = Boolean(input.arabic && input.arabic.trim());
  const msgLines = wrap(input.message, 44, 3);

  let arabicBlock: { png: Buffer; width: number; height: number } | null = null;
  if (hasArabic) {
    const size = 40;
    arabicBlock = renderArabic({
      lines: wrapArabic(input.arabic!, COL - 90, size, 3),
      width: COL - 60,
      fontSize: size,
      colour: INK,
    });
  }

  const titleH = input.cardTitle ? 46 : 0;
  const arabicH = arabicBlock ? arabicBlock.height + 10 : 0;
  const attrH = input.attribution ? 34 : 0;
  const cardH = 34 + titleH + arabicH + msgLines.length * 32 + attrH + 30;

  /*
   * Anchored from the bottom, not the top.
   *
   * The card grows with its content -- a three-line dua is 250px taller than a one-line one --
   * so a fixed top edge pushed the tall ones straight through the website line at the foot of
   * the frame. Fixing the *gap below* the card instead keeps that clear whatever the dua's
   * length, and the clamp stops a very tall card riding up into the intro text.
   */
  const cardTop = Math.max(500, H - 96 - cardH);

  let y = cardTop + 34 + (input.cardTitle ? 30 : 0);
  const titleSvg = input.cardTitle
    ? `<text x="${CX}" y="${y}" class="ct" text-anchor="middle">${esc(input.cardTitle.toUpperCase())}</text>`
    : "";
  if (input.cardTitle) y += 16;

  const arabicTop = y + 6;
  if (arabicBlock) y += arabicBlock.height + 10;

  const msgSvg = msgLines
    .map((l, i) => `<text x="${CX}" y="${y + 22 + i * 32}" class="msg" text-anchor="middle">${esc(l)}</text>`)
    .join("");
  y += msgLines.length * 32 + 22;

  const attrSvg = input.attribution
    ? `<text x="${CX}" y="${y + 6}" class="attr" text-anchor="middle">${esc(input.attribution)}</text>`
    : "";

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .g{font-family:Georgia,'Times New Roman',serif;font-size:${gSize}px;fill:${INK};letter-spacing:8px}
      .intro{font-family:Georgia,'Times New Roman',serif;font-size:25px;fill:${MUTED}}
      .ct{font-family:Georgia,serif;font-size:19px;fill:${GOLD};letter-spacing:3.5px}
      .msg{font-family:Georgia,'Times New Roman',serif;font-size:24px;fill:${INK};font-style:italic}
      .attr{font-family:Georgia,serif;font-size:19px;fill:${MUTED};letter-spacing:1px}
      .site{font-family:Georgia,serif;font-size:21px;fill:${MUTED};letter-spacing:4.5px}
    </style>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#faf6ef" stop-opacity="0.97"/>
      <stop offset="62%" stop-color="#faf6ef" stop-opacity="0.93"/>
      <stop offset="100%" stop-color="#faf6ef" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Softens the generated scene under the type. Without it the wrap of a long dua can land
       on a dome or a minaret and the line stops being readable. -->
  <rect x="0" y="0" width="${PAD + COL + 90}" height="${H}" fill="url(#veil)"/>

  <text x="${CX}" y="332" class="g" text-anchor="middle">${esc(greeting)}</text>
  <g stroke="${GOLD}" stroke-width="1.3">
    <line x1="${CX - 120}" y1="372" x2="${CX - 22}" y2="372"/>
    <line x1="${CX + 22}" y1="372" x2="${CX + 120}" y2="372"/>
  </g>
  <circle cx="${CX}" cy="372" r="4" fill="${GOLD}"/>

  ${introLines.map((l, i) => `<text x="${CX}" y="${418 + i * 34}" class="intro" text-anchor="middle">${esc(l)}</text>`).join("")}

  <rect x="${PAD}" y="${cardTop}" width="${COL}" height="${cardH}" rx="22"
        fill="#fffdf9" fill-opacity="0.93" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.4"/>
  ${titleSvg}
  ${msgSvg}
  ${attrSvg}

  <text x="${CX}" y="${H - 46}" class="site" text-anchor="middle">HABIBAMINHAS.COM</text>
</svg>`;

  const bg = await sharp(input.background)
    .resize(W, H, { fit: "cover", position: "centre" })
    .toBuffer();

  const LOGO_W = 300;
  const logo = await sharp(path.join(process.cwd(), "public/logo/habiba-minhas-logo-t.png"))
    .resize({ width: LOGO_W })
    .toBuffer();

  const layers: sharp.OverlayOptions[] = [
    { input: Buffer.from(overlay), top: 0, left: 0 },
    { input: logo, top: 96, left: Math.round(CX - LOGO_W / 2) },
  ];
  if (arabicBlock) {
    layers.push({
      input: arabicBlock.png,
      top: Math.round(arabicTop),
      left: Math.round(PAD + 30),
    });
  }

  return sharp(bg)
    .composite(layers)
    // Instagram's content-publishing API takes JPEG only; a PNG here fails at the container
    // step with an unhelpful error.
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

/**
 * Stores the artwork and returns its public URL.
 *
 * The key carries the regeneration count, so a regenerated image is a genuinely new URL.
 * Overwriting in place looked tidier but meant Meta and the admin preview both served a
 * cached copy of the picture the owner had just rejected.
 */
export async function uploadArtwork(
  buffer: Buffer,
  occasionSlug: string,
  dateKey: string,
  revision: number,
): Promise<string> {
  const sb = createAdminClient();
  const key = `occasion/${dateKey}-${occasionSlug}${revision > 0 ? `-v${revision + 1}` : ""}.jpg`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`Artwork upload failed: ${error.message}`);

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
}
