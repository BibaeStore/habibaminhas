/**
 * The occasion poster: a generated scene, the brand logo leading, the greeting, and one dua.
 *
 * Design approved by the owner 2026-08-28 after four directions were rendered and compared.
 * "The Alcove": scene on the right through an arch, type on the left, one rounded card holding
 * a single dua. Logo at 460px — 43% of the frame — because on an occasion post the brand *is*
 * the subject; there is no product on the card to be the subject instead.
 *
 * Two rules that are load-bearing, not stylistic
 * ----------------------------------------------
 * **The image model never renders text.** Every word is drawn here from strings we control.
 * Image models misspell, and "JUMMA MUBRAK" on a brand account is not something you quietly fix
 * afterwards.
 *
 * **All text is rendered by resvg, not sharp.** sharp rasterises SVG through librsvg, which
 * does no complex-script shaping: fed a dua it produces disconnected letters in reversed order.
 * It also cannot load the calligraphic and script faces this design needs. resvg shapes with
 * rustybuzz, a HarfBuzz port, and handles both. sharp still does all the compositing.
 *
 * The layout follows the logo
 * ---------------------------
 * Every measurement below the logo is derived from its height, and the dua card is pinned to
 * the footer with the type flowing down to meet it. Earlier versions placed things at fixed
 * offsets and then had to be patched three times as the content changed size — a long dua
 * crossing the website line, a large logo pushing the card through it. Deriving the rhythm
 * means content size cannot cause an overlap.
 */
import path from "node:path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { createAdminClient } from "@/lib/supabase/server";

const W = 1080;
const H = 1080;          // square, matching the approved reference
const BUCKET = "social-media";

const COL = 604;         // left type column
const PAD = 56;
const CX = PAD + COL / 2;

/** 43% of the frame. The owner chose "logo-led" from three rendered options. */
const LOGO_W = 460;
const LOGO_RATIO = 2.47; // the lockup's own aspect ratio
const LOGO_TOP = 52;

const INK = "#2f2a20";
const GOLD = "#b08d57";
const GOLD_D = "#8d6d3c";
const MUTED = "#6b6153";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const FONTS = [
  "Amiri-Regular.ttf",
  "Amiri-Bold.ttf",
  "ArefRuqaaInk-Bold.ttf",
  "CormorantGaramond.ttf",
  "CormorantGaramond-Italic.ttf",
  "GreatVibes-Regular.ttf",
].map((f) => path.join(FONT_DIR, f));

/** SVG is XML: an unescaped `&` or `'` in "Women's Day" silently voids the whole overlay. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Rasterises the text layer.
 *
 * `loadSystemFonts: false` is a guarantee rather than an optimisation: a Linux build server
 * with no Arabic fonts installed must produce a byte-identical poster to a Windows laptop.
 * Without it the output would silently vary by machine.
 */
function renderText(svg: string): Buffer {
  return new Resvg(svg, {
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Cormorant Garamond" },
    background: "rgba(0,0,0,0)",
  })
    .render()
    .asPng();
}

/** Greedy wrap. No line cap — truncating a dua is never acceptable. */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if (!line) line = w;
    else if ((line + " " + w).length <= maxChars) line += " " + w;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

/**
 * Largest Arabic size at which the text fits `maxLines`.
 *
 * 0.42em per character, not 0.5: a dua is fully vocalised and every fatha, kasra and shadda is
 * a mark the shaper makes room for. At 0.5 the longest line in the library ran past the card's
 * right edge in a real render.
 */
function fitArabic(text: string, width: number, maxLines: number, max = 38, min = 26) {
  for (let size = max; size > min; size -= 2) {
    const perLine = Math.max(8, Math.floor(width / (size * 0.42)));
    const lines = wrap(text, perLine);
    if (lines.length <= maxLines) return { size, lines };
  }
  const perLine = Math.max(8, Math.floor(width / (min * 0.42)));
  return { size: min, lines: wrap(text, perLine) };
}

/**
 * Asks the image model for a textless scene.
 *
 * "No text" is repeated several ways because a single mention is not reliably obeyed, and a
 * stray glyph behind the real greeting looks like a printing fault.
 */
export async function generateBackground(theme: string): Promise<{ buffer: Buffer; prompt: string }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const prompt = `${theme}

Composition: a square frame. The RIGHT side carries the scene. The LEFT 55% must stay essentially empty — a plain luminous wall with only the faintest texture, no ornament and no objects — because the type goes there.

Strictly forbidden: no text, no lettering, no letters, no words, no numbers, no calligraphy, no signatures, no watermark. No people, no faces, no hands. No clothing, no mannequins.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024", quality: "high", n: 1 }),
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
  /** "JUMMA MUBARAK". Split across two lines by the layout. */
  greeting: string;
  /** Arabic calligraphy headline. Null for occasions with no established Arabic phrase. */
  greetingAr?: string | null;
  /** Heads the card: "Dua for Forgiveness", "For Mothers". */
  cardTitle?: string;
  /** The dua in Arabic. Empty for non-Islamic occasions, which carry only a message. */
  arabic?: string;
  /** English meaning, or the line of advice. Always present. */
  message: string;
  /** Roman transliteration, set small beneath the Arabic. */
  attribution: string;
  /** One or two lines. Held short so it supports the greeting rather than crowding it. */
  blessing?: string;
};

const DEFAULT_BLESSING = "May this blessed day bring peace and barakah to you and your family.";

export async function composeOccasionImage(input: ComposeInput): Promise<Buffer> {
  /*
   * "JUMMA MUBARAK" becomes JUMMA in serif caps with "Mubarak" in script beneath it — the
   * treatment the owner's reference used and the reason a script face had to be available at
   * all. A single-word greeting keeps the whole line in caps and simply has no script row.
   */
  const words = input.greeting.trim().split(/\s+/);
  const lead = words[0].toUpperCase();
  const tail = words.slice(1).join(" ");
  const tailScript = tail ? tail.charAt(0).toUpperCase() + tail.slice(1).toLowerCase() : "";

  const LH = Math.round(LOGO_W / LOGO_RATIO);

  // ── the rhythm, all of it relative to the logo ──
  const yAr = LOGO_TOP + LH + 66;
  const yLead = yAr + (input.greetingAr ? 106 : 40);
  const yTail = yLead + 84;
  const yRule = (tailScript ? yTail : yLead) + 42;
  const yBless = yRule + 50;

  const blessLines = wrap(input.blessing || DEFAULT_BLESSING, 42);
  const blessEnd = yBless + (blessLines.length - 1) * 36;

  // ── the card ──
  const hasArabic = Boolean(input.arabic && input.arabic.trim());
  const dua = hasArabic ? fitArabic(input.arabic!, COL - 130, 2) : null;
  const arLineH = dua ? Math.round(dua.size * 1.8) : 0;
  const msgLines = wrap(input.message, 44);
  const attrLines = input.attribution ? wrap(input.attribution, 50) : [];

  const cardH =
    42 +
    (input.cardTitle ? 44 : 0) +
    (dua ? arLineH * dua.lines.length + 20 : 0) +
    msgLines.length * 31 +
    attrLines.length * 25 +
    34;

  /*
   * Pinned to the footer, never pushed down by what is above it.
   *
   * An earlier version took Math.max of "below the blessing" and "above the footer", which
   * picks the *lower* edge — so a large logo pushed the blessing down, that won the max, and the
   * card bottom went through the website line. Pinning to the footer and warning on a squeeze
   * fails at build time rather than in a published poster.
   */
  const FOOTER_TOP = H - 74;
  const cardTop = FOOTER_TOP - cardH;
  if (cardTop < blessEnd + 24) {
    console.warn(
      `[occasion] tight layout: only ${cardTop - blessEnd}px between the blessing and the dua card`,
    );
  }

  let y = cardTop + 48;
  const titleSvg = input.cardTitle
    ? `<text x="${CX}" y="${y}" text-anchor="middle" font-family="Cormorant Garamond" font-size="19" letter-spacing="3.4" fill="${GOLD_D}">${esc(input.cardTitle.toUpperCase())}</text>`
    : "";
  if (input.cardTitle) y += 44;

  const arSvg = dua
    ? dua.lines
        .map(
          (l, i) =>
            `<text x="${CX}" y="${y + i * arLineH}" text-anchor="middle" direction="rtl" font-family="Amiri" font-size="${dua.size}" fill="${INK}">${esc(l)}</text>`,
        )
        .join("")
    : "";
  if (dua) y += arLineH * dua.lines.length + 28;

  const msgSvg = msgLines
    .map(
      (l, i) =>
        `<text x="${CX}" y="${y + i * 31}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="26" fill="${INK}">${esc(l)}</text>`,
    )
    .join("");
  y += msgLines.length * 31 + 10;

  const attrSvg = attrLines
    .map(
      (l, i) =>
        `<text x="${CX}" y="${y + i * 25}" text-anchor="middle" font-family="Cormorant Garamond" font-size="20" fill="${MUTED}">${esc(l)}</text>`,
    )
    .join("");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#faf6ef" stop-opacity="0.97"/>
    <stop offset="58%" stop-color="#faf6ef" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#faf6ef" stop-opacity="0"/>
  </linearGradient></defs>

  <!-- Softens the scene under the type. Without it a long line can land on a dome and stop
       being readable. -->
  <rect x="0" y="0" width="${PAD + COL + 110}" height="${H}" fill="url(#veil)"/>

  ${
    input.greetingAr
      ? `<text x="${CX}" y="${yAr}" text-anchor="middle" direction="rtl" font-family="Aref Ruqaa Ink" font-size="80" font-weight="700" fill="${GOLD_D}">${esc(input.greetingAr)}</text>`
      : ""
  }

  <text x="${CX}" y="${yLead}" text-anchor="middle" font-family="Cormorant Garamond"
        font-size="100" font-weight="600" letter-spacing="9" fill="${INK}">${esc(lead)}</text>
  ${
    tailScript
      ? `<text x="${CX}" y="${yTail}" text-anchor="middle" font-family="Great Vibes" font-size="88" fill="${GOLD}">${esc(tailScript)}</text>`
      : ""
  }

  <g stroke="${GOLD}" stroke-width="1.2" stroke-opacity="0.85">
    <line x1="${CX - 168}" y1="${yRule}" x2="${CX - 30}" y2="${yRule}"/>
    <line x1="${CX + 30}" y1="${yRule}" x2="${CX + 168}" y2="${yRule}"/>
  </g>
  <path d="M${CX},${yRule - 7} l7,7 -7,7 -7,-7 z" fill="${GOLD}"/>

  ${blessLines.map((l, i) => `<text x="${CX}" y="${yBless + i * 36}" text-anchor="middle" font-family="Cormorant Garamond" font-size="29" fill="${MUTED}">${esc(l)}</text>`).join("")}

  <rect x="${PAD}" y="${cardTop}" width="${COL}" height="${cardH}" rx="20"
        fill="#fffdf8" fill-opacity="0.95" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.3"/>
  ${titleSvg}${arSvg}${msgSvg}${attrSvg}

  <text x="${CX}" y="${H - 38}" text-anchor="middle" font-family="Cormorant Garamond" font-size="21"
        letter-spacing="4.5" fill="${MUTED}">HABIBAMINHAS.COM</text>
</svg>`;

  const logo = await sharp(path.join(process.cwd(), "public/logo/habiba-minhas-logo-t.png"))
    .resize({ width: LOGO_W })
    .toBuffer();

  return sharp(await sharp(input.background).resize(W, H, { fit: "cover", position: "centre" }).toBuffer())
    .composite([
      { input: renderText(svg), top: 0, left: 0 },
      { input: logo, top: LOGO_TOP, left: Math.round(CX - LOGO_W / 2) },
    ])
    // Instagram's content-publishing API takes JPEG only; a PNG here fails at the container
    // step with an unhelpful error.
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

/**
 * Stores the artwork and returns its public URL.
 *
 * The key carries a time component as well as the revision counter. The counter alone produced
 * the same key for two different renders, and with `upsert: true` and a one-year cacheControl
 * the second render overwrote the object while Meta went on serving the copy it had already
 * fetched from that URL — which would have republished a picture the owner had just rejected.
 */
export async function uploadArtwork(
  buffer: Buffer,
  occasionSlug: string,
  dateKey: string,
  revision: number,
): Promise<string> {
  const sb = createAdminClient();
  const stamp = Date.now().toString(36);
  const key = `occasion/${dateKey}-${occasionSlug}-v${revision + 1}-${stamp}.jpg`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`Artwork upload failed: ${error.message}`);

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
}
