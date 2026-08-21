/**
 * Builds the occasion image: a generated themed backdrop, the product photograph in a
 * mihrab arch, the greeting, and the logo.
 *
 * The one rule worth stating loudly: **the image model never renders text.** It is asked
 * for a textless backdrop, and every word is drawn afterwards with sharp from strings held
 * in `social_occasions`. Image models still misspell, and "JUMMA MUBRAK" on a brand
 * account is not something you can quietly fix after the fact. Keeping type out of the
 * model's hands makes that failure impossible rather than unlikely.
 *
 * The composition is the one proven on the 2026-08-21 Jumma post — arch, greeting above,
 * logo below — generalised so the greeting, subtitle and art direction come from the row.
 */
import sharp from "sharp";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/server";

const W = 1080;
const H = 1350;           // Instagram 4:5, the best-performing feed ratio
const ARCH_W = 500;
const ARCH_H = 680;
const ARCH_X = (W - ARCH_W) / 2;
const ARCH_Y = 232;
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
  /** Public URL of the product hero shot. */
  productImageUrl: string;
  greeting: string;
  subtitle: string | null;
};

/** Lays the backdrop, arch, type and logo into the final 1080×1350 JPEG. */
export async function composeOccasionImage(input: ComposeInput): Promise<Buffer> {
  const r = ARCH_W / 2;

  const productRes = await fetch(input.productImageUrl);
  if (!productRes.ok) throw new Error(`Could not fetch product image (${productRes.status})`);
  const productRaw = Buffer.from(await productRes.arrayBuffer());

  // A mihrab-shaped mask: it echoes the arch motif in the backdrop and, unlike a plain
  // rectangle, reads as designed rather than pasted.
  const archPath = `M0,${r} A${r},${r} 0 0 1 ${ARCH_W},${r} L${ARCH_W},${ARCH_H} L0,${ARCH_H} Z`;
  const maskSvg = `<svg width="${ARCH_W}" height="${ARCH_H}" xmlns="http://www.w3.org/2000/svg"><path d="${archPath}" fill="#fff"/></svg>`;

  const panel = await sharp(productRaw)
    .resize(ARCH_W, ARCH_H, { fit: "cover", position: "top" })
    .composite([{ input: Buffer.from(maskSvg), blend: "dest-in" }])
    .png()
    .toBuffer();

  const greeting = input.greeting.toUpperCase();
  const gSize = fitFontSize(greeting, W - 150, 62, 30, 11);
  const subLines = input.subtitle ? wrap(input.subtitle, 58, 2) : [];

  const subSvg = subLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${1055 + i * 34}" class="sub" text-anchor="middle">${esc(l)}</text>`,
    )
    .join("");

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>
    .g{font-family:Georgia,'Times New Roman',serif;font-size:${gSize}px;fill:${INK};letter-spacing:11px}
    .sub{font-family:Georgia,'Times New Roman',serif;font-size:25px;fill:${MUTED};font-style:italic}
  </style></defs>
  <text x="${W / 2}" y="152" class="g" text-anchor="middle">${esc(greeting)}</text>
  <g stroke="${GOLD}" stroke-width="1.3">
    <line x1="${W / 2 - 130}" y1="190" x2="${W / 2 - 20}" y2="190"/>
    <line x1="${W / 2 + 20}" y1="190" x2="${W / 2 + 130}" y2="190"/>
  </g>
  <circle cx="${W / 2}" cy="190" r="4" fill="${GOLD}"/>
  <path d="M${ARCH_X},${ARCH_Y + r} A${r},${r} 0 0 1 ${ARCH_X + ARCH_W},${ARCH_Y + r} L${ARCH_X + ARCH_W},${ARCH_Y + ARCH_H} L${ARCH_X},${ARCH_Y + ARCH_H} Z" fill="none" stroke="${GOLD}" stroke-width="2"/>
  ${subSvg}
</svg>`;

  const bg = await sharp(input.background).resize(W, H, { fit: "cover", position: "centre" }).toBuffer();
  const logo = await sharp(path.join(process.cwd(), "public/logo/habiba-minhas-logo-t.png"))
    .resize({ width: 340 })
    .toBuffer();

  return sharp(bg)
    .composite([
      { input: panel, top: ARCH_Y, left: Math.round(ARCH_X) },
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: logo, top: 1140, left: Math.round((W - 340) / 2) },
    ])
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
