import sharp from "sharp";

/**
 * Still frames for a reel, rendered before ffmpeg ever runs.
 *
 * Everything visual lives here. ffmpeg only moves these frames around — it never composes
 * anything — which means the look can be checked by opening a PNG rather than by encoding
 * a video and scrubbing it.
 *
 * Two facts drive the whole design:
 *
 * 1. **Product photographs are 4:5; reels are 9:16.** Cropping to 9:16 would slice the top
 *    and bottom off a garment, which is the entire subject. So the photograph is contained
 *    whole and the remainder is filled with the product's own palette colour — the same
 *    approach `images.ts` already uses for the feed derivatives.
 *
 * 2. **Frames are rendered at 1.5x and downscaled by ffmpeg.** A slow zoom on a frame
 *    rendered at final size has to magnify real pixels, and the result visibly softens
 *    part-way through the shot. Rendering at 1620x2880 gives `zoompan` room to zoom to
 *    ~1.3x while still sampling down to 1080x1920.
 */

/** Instagram Reels: 1080x1920, exactly 9:16. */
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;

/** Render scale — headroom so a zoom never magnifies beyond the source. */
const RENDER_SCALE = 1.5;
const RENDER_WIDTH = Math.round(REEL_WIDTH * RENDER_SCALE);   // 1620
const RENDER_HEIGHT = Math.round(REEL_HEIGHT * RENDER_SCALE); // 2880

/** Brand cream — the default `palette` value on every product row. */
const DEFAULT_BACKGROUND = "#f5f0eb";
/** Brand ink, for text on a light ground. */
const INK = "#1a1612";

/** Only accept `#rgb` / `#rrggbb`; anything else falls back to brand cream. */
function safeColour(colour: string | undefined): string {
  const value = (colour ?? "").trim();
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) ? value : DEFAULT_BACKGROUND;
}

/** Text going into an SVG must not be able to break the document. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Is this background dark enough to need light text?
 *
 * Product palettes range from cream to near-black, so the end card cannot assume either.
 * Uses the WCAG relative-luminance formula rather than a naive average, which would call
 * a saturated blue "light".
 */
function isDark(hex: string): boolean {
  const full = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const channel = (i: number) => {
    const c = parseInt(full.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return luminance < 0.4;
}

/**
 * One product photograph as a full-bleed 9:16 frame.
 *
 * The photograph keeps its own proportions and sits slightly above centre — a garment
 * reads better with more space beneath it than above, and it leaves room for the caption
 * overlay Instagram draws along the bottom of a reel.
 */
export async function buildSlideFrame(
  imageBuffer: Buffer,
  background?: string,
): Promise<Buffer> {
  const bg = safeColour(background);

  /*
   * The remaining space is filled with a blurred, zoomed copy of the same photograph
   * rather than flat colour.
   *
   * A 4:5 photograph inside a 9:16 frame leaves roughly a third of the height empty. Flat
   * bands read as a mistake on a full-screen format, and they only ever looked acceptable
   * here because these particular photographs happen to have cream backgrounds — a dark
   * garment on a dark set would have shown two obvious cream slabs.
   *
   * The blur is derived from the image itself, so it is always the right colour, and it
   * makes the frame read as full-bleed while the garment stays completely uncropped.
   */
  const backdrop = await sharp(imageBuffer)
    .resize(RENDER_WIDTH, RENDER_HEIGHT, { fit: "cover", position: "attention" })
    .blur(50)
    // Pulled down slightly so the sharp photograph in front stays the brightest thing in
    // the frame and the eye goes to the garment.
    .modulate({ brightness: 0.9, saturation: 0.85 })
    .toBuffer();

  // 94% of the frame width — a slim, even margin that lets the blur read as a border.
  const inner = await sharp(imageBuffer)
    .resize({
      width: Math.round(RENDER_WIDTH * 0.94),
      height: Math.round(RENDER_HEIGHT * 0.82),
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  const { width: innerWidth = 0, height: innerHeight = 0 } = await sharp(inner).metadata();

  // Sharp needs both offsets or neither — `gravity` cannot be combined with one of them.
  const left = Math.max(0, Math.round((RENDER_WIDTH - innerWidth) / 2));
  const top = Math.max(0, Math.round((RENDER_HEIGHT - innerHeight) / 2 - RENDER_HEIGHT * 0.03));

  return sharp({
    create: {
      width: RENDER_WIDTH,
      height: RENDER_HEIGHT,
      channels: 3,
      // Only ever visible if the backdrop fails to cover, which it should not — kept as a
      // defined floor rather than transparent black.
      background: bg,
    },
  })
    .composite([
      { input: backdrop, top: 0, left: 0 },
      { input: inner, top, left },
    ])
    .jpeg({ quality: 92, progressive: false, mozjpeg: true })
    .toBuffer();
}

/**
 * Closing frame — product name, price and the call to action.
 *
 * The owner asked for name and price on an end card. Deliberately no size or stock: a reel
 * is permanent and inventory goes stale the moment something sells, which is the same rule
 * the captions follow.
 */
export async function buildEndCard(input: {
  title: string;
  price: string;
  background?: string;
  cta?: string;
}): Promise<Buffer> {
  const bg = safeColour(input.background);
  const dark = isDark(bg);
  const fg = dark ? "#faf7f1" : INK;
  const rule = dark ? "rgba(250,247,241,0.35)" : "rgba(26,22,18,0.25)";

  // Wrap the title by words — SVG has no text wrapping of its own.
  const words = input.title.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 22) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  const titleLines = lines.slice(0, 3);

  const centre = RENDER_HEIGHT / 2;
  const titleStart = centre - (titleLines.length - 1) * 48 - 60;

  const svg = `
<svg width="${RENDER_WIDTH}" height="${RENDER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g font-family="Georgia, 'Times New Roman', serif" fill="${fg}" text-anchor="middle">
    ${titleLines
      .map(
        (text, i) =>
          `<text x="${RENDER_WIDTH / 2}" y="${titleStart + i * 96}" font-size="72">${escapeXml(text)}</text>`,
      )
      .join("\n    ")}
    <line x1="${RENDER_WIDTH / 2 - 120}" y1="${titleStart + titleLines.length * 96 + 20}"
          x2="${RENDER_WIDTH / 2 + 120}" y2="${titleStart + titleLines.length * 96 + 20}"
          stroke="${rule}" stroke-width="3"/>
    <text x="${RENDER_WIDTH / 2}" y="${titleStart + titleLines.length * 96 + 130}"
          font-size="82" letter-spacing="2">${escapeXml(input.price)}</text>
    <text x="${RENDER_WIDTH / 2}" y="${titleStart + titleLines.length * 96 + 250}"
          font-size="44" font-family="Helvetica, Arial, sans-serif"
          letter-spacing="6" opacity="0.75">${escapeXml((input.cta ?? "LINK IN BIO").toUpperCase())}</text>
    <text x="${RENDER_WIDTH / 2}" y="${RENDER_HEIGHT - 180}"
          font-size="40" font-family="Helvetica, Arial, sans-serif"
          letter-spacing="10" opacity="0.6">HABIBA MINHAS</text>
  </g>
</svg>`;

  return sharp(Buffer.from(svg))
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

/** Downloads a product image. Fails loudly — a missing slide must abort the whole reel. */
export async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Image fetch failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
