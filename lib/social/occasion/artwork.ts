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

const W = 1080;
const H = 1350;           // Instagram 4:5, the best-performing feed ratio
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
  /** The dua, quote or line of advice. This is what makes the card worth keeping. */
  message: string;
  /** Transliteration or attribution, set smaller beneath the message. */
  attribution: string;
};

/**
 * Lays the backdrop, the logo, the greeting and the message into a 1080x1350 JPEG.
 *
 * Two changes the owner asked for on 2026-08-28, both of which change the composition rather
 * than decorate it:
 *
 * **No product.** The old card put a garment photograph in a mihrab arch, which made a
 * greeting look like an advertisement wearing a greeting's clothes. A Jumma card should greet.
 * Everything that sold has been taken out.
 *
 * **The logo leads.** It was 340px wide, below the arch, doing the job of a footer. It is now
 * 460px and the first thing in the frame, because on an occasion post the brand *is* the
 * subject — there is nothing else on the card to be the subject instead.
 *
 * The rule that has not changed, and must not: **the image model never renders text.** Every
 * word here is drawn by sharp from strings we control. Image models still misspell, and
 * "JUMMA MUBRAK" on a brand account is not something you quietly fix afterwards.
 */
export async function composeOccasionImage(input: ComposeInput): Promise<Buffer> {
  const greeting = input.greeting.toUpperCase();
  const gSize = fitFontSize(greeting, W - 170, 68, 32, 12);

  // The message carries the card, so it gets room: up to four lines, and the type shrinks
  // rather than the text being cut. A truncated dua would be worse than none.
  const msgLines = wrap(input.message, 46, 4);
  const mSize = msgLines.length > 3 ? 30 : 34;
  const msgTop = 900;

  const msgSvg = msgLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${msgTop + i * (mSize + 14)}" class="msg" text-anchor="middle">${esc(l)}</text>`,
    )
    .join("");

  const attrY = msgTop + msgLines.length * (mSize + 14) + 14;
  const attrSvg = input.attribution
    ? `<text x="${W / 2}" y="${attrY}" class="attr" text-anchor="middle">${esc(input.attribution)}</text>`
    : "";

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>
    .g{font-family:Georgia,'Times New Roman',serif;font-size:${gSize}px;fill:${INK};letter-spacing:12px}
    .msg{font-family:Georgia,'Times New Roman',serif;font-size:${mSize}px;fill:${INK};font-style:italic}
    .attr{font-family:Georgia,'Times New Roman',serif;font-size:22px;fill:${MUTED};letter-spacing:1.5px}
    .site{font-family:Georgia,'Times New Roman',serif;font-size:24px;fill:${MUTED};letter-spacing:5px}
  </style></defs>

  <text x="${W / 2}" y="700" class="g" text-anchor="middle">${esc(greeting)}</text>

  <g stroke="${GOLD}" stroke-width="1.4">
    <line x1="${W / 2 - 150}" y1="770" x2="${W / 2 - 26}" y2="770"/>
    <line x1="${W / 2 + 26}" y1="770" x2="${W / 2 + 150}" y2="770"/>
  </g>
  <circle cx="${W / 2}" cy="770" r="4.5" fill="${GOLD}"/>

  ${msgSvg}
  ${attrSvg}

  <text x="${W / 2}" y="1276" class="site" text-anchor="middle">HABIBAMINHAS.COM</text>
</svg>`;

  const bg = await sharp(input.background)
    .resize(W, H, { fit: "cover", position: "centre" })
    .toBuffer();

  const LOGO_W = 460;
  const logo = await sharp(path.join(process.cwd(), "public/logo/habiba-minhas-logo-t.png"))
    .resize({ width: LOGO_W })
    .toBuffer();

  return sharp(bg)
    .composite([
      { input: logo, top: 300, left: Math.round((W - LOGO_W) / 2) },
      { input: Buffer.from(overlay), top: 0, left: 0 },
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
