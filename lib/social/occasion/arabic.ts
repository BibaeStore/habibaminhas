import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

/**
 * Arabic text, rendered correctly.
 *
 * Why this is not done with sharp like every other overlay in this project
 * ------------------------------------------------------------------------
 * sharp rasterises SVG through librsvg, and librsvg does not do complex-script shaping. Fed
 * a dua it produces disconnected letters in reversed order — tested three ways on 2026-08-28,
 * including pre-shaping to presentation forms and pre-reversing to counteract it. The closest
 * attempt still collapsed the word spacing. Malformed Arabic in a supplication is not a
 * cosmetic defect, so none of those were shippable.
 *
 * resvg shapes text with rustybuzz, a HarfBuzz port, and gets it right: joined letters,
 * right-to-left order, diacritics in place. It is used here and nowhere else — sharp still
 * does all the compositing, because it already works everywhere this runs.
 *
 * The font is committed rather than relied upon. Amiri is a Naskh face under the SIL Open
 * Font License, so it may be redistributed (see assets/fonts/OFL.txt), and bundling it means
 * a Linux CI runner with no Arabic fonts installed renders identically to a Windows laptop.
 * `loadSystemFonts: false` makes that guarantee rather than a hope — without it, output would
 * silently vary by machine.
 */

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const REGULAR = path.join(FONT_DIR, "Amiri-Regular.ttf");
const BOLD = path.join(FONT_DIR, "Amiri-Bold.ttf");

/** XML-escape. An unescaped `&` silently voids the whole SVG. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type ArabicBlock = {
  /** Transparent PNG, ready to composite. */
  png: Buffer;
  width: number;
  height: number;
};

/**
 * Renders one or more lines of Arabic to a transparent PNG.
 *
 * Returned as an image rather than as SVG for the caller to inline, because the caller
 * composites with sharp — and handing sharp the same SVG would put it straight back through
 * librsvg and undo the entire point of this module.
 */
export function renderArabic(input: {
  lines: string[];
  width: number;
  fontSize: number;
  colour: string;
  bold?: boolean;
  /** Multiplier on font size. Naskh needs more room than Latin for its diacritics. */
  lineHeight?: number;
}): ArabicBlock {
  const lineHeight = input.lineHeight ?? 1.75;
  const step = Math.round(input.fontSize * lineHeight);
  // Generous top padding: Amiri's ascenders and the fatha/damma marks above them sit well
  // above the nominal cap height, and a tight box clips them.
  const padTop = Math.round(input.fontSize * 0.95);
  const height = padTop + step * input.lines.length;

  const text = input.lines
    .map(
      (line, i) =>
        `<text x="${input.width / 2}" y="${padTop + i * step}" text-anchor="middle" direction="rtl" ` +
        `font-family="Amiri" font-size="${input.fontSize}" ` +
        `${input.bold ? 'font-weight="700" ' : ""}fill="${input.colour}">${esc(line)}</text>`,
    )
    .join("\n");

  const svg = `<svg width="${input.width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${text}</svg>`;

  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [REGULAR, BOLD],
      loadSystemFonts: false,
      defaultFontFamily: "Amiri",
    },
  });

  return { png: resvg.render().asPng(), width: input.width, height };
}

/**
 * Splits a long dua across lines that fit the given width.
 *
 * Measured in characters rather than by metrics, because resvg gives no measuring API and the
 * alternative is rendering twice. Arabic in Amiri runs roughly 0.5em per character including
 * the spaces between words, which errs towards breaking early — a dua on three comfortable
 * lines reads better than one on two crowded ones.
 */
export function wrapArabic(text: string, width: number, fontSize: number): string[] {
  /*
   * 0.42em per character, not 0.5.
   *
   * The first estimate was measured against undiacriticised Arabic. A dua is fully
   * vocalised — every fatha, kasra and shadda is a mark the shaper has to make room for — and
   * at 0.5 the longest line of "Rabbana atina fid-dunya..." ran past the card's right edge in
   * the render. Erring small costs a line break; erring large publishes text falling off a
   * card.
   */
  const perLine = Math.max(8, Math.floor(width / (fontSize * 0.42)));
  const words = text.split(/\s+/).filter(Boolean);

  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= perLine || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  /*
   * No line cap, and that is deliberate. The previous version stopped at three lines and
   * dumped every remaining word onto the last one, which is exactly how a 40-character line
   * ended up in a 27-character box. A dua must never be truncated *or* overflowed, so it takes
   * as many lines as it needs and the caller shrinks the type to suit.
   */
  return lines;
}

/**
 * Font size at which a dua fits the card in at most `maxLines`.
 *
 * Tried largest-first so a short supplication is still set at a comfortable size, and the long
 * ones step down rather than spilling.
 */
export function fitArabic(
  text: string,
  width: number,
  maxLines: number,
  max = 40,
  min = 26,
): { fontSize: number; lines: string[] } {
  for (let size = max; size > min; size -= 2) {
    const lines = wrapArabic(text, width, size);
    if (lines.length <= maxLines) return { fontSize: size, lines };
  }
  return { fontSize: min, lines: wrapArabic(text, width, min) };
}
